在webpack的配置中：

```javascript
	devtool: 'source-map',
	output: {
		publicPath: '/',
		devtoolModuleFilenameTemplate: '../[resource-path]'
	},
```

launch.json中配置

```JavaScript
{
    "version": "0.2.0",
    "configurations": [
      {
        "type": "chrome",
        "request": "launch",
        "name": "wepack中调试",
        "url": "http://localhost:3060",
        "webRoot": "${workspaceFolder}/src",
        "breakOnLoad": true,
        "sourceMapPathOverrides": {
          "webpack:///src/*": "${webRoot}/*"
        }
      }
    ]
}
```

