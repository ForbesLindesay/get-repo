'use strict';

var EXPECTED_CHECKSUM = 'c4a044735c83ee557b80578123374c859703d9d797c331a32374d503b55c1501ca2df36538a2545aab5615fd6a203d2f1ede17f3f7b35af10cbb2432ee86b0c2';
var UPDATE_CACHE = false;
var SKIP_CACHE = false;

var assert = require('assert');
var crypto = require('crypto');
var FileCache = require('http-basic/lib/file-cache');
var getRepo = require('../');

assert(!(UPDATE_CACHE && SKIP_CACHE));

var checksum = crypto.createHash('sha512');


// use a cache that returns mocked responses with cache-control set to never expire
// that way we don't actually have to hit github

// to update the cache, just delete the "cache" folder
var testCache = new FileCache(__dirname + '/cache');
testCache.isExpired = function () {
  return UPDATE_CACHE || SKIP_CACHE;
};
testCache.canCache = function () {
  return !SKIP_CACHE;
};


getRepo('jadejs', 'jade-lexer', {cache: testCache}).on('data', function (entry) {
  checksum.update(entry.type);
  checksum.update(entry.path);
  if (entry.type === 'File') checksum.update(entry.body);
}).on('end', function () {
  if (UPDATE_CACHE) {
    console.log('Updated checksum: ' + checksum.digest('hex'));
  } else {
    assert(checksum.digest('hex') === EXPECTED_CHECKSUM);
    console.log('tests passed');
  }
});