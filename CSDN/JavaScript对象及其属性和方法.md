### 1 浅复制
Object.assign()方法实习对象的浅复制，其实就是使用 = 来赋值。
```javascript
var newObject = Object.assign({}, myObjext)
```
### 2 属性描述符
Object.getOwnPropertyDescriptor(...)获取属性描述符
```javascript
var myObject = {
	a: 2
}
Object.getOwnPropertyDescriptor(myObject, "a") //第一个参数是对象，第二个参数是属性名
//{
//	value: 2,  //值
//	writable: true,  //可写
//	enumrable: true,  //可枚举
//	configurable: true  //可配置
//}
```
Object.defineProperty(...)添加或修改一个已有的属性（如果可配置为true），并对其特性进行设置。
```javascript
var myObject = {}
Object.defineProperty(myObject, "a", {
	value: 2,  
	writable: true,  
	enumrable: true,  
	configurable: true  
}) //第一个参数是对象，第二个参数是属性名，第三个参数是一个对象，用来设置特性
```
### 3 不变性
##### 	3.1 对象常量
结合writable: false 和 configurable: false 就可以创建一个真正的常量属性（不可修改、重定义或者删除）
##### 3.2 禁止扩展
使用Object.preventExtensions(...)可以禁止一个对象添加新属性并且保留已有属性，改函数只有一个参数，即为需要禁止的对象。
##### 3.3 密封
Object.seal(...)
##### 3.4 冻结
Object.freeze(...)
###  4 Getter和Setter
可以为对象设置getter和setter，如下：

```javascript
var myObject = {
	//给a定义一个getter
	get a() {
		return this._a_;
	}
	//给a定义一个setter
	set a(val) {
		this._a_ = val * 2;
	}
}
```
### 5 存在性

```javascript
var myObject = {
	a: 2
}
("a" in myObject); //true
("b" in myObject); //false
myObject.hasOwnProperty("a"); //true
myObject.hasOwnProperty("b"); //false
```
in操作符会检查属性是否在对象及其【prototype】原型链中。相比之下，hasOwnProperty(...)只会检查属性是否在myObject对象中，不会检查【prototype】原型链。
注意：in操作符看似检查的是某个容器中是否有某个值，其实检查的是属性名，应用到数组中，检查的是否有某个index，而不是是否有某个值！
### 6 遍历
for...in遍历对象是无法直接获取属性值的，因为它实际上遍历的是对象中的所有可枚举的属性，你需要手动获取属性值。
for...of
```javascript
var myArr = [1, 2, 3];
for(var v of myarr){
	console.log(v);
}
// 1
// 2
// 3
```

