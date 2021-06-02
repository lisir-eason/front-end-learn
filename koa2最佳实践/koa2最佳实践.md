# koa2最佳实践

### 1.搭建项目

##### 1.1 使用koa-generator初始化项目：

```shell
npm install koa-generator -g
koa2  my-project
cd  my-project
npm  install
npm run dev
```

##### 1.2 调整项目结构：

![image-20210528203313547](https://i.loli.net/2021/06/02/LsPxduH8JKy9TMw.png)

##### 1.3安装项目所需的依赖：

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

##### 1.4 json.package文件中配置pre-commit:

```json
{...
    "pre-commit": [
        "lint"
    ]
}
```

##### 1.5 使用cross-env配置环境变量，修改scripts命令：

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

### 2.配置数据库（model）

详细配置可见[Sequelize官网文档](https://www.sequelize.com.cn/core-concepts/getting-started)

##### 2.1 安装sequelize和数据库驱动：

```shell
npm install --save sequelize mysql2
```

##### 2.2 配置数据库并测试连接：

```js
const { Sequelize } = require('sequelize')

const sequelize = new Sequelize('personal_bog', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  port: 3306
})

async function test(params) {
  try {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
}

test()
```

##### 2.3 定义数据模型：

```js
const { seq } = require('../sequelize')   //sequelize实例
const { String, Integer } = require('../type')  //封装的sequelize支持的数据类型

const User = seq.define('User', {
  userName: {
    type: String,
    allowNull: false,
    unique: true,
    comment: '用户名'
  },
  password: {
    type: String,
    allowNull: false,
    comment: '密码'
  },
  //....
})

// type.js
const Sequelize = require('sequelize')

module.exports = {
    STRING: Sequelize.STRING,
    DECIMAL: Sequelize.DECIMAL,
    TEXT: Sequelize.TEXT,
    INTEGER: Sequelize.INTEGER,
    BOOLEAN: Sequelize.BOOLEAN
}
```

##### 2.4 同步数据模型到数据库：

```js
//同步数据
seq.sync({ force: true }).then(() => {
  console.log('Sync data to database successfully.')
  process.exit()
}).catch(err => {
  console.error('Unable to sync data to the database:', err)
})
```

### 3.查询/操作数据库

route层  ==> controller层 ==> service层 ==> database

##### 3.1 查询数据库

```js
const users = await User.findOne({
    where：{userName: 'xxx'},
    attributes: ['userName', 'nickName', 'gender', 'picture', 'city']
})
```

##### 3.2 定义成功/失败返回模型

```js
// 希望最后是这个样子
// {
//   errno: 0,  成功失败都有
//   data: {},  成功时
//   message: '' 失败时
// }
class ResModal {
  constructor({errno, data, message}){
    this.errno = errno
    if (data) {
      this.data = data
    }
    if (message) {
      this.message = message
    }
  }
}

//成功模型
class SuccessModal extends ResModal {
  constructor({data}){
    super({data, errno: 0})
  }
}

//失败模型
class ErrorModal extends ResModal {
  constructor({errno, message}){
    super({errno, message})
  }
}
```

##### 3.3 抽离并维护错误返回码

```js
module.exports = {
  userIsNotExist: {
    errno: 10001,
    message: '用户名不存在'
  },
  createUserFailed: {
    errno: 10002,
    message: '创建用户失败'
  }
}
```

### 4 Schema验证字段是否正确

##### 4.1 ajv

使用ajv验证所传参数是否符合要求，详情查看[官网](https://ajv.js.org/json-schema.html#metadata-keywords)

```js
const Ajv = require("ajv")
const ajv = new Ajv()

const schema = {
  type: "object",
  properties: {
    foo: {type: "integer"},
    bar: {type: "string"}
  },
  required: ["foo"],
  additionalProperties: false
}

const data = {foo: 1, bar: "abc"}
const valid = ajv.validate(schema, data)
if (!valid) console.log(ajv.errors)
```

##### 4.2 在项目中使用中间件形式进行验证：

genValidate(userValidate)为中间件函数

```js
// route.js
router.post('/register', genValidate(userValidate), async function (ctx, next) {
  const { userName, password, } = ctx.request.body
  ctx.body = await register({userName, password})
})

//genValidate
function genValidate(validateFn) {
  async function validator(ctx, next) {
    const data = ctx.request.body
    const err = validateFn(data)
    if (err) {
      ctx.body = new ErrorModal(jsonSchemaFileInfo)
      return
    }
    await next()
  }

  return validator
}
```

