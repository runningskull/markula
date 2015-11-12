
//------------------------------------------------------------------------------
// Externs

require('github-markdown-css/github-markdown.css')
require('highlight.js/styles/github.css')
require('./style.css')

require('jquery-tabby')



//------------------------------------------------------------------------------
// App

// Libraries
var throttle = require('lodash.throttle')
  , director = require('director')
  , storage = require('./storage')
  , hljs = require('highlight.js')
  , flow = require('lodash.flow')
  , search = require('./search')
  , pad = require('lodash.pad')
  , marked = require('marked')
  , key = require('keymaster')
  , help = require('./help')

// Config
var cfg = {
   sync_scroll: true
  ,default_filename: '*scratch*'
}

// Common references
var sync_scroll = scroll_syncer()
  , $eframe = $('#editor-frame')
  , $md = $('.markdown-body')
  , $preview = $('#preview')
  , $flist = $('#file-list')
  , $ed = $('#editor')
  , $bod = $('body')
  , $rs = $('#rs')

var $flist_frame = $flist.parent()
  , $flist_search = $('#file-list-search')

var CURRENT_FILE = null


// App

var router = init_routing()

$(function() {
  load_config()

  init_editor()
  listen_for_resize()
  listen_for_scroll()
  listen_for_input()

  init_key_shortcuts()
  init_file_search()
  help.init($ed, $preview)
})


// Private Helpers

var highlight = throttle(function() {
  $preview.find('pre code').each(function(i, block) {
    hljs.highlightBlock(block)
  })
}, 2000)

function render(md) {
  md || (md = $ed.val())
  $md.html(marked(md))
  highlight()
}

function save_file(cb) {
  var md = $ed.val()
  if ('function' != typeof cb) cb = undefined;
  storage.files(CURRENT_FILE, md, cb)
  return md
}


function scroll_syncer() {
  var dirty = false

  return function($source, $target) {
    if (!cfg.sync_scroll) { return }
    if (dirty) { return (dirty = false) }

    var epad = ($source[0].scrollHeight - $source.innerHeight()) || 1
      , epct = $source.scrollTop() / epad

    var ppad = ($target[0].scrollHeight - $target.innerHeight()) || 1

    dirty = true
    $target[0].scrollTop = Math.round(ppad * epct)
  }
}


function init_routing() {
  if (document.location.hash == '')
    document.location.hash = "/";

  var router = director.Router({
    '/': {
       '': handle_route
      ,'/(\\w+)(.md)?': {on: handle_route}
    }
  })

  // var router_nohash = director.Router({'/$': handle_route})
  //                             .configure({html5history: true})

  router.init()
  // router_nohash.init()

  return router
}

function init_editor() {
  $ed.tabby({tabString: '    '})
}

function init_key_shortcuts() {
  key.filter = function(){ return true }

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
      $flist_frame.show()

      populate_file_list(ks)

      $flist_search.focus()
    })

    return false
  })

  key('escape', 'file-list', function() {
    $flist_frame.hide()
    key.setScope(null)
    return false
  })
}

function init_file_search() {
  search.init()
  listen_for_search()
}

function load_config() {
  storage.config('editor-css', into($ed, 'css', {default: {}}))
  storage.config('preview-css', into($preview, 'css', {default: {}}))
  storage.config('sync-scroll', into(cfg, 'sync_scroll', {assign:true, default:true}))

  storage.config('rs-position', position_divider)
}

function load_file() {
  storage.files(CURRENT_FILE, flow(into($ed, 'val'), render))
}

function listen_for_resize() {
  var $doc = $(document)
    , $bod = $('body')

  $rs.on('dragstart.resize', function() { 
    var ww = window.innerWidth

    $ed.css({"user-select": "none"})
    $preview.css({"user-select": "none"})
    $rs.css({opacity:0})

    $doc.on('drop.resizing', function(e) { 
      e.preventDefault()

      $rs.css({left: e.pageX})
      $bod.removeClass('resizing')

      $ed.css({"user-select": ""})
      $preview.css({"user-select": ""})
      $rs.css({opacity:''})

      $doc.off('.resizing')
      $rs.off('.resizing')

      storage.config('rs-position', e.pageX)
    })

    $rs.on('drag.resizing', function (e) {
      resize_frames(e.pageX, ww)
    })
  })
}

function listen_for_scroll() {
  $ed.on('scroll.markula', function() {
    sync_scroll($(this), $preview)
  })

  $preview.on('scroll.markula', function() {
    sync_scroll($(this), $ed)
  })
}

function listen_for_input() {
  var _render = render.bind(null,null)
  $ed.on('input', throttle(flow(_render, save_file), 20))
}

function listen_for_search() {
  $flist_search.on('input', function() {
    var q = $flist_search.val()
    populate_file_list(search.search(q))
  })
}


function handle_route(file_id) {
  file_id == null && (file_id = cfg.default_filename)

  $flist_frame.hide()
  $flist_search.val('')

  CURRENT_FILE = file_id
  document.title = '✎ ' + file_id + '.md'
  load_file()

  $ed.focus()
}

function populate_file_list(ks) {
  $flist.empty()
  ks.forEach(function(k) {
    $flist.append('<li><a href="#/'+k+'">'+k+'</li>')
  })
}

function position_divider(xpx) {
  if (xpx == undefined) return;
  var ww = window.innerWidth
  resize_frames(xpx, ww)
  $rs.css({left: xpx})
  $bod.removeClass('resizing')
}

function resize_frames(xpx, ww) {
  ww || (ww = window.innerWidth)

  var x = (xpx / ww) * 100
    , xx = (100 - x)

  $eframe.css({width: x+'%'})
  $preview.css({left:x+'%', width:xx+'%'})
}

function into(obj, k, opts) {
  /* Returns a function that puts a 'val' into field 'k' of 'obj', returning 'val'
   * Options:
   *  - assign: if true, do obj.field = x ; if false, obj.field(x)
   *  - default: provide a default value if config field not found
   */

  opts || (opts = {})

  return function(val) {
    if (opts.default && (val == null))
      val = opts.default;

    if (opts.assign) { return obj[k] = val } 
    else { obj[k](val); return val }
  }
}


