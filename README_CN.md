[![Docs](https://img.shields.io/badge/Docs-English-blue.svg)](readme-cn)
# 网页微信API（node版） 

> 希望这些能够为您带来帮助.

# Node 仓库

## 截图
![Basic Example][example-img]

## 安装

可以用以下命令安装:

    $ npm install webwechat_api

并且使用它:

    var api = require('webwechat_api');

## 使用
使用api.方法名，创建你自己的回话
    
    wechatapi.getUUID(function (data){
        //do something
    });

运行wxbot.js文件,案例中包含基本的方法与功能。
	
	node wxbox.js

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
