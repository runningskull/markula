var throttle = require('lodash.throttle')
  , hljs = require('highlight.js')
  , marked = require('marked')
  , d = require('./dom')


function render(md) {
  md || (md = d.ed.val())
  d.md.html(marked(md))
  highlight()
}

var highlight = throttle(function() {
  d.preview.find('pre code').each(function(i, block) {
    hljs.highlightBlock(block)
  })
}, 2000)


module.exports = render

