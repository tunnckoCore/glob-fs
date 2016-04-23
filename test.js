/*!
 * glob-fs <https://github.com/tunnckoCore/glob-fs>
 *
 * Copyright (c) 2016 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

/* jshint asi:true */

'use strict'
/*!
 * glob-fs <https://github.com/tunnckoCore/glob-fs>
 *
 * Copyright (c) 2016 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

/* jshint asi:true */

'use strict'

var readdir = require('./index-multi')
// var utils = require('./utils')

var count = 0
var options = {recursive: true, dot: true}
var patterns = [
  '!benchmark/playing/b/**',
  'fixtures/betafoo/**',
  'benchmark/playing/**/*.js',
  'fixtures/coverage/**/*.{html,json}',
  '!fixtures/betafoo/data.json',
  '!benchmark/playing/a/[c-z][0-9].*'
]

var stream = readdir(patterns, options)

stream
.on('data', function (file) {
  console.log(count++, file.path)
})
.on('error', console.error)
.on('end', function () {
  console.log('end')
})

// var utils = require('./utils')

// var i = 0
// var gso = require('glob-stream')
// gs.create('benchmark/**', {
//   recursive: true,
//   ignore: [
//     'benchmark/playing/b/**.*',
//     'benchmark/playing/a/[c-z][0-9].*'
//   ]
// })
// .on('data', function (file) {
//   console.log(i++, file.path)
// })
// .on('end', function () {
//   console.log('=====')
//   i = 0
//   gso.create([
//     'benchmark/**',
//    '!benchmark',
//    '!benchmark/playing/b/**.*',
//    '!benchmark/playing/a/[c-z][0-9].*'
//   ])
//   .on('data', function (file) {
//     console.log(i++, file.path)
//   })
// })

// var utils = require('./utils')

// var i = 0
// var gso = require('glob-stream')
// gs.create('benchmark/**', {
//   recursive: true,
//   ignore: [
//     'benchmark/playing/b/**.*',
//     'benchmark/playing/a/[c-z][0-9].*'
//   ]
// })
// .on('data', function (file) {
//   console.log(i++, file.path)
// })
// .on('end', function () {
//   console.log('=====')
//   i = 0
//   gso.create([
//     'benchmark/**',
//    '!benchmark',
//    '!benchmark/playing/b/**.*',
//    '!benchmark/playing/a/[c-z][0-9].*'
//   ])
//   .on('data', function (file) {
//     console.log(i++, file.path)
//   })
// })
