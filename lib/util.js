module.exports = {

  into: function(obj, k, opts) {
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


}

