# TypeScript 学习笔记

本文是作者在学习TypeScript 时的学习笔记，重在一些基础概念，一些前端工程师可能不太了解的概念，比如接口（Interfaces）、泛型（Generics）、类（Classes）、枚举类型（Enums）等。希望以后在使用TypeScript 可以回顾以前所学

> TypeScript 是 JavaScript 的类型的超集，它可以编译成纯 JavaScript。编译出来的 JavaScript 可以运行在任何浏览器上。TypeScript 编译工具可以运行在任何服务器和任何系统上。TypeScript 是开源的。

### 安装 TypeScript

```javascript
npm install -g typescript
```

编译一个 TypeScript 文件：

```javascript
tsc hello.ts
```

### Hello TypeScript

```typescript
function sayHello(person: string) {
    return 'Hello, ' + person;
}

let user = 'Tom';
console.log(sayHello(user));
```

### 原始数据类型

> 布尔值

```typescript
let isTrue: boolean = false;
```

> 数值

```typescript
let num: number = 6;
```

> 字符串

```typescript
let name: string = 'Tom';
//可以使用模板字符串
let myName: string = `hi, my name is ${name}`
```

> 空值

```typescript
//js中没有空值（void）的概念，在ts中，可以用void表示没有任何返回值的函数
function alert(): void {
  alert('Hi')
}
```

> Null 和 Undefined

```typescript
//ts中有null和undefined类型，与void不同的是，null和undefined是所有类型的子集，意味着它可以赋值给number或者string而不会报错
let u: undefined = undefined;
let n: null = null;
//不报错
let num:number = undefined;
```

### 任意值

任意值any，**声明一个变量为任意值之后，对它的任何操作，返回的内容的类型都是任意值**

```typescript
let anyName: any = 'hi';
anyName = 4;
```

如果一个值在申明的时候没有注明它的类型，默认为any

### 类型推论

TypeScript 会在没有明确的指定类型的时候推测出一个类型，这就是类型推论。

```typescript
//报错，是因为ts将myNumber推论成string类型，对string赋值number类型报错，这就是类型推论
let myNumber = 'seven';
myNumber = 7;
```

**如果定义的时候没有赋值，不管之后有没有赋值，都会被推断成** `any` **类型而完全不被类型检查**

### 联合类型

```typescript
//所谓联合类型，有点像可选项
let myNum: string | number;
myNum = 'seven';
myNum = 7;
```

当ts不知道联合类型到底是哪个类型的时候，**只能访问此联合类型的所有类型里共有的属性或方法**

```typescript
//报错，number类型是没有length属性的，但是可以调用公共方法，比如return someting.toString()
function getLength(someting: sting | number): number{
  return something.length
}
```

### 接口 -- 对象的类型

先来看一个例子

```typescript
//其实接口就是对对象的一种约束，约束对象应该长成什么样子。对象应用接口就必须保持一致，不能多也不能少属性，否则报错。但是可选属性除外
interface Person {
  name: string;
  age: number;
  sex?: boolean; //属性名后加上？表示这是个可选属性
  [propName: string]: any; //表示这是个任意属性，但注意这个任意类型后的any若改为string，其它的属性就都														只能是string了
  readonly id: number; //readonly表示这个是只读属性
}

let Tom: Person {
  name: 'Tom',
  age: 12
}
```

### 数组类型

```typescript
//最简单的定义数组的方法
let arr: number[] = [1, 2, 3]；
//也可以用数组泛型表示
let arr: Array<number> = [1, 2, 3];
//还可以用接口描述数组
interface NumberArray {
  [index: number]: number;
}
let arr: NumberArray = [1, 2, 3]
```

> 类数组不是数组类型，不能赋值给数组，如下会报错

```typescript
//实际上 类数组类型有它的接口，ts内置了IArguments
function sum() {
  let args: number[] = arguments; //类型不符报错
  let args: IArguments = arguments; //不会报错，ts内置的接口
}
```

### 函数类型

```typescript
//ts中定义函数，不仅有输入也要限制输出
function sum(x: number, y: number): number {
  return x + y;
}
//也可以用函数表达式定义
let sum = function (x: number, y: number): number {
  return x + y;
}
//用接口定义函数
interface SearchFunc {
  (source: string, subString: string) : boolean;
}
let mySearch: SearchFunc;
mySearch = function(source: string, subString: string) {
  return source.search(subString) !== -1;
}
```

> 可选参数：可选参数必须接在必需参数后面。换句话说，**可选参数后面不允许再出现必需参数了**

```typescript
//z为可选参数 x为参数默认值，一旦有默认值，该参数就被识别为可选参数，并且不受后面不能出现必选参数的限制
function sum(x: number = 1, y: number, z?: number): number {
  return x + y;
}
```

> 剩余参数：与ES6相似，其实是一个数组items，用数组约束即可

```typescript
function push(array: any[], ...items: any[]): void {
  items.forEach(function(item) {
    array.push(item);
  })
}

let a = [];
push(a, 1, 2, 3);
```

### 类型断言

类型断言（Type Assertion）可以用来手动指定一个值的类型。

```typescript
<类型>值
//或者
值 as 类型
```

看一个例子：

```typescript
//上面提到过，这样会报错，因为不知道something的类型
function getLength(something: string | number): number {
  return something.length;
}
//但是有时候我们确实需要去访问参数的属性，比如
function getLength(someting: string | number): number {
  if (something.length) {
    return someting.length;
  } else {
    return someting.toString().length;
  }
}
//这样会报错，所以我们需要使用类型断言，将someting断言成string这样就不会报错：
function getLength(someting: string | number): number {
  if (<string>something.length) {
    return <string>someting.length;
  } else {
    return someting.toString().length;
  }
}
```

