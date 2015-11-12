
//------------------------------------------------------------------------------
// CSS

require('github-markdown-css/github-markdown.css')
require('highlight.js/styles/github.css')
require('./style.css')



//------------------------------------------------------------------------------
// App

// Libraries
var throttle = require('lodash.throttle')
  , storage = require('./storage')
  , hljs = require('highlight.js')
  , flow = require('lodash.flow')
  , marked = require('marked')
  , help = require('./help')
  , page = require('page')

// Config
var cfg = {
  sync_scroll: true
}

// Common references
var sync_scroll = scroll_syncer()
  , $preview = $('#preview')
  , $eframe = $('#editor-frame')
  , $md = $('.markdown-body')
  , $ed = $('#editor')
  , $bod = $('body')
  , $rs = $('#rs')

var CURRENT_FILE = null


// App

init_routing()

$(function() {
  load_config()

  listen_for_resize()
  listen_for_scroll()
  listen_for_input()

  help.init($ed, $preview)

  // kick things off
  page({hashbang: true})
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

function save_file() {
  var md = $ed.val()
  storage.files(CURRENT_FILE, md)
  return md
}

function handle_route(render, ctx) {
  CURRENT_FILE = ctx.params.file_id
  render && load_file()
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
  // triggered on initial page load
  page(':file_id', handle_route.bind(null, true))

  // triggered on navigation
  page('/:file_id', handle_route.bind(null, true))

  // default page
  page('/', function(){ CURRENT_FILE = '*scratch*' })
}
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

      persist('rs-position', e.pageX)
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

