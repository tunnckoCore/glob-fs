/*!
 * glob-fs <https://github.com/tunnckoCore/glob-fs>
 *
 * Copyright (c) 2016 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

/* jshint asi:true */

'use strict'

var GlobFS = require('./index')
var stream = new GlobFS('./(*.{json,md})', {
  exclude: /CHANGELOG/,
  include: /.yml/
})

stream
  .on('data', console.log)
  .on('error', console.error)

// =>
// <File ".codeclimate.yml">
// <File ".travis.yml">
// <File ".verb.md">
// <File "CONTRIBUTING.md">
// <File "package.json">
