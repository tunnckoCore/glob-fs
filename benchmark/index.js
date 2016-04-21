'use strict'

var Benchmark = require('benchmark')
var suite = new Benchmark.Suite
var gs = require('glob-stream')
var GlobFS = require('../index')

var gsPatterns = [
  'playing/**/*',
  '!playing/a/[d-z][0-9].*',
  '!playing/b/{d,e}*.*',
  '!playing/**/*.{md,txt,json,hbs}'
]
var gsOptions = {cwd: __dirname, dot: true}
var gfsOptions = {cwd: __dirname, dot: true, exclude: [
  __dirname + '/playing/b/{d,e}*.*',
  __dirname + '/playing/a/{d..z}{0..9}.*',
  __dirname + '/playing/**/*.(md|txt|json|hbs)',
]}

var i = 0
// add tests
suite
  .add('glob-stream', function (deferred) {
    gs.create(gsPatterns, gsOptions)
      .on('data', function (file) {
        i++
      })
      .on('end', function () {
        deferred.resolve()
      })
  })
  .add('GlobFS', function(deferred) {
    new GlobFS('playing/**/*', gfsOptions)
      .on('data', function (file) {
        i++
      })
      .on('end', function () {
        deferred.resolve()
      })
  })
  // add listeners
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
    process.exit(0)
  })
  .run({ defer: true })
