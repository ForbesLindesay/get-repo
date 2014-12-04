# get-repo

Get the files in a repository on GitHub

[![Build Status](https://img.shields.io/travis/ForbesLindesay/get-repo/master.svg)](https://travis-ci.org/ForbesLindesay/get-repo)
[![Dependency Status](https://img.shields.io/gemnasium/ForbesLindesay/get-repo.svg)](https://gemnasium.com/ForbesLindesay/get-repo)
[![NPM version](https://img.shields.io/npm/v/get-repo.svg)](https://www.npmjs.org/package/get-repo)

## Installation

    npm install get-repo

## Usage

```js
var fs = require('fs');
var getRepo = require('get-repo');

getRepo('jadejs', 'jade-lexer', {cache: testCache}).on('data', function (entry) {
  console.log(entry.type + ': ' + entry.path);
  if (entry.type === 'Directory') {
    fs.mkdirSync(__dirname + '/jade-lexer' + entry.path);
  }
  if (entry.type === 'File') {
    fs.writeFileSync(__dirname + '/jade-lexer' + entry.path, entry.body);
  }
}).on('end', function () {
  console.log('done');
});
```

## License

  MIT
