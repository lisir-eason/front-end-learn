对于闭包一种很准确的定义：
无论通过何种手段将内部函数传递到所在的词法作用域以外，它都会持有对原始定义作用域的引用，无论在何处执行这个函数都会使用闭包。

```javascript
function foo () {
	var a = 2;
	function bar () {
		console.log(a);
	}
	return bar;
}
var baz = foo();
baz(); //2 这就是闭包的效果
```
通俗的讲，其实就是函数A内部的一个函数B，通过一些方法将这个内部的函数B暴露出去，在外部调用此函数B，即可访问函数A的作用域及其变量。

```javascript
function wait (message) {
	setTimeout( function timer () {
		console.log(message);
	}, 1000);
}
wait("Hello closure")
```
wait(...)执行1000毫秒后，它的内部作用域并不会消失，timer函数依然持有wait(...)作用域的闭包。
因此，在定时器、事件监听器、Ajax请求、跨窗口通信、Web Workers或者任何其他的异步（或者同步）任务中，只要使用了回调函数，实际上就是在使用闭包！
#### 循环和闭包

```javascript
for (var i = 1; i <= 5; i++) {
	setTimeout(function timer() {
		console.log(i);
	}, i*1000)
}
```
正常情况下，我们对这段代码的预期是分别输出1-5，每秒一次，每次一个。
但实际上，这段代码运行时会以每秒一次输出五次6。
原因是因为，回调函数的执行在for循环结束后才执行，此时只有一个i，那就是6。
那么，如何才能达到我们的预期呢？

```javascript
for (var i = 1; i <= 5; i++) {
	(function(j){
		setTimeout(function timer() {
			console.log(j);
		}, j*1000)
	})(i)
}
```
在迭代内使用IIFE会为每个迭代都生成一个新的作用域，使得延迟函数的回调可以将新的作用域封闭在每个迭代内部，每个迭代中都会含有一个具有正确值的变量供我们访问。
当然，此问题也可以使用let定义i解决：

```javascript
for (let i = 1; i <= 5; i++) {
	setTimeout(function timer() {
		console.log(i);
	}, 1000*i);
}
```

