var storage = require('./storage')
  , search = require('./search')
  , key = require('keymaster')
  , cfg = require('./cfg')
  , d = require('./dom')

function init() {
  // always listen for key shortcuts
  key.filter = function(){ return true }


  // Document handling

  key('command+s, ctrl+s', function() {
    if (!CURRENT_FILE || (CURRENT_FILE == cfg.default_filename)) {
      // save as a named file
      var file_name = prompt('Name this file:')
      if (file_name) {
        CURRENT_FILE = file_name
        save_file(function(){ router.setRoute('/'+file_name) })
        storage.files(cfg.default_filename, '')
      }
    } else {
      // placebo
      var delay = 210
        , old = document.title

      document.title = '✔ Saved'
      setTimeout(function(){ document.title = '✔ ' },       delay)
      setTimeout(function(){ document.title = '✔ Saved!' }, delay * 2)
      setTimeout(function(){ document.title = '✔ ' },       delay * 3)
      setTimeout(function(){ document.title = '✔ Saved!' }, delay * 4)
      setTimeout(function(){ document.title = old},         delay * 9)
    }

    return false
  })

  key('ctrl+p', function() {
    storage.files.store.keys(function(e, ks) {
      if (e) throw e;

      key.setScope('file-list')
      d.flist_frame.show()

      populate_file_list(ks)

      d.flist_search.focus()
    })

    return false
  })


  // Configuration

  key('ctrl+=', function() {
    storage.config('sync-scroll', function(current) {
      cfg.sync_scroll = !current
      storage.config('sync-scroll', !current)
    })
  })

  key('escape', 'file-list', function() {
    d.flist_frame.hide()
    key.setScope(null)
    return false
  })


  search.init()
  listen_for_search()

}


function listen_for_search() {
  d.flist_search.on('input', function() {
    var q = d.flist_search.val()
    populate_file_list(search.search(q))
  })
}

function populate_file_list(ks) {
  d.flist.empty()
  ks.forEach(function(k) {
    d.flist.append('<li><a href="#/'+k+'">'+k+'</li>')
  })
}

module.exports = {
  init: init
}

