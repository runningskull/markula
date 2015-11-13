
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
  , storage = require('./lib/storage')
  , director = require('director')
  , hljs = require('highlight.js')
  , flow = require('lodash.flow')
  , help = require('./lib/help')
  , keys = require('./lib/keys')
  , pad = require('lodash.pad')
  , marked = require('marked')
  , cfg = require('./lib/cfg')
  , d = require('./lib/dom')


var sync_scroll = scroll_syncer()
var CURRENT_FILE = null
var router = init_routing()


// App

$(function() {
  load_config()

  init_editor()
  listen_for_resize()
  listen_for_scroll()
  listen_for_input()

  keys.init()
  help.init(d.ed, d.preview)
})


// Private Helpers

var highlight = throttle(function() {
  d.preview.find('pre code').each(function(i, block) {
    hljs.highlightBlock(block)
  })
}, 2000)

function render(md) {
  md || (md = d.ed.val())
  d.md.html(marked(md))
  highlight()
}

function save_file(cb) {
  var md = d.ed.val()
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
      ,'/([\\w$-_.+!*\'(),]+)(.md)?': {on: handle_route}
    }
  })

  // var router_nohash = director.Router({'/$': handle_route})
  //                             .configure({html5history: true})

  router.init()
  // router_nohash.init()

  return router
}

function init_editor() {
  d.ed.tabby({tabString: '    '})
}

function load_config() {
  storage.config('editor-css', into(d.ed, 'css', {default: {}}))
  storage.config('preview-css', into(d.preview, 'css', {default: {}}))
  storage.config('sync-scroll', into(cfg, 'sync_scroll', {assign:true, default:true}))

  storage.config('rs-position', position_divider)
}

function load_file() {
  storage.files(CURRENT_FILE, flow(into(d.ed, 'val'), render))
}

function listen_for_resize() {
  var $doc = $(document)
    , $bod = $('body')

  d.rs.on('dragstart.resize', function() { 
    var ww = window.innerWidth

    d.ed.css({"user-select": "none"})
    d.preview.css({"user-select": "none"})
    d.rs.css({opacity:0})

    $doc.on('drop.resizing', function(e) { 
      e.preventDefault()

      d.rs.css({left: e.pageX})
      $bod.removeClass('resizing')

      d.ed.css({"user-select": ""})
      d.preview.css({"user-select": ""})
      d.rs.css({opacity:''})

      $doc.off('.resizing')
      d.rs.off('.resizing')

      storage.config('rs-position', e.pageX)
    })

    d.rs.on('drag.resizing', function (e) {
      resize_frames(e.pageX, ww)
    })
  })
}

function listen_for_scroll() {
  d.ed.on('scroll.markula', function() {
    sync_scroll($(this), d.preview)
  })

  d.preview.on('scroll.markula', function() {
    sync_scroll($(this), d.ed)
  })
}

function listen_for_input() {
  var _render = render.bind(null,null)
  d.ed.on('input', throttle(flow(_render, save_file), 20))
}


function handle_route(file_id) {
  file_id == null && (file_id = cfg.default_filename)

  d.flist_frame.hide()
  d.flist_search.val('')

  CURRENT_FILE = file_id
  document.title = '✎ ' + file_id + '.md'
  load_file()

  d.ed.focus()
}

function position_divider(xpx) {
  if (xpx == undefined) return;
  var ww = window.innerWidth
  resize_frames(xpx, ww)
  d.rs.css({left: xpx})
  d.bod.removeClass('resizing')
}

function resize_frames(xpx, ww) {
  ww || (ww = window.innerWidth)

  var x = (xpx / ww) * 100
    , xx = (100 - x)

  d.eframe.css({width: x+'%'})
  d.preview.css({left:x+'%', width:xx+'%'})
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


