'use strict';

var zlib = require('zlib');
var Transform = require('barrage').Transform;
var Promise = require('promise');
var tar = require('tar');
var request = require('http-basic');
var concat = require('concat-stream');

module.exports = getRepo;
function getRepo(username, repo, options) {
  options = options || {};
  var stream = new Transform({objectMode: true});
  stream._transform = function (entry, _, callback) {
    entry.then(function (entry) {
      stream.push(entry);
    }).nodeify(callback);
  };
  var errored = false;
  function reject(err) {
    errored = true;
    setTimeout(function () {
      stream.emit('error', err);
      stream.end();
    }, 0);
  }
  function push(entry) {
    if (!errored) {
      var type = entry.type;
      var path = entry.path.replace(/^[^\/]*/, '');
      if (type === 'Directory') {
        stream.write(Promise.resolve({type: type, path: path}));
      } else if (type === 'File') {
        stream.write(new Promise(function (resolve) {
          return entry.pipe(concat(function (body) {
            resolve({type: type, path: path, body: body});
          }));
        }));
      }
    }
  }
  request('GET',
          'https://github.com/' + username + '/' + repo + '/archive/' + (options.tag || 'master') + '.tar.gz',
          {followRedirects: true, gzip: false, cache: options.cache, headers: options.headers},
          function (err, res) {
    if (err) {
      return reject(err);
    }
    if (res.statusCode !== 200) {
      return reject(new Error('Unexpected status code ' + res.statusCode));
    }
    var gunzip = zlib.createGunzip();
    var extract = new tar.Parse();
    res.body.on('error', reject);
    gunzip.on('error', reject);
    extract.on('error', reject);
    res.body.pipe(gunzip).pipe(extract);

    extract.on('entry', push);
    extract.on('end', function () {
      if (!errored) {
        stream.end();
      }
    });
  });
  return stream;
}