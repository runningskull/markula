// Libraries
var throttle = require('lodash.throttle')
  , hljs = require('highlight.js')
  , marked = require('marked')

// Config
var do_sync_scroll = true

// Common references
var highlight = throttle(highlight_, 2000)
  , render = throttle(render_, 20)
  , sync_scroll = ScrollSyncer()
  , $preview = $('#preview')
  , $eframe = $('#editor-frame')
  , $ed = $('#editor')
  , $md = $('.markdown-body')
  , $rs = $('#rs')


// App
$(function() {
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

function load_saved_data() {
  $ed.val(sload('md'))
  $ed.css(sload('ed-css') || {})
  $preview.css(sload('preview-css') || {})

  var ss = sload('sync-scroll')
  if (ss != null) do_sync_scroll = (ss != 'false');
}

function print_help() {
  var _ = function(x,s){ console.log('%c'+x, s||'')}

  _("Available Configuration:", 'font-weight:bold;font-size:1.125em;')
  console.group()
  _("md.sync_scroll( Bool )")
  _("md.editor_css( {...} )")
  _("md.preview_css( {...} )")
  _("md.reset_config()")
  console.groupEnd()
  _("\nConfiguration settings will be persisted across sessions")
}

function ScrollSyncer() {
  var dirty = false

  return function($source, $target) {
    if (!do_sync_scroll) { return }
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
    })

    $rs.on('drag.resizing', function (e) {
      var x = (e.pageX / ww) * 100
        , xx = (100 - x)

      $eframe.css({width: x+'%'})
      $preview.css({left:x+'%', width:xx+'%'})
    })
  })
}

function persist(k, v) { localStorage.setItem('mnmlmd-'+k, v) }
function unpersist(k) { localStorage.removeItem('mnmlmd-'+k) }
function sload(k) { return localStorage.getItem('mnmlmd-'+k) }


//------------------------------------------------------------------------------
// Available Configuration

window.md = {
  sync_scroll: function(b) { 
    if (b===undefined) { return sload('sync-scroll') }
    persist('sync-scroll', b)
    do_sync_scroll = b
  }

  ,editor_css: function(css) {
    if (css===undefined) { return sload('editor-css') }
    persist('editor-css', css)
    $ed.css(css)
  }

  ,preview_css: function(css) {
    if (css===undefined) { return sload('preview-css') }
    persist('preview-css', css)
    $preview.css(css)
  }

  ,reset_config: function() {
    if (confirm("Erase saved config?")) {
      ['sync-scroll', 
        'editor-css', 
        'preview-css'].forEach(unpersist)

      location.reload()
    }
  }
}



////////////////////////////////////////////////////////////////////////////////
// CSS

require('github-markdown-css/github-markdown.css')
require('./style.css')


