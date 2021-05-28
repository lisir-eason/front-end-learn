# koa2最佳实践

### 1.搭建项目

使用koa-generator初始化项目：

```shell
npm install koa-generator -g
koa2  my-project
cd  my-project
npm  install
npm run dev
```

调整项目结构：

![image-20210528203313547](C:\Users\Eason\AppData\Roaming\Typora\typora-user-images\image-20210528203313547.png)

安装项目所需的依赖：

- eslint    ---代码格式检查
- babel-eslint
- cross-env   --为了各个平台兼容命令行设置环境变量
- pre-commit   --提交代码用
- jest  --单元测试用
- supertest   --单元测试用

```shell
cnpm install babel-eslint cross-env eslint jest pre-commit supertest --save-dev
```

加.eslintignore和.eslintrc.js文件，设置eslint规则；

json.package文件中配置pre-commit:

```json
{...
    "pre-commit": [
        "lint"
    ]
}
```

使用cross-env配置环境变量，修改scripts命令：

```json
{... 
	"scripts": {
        "dev": "cross-env NODE_ENV=dev ./node_modules/.bin/nodemon --inspect=9229 bin/www",
        "prd": "cross-env NODE_ENV=production pm2 start pm2.conf.json",
        "lint": "eslint --ext .js ./src",
        "test": "cross-env NODE_ENV=test jest --runInBand --forceExit --colors"
  	},
}
```

--inspect=9229是为了在chrome中启用一个设备来调试nodejs，可以在浏览器中访问chrome://inspect看到。

生产环境使用pm2启动，配置在pm2.conf.json文件中。

