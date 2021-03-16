## Underscore的源码阅读笔记

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

立即执行函数中return的是mixin(allExports)

```javascript
//allExports是一个集合很多方法的对象
var allExports = {
    __proto__: null,
    VERSION: VERSION,
    each: each,
    forEach: each,
    ...
}

//
function mixin(obj) {
  each(functions(obj), function(name) {
    //给_上绑定方法
    var func = _[name] = obj[name];
    //给_.prototype上绑定方法
    _.prototype[name] = function() {
      var args = [this._wrapped];
      push.apply(args, arguments);
      return chainResult(this, func.apply(_, args));
    };
  });
  return _;
}

function _(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
}
```

在开始的使用例子中，_.map([1, 2, 3], function(num){ return num * 3; });其实这里就是使用的

```javascript

```

