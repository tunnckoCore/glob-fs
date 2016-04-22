/*!
 * glob-fs <https://github.com/tunnckoCore/glob-fs>
 *
 * Copyright (c) 2016 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

/* jshint asi:true */

'use strict'

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
