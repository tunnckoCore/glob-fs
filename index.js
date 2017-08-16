'use strict'

const _fs = require('fs')
const path = require('path')
const { Readable } = require('stream')

const fs = require('pify')(_fs)
const VFile = require('vfile')
const isDotfile = require('is-dotfile')
const isDotdir = require('is-dotdir')

function isValidSince (since) {
  return (
    typeof since === 'number' ||
    since instanceof Number ||
    since instanceof Date
  )
}

class Readdir extends Readable {
  constructor (dir, options) {
    if (typeof dir !== 'string') {
      throw new TypeError('readdir: expect a `dir` be string')
    }

    options = Object.assign({ objectMode: true, cwd: process.cwd() }, options)
    options.since = isValidSince(options.since) ? +options.since : 0

    super(options)

    this.options = options
    this.path = path.resolve(this.options.cwd, dir)
    this.queue = [this.path]
    this.plugins = []
    this.use(function hacks (app) {
      return (file) => {
        let fp = file.path
        fp = fp.charAt(-1) === '/' ? fp.slice(0, -1) : fp
        if (file.stat.isDirectory()) {
          file.path = fp + '/'
        }
        file.relative = path.relative(file.cwd, file.path)
        return file
      }
    })
    this.use(function normalizeDots (app) {
      return (file) => {
        if (!app.options.dot && file.isDot()) {
          file.exclude = true
          file.include = false
        }
        return file
      }
    })
  }

  use (plugin) {
    const ret = plugin(this)
    if (typeof ret === 'function') {
      this.plugins.push(ret)
    }
    return this
  }

  createFile (fp, stat) {
    this.file = new VFile({
      cwd: this.options.cwd,
      path: fp,
      stat,
    })

    this.file.exclude = false
    this.file.include = true
    this.file.isDotfile = () => isDotfile(this.file.path)
    this.file.isDotdir = () => isDotdir(this.file.path)
    this.file.isDot = () => this.file.isDotfile() || this.file.isDotdir()

    return this.file
  }

  _runFilePlugins (file) {
    this.plugins.forEach((plugin) => {
      const ret = plugin(file)
      this.file = ret || file
    })
  }

  _read () {
    if (!this.queue.length) {
      this.push(null)
      return
    }
    this._stat(this.queue.shift())
  }

  _stat (filepath) {
    fs
      .stat(filepath)
      .then((stat) => {
        if (this.options.since > stat.mtime) {
          this._read()
          return
        }

        this.file = this.createFile(filepath, stat)
        this._runFilePlugins(this.file)

        let isRoot = path.basename(this.path) === this.file.basename
        let recurse = isRoot || this.options.recursive
        this.file.exclude = isRoot ? false : this.file.exclude

        if (!this.file.exclude && recurse && this.file.stat.isDirectory()) {
          return this._readdir(filepath).then(() => {
            this._push()
          })
        }

        this._push()
      })
      .catch((er) => this.emit('error', er))
  }

  _readdir (dir) {
    return fs.readdir(dir).then((filepaths) => {
      // one point for optimization with globs
      filepaths.forEach((fp) => {
        this.queue.push(path.join(dir, fp))
      })
    })
  }

  _push () {
    if (this.file.exclude) {
      return this.file.include ? this.push(this.file) : this._read()
    }

    this.push(this.file)
  }
}

module.exports = Readdir
