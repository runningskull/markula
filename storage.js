// Libraries
var storage = require('localforage')
  , project_name = require('./package').name



// Stores

var config = storage.createInstance({
   name: project_name
  ,storeName: 'cfg'
})

var files = storage.createInstance({
   name: project_name
  ,storeName: 'files'
})



// Main Interface

function get_set(store, k, v, cb) {
  if (_is_function(v)) { cb=v ; v=undefined }
  
  cb = _with_throwing(cb)

  if (v === undefined) {
    store.getItem(k, cb);
  } else {
    store.setItem(k, v, cb);
  }
}

module.exports = {
   config: get_set.bind(null, config)
  ,files: get_set.bind(null, files)
}

module.exports.config.store = config
module.exports.files.store = files



// Helpers

function _noop() {}

function _with_throwing(f) { return function(e, x) { 
  if (e) throw e; 
  (f || _noop).apply(this, Array.prototype.slice.call(arguments, 1))
}}

var _is_function = $.isFunction

