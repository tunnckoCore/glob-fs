'use strict'

var ansi = require('ansi')
var bold = require('ansi-bold')
var Benchmark = require('benchmark')
var suite = new Benchmark.Suite
var cursor = ansi(process.stdout)

var plugins = require('../utils').plugins
var glob = require('glob')
var gso = require('glob-stream')
var GlobKernel = require('../index')
var GlobFS = require('../index-multi')

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
  '!playing/b/**',
  '../fixtures/betafoo/**',
  'playing/**/*.js',
  '../fixtures/quxie/**/*.{html,json}',
  '!../fixtures/betafoo/data.json',
  '!../fixtures/betafoo/carra/base.css',
  '!playing/a/[c-z][0-9].*'
]
// gs sucks.. ALL negatives should be last
var gsoPatterns = [
  '../fixtures/betafoo/**',
  'playing/**/*.js',
  '../fixtures/quxie/**/*.{html,json}',
  '!playing/b/**',
  '!../fixtures/betafoo/data.json',
  '!../fixtures/betafoo/carra/base.css',
  '!playing/a/[c-z][0-9].*'
]
var options = {cwd: __dirname, dot: true, recursive: true}

var matcher = require('is-match')
var isMatch = matcher(patterns, options)

suite
  .add('glob-stream original', function (deferred) {
    gso.create(gsoPatterns, options)
      .on('data', function (file) {
        count++
      })
      .on('end', function () {
        deferred.resolve()
      })
  }, opts)
  .add('glob-fs advanced', function (deferred) {
    new GlobFS(patterns, options)
      .on('data', function (file) {
        count++
      })
      .on('end', function () {
        deferred.resolve()
      })
  }, opts)
  // .add('glob-fs kernel (single dir only)', function(deferred) {
  //   var globfs = new GlobKernel('./playing', options)

  //   globfs
  //     .use(plugins.normalizeDots)
  //     .use(plugins.match(patterns, options))
  //     .use(plugins.reinclude(options))
  //     .on('data', function (file) {
  //       // count++
  //       console.log(count++, file.path)
  //     })
  //     .on('end', function () {
  //       // deferred.resolve()
  //     })
  // }, opts)

  // .add('node-glob (single pattern only)', function (deferred) {
  //   options.ignore = patterns.slice(1).map(function (pattern) {
  //     return pattern.slice(1)
  //   })

  //   glob(patterns[0], options, function (err, files) {
  //     // console.log('node-glob', files.length)
  //     if (err) deferred.reject(err)
  //     deferred.resolve()
  //   })
  // }, opts)
  .on('complete', function () {
    console.log('Fastest is ' + bold(this.filter('fastest').map('name')))
    process.exit(0)
  })
  .run({ defer: true })
