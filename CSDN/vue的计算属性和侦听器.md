### 计算属性缓存 vs 方法
按照官网的实例，计算属性和方法使用后的效果是一致的。但是，计算属性是基于它们的依赖进行缓存，换句话说，只要计算属性依赖的值没有发生改变，那么计算属性就不会重新求值。
```html
<p>Reversed message: "{{ reversedMessage() }}"</p>
```

```javascript
// 方法
methods: {
  reversedMessage: function () {
    return this.message.split('').reverse().join('')
  },
//计算属性
computed: {
   // 计算属性的 getter
   reversedMessage: function () {
     // `this` 指向 vm 实例
     return this.message.split('').reverse().join('')
   }
 }
```
因此，意味着下面的计算属性不再更新：

```javascript
computed: {
  now: function () {
    return Date.now()
  }
}
```
### 计算属性 vs 侦听属性
在官网给出的实例中，其实强调二者最大的区别就是watch的滥用可能会导致代码是命令式且重复的，因此更推荐合理的计算属性的写法。另外，watch选项允许我们可以执行一个异步操作，限制我们执行该操作的频率，并在我们得到最终结果前，设置中间状态。这些都是计算属性无法做到的。
```html
<div id="demo">{{ fullName }}</div>
```

```javascript
//watch（侦听属性）
var vm = new Vue({
  el: '#demo',
  data: {
    firstName: 'Foo',
    lastName: 'Bar',
    fullName: 'Foo Bar'
  },
  watch: {
    firstName: function (val) {
      this.fullName = val + ' ' + this.lastName
    },
    lastName: function (val) {
      this.fullName = this.firstName + ' ' + val
    }
  }
})

//计算属性
var vm = new Vue({
  el: '#demo',
  data: {
    firstName: 'Foo',
    lastName: 'Bar'
  },
  computed: {
    fullName: function () {
      return this.firstName + ' ' + this.lastName
    }
  }
})
```



