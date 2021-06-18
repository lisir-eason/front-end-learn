## 1.let 命令
<hr />
let 定义的变量只在let命令所在的代码块内有效。并且let定义的变量不存在变量提升，意味着不可以先使用后申明，会报错。也不允许重复定义。

```javascript
// var 的情况
console.log(foo); // 输出undefined
var foo = 2;

// let 的情况
console.log(bar); // 报错ReferenceError
let bar = 2;
```
## const命令
const声明的变量不得改变值，这意味着，const一旦声明变量，就必须立即初始化，不能留到以后赋值。

```javascript
const foo;
// SyntaxError: Missing initializer in const declaration
```
const定义变量的本质，不是变量的值不得变动，而是变量指向的那个内存地址保存的数据不得改动。对于简单的数据类型，变量保存的内存地址就是值。但对于对象和数组，变量保存的只是一个指向实际数据的指针，因此保证的是这个指针不会改变。以下用法是正确的不会保存：

```javascript
const foo = {};

// 为 foo 添加一个属性，可以成功
foo.prop = 123;
foo.prop // 123

// 将 foo 指向另一个对象，就会报错
foo = {}; // TypeError: "foo" is read-only
```

