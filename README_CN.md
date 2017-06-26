[![Docs](https://img.shields.io/badge/Docs-English-blue.svg)](https://github.com/wslongchen/webwechat_api/blob/master/Readme.md)
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Linux Build][travis-img]][travis-url]
# 网页微信API（node版） 

> 希望这些能够为您带来帮助.

# Node 仓库

## 截图
![Basic Example][example-img]

## 安装

可以用以下命令安装:
```bash
    $ npm install webwechat_api
    $ npm link
```
并且使用它:

    var api = require('webwechat_api');

## 使用
使用api.方法名，创建你自己的回话
```js 
    wechatapi.getUUID(function (data){
        //do something
    });
```
运行wxbot.js文件或者运行webwx test,案例中包含基本的方法与功能。运行webwx -h获取帮助。
```bash
	node wxbox.js
```
or
```bash
	webwx test
```
更多的方法、接口名可以在wechatapi.js中查看.

# 更新

- 获取联系人（公众号、群聊）信息
- 实时接收消息（能识别群@消息）
- 发送文字消息

【1.0.2】 --17/06/26

# 支持

- OS X
- Linux
- Windows

# 开发

设置基本的node环境，并运行 `npm install`


# 反馈

	MrPan <1049058427@qq.com>
	
# 感谢

- [qrcode-terminal] by gtanner 
- 问题参考 by [biezhi]


[qrcode-terminal]: https://github.com/gtanner/qrcode-terminal
[biezhi]: https://github.com/biezhi/wechat-robot
[example-img]: https://github.com/wslongchen/webwechat_api/blob/master/screenshot.png
[readme-en]: https://github.com/wslongchen/webwechat_api/blob/master/README.md
[npm-image]: https://img.shields.io/npm/v/webwechat_api.svg
[npm-url]: https://npmjs.org/package/webwechat_api
[downloads-image]: https://img.shields.io/npm/dm/webwechat_api.svg
[downloads-url]: https://npmjs.org/package/webwechat_api
[travis-img]: https://travis-ci.org/wslongchen/webwechat_api.svg?branch=master
[travis-url]: https://travis-ci.org/wslongchen/webwechat_api
