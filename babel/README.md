# babel笔记

#### 为什么会学babel

本来是想看react的源码，就得先了解JSX语法。JSX对于开发者来说就是一种语法糖，得转换成浏览器认识的代码js，所以才对babel有了进一步了解。在这里可以[试试转化JSX](https://www.babeljs.cn/repl)。

```jsx
<h1 style={{"color":"blue"}}>hello world</h1>
```

上面的JSX语法经过babel转化成这样的js：

```javascript
"use strict";

/*#__PURE__*/
React.createElement("h1", {
  style: {
    "color": "blue"
  }
}, "hello world");
```

很好奇哈，babel貌似按照某种规则，将我们的代码进行转化。本着打不过就加入的原则，我们决定先加入babel！

#### 搭建babel环境

1.首先运行npm init，初始化我们的项目，得到一个package.json文件；

2.安装babel依赖，这里有四个依赖需要解释下：

- babel/core ---- babel的核心功能库
- babel/cli ---- babel的脚手架工具，可以通过命令行手动转化我们的代码
- @babel/preset-env ---- babel为我们预设的插件
- @babel/polyfill ---- 这个为了解决ES6的新语法打的补丁，比如Promise，转换后会用require()引入polyfill

```shell
npm install --save-dev @babel/core @babel/cli @babel/preset-env
npm install --save @babel/polyfill
```

3.根目录新建`babel.config.json`文件，当然也可以在package.json中编写配置，也可以用js文件return配置；

```json
{
  "presets": [...],  //预设
  "plugins": [...]   //插件
}
```

4.src目录下新建index.js，输入一些es6语法；

5.运行babel的脚手架命令，在lib文件夹中生成转化后的代码；

```shell
./node_modules/.bin/babel src --out-dir lib
```

也可以使用运行器npx：

```shell
npm babel src --out-dir lib
```

至此最基本的babel项目环境已经搭建完成，babel的其它配置可以参考[官方文档](https://www.babeljs.cn/docs/configuration)。

#### babel的原理

会用当然不是我们的目标，于是我查了下资料，结合babel的[github地址](https://github.com/babel/babel/blob/master/CONTRIBUTING.md#developing)，了解到大概流程是这样：

原js文件 ==> [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree)(Abstract Syntax Tree)树 ==> 重构AST树 ==> 生成新的js文件

##### 什么是AST树？

简单理解就是把js文件，按照一定规则（这个规则也不难，就是暴力遍历字符），组装成抽象语法树，有个[在线工具](https://astexplorer.net/)可以预览AST树。例如我们有一个js语句：

```javascript
var a = 1;
```

经过转换后的AST长这样：

```json
{
  "type": "Program",
  "start": 0,
  "end": 10,
  "body": [
    {
      "type": "VariableDeclaration",  //声明变量
      "start": 0,
      "end": 10,
      "declarations": [  //声明
        {
          "type": "VariableDeclarator",  //变量标识符
          "start": 4,
          "end": 9,
          "id": {
            "type": "Identifier",  //标识符
            "start": 4,
            "end": 5,
            "name": "a"
          },
          "init": {   //初始值
            "type": "Literal",
            "start": 8,
            "end": 9,
            "value": 1,
            "raw": "1"
          }
        }
      ],
      "kind": "var"  //种类
    }
  ],
  "sourceType": "module"
}
```

OK，从上面的树中基本上可以看到，这是一个声明变量的语句，从0开始，10结束。申明的标识符是a，初始值是文字类型的1。类型是var。第一步搞清楚了，js文件如何解析成AST树。那么怎么对AST树进行操作呢？我们试着写一个插件。

### 写一个babel插件

我们试着编写一个插件，目标是将js文件中的双等“==”转换成全等“===”。参照官方[babel插件说明书](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#babel-plugin-handbook)。

