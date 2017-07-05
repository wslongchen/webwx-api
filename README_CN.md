[![Docs](https://img.shields.io/badge/Docs-English-blue.svg)](https://github.com/wslongchen/webwx-api/blob/master/Readme.md)
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Linux Build][travis-img]][travis-url]
# 网页微信API（node版） 

> 一开始只是想用node做一个微信机器人，研究一下微信的网页版接口，后来深陷js无法自拔，用ES2015重新写了一份Promise风格的接口，然后越发觉得es6很厉害，用的很爽，紧接着有看到了wechat4u 的node项目，姿势学到了很多，希望，这个项目能够在某些地方帮助到你。

# Node 仓库

## 截图
![Basic Example][example-img]

## 安装

可以用以下命令安装:
```bash
    $ npm install webwx-api
    $ npm link
```
并且使用它:

    var api = require('webwx-api');

## 使用
使用api.方法名，创建你自己的回话
```js 
    wechatapi.getUUID(function (data){
        //do something
    });
```
或者
```js
  wechatapi.getUUID.then((resolve) =>{
      //do something
  },(reject) => {
      //do something
  });
```
或者
```js
    wechat.start
    bot.on('uuid', uuid => {
      qrcode.generate('https://login.weixin.qq.com/l/' + uuid, {
        small: false
      })
      console.log('二维码链接：', 'https://login.weixin.qq.com/qrcode/' + uuid)
    })
```

运行wxbot.js，bot.js文件或者运行webwx test,案例中包含基本的方法与功能。运行webwx -h获取帮助。
```bash
	node wxbox.js
```
或者
```bash
	webwx test
```
或者
```bash
    node bot.js
```
更多的方法、接口名可以在wechatapi.js、wxapi.js以及wechat.js中查看.

# 更新

- 获取联系人（公众号、群聊）信息
- 实时接收消息（能识别群@消息）
- 发送文字消息(解决文字编码问题)
- 增加群聊，以及拉人入群
- 重构了代码，加入es6风格
【1.0.14】 --17/07/01

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
[example-img]: https://github.com/wslongchen/webwx-api/blob/master/screenshot.png
[readme-en]: https://github.com/wslongchen/webwx-api/blob/master/README.md
[npm-image]: https://img.shields.io/npm/v/webwx-api.svg
[npm-url]: https://npmjs.org/package/webwx-api
[downloads-image]: https://img.shields.io/npm/dm/webwx-api.svg
[downloads-url]: https://npmjs.org/package/webwx-api
[travis-img]: https://travis-ci.org/wslongchen/webwx-api.svg?branch=master
[travis-url]: https://travis-ci.org/wslongchen/webwx-api
