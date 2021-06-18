### package.json

```javascript
{
  "name": "react-project-demo-20181016",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "build": "webpack --config build/pro.js --color",
    "dev": "webpack-dev-server --config build/dev.js --open"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "babel-core": "^6.26.3",
    "babel-loader": "^7.1.5",
    "babel-plugin-syntax-dynamic-import": "^6.18.0",
    "babel-plugin-transform-runtime": "^6.23.0",
    "babel-preset-env": "^1.7.0",
    "babel-preset-react": "^6.24.1",
    "babel-preset-stage-0": "^6.24.1",
    "bower-webpack-plugin": "^0.1.9",
    "clean-webpack-plugin": "^0.1.19",
    "css-loader": "^1.0.0",
    "debug": "^4.1.0",
    "extract-text-webpack-plugin": "^4.0.0-beta.0",
    "file-loader": "^2.0.0",
    "html-webpack-plugin": "^3.2.0",
    "node-sass": "^4.9.4",
    "opn": "^5.4.0",
    "sass-loader": "^7.1.0",
    "style-loader": "^0.23.1",
    "uglifyjs-webpack-plugin": "^2.0.1",
    "url-loader": "^1.1.2",
    "webpack": "^4.20.2",
    "webpack-api-mocker": "^1.5.15",
    "webpack-bundle-analyzer": "^3.0.2",
    "webpack-cli": "^3.1.2",
    "webpack-dev-server": "^3.1.9",
    "webpack-merge": "^4.1.4"
  },
  "dependencies": {
    "antd": "^3.10.9",
    "axios": "^0.18.0",
    "babel-plugin-import": "^1.9.1",
    "babel-plugin-transform-decorators-legacy": "^1.3.5",
    "babel-polyfill": "^6.26.0",
    "bignumber.js": "^7.2.1",
    "echarts": "^4.2.0-rc.2",
    "jquery": "^3.3.1",
    "js-base64": "^2.5.0",
    "lodash": "^4.17.11",
    "mockjs": "^1.0.1-beta3",
    "moment": "^2.23.0",
    "prop-types": "^15.6.2",
    "react": "^16.5.2",
    "react-dom": "^16.5.2",
    "react-loadable": "^5.5.0",
    "react-redux": "^5.0.7",
    "react-router-cache-route": "^1.3.1",
    "react-router-dom": "^4.3.1",
    "redux": "^4.0.1",
    "redux-thunk": "^2.3.0",
    "reqwest": "^2.0.5",
    "storejs": "^1.0.20",
    "underscore": "^1.9.1"
  }
}

```
### bulid/dev.js

```javascript
const path = require('path')
const webpack = require('webpack')
const common = require('./webpack.common.js');
const merge = require('webpack-merge');

module.exports = merge(common, {
	mode: 'development',

	devtool: 'source-map',

	output: {
        publicPath: '/',
        devtoolModuleFilenameTemplate: '../[resource-path]'
	},

	plugins: [
		// new webpack.NamedModulesPlugin(),
		// new webpack.HotModuleReplacementPlugin(),
		new webpack.DefinePlugin({
			NODE_ENV: JSON.stringify('development')
		})
	],

	optimization: {
		splitChunks: {
			cacheGroups: {
				commons: {
					test: /[\\/]node_modules[\\/]/,
					name: "vendors",
					chunks: "all"
				}
			}
		}
	},

	devServer: {
		contentBase: path.resolve(__dirname, '../dist'),
		hot: false,
		inline: false,
		port: 3060,
		historyApiFallback: true,
		stats: "errors-only",
		proxy: [{
			context: ['/pyplatform/console'],
			target: 'http://pyfinance2v2-dev.pystandard.py',
			changeOrigin: true,
			// pathRewrite: {'^/base': ''}
		}]
	}
});

```
### build/pro.js

```javascript
const path = require('path')
const webpack = require('webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const UglifyJSPlugin = require("uglifyjs-webpack-plugin")
const CleanWebpackPlugin = require('clean-webpack-plugin');
const common = require('./webpack.common.js');
const merge = require('webpack-merge');

module.exports = merge(common, {
	mode: 'production',

	// devtool: 'source-map',

	plugins: [
		new CleanWebpackPlugin('dist', {
			root: path.resolve(__dirname, '../')
		}),
		// new BundleAnalyzerPlugin(),
		new UglifyJSPlugin({
			sourceMap: false
		}),
		new webpack.DefinePlugin({
			NODE_ENV: JSON.stringify('production')
		})
	],

	optimization: {
		splitChunks: {
			cacheGroups: {
				commons: {
					test: /[\\/]node_modules[\\/]/,
					name: "vendors",
					chunks: "all"
				}
			}
		}
	}
});

```

### build/webpack.common.js

```javascript
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: {
		index: [
			'babel-polyfill',
			'./src/index.js',
		]
	},

	output: {
		path: path.resolve(__dirname, "../dist"),
		filename: '[name]_[hash].js',
		chunkFilename: '[name]_[hash].js',
	},

	module: {
		rules: [
			{
				test: /\.css$/,
				use: ExtractTextPlugin.extract({
					fallback: "style-loader",
					use: "css-loader"
				})
			},
			{
				test: /(\.jsx|\.js)$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							"env",
							"react",
							"stage-0"
						],
						plugins:[
							"transform-runtime",
							"transform-decorators-legacy",
							"syntax-dynamic-import",
							["import",
								{
									"libraryName": "antd",
									"libraryDirectory": "es",
									"style": "css"
								}
							]
						]
					}
				}
			},
			{
				test:/\.scss$/,
				use: ExtractTextPlugin.extract({
					fallback: "style-loader",
					use:['css-loader','sass-loader']
				})
			},
			{
				test: /\.(png|svg|jpg|gif|xlsx)$/,
				use: 'url-loader?limit=1024&name=[name].[ext]&outputPath=img/'
			}
		]
	},

	plugins: [

		new HtmlWebpackPlugin({
			title: '智能投顾后台系统',
			template: './src/index.ejs',
		}),

		new ExtractTextPlugin("[name]_[chunkhash].css"),
	],
};

```

