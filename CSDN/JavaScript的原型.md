JavaScript中的对象有一个特殊的【Prototype】内置属性，其实就是对于其他对象的引用。几乎所有的对象在创建时【Prototype】属性都会被赋予一个非空的值。
对于默认的【get】操作来说，如果无法在对象本身找到需要的属性，就会继续访问对象的【Prototype】原型链：

```javascript
var anotherObject = {
	a: 2
};
//创建一个关联到anotherObject的对象
var myObject = Object.create(anotherObject);
myObject.a; //2
//Object.create(...)会创建一个对象，并把这个对象的原型链关联到制定的对象
```
### 1 “类” 函数
在JavaScript中，所有的函数默认都会拥有一个名为prototype的公有并且不可枚举的属性，它会指向另一个对象。所以，在JavaScript中，没有类似的复制机制。你不能创建一个类的多个实例，只能创建多个对象，它们的【prototype】关联的是同一个对象。

```javascript
function Foo() {
	//....
}
var a = new Foo();
Object.getPrototypeOf(a) === Foo.prototype; //true
```
new Foo()会生成一个新对象（我们称之为a），这个新对象的内部链接【prototype】关联的是Foo.prototype对象。
最后我们得到了两个对象，它们是相互关联，就是这样。我们并没有初始化一个类，实际上我们并没有从“类”中复制任何行为到一个对象中，只是让两个对象互相关联。
这样的继承方式我们称之为“原型继承”。这种关联的操作除了new操作符外，还有Object.create(...)也可以达到同样的目的。
继承意味着复制操作，JavaScript（默认）并不会复制对象属性。相反，JavaScript会在两个对象之间创建一个关联，这样一个对象就可以通过委托访问另一个对象的属性和函数。委托这个术语可以更加准确地描述JavaScript中对象的关联机制。

```javascript
//es6之前需要抛弃默认的Bar.prototype
Bar.prototype = Object.create(Foo.prototype)

//es6开始可以直接修改现有的Bar.prototype
Object.setPrototypeOf(Bar.prototype, Foo.prototype)
```

