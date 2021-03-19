# Underscore的源码阅读笔记

### Underscore的使用

[Underscore.js中文网]: https://underscorejs.net/	"Underscore.js中文网"

普通使用

```javascript
_.map([1, 2, 3], function(num){ return num * 3; });
// [3, 6, 9]
```

这里是underscore的一个链式调用，和jquey一样支持链式调用。

```javascript
var r = _.chain([1, 4, 9, 16, 25])
         .map(Math.sqrt)
         .filter(x => x % 2 === 1)
         .value();

console.log(r); // [1, 3, 5]
```

### 模块化和立即执行函数

匿名的立即执行函数是为了避免污染全局作用域，在函数中对AMD（异步加载的浏览器环境）、CommonJS（Nodejs环境）实现了支持，但并未对CMD（SeaJS）支持。最后将factory()挂载在global，即window上。

```javascript
//立即执行函数，保护全局变量不被污染
    (function (global, factory) {
      //对CommonJS的支持，即module.exports，适用于Nodejs
      typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
      //对AMD的支持，例如RequireJS
      typeof define === 'function' && define.amd ? define('underscore', factory) :
      (global = global || self, (function () {
        var current = global._;
        //在浏览器中，这里的global就是window对象，所以可以全局使用 ‘_’
        var exports = global._ = factory();
        //对变量_的冲突处理，如果非要使用_作为变量名
        exports.noConflict = function () { global._ = current; return exports; };
      }()));
    })(this, function () {});
```

### underescore/_到底是啥?

立即执行函数中return的是**mixin(allExports)**，allExports是一个集合很多方法的对象。

```javascript
var allExports = {
    __proto__: null,
    VERSION: VERSION,
    each: each,
    forEach: each,
    mixin: mixin, //mixin方法暴露给_,因此可以通过_.min(obj)方法给_扩展方法。
    ...
}
```

mixin方法可以给\_ 和\_.prototype上绑定方法，当然mixin也被暴露给**\_**，可以让开发者给**\_**和**\_.prototype**上扩展方法。在开始的使用例子中，**_.map([1, 2, 3], function(num){ return num * 3; });**这里就是使用的\_上的方法。

```javascript
//mixin方法
function mixin(obj) {
  each(functions(obj), function(name) {
    //给_上绑定方法
    var func = _[name] = obj[name];
    //给_.prototype上绑定方法，那么问题来了为啥要绑定两次？其实是为了实现链式调用，给_的实例使用的
    _.prototype[name] = function() {
      var args = [this._wrapped];
      push.apply(args, arguments);  //这里将参数push进args，得到[this._wrapped, arguments]
      return chainResult(this, func.apply(_, args));
    };
  });
  return _;
}
```

而在链式调用中，**\_.chain([1, 4, 9, 16, 25])**，调用**\_.chain()**方法，首先会创建一个\_的实例，然后设置属性**\_chain**为**true**，然后返回这个实例。

```javascript
//给_的实例添加一个_chain为true, chain()方法也通过mixin方法暴露给_和_.prototype了
function chain(obj) {
  var instance = _(obj);
  instance._chain = true;
  return instance;   //返回的是_的实例，因此调用的是_.prototype上的方法
}

//这里觉得这个逻辑比较绕，建议可以打断点看看到底在做什么
//总体要实现：给一个obj，返回一个_的实例，实例的_wrapped属性是obj
function _(obj) {
    if (obj instanceof _) return obj;  //判断obj是不是_的实例，是的话就不用了new了，直接return obj
    //这里在return之前new了个_的实例，第一次初始化的时候this是window，new之后this就是实例了。如果没有判断就死循环了，个人	   觉得这里逻辑比较经典吧！和jquery也是实现了无new的实例化过程。
    if (!(this instanceof _)) return new _(obj); 
    this._wrapped = obj;  //这里是new的时候给实例加属性_wrapped
}
```

当下一步调用方法时，比如**instance.map()**，此时调用***\_.prototype***上的方法，把方法返回的结果，作为**chainResult**的方法，从而得到一个新的\_的实例，且**\_wrapped**为新的结果。

```javascript
//chainResult方法，instance为之前的实例，obj为新的结果，这里就return回去一个新的_实例，_wrapped为新的结果，
//并且_chain为	ture
function chainResult(instance, obj) {
  return instance._chain ? _(obj).chain() : obj;
}
```

链式最后调用**.value()**方法返回实例的**\_wrapped**属性。

```javascript
//.value方法返回_wrapped
_.prototype.value = function() {
  return this._wrapped;
};
```

以上就分析完了两种最常用的使用方法。

### 自己尝试写下

```javascript
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
```