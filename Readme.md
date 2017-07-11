[![Docs][docs-image]][docs-url]
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Linux Build][travis-img]][travis-url]
> Just want to do a WeChat robot node, the web version interface study of WeChat, later in JS can not extricate themselves, with ES2015 to write a Promise style interface, then I think ES6 is very powerful, with a cool, then see the wechat4u node project, learned a lot of posture this project, hope to be able to help you in some places.

You can scan two-dimensional code below to add Ann, and reply to sign [应垂丝汀] Moore pull into the specified vertical communication group chat, come and join us.

![Basic Example][qr-img]

# Node Library

## ScreenShot
![Basic Example][example-img]

## Install

Can be installed with:
```bash
    $ npm install webwx-api --save
```

## Usage

2017-07-08 updated

+ Using the new version of API can be used
```js
    const Wechat = require('webwx-api')
    let w = new Wechat()
    w.start()
    w.on('uuid', uuid => {
      console.log('二维码链接：', 'https://login.weixin.qq.com/qrcode/' + uuid)
    })
```
Or use its specific methods directly
```js
    const Wechat = require('webwx-api/lib/wxcore')
    //do something
```

+ Using the older version of API, you can use the following
```js
    const oldapi = require('webwx-api/wxapiold');
    oldapi.startBot();
```

+ To use api.mothodName to create your own WeChat robot.
```js 
    oldapi.getUUID(function (data){
        //do something
    });
```
or
```js
  oldapi.getUUID.then((resolve) =>{
      //do something
  },(reject) => {
      //do something
  });
```

+ Run wxbot.js,bot.js or webwx test, which contains the basic functions and cases.And You can run webwx -h for help
```bash	
    node wxbot.js
```
or
```bash	
    webwx test
```
or
```bash
    node bot.js
```
+ More methods, contents, and method names can be viewed in wechatapi.js , wxapi.js and wechat.js.

# Updates

- Get information about contacts (public numbers, group chats)
- Receive messages in real time (able to identify group @ messages)
- Send text messages (to solve text encoding problems)
- Add group chat, and pull people into the group
- Refactoring the code, adding the ES6 style
- solve the problem of compatibility between new and old API packages

【1.0.18】 --17/07/08

# Support

- OS X
- Linux
- Windows

# Developing

To setup the development envrionment run `npm install`

# Contributers

	MrPan <1049058427@qq.com>
	
# Thanks

- [qrcode-terminal] by gtanner 
- more problem fix by [biezhi]
- more learning by [wechat4u]

[qrcode-terminal]: https://github.com/gtanner/qrcode-terminal
[biezhi]: https://github.com/biezhi/wechat-robot
[example-img]: https://github.com/wslongchen/webwechat_api/blob/master/screenshot.png
[qr-img]: https://github.com/wslongchen/webwx-api/blob/master/qr.JPG
[docs-image]: https://img.shields.io/badge/文档-中文-blue.svg
[docs-url]: https://github.com/wslongchen/webwx-api/blob/master/README_CN.md
[npm-image]: https://img.shields.io/npm/v/webwx-api.svg
[npm-url]: https://npmjs.org/package/webwx-api
[downloads-image]: https://img.shields.io/npm/dm/webwx-api.svg
[downloads-url]: https://npmjs.org/package/webwx-api
[travis-img]: https://travis-ci.org/wslongchen/webwx-api.svg?branch=master
[travis-url]: https://travis-ci.org/wslongchen/webwx-api
[wechat4u]: https://github.com/nodeWechat
