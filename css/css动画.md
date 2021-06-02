# css3 动画实践

动画两种实现方式

#### 1.过渡动画（transition）。

首先这个很容易和transform混合，transform是设置元素2D或者3D转换的，详情看[transform 属性文档](https://www.w3school.com.cn/cssref/pr_transform.asp)

```css
transition: property duration timing-function delay;
```

property：过渡的属性，如：'width'、'transform'等等，也可以写'all'。

duration： 动画持续时间， 如：'2s' 两秒。

timing-function： 规定速度效果的速度曲线。 默认  'ease'，其它值可查看[transition-timing-function文档](https://www.w3school.com.cn/cssref/pr_transition-timing-function.asp)

delay: 延迟多少秒开始。

使用时，一般先给元素设定transition：xxx 动画属性，然后通过伪类:hover，或者js添加class的方式改变元素的属性，从而实现动画的效果。

### 2.关键帧动画（animation）。

语法：

```css
animation: name duration timing-function delay iteration-count direction;
```

name： keyframes的名字，一般是这样定义的：

```css
@keyframes wlk{
    100%{
        left: 300px;
        background-color: blue;
        transform: rotate(45deg);
    }
}
```

duration：持续时间， 如：'2s' 两秒。

timing-function：规定速度效果的速度曲线。

delay：延迟多少秒开始。

iteration-count： 动画播放的次数，默认是’1‘，可选’infinite‘--无限次数播放。

direction：定义是否应该轮流反向播放动画。默认值为normal，设置alternate为动画应该轮流反向播放。