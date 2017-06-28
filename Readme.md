[![Docs][docs-image]][docs-url]
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Linux Build][travis-img]][travis-url]
> Something could help for you.

# Node Library

## ScreenShot
![Basic Example][example-img]

## Install

Can be installed with:
```bash
    $ npm install webwx-api
    $ npm link
```
and used:
```js
    var api = require('webwx-api');
```
## Usage
+ To use api.mothodName to create your own WeChat robot.
```js
      wechatapi.getUUID(function (data){
           //do something
       });
```
or
```js
  wechatapi.getUUID.then((resolve) =>{
      //do something
  },(reject) => {
      //do something
  });
```

+ Run wxbot.js or webwx test, which contains the basic functions and cases.And You can run webwx -h for help
```bash	
    node wxbox.js
```
or
```bash	
    webwx test
```
+ More methods, contents, and method names can be viewed in wechatapi.js and wxapi.js.

# Updates

- Get information about contacts (public numbers, group chats)
- Receive messages in real time (able to identify group @ messages)
- Send text messages (to solve text encoding problems)
- Add group chat, and pull people into the group

【1.0.2】 --17/06/28

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


[qrcode-terminal]: https://github.com/gtanner/qrcode-terminal
[biezhi]: https://github.com/biezhi/wechat-robot
[example-img]: https://github.com/wslongchen/webwechat_api/blob/master/screenshot.png
[docs-image]: https://img.shields.io/badge/文档-中文-blue.svg
[docs-url]: https://github.com/wslongchen/webwx-api/blob/master/README_CN.md
[npm-image]: https://img.shields.io/npm/v/webwx-api.svg
[npm-url]: https://npmjs.org/package/webwx-api
[downloads-image]: https://img.shields.io/npm/dm/webwx-api.svg
[downloads-url]: https://npmjs.org/package/webwx-api
[travis-img]: https://travis-ci.org/wslongchen/webwx-api.svg?branch=master
[travis-url]: https://travis-ci.org/wslongchen/webwx-api
