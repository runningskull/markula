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

    ,storage: storage
  }

  window.md.css.editor = window.md.css.bind(null, $ed, 'editor')
  window.md.css.preview = window.md.css.bind(null, $preview, 'preview')

}

function print_help() {
  var _ = function(x,s){ console.log('%c'+x, s||'')}

  console.group("%cAvailable Configuration:", 'font-weight:bold;font-size:1.125em;')
  _("md.sync_scroll( Bool )")
  _("md.editor_css( {...} )")
  _("md.preview_css( {...} )")
  _("md.reset_config()")
  console.groupEnd()
  _("\nConfiguration settings will be persisted across sessions", "font-style:italic")
}

function clog() {
  console.log.apply(console, arguments)
}


module.exports = {init: init}

