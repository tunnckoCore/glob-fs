'use strict'

var ansi = require('ansi')
var bold = require('ansi-bold')
var Benchmark = require('benchmark')
var suite = new Benchmark.Suite
var cursor = ansi(process.stdout)

var glob = require('glob')
var gso = require('glob-stream')
var GlobFS = require('../index')

var opts = {
  onCycle: function onCycle (event) {
    cursor.horizontalAbsolute()
    cursor.eraseLine()
    cursor.write('  ' + event.target)
  },
  onComplete: function onComplete () {
    cursor.write('\n')
  }
}

var count = 0
var patterns = [
  'playing/**/*',
  '!playing/a/[d-z][0-9].*',
  '!playing/b/{d,e}*.*',
  '!playing/**/*.{md,txt,json,hbs}'
]
var options = {cwd: __dirname, dot: true, recursive: true}

var matcher = require('is-match')
var isMatch = matcher(patterns, options)

suite
  .add('glob-stream original', function (deferred) {
    gso.create(patterns, options)
      .on('data', function (file) {
        count++
      })
      .on('end', function () {
        deferred.resolve()
      })
  }, opts)
  .add('node-glob', function (deferred) {
    options.ignore = patterns.slice(1).map(function (pattern) {
      return pattern.slice(1)
    })

    glob(patterns[0], options, function (err, files) {
      // console.log('node-glob', files.length)
      if (err) deferred.reject(err)
      deferred.resolve()
    })
  }, opts)
  .add('glob-fs', function(deferred) {
    var globfs = new GlobFS('./playing', options)

    globfs
      .use(function (app) {
        app.options.recursive = true
        return function (file) {
          if (!isMatch(file.relative)) file.exclude = true
        }
      })
      .on('data', function (file) {
        count++
      })
      .on('end', function () {
        deferred.resolve()
      })
  }, opts)
  .on('complete', function () {
    console.log('Fastest is ' + bold(this.filter('fastest').map('name')))
    process.exit(0)
  })
  .run({ defer: true })
