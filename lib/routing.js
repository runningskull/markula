var director = require('director')
  , storage = require('./storage')
  , render = require('./render')
  , flow = require('lodash.flow')
  , cfg = require('./cfg')
  , u = require('./util')
  , d = require('./dom')

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

  module.exports.router = router
  return router
}

function handle_route(file_id) {
  file_id == null && (file_id = cfg.default_filename)

  d.flist_frame.hide()
  d.flist_search.val('')

  cfg.CURRENT_FILE = file_id
  document.title = '✎ ' + file_id + '.md'
  load_file()

  d.ed.focus()
}

function load_file() {
  storage.files(cfg.CURRENT_FILE, flow(u.into(d.ed, 'val'), render))
}


module.exports = {
   init: init_routing
  ,router: null
}

