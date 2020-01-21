# TypeScript 学习笔记 -- 进阶篇

### 类型别名

```typescript
//类型别名用来给一个类型起个新名字
type Name = string;
type NameResolver = () => string;
type NameOrResolver = Name | NameResolver;
function getName(n: NameOrResolver): Name {
  if (typeof n === 'string') {
    return n;
  } else {
    return n();
  }
}
```

### 字符串字面量类型

```typescript
//EventNames就是三种字符串中的一个，不能是其它
type EventNames = 'click' | 'scroll' | 'mousemove';
function handleEvent(ele: Element, event: EventNames) {
  //dosomething
}
```

### 元祖

```typescript
//数组合并了相同类型的对象，而元组（Tuple）合并了不同类型的对象
let tom: [string, number] = ['Tom', 25]
```

### 枚举

```typescript
enum Days {Sun, Mon, Tue, Wed, Thu, Fri, Sat};

console.log(Days["Sun"] === 0); // true
console.log(Days["Mon"] === 1); // true
console.log(Days["Tue"] === 2); // true
console.log(Days["Sat"] === 6); // true

console.log(Days[0] === "Sun"); // true
console.log(Days[1] === "Mon"); // true
console.log(Days[2] === "Tue"); // true
console.log(Days[6] === "Sat"); // true
```

### 类

```typescript
//public 公开 private 只有内部可访问 protected 与private类似 但是类的子类可以访问
class Animal {
  public readonly age; //只读属性
	public name;  
  public constructor(name) {
    this.name = name;
  }
}

//抽象类是不允许被实例化的。其次，抽象类中的抽象方法必须被子类实现
abstract class Animal {
  //...
}

```

### 类与接口

```typescript
// 一个类可以实现多个接口
interface Alarm {
  alert();
}

interface Light {
  lightOn();
  lightOff();
}

class Car implements Alarm, Light {
  alert () {
    console.log('Car alert')
  }
  lightOn() {
    console.log('Car light on')
  }
  lightOff() {
    console.log('Car light Off')
  }
}
```

### 泛型

```typescript
function createArray<T>(length: number, value: T): Array<T> {
    let result: T[] = [];
    for (let i = 0; i < length; i++) {
        result[i] = value;
    }
    return result;
}

createArray<string>(3, 'x'); // ['x', 'x', 'x']
```

> 定义泛型的时候，可以一次定义多个类型参数：

```typescript
function swap<T, U>(tuple: [T, U]): [U, T] {
    return [tuple[1], tuple[0]];
}

swap([7, 'seven']); // ['seven', 7]
```

> 对泛型进行约束

```typescript
interface Lengthwise {
    length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
    console.log(arg.length);
    return arg;
}
```

> 泛型类

```typescript
class GenericNumber<T> {
    zeroValue: T;
    add: (x: T, y: T) => T;
}

let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = function(x, y) { return x + y; };
```

