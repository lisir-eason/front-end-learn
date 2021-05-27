### JS类型

js有7种内置类型：null undefined boolean number string object symbol

使用typeof运算符返回类型，但是null比较特殊：

```js
typeof null === 'object'  //true
```

所以如何判断呢

```js
(!null && typeof null === "object")   //true
```

### JS值

类数组：函数的arguments对象

```js
function foo() {
    var arr = Array.prototype.slice.call(arguments)
	// or var arr = Array.from(arguments)
    arr.push('b')
    console.log(arr)
}

foo('a', 'c')  //["a", "c", "b"]
```

这里用slice方法（或者es6的Array.from）将类数组对象arguments转换为数组对象，所以才可以使用数组的方法push