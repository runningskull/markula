var storage = require('./storage')
  , search = require('./search')
  , key = require('keymaster')
  , r = require('./routing')
  , cfg = require('./cfg')
  , d = require('./dom')

function init() {
  // always listen for key shortcuts
  key.filter = function(){ return true }


  // Document handling

  key('command+n, ctrl+n', function() {
    if (!cfg.CURRENT_FILE || (cfg.CURRENT_FILE == cfg.default_filename)) {
      //noop
    } else {
      r.router.setRoute('/')
    }

    return false
  })

  key('command+s, ctrl+s', function() {
    if (!cfg.CURRENT_FILE || (cfg.CURRENT_FILE == cfg.default_filename)) {
      prompt_and_rename()
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

  key('command+shift+s, ctrl+shift+s', prompt_and_rename)

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


  // Utils


  search.init()
  listen_for_search()

}


function prompt_and_rename() {
  // save as a named file
  var file_name = prompt('Name this file:')
  if (file_name) {
    cfg.CURRENT_FILE = file_name
    save_file(function(){ r.router.setRoute('/'+file_name) })
    storage.files(cfg.default_filename, '')
  }
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

