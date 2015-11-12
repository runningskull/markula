var storage = require('./storage')

function init($ed, $preview) {

  window.md = {
    sync_scroll: function(b) { 
      if (b===undefined) { return cfg_load('sync-scroll') }
      storage.config('sync-scroll', b)
      cfg.sync_scroll = b
    }

    ,css: function($elem, name, css, _val) {
      if (css === undefined) { return storage.config(name + '-css', clog) }

      if (_val) {
        var key = css
        css = {}
        css[key] = _val
      }

      storage.config(name + '-css', css)
      $elem.css(css)
    }

    ,reset_config: function(k) {
      if (k) {
        if (k instanceof Array) 
          k.forEach(md.reset_config);
        else 
          storage.config(k, null);
      } else {
        if (confirm("Erase all saved config?")) {
          window.md.reset_config([
            'sync-scroll', 
            'editor-css', 
            'preview-css',
            'rs-position'
          ])

          location.reload()
        } else {
          console.log('Configuration left unchanged.')
        }
      }
    }

    ,rm: function(filename) {
      if (!filename) return;

      if (! (filename instanceof Array))
        filename = [filename];

      if (confirm("About to remove files:\n\n-----\n\n" + filename.join("\n") + '\n\n-----\n\nReally do it?')) {
        filename.forEach(function(f) {
          storage.files.store.removeItem(f)
        })
      }
    }

    ,list_files: function() {
      storage.files.store.keys(function(e, ks) {
        if (e) throw e;
        console.log(ks)
      })
    }

    ,storage: storage
  }

  window.md.css.editor = window.md.css.bind(null, $ed, 'editor')
  window.md.css.preview = window.md.css.bind(null, $preview, 'preview')

  print_help()

}

function print_help() {
  var _ = function(x,s){ console.log('%c'+x, s||'')}
    , cmdcss = 'font-family:monospace;padding:4px;display:inline-block;background:#f2f2f2;font-weight:bold;'

  console.group("%cKeyboard Shortcuts:", 'font-weight:bold;font-size:1.125em;')
  _("<" + (is_mac() ? "cmd" : "ctrl") + "-s> :: Save/name file")
  _("<ctrl-p> :: Find saved file")
  _("<ctrl-=> :: Toggle scroll syncing")
  console.groupEnd()
  _("")

  console.group("%cAvailable Configuration:", 'font-weight:bold;font-size:1.125em;')
  _('md.rm( "filename" )              ||  md.rm(["f1", "f2", ...])')
  _('md.css.editor( "prop", "val" )   ||  md.css.editor( {prop:val, ...} )')
  _('md.css.preview( "prop", "val" )  ||  md.css.preview({prop:val, ...})')
  _('md.css( $elem, "storage-key", {prop:val, ...} )')
  _('md.sync_scroll( sync? )')
  _('md.reset_config()')
  console.groupEnd()
  _("")
  
  if (! is_mac()) {
    $('.windosx').text('ctrl')
  }
}

function clog() {
  console.log.apply(console, arguments)
}

function is_mac() {
  return ['Mac68K', 'MacPPC', 'MacIntel'].indexOf(navigator.platform)
}


module.exports = {init: init}

