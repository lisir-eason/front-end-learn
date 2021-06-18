### 1 this是什么
每个函数的this是在调用的时候绑定的，完全取决于函数的调用位置（也就是函数的调用方法）。需要注意的一点是，调用位置就是函数在代码中被调用的位置（而不是申明的位置）。一下举例来说明函数的调用位置：
### 2 this的绑定
#### 2.1 默认绑定
```javascript
function foo() {
	console.log(this.a)
}
var a = 2;
foo();  //2
```
这段代码中，foo()函数执行的环境是全局对象，因此 this也指向了全局对象。而在全局对象中有一个变量a为2，所以输出了2。
#### 2.2 隐式绑定
```javascript
function foo() {
	console.log(this.a)
}
var obj = {
	a: 1,
	foo: foo //此属性指向函数foo()
};
obj.foo();  //2
```
当函数引用有上下文对象时，隐式绑定规则就会把函数调用中的this绑定到这个上下文对象。因为调用foo()时this被绑定到了obj，因此this.a和obj.a是一样的。
#### 2.3 显式绑定
显示绑定依靠两个函数来实现：call()和apply()函数。它们的第一个参数是给this准备的，接着在调用函数时将其绑定到this。这种方法称之为显式绑定。
```javascript
function foo() {
	console.log(this.a);
}
var obj = {
	a: 2
};
foo.call(obj) //2
```
使用bind()函数实现硬绑定：
```javascript
function foo(something) {
	console.log(this.a, something);
	return this.a + something;
}
var obj = {
	a: 2
};
var bar = foo.bind(obj);
var b = bar(3); //2 3
console.log(b)  //5
```
使用bind()强行将obj绑定给foo()函数对象作为this的指向，这种方式我们称之为硬绑定。
#### 2.4 new绑定
在传统的面向类的语言中，“构造函数”是类中的一些特殊方法，使用new初始化类时会调用类中的构造函数。通常形式是这样的：
```java
something = new MyClass(...)
```
JavaScript中也有一个new操作符，然而，JavaScript中的new的机制实际上和面向类的语言完全不同。在JavaScript中，构造函数只是一些使用new操作符时被调用的函数。它们不会属于某个类，也不会实例化一个类，实际上，它们甚至都不能说是一种特殊的函数类型，它们只是被new操作符调用的普通函数而已。
```javascript
function Foo(a) {
	this.a = a;
}
var bar = new Foo(2);
console.log(bar.a); //2
```
在使用new操作符时，我们将this绑定到了当前的对象。
### 3 优先级
new > 显式 > 隐式 > 默认
因此，**判断this**的方法如下：
<1> 函数是否在new中调用（new绑定）？
```javascript
var bar = new Foo()
```
<2>函数是否通过call、apply（显式绑定）或者bind（硬绑定）调用？

```javascript
var bar = foo.call(obj)
```
<3> 函数是否在某个上下文对象中调用（隐式绑定）？
```javascript
var bar = obj.foo()
```
<4>如果都不是的话，使用的默认绑定。如果在严格模式下，就绑定到undefined，否则绑定到全局对象。
```javascript
var bar = foo()
```
注：在ES6中的箭头函数并不会使用四条标准的绑定规则，而是根据当前的词法作用域来决定this，具体来说，箭头函数会继承外层函数调用的this绑定（无论this绑定到什么）。这其实和ES6之前代码中的self = this 的机制一样。
