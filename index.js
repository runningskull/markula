
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
  , routing = require('./lib/routing')
  , storage = require('./lib/storage')
  , render = require('./lib/render')
  , hljs = require('highlight.js')
  , flow = require('lodash.flow')
  , help = require('./lib/help')
  , keys = require('./lib/keys')
  , pad = require('lodash.pad')
  , marked = require('marked')
  , cfg = require('./lib/cfg')
  , u = require('./lib/util')
  , d = require('./lib/dom')


var sync_scroll = scroll_syncer()
var router = routing.init()


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


function init_editor() {
  d.ed.tabby({tabString: '    '})
}

function load_config() {
  storage.config('editor-css', u.into(d.ed, 'css', {default: {}}))
  storage.config('preview-css', u.into(d.preview, 'css', {default: {}}))
  storage.config('sync-scroll', u.into(cfg, 'sync_scroll', {assign:true, default:true}))

  storage.config('rs-position', position_divider)
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
  d.ed.on('input', throttle(flow(_render, u.save_file), 20))
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


// TODO: this is needed by keys.js
//       perhaps make a divider.js instead?
window.position_divider = position_divider

