[![Docs](https://img.shields.io/badge/文档-中文-blue.svg)](https://github.com/wslongchen/webwechat_api/blob/master/README_CN.md)
# webWechatApi By Node  
# WeChat Redpack Helper

> Something could help for you.

# Node Library

## ScreenShot
![Basic Example][example-img]

## Install

Can be installed with:

    $ npm install webwechat_api

and used:

    var api = require('webwechat_api');

## Usage
To use api.mothodName to create your own WeChat robot.
    
    wechatapi.getUUID(function (data){
        //do something
    });

Run wxbot.js, which contains the basic functions and cases.
	
	node wxbox.js

More methods, contents, and method names can be viewed in wechatapi.js.

# Updates

- Get information about contacts (public numbers, group chats)
- Receive messages in real time (able to identify group @ messages)
- Send text messages

【1.0.2】 --17/06/26

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
[readme-en]: https://github.com/wslongchen/webwechat_api/blob/master/README.md
