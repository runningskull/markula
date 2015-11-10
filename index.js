

//------------------------------------------------------------------------------
// CSS

require('github-markdown-css/github-markdown.css')
require('highlight.js/styles/github.css')
require('./style.css')



//------------------------------------------------------------------------------
// App

// Libraries
var throttle = require('lodash.throttle')
  , storage = require('localforage')
  , hljs = require('highlight.js')
  , marked = require('marked')

// Config
var cfg = {
  sync_scroll: true
}

// Common references
var highlight = throttle(highlight_, 2000)
  , render = throttle(render_, 20)
  , sync_scroll = ScrollSyncer()
  , $preview = $('#preview')
  , $eframe = $('#editor-frame')
  , $md = $('.markdown-body')
  , $ed = $('#editor')
  , $bod = $('body')
  , $rs = $('#rs')


// App
$(function() {
  set_storage_config()
  load_saved_data()
  listen_for_resize()

  $ed.on('scroll', function() {
    sync_scroll($(this), $preview)
  })

  $preview.on('scroll', function() {
    sync_scroll($(this), $ed)
  })


  $ed.on('input', render)
  render()

  print_help()
})


//------------------------------------------------------------------------------
// Private Helpers

function render_() {
  var md = $ed.val()

  persist('md', md)

  $md.html(marked(md))
  highlight()
}

function highlight_() {
  $preview.find('pre code').each(function(i, block) {
    hljs.highlightBlock(block)
  })
}

function set_storage_config() {
  storage.config({
     name: 'mnmlmd'
    ,storeName: 'md'
  })
}

function load_saved_data() {
  load_into('md', $ed, 'val')
  load_into('editor-css', $ed, 'css', {default: {}})
  load_into('preview-css', $preview, 'css', {default: {}})
  load_into('sync-scroll', cfg, 'sync_scroll', {assign:true, default:true})

  cfg_load('rs-position', position_divider)
}

function ScrollSyncer() {
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

function listen_for_resize() {
  var $doc = $(document)
    , $bod = $('body')

  var ww

  $rs.on('dragstart', function(){ 
    ww = window.innerWidth

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

function resize_frames(xpx, ww) {
  ww || (ww = window.innerWidth)

  var x = (xpx / ww) * 100
    , xx = (100 - x)

  $eframe.css({width: x+'%'})
  $preview.css({left:x+'%', width:xx+'%'})
}

function position_divider(xpx) {
  if (xpx == undefined) return;
  var ww = window.innerWidth
  resize_frames(xpx, ww)
  $rs.css({left: xpx})
  $bod.removeClass('resizing')
}


function persist(k, v) { storage.setItem('mdcfg-'+k, v) }
function unpersist(k) { storage.removeItem('mdcfg-'+k) }
function cfg_load(k, cb) { return storage.getItem('mdcfg-'+k, with_throwing(cb)) }

function with_throwing(f) { return function(e) { 
  if (e) throw e; 
  f.apply(this, Array.prototype.slice.call(arguments, 1))
}}

function load_into(k, obj, field, opts) {
  /* Load stored config field 'k' into 'obj.field`.
   * Options:
   *  - assign: if true, do obj.field = x ; if false, obj.field(x)
   *  - default: provide a default value if config field not found
   */

  opts || (opts = {})

  cfg_load(k, function(v) {
    if (opts.default && (v == null))
      v = opts.default;

    if (opts.assign) { obj[field] = v } 
    else { obj[field](v) }
  })
}


//------------------------------------------------------------------------------
// Configuration Interface

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

window.md = {
  sync_scroll: function(b) { 
    if (b===undefined) { return cfg_load('sync-scroll') }
    persist('sync-scroll', b)
    cfg.sync_scroll = b
  }

  ,editor_css: function(css) {
    if (css===undefined) { return JSON.parse(cfg_load('editor-css')) }
    persist('editor-css', JSON.stringify(css))
    $ed.css(css)
  }

  ,preview_css: function(css) {
    if (css===undefined) { return JSON.parse(cfg_load('preview-css')) }
    persist('preview-css', JSON.stringify(css))
    $preview.css(css)
  }

  ,reset_config: function() {
    if (confirm("Erase saved config?")) {
      ['sync-scroll', 
        'editor-css', 
        'preview-css',
        'rs-position'].forEach(unpersist)

      location.reload()
    }
  }

  ,storage: storage
}

