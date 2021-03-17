(function (global, factory) {
  global._ = factory();
})(window, function () {

  function each(obj, iterate) {
    var keys = Object.keys(obj);
    for (let index = 0; index < keys.length; index++) {
      const element = keys[index];
      obj[element] = iterate(element, obj[element]);
    }
    return obj
  }

  function filter(arr, predicate) {
    // _.filter([1, 2, 3], function(item){return item === 1})
    var result = [];
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];
      const isHit = predicate(element);
      if (isHit) {
        result.push(element)
      }
    }
    return result;
  }

  function mixin(source) {
    each(source, function (key, value) {
      _[key] = value;
      _.prototype[key] = function () {
        var arg =  [this._wrapped];
        Array.prototype.push.apply(arg, arguments); // [this._wrapped, arguments]
        return chainResult(this, value.apply(_, arg))
      }
    })
    return _
  }

  var sourceMap = {
    each: each,
    filter: filter,
    chain: chain,
  }

  //_.chain([1, 3]).map().filter()
  function chain(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance
  }

  function chainResult(instance, obj) {
    return instance._chain ? chain(_(obj)) : obj
  }

  _.prototype.value = function() {
    return this._wrapped;
  };

  function _(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  }

  return mixin(sourceMap)
})