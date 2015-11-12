var fuzzy = require('fuzzy')
  , storage = require('./storage')
  , at = require('lodash.at')

var f, filenames

function init() {
  reload()
}

function reload() {
  storage.files.store.keys(function(e, ks) {
    if (e) throw e;
    filenames = ks
  })
}

function search(pattern) {
  if (pattern == "")
    return filenames;

  var matches = fuzzy.filter(pattern, filenames).map(function(res) {
    return res.original
  })

  return matches
}


module.exports = {
  init: init,
  reload: reload,
  search: search
}

