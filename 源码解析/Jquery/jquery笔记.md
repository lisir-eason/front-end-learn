# Jquery源码阅读笔记

#### 基础知识：js中创建对象

读jquery之前，js中创建一个对象的方法如下：

```javascript
//组合模式 实现一个对象
var Person = function(name) {   
  this.name = name
  this.sayName =function () {
    console.log('我的名字是 ' + this.name)
  }
}

Person.prototype = {
  constructor: Person,
  age: 10,
  sayAge: function () {
    console.log('我的年龄是 ' + this.age)
  }
}

var tony = new Person('tony')

tony.sayName()  //我的名字是 tony
tony.sayAge()  //我的年龄是 10
```

我们发现这种方法使用new()才能生成一个实例，但是jquery中不需要new()就可以创建一个对象，这是为什么呢？

#### Jquery中的关键代码

立即执行函数避免全局变量污染，然后支持AMD和ConmonJS,以及绑定到window。

```javascript
( function( global, factory ) {
    //支持commonJS nodejs环境
    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.exports = global.document ?
            factory( global, true ) :
            function( w ) {
                if ( !w.document ) {
                    throw new Error( "jQuery requires a window with a document" );
                }
                return factory( w );
            };
    } else {
        //html的script标签中直接引入
        factory( global );
    }
} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {
    //支持AMD require.js
    if ( typeof define === "function" && define.amd ) {
        define( "jquery", [], function() {
            return jQuery;
        } );
    }
    //暴露出jQuery和$
    if ( typeof noGlobal === "undefined" ) {
        window.jQuery = window.$ = jQuery;
    }
}
```

那么jQuery到底是什么呢？

```javascript
jQuery = function( selector, context ) {)
	return new jQuery.fn.init( selector, context );
};

init = jQuery.fn.init = function( selector, context, root ) {
    ...
    elem = document.getElementById( match[ 2 ] );  //处理id的情况
    if ( elem ) {
        this[ 0 ] = elem;
        this.length = 1;
    }
    return this;  //其实是jQuery.fn 也就是jQuery.prototype
}

jQuery.fn = jQuery.prototype = {
    jquery: version,
	constructor: jQuery,
    toArray: function() {
		return slice.call( this );
	},
    ... 
}
```







```javascript

```

