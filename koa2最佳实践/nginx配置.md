记录使用nginx时一些配置

## 开启g-zip

开启g-zip后，支持g-zip的浏览器会优先使用gz文件，这样会节省不少的加载时间。

```
gzip  on;
gzip_static on;
gzip_http_version 1.1;
gzip_proxied expired no-cache no-store private auth;
gzip_disable "MSIE [1-6]\.";
gzip_vary on;
```

## 静态文件路由访问

前端控制的路由跳转，需要重写路径后才能正确加载模块文件：

```
rewrite ^/(.*)/$ /$1 permanent; 
root   C:\code\personal-blog\build;
index  index.html index.htm;

location / {
    root   C:\code\personal-blog\build;
    try_files $uri /index.html;
}
```

## 后端接口代理

由于跨域策略的限制，后端的服务和前端的服务存在跨域限制，因此需要配置。首先在前端生产环境给每个接口加**~/api**的前缀，在封装axio的文件中：

```js
let baseUrl

if (process.env.NODE_ENV === 'development') {
  baseUrl = ''
} else {
  baseUrl = '/apis'
}
```

配置nginx,重新api并代理到后端服务的端口：

```
location /apis {
    rewrite  ^.+apis/?(.*)$ /$1 break;
    include  uwsgi_params;
    proxy_pass   http://localhost:3001;
}
```

## 图片等文件代理

首先，我们在后端文件中，如果是prd环境就在返回的图片url中加/picture的前缀：

```js
  if (isDev) {
    picBaseUrl = 'http://localhost:3001'
  } else if (isProd) {
    picBaseUrl = '/pictures'
  }
```

配置nginx，和api比较类似，代理到服务端接口即可：

```
location /pictures {
    rewrite  ^.+pictures/?(.*)$ /$1 break;
    include  uwsgi_params;
    proxy_pass   http://localhost:3001;
}
```