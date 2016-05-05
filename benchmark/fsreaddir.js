'use strict'

/* eslint-disable */

// var ansi = require('ansi')
// var bold = require('ansi-bold')
// var Benchmark = require('benchmark')
// var suite = new Benchmark.Suite
// var cursor = ansi(process.stdout)

// // var fsReaddir = require('../../../globbing/new-fs-readdir')
// var glob = require('glob')
// var gso = require('glob-stream')
// var GlobKernel = require('../index')
// var matcher = require('is-match')

// var opts = {
//   onCycle: function onCycle (event) {
//     cursor.horizontalAbsolute()
//     cursor.eraseLine()
//     cursor.write('  ' + event.target)
//   },
//   onComplete: function onComplete () {
//     cursor.write('\n')
//   }
// }

var matcher = require('is-match')
var isMatch = matcher(['**', 'a/b', '!a/**'])
console.log(isMatch('a/b/c/d.txt'))
// var isMatch = matcher('/home/charlike/dev/final/benchmarked/**/*.md', {dot: true})
// var count = 0

// //   .add('node-glob', function (deferred) {
// //     glob('./**/*', {cwd: '/home/charlike/dev/final/benchmarked', dot: true}, function (err, res) {
// //       // console.log(err, res, res && res.length)
// //       if (err) return deferred.reject(err)
// //       deferred.resolve()
// //     })
// //   }, opts)
//   suite
//   .add('glob-stream', function (deferred) {
//     gso.create('./**/*.md', {cwd: '/home/charlike/dev/final/benchmarked', dot: true})
//       .on('data', function () {
//         count++
//       })
//       .on('error', function (err) {
//         deferred.reject(err)
//       })
//       .on('end', function () {
//         // console.log(count)
//         deferred.resolve()
//       })
//   }, opts)
//   .add('GlobKernel', function (deferred) {
//     var globfs = new GlobKernel('.', {cwd: '/home/charlike/dev/final/benchmarked', dot: true, recursive: true})
//       .use(function (app) {
//         return function (file) {
//           if (!isMatch(file.path)) file.exclude = true
//         }
//       })
//       .on('data', function (file) {
//         // console.log(file)
//         count++
//       })
//       .on('error', function (err) {
//         // console.log(err)
//         deferred.reject(err)
//       })
//       .on('end', function () {
//         // console.log(count)
//         deferred.resolve()
//       })
//   }, opts)
//   // .add('fs-readdir', function (deferred) {
//   //   fsReaddir('.', '**/*', {cwd: '/home/charlike/dev/final/benchmarked', dot: true}, function (err, res) {
//   //     // console.log(err, res, res && res.length)
//   //     if (err) return deferred.reject(err)
//   //     deferred.resolve()
//   //   })
//   // }, opts)
//   .on('complete', function () {
//     console.log('Fastest is ' + bold(this.filter('fastest').map('name')))
//     process.exit(0)
//   })
//   .run({ defer: true })

// // suite
// //   .add('glob-stream original', function (deferred) {
// //     gso.create(gsoPatterns, options)
// //       .on('data', function (file) {
// //         count++
// //       })
// //       .on('end', function () {
// //         deferred.resolve()
// //       })
// //   }, opts)
// //   .add('glob-fs advanced', function (deferred) {
// //     new GlobFS(patterns, options)
// //       .on('data', function (file) {
// //         count++
// //       })
// //       .on('end', function () {
// //         deferred.resolve()
// //       })
// //   }, opts)
// //   .add('node-glob (globby)', function (deferred) {
// //     globby(gsoPatterns, options).then(function (paths) {
// //         deferred.resolve()
// //         //=> ['unicorn', 'rainbow']
// //     })
// //   }, opts)
//   // .add('node-glob (globby)', function (deferred) {
//     // require('glob-js').glob(patterns, null, function (err, files) {
//     //     console.log(err, files)
//     //     // deferred.resolve()
//     //     //=> ['unicorn', 'rainbow']
//     // })
//   // }, opts)
//   // .add('glob-fs kernel (single dir only)', function(deferred) {
//   //   var globfs = new GlobKernel('./playing', options)

//   //   globfs
//   //     .use(plugins.normalizeDots)
//   //     .use(plugins.match(patterns, options))
//   //     .use(plugins.reinclude(options))
//   //     .on('data', function (file) {
//   //       // count++
//   //       console.log(count++, file.path)
//   //     })
//   //     .on('end', function () {
//   //       // deferred.resolve()
//   //     })
//   // }, opts)

//   // .add('node-glob (single pattern only)', function (deferred) {
//   //   options.ignore = patterns.slice(1).map(function (pattern) {
//   //     return pattern.slice(1)
//   //   })

//   //   glob(patterns[0], options, function (err, files) {
//   //     // console.log('node-glob', files.length)
//   //     if (err) deferred.reject(err)
//   //     deferred.resolve()
//   //   })
//   // }, opts)
//   // .on('complete', function () {
//   //   console.log('Fastest is ' + bold(this.filter('fastest').map('name')))
//   //   process.exit(0)
//   // })
//   // .run({ defer: true })
