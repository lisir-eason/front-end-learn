# CSS常见设置案例

本文旨在记录一些常见的css属性设置及其应用。

### 1.字体

```css
body {
    font-family: "PingFang SC", "Microsoft Yahei", monospace;
}
```

上面这个例子设置了body里的字体，表示如果有平方字体就用平方（mac系统），没有就用微软雅黑（windows系统），两者都没有就用一个monospace（等宽字体）。其中monospace表示的是一个字体族，表示用一种等宽字体即可，所以有些大的网站这个font-family写的比较长就是为了兼容不同的平台。

如何使用自定义字体：

```css
@font-face {
    font-family: "IF";
    src: url("./IndieFlower.ttf");  /* 这里是字体的路径 */
}

.class {
    font-family: "IF"
}
```

当然src里也可以使用网络上的字体，需要注意的是网络跨域限制导致不能正常使用的问题。

### 2.行高

行内元素都可以设置行高line-hight，如果设置行高大于字体的大小，那么行内元素会撑高外元素，此时行内元素实现垂直居中的效果。

如下代码：

```html
<div>
    <span>xxx</span>
    <img src="xxx" />
</div>
```

img将被视为行内元素，因此和span一样遵守文字排版的规则：根据base line对齐。因此会导致图片和div的下方有空隙。解决方法：

```css
img {
    vertical-align: bottom
}
```

### 3.flex布局

利用flex布局实现左边固定宽度的布局：

```html
<div class="container">
    <div class="left">
        左
    </div>
    <div class="right">
        右
    </div>
</div>
```

```css
.container {
    width: 800px;
    height: 300px;
    display: flex;
}
.left {
    display: flex;
    with: 200px;
}
.right {
    display: flex;
    flex: 1;
}
```

### 4.float

首先理解一个概念就是BFC（Block formatting context）直译为“块级格式化上下文”， 简单理解为一个独立的“块”，它里面宽高都是独立的。如何产生BFC?

- float的值不是none。
- position的值不是static或者relative。
- display的值是inline-block、table-cell、flex、table-caption或者inline-flex
- overflow的值不是visible

当时用float属性的时候就会使目标元素变成独立的块，使其尽量靠左（右），靠上展示。利用这样的特性就可以实现文字包围图片的效果。但是这样做会引来一个问题是：如果不设置父元素的高度的话，float后的元素是无法撑起父元素的高度的，这样就会造成父元素高度塌陷的问题。这样就需要清除浮动：

a.可以考虑将父元素也变成BFC:

```css
.parent {
    overflow: hidden;
}
```

b.里面的元素刚好超出float的高度，使用伪类元素清除浮动；

```css
.clear-folat::after {
	content: '';
    clear: both;   /* 这个属性就是设置当前元素挨着float下方 */
    display: block;  
    visibility: hidden;
    height: 0;
}
```

利用float实现左边固定右边自适应的方案：

```css
.left {
    float: left;
    width: 200px;
}
.right {
    margin-left: 200px;
}
```

### 5.clip-path

- 对容器进行裁剪
- 常见几何图形
- 自定义路径

### 6.less

嵌套结构, &表示同级结构：

```less
.contanier {
    width: 100px;
    .inner {
        height: 90px;
        &:hover {
            color: yellow;
        }
    }
}
```

定义变量：

```
@fontsize: 12px;
@bgColor: red;

.contanier {
	font-size: @fontsize + 2px;
	backgroud-color: @bgColor;
}
```

mixin代码复用:

```less
.block(@fontsize){
    font-size: @fontsize;
    width: 200px;
}

.test {
    .block(12px);
}
```

extend:

```less
.block{
    width: 100px;
    font-size: 14px;
}

.nav:extend(.block){
    
}

.nav{
    &:extend(.block);
}
```

**extend和mixin在目的上是一样的，都是为了css层面的复用，但是编译出来的结果不一样。**

模块化管理，使用import:

```less
@import './variable';
@import './color'
```

