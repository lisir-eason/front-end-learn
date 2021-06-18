### call()方法
这个方法的第一个参数表示this指向的对象，后面的所有参数都是函数的参数。例如：

```javascript
function sayName(label) {
    console.log(label+'--->'+this.name)
}
var name = '张三';
var person1 = {
    name: '李四'
};
var person2 = {
    name: '王二'
};
sayName.call(window,'global');      //'global--->张三'
sayName.call(person1,'person1');    //'person1--->李四'
sayName.call(person2,'person2');    //'person2--->王二'
```
### apply()方法
這個方法和call方法的作用都是相同的，只不过在传递参数时候，call方法可以传递多个参数，而apply方法只能传递一个方法，并且要求是一个数组。

```javascript
function sayName(label) {
    console.log(label);
    console.log(this.name);
}
var name = '张三';
var person1 = {
    name: '李四'
};
var person2 = {
    name: '王二'
};
sayName.apply(window,['global']);   //'global--->张三'
sayName.apply(person1,['person1']); //'person1--->李四'
sayName.apply(person2,['person2']); //'person2--->王二'
```
### bind()方法
bind()方法第一个参数是我们希望函数中this指向的对象，后面的参数是我们希望给函数的参数绑定的值。
```javascript
var obj = {
	name:'小明'
	age:23
};
function myName(age,gender){
	console.log(this.name,age,gender);
}
var newName = myName.bind(obj);
newName();  //小明 undefined undefined
var newName2 = myName.bind(obj,18);
newName2();  //小明 18 undefined
var newName3 = myName.bind(obj,18,'女');
newName3();  //小明 18 女
var newName4 = myName.bind(obj);
newName4(18,'女');  //小明 18 女
```

