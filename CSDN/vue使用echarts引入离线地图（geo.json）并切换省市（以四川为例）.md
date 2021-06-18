### 首先安装echarts

```javascript
npm install echarts --save
```
### 然后再main.js中引入echarts
```javascript
import echarts from 'echarts'
Vue.prototype.$echarts = echarts
```
在需要使用的vue组件中，就可以使用this.$echarts调用echarts的方法
### 接下来注册地图

```javascript
//引入地图离线文件
import sichuan from './sichuan.json'
import yaan from './citys/511800.json'
import bazhong from './citys/511900.json'
import neijiang from './citys/511000.json'
import mianyang from './citys/510700.json'
...
//使用name映射地图json文件
const jsonMap = {
    '四川省': sichuan,
    '雅安市': yaan,
    '巴中市': bazhong,
    '内江市': neijiang,
    '绵阳市': mianyang,
    ...
}
//循环遍历注册地图
for (let index in this.jsonMap) {
    this.$echarts.registerMap(index, this.jsonMap[index])
}
```
### 在options中配置离线地图

```javascript
//在series中指定离线地图
map---serires---mapType---'四川省'
//在需要切换地图的时候修改series--mapType
map---serires---mapType---'成都市'
//调用setOptions重绘地图
let myChart = this.$echarts.init(document.getElementById('mapChart'));
myChart.setOption(option);
```
### 点击下钻的实现
给echarts的实例对象添加click事件
```javascript
myChart.on('click', function(result){
 	const map = that.options
    const index = map.findIndex(item => item.area_name == result.name)
    that.province_code = map[index].area_code
})
```

