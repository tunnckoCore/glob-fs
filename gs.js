'use strict'

const arrayMap = require('arr-map')
const globParent = require('glob-parent')
const arrayUnique = require('array-unique')
const isValidGlob = require('is-valid-glob')
const micromatch = require('micromatch')
const toAbsoluteGlob = require('to-absolute-glob')
const Readdir = require('./index')

function arrayNegatives (patterns, negatives) {
  return arrayMap(patterns, function toNegatives (pattern, i) {
    if (pattern[0] === '!') {
      negatives.push(pattern.slice(1))
      return patterns[i - 1]
    }
    return pattern
  })
}

function create (patterns, options) {
  if (!isValidGlob(patterns)) {
    throw new TypeError('expect `patterns` to be string or array of strings')
  }
  if (patterns.length === 0) {
    throw new Error('expect at least 1 pattern to be passed')
  }

  let negatives = []
  patterns = arrayify(patterns)
  patterns = arrayNegatives(patterns, negatives)
  patterns = arrayUnique(patterns)
  options = Object.assign({
    recursive: false,
    ignore: negatives.length >= 1 ? negatives : null,
  }, options)
  options.ignore = toAbsolutePath(options.ignore)

  const baseDirs = arrayMap(patterns, globParent)

  if (baseDirs.length === 1) {
    return createStream(baseDirs[0], patterns, options)
  }

  let len = baseDirs.length
  let i = 1
  let stream = createStream(baseDirs[0], patterns, options)

  // eslint-disable-next-line
  while (i < len) {
    let src = createStream(baseDirs[i++], patterns, options)
    src
      .on('data', (file) => stream.emit('data', file))
      .once('error', (err) => stream.emit('error', err))
  }
  return stream
}

function createStream (dir, patterns, options) {
  let stream = new Readdir(dir, options)
  let isMatch = isMatchFile(patterns.concat(dir), options)
  let include = options.include
    ? isMatchFile(options.include, options)
    : () => {}

  stream.use((app) => (file) => {
    // console.log('file.path:', file.path, isMatch(file))
    if (!isMatch(file)) {
      file.exclude = true
    }
    if (include(file)) {
      file.include = true
    }

    return file
  })

  return stream
}

function arrayify (val) {
  if (!val) return []
  if (!Array.isArray(val)) return [val]
  return val
}

function toAbsolutePath (val) {
  return arrayify(val).map((fp) => toAbsoluteGlob(fp))
}

function isMatchFile (patterns, options) {
  patterns = toAbsolutePath(patterns)
  const isMatch = micromatch.matcher(patterns, options)

  return (file) =>
    // console.log('filepath:', file.path)
    // console.log('patterns:', patterns)
    // console.log('ignore:', options.ignore)
    // console.log('history:', file.history[0])
    // console.log('filepath match:', isMatch(file.history[0]))
    // console.log('relative match:', isMatch(file.relative))
    // console.log('basename match:', isMatch(file.basename))
    // console.log('=====')

    isMatch(file.history[0]) ||
      isMatch(file.path) ||
      isMatch(file.relative) ||
      isMatch(file.basename) ||
      isMatch(file.stem)
}

// work:
// create(['.vscode/*.json', 'src/*.js'], { dot: true })

// not work properly:
create(['**/*.{json,js}', '!node_modules/**'], { dot: true, recursive: true })
  .on('data', (file) => {
    console.log('file.path', file.path)
  })
