### Jquery源码阅读笔记

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

看下jquery中的代码

#### Jquery中的关键代码

```javascript

jQuery = function( selector, context ) {
    // 这里返回jQuery.fn.init
    return new jQuery.fn.init( selector, context );
};

init = jQuery.fn.init = function( selector, context, root ) {
    ...
    return this.constructor( context ).find( selector );
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

