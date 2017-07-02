'use strict'
// 导入基本模块
require('babel-register')
const Wechat = require('./src/wechat')
const qrcode = require('qrcode-terminal')
const fs = require('fs')
const request = require('request')

let bot
/**
 * 尝试获取本地登录数据，免扫码
 * 这里演示从本地文件中获取数据
 */
try {
  bot = new Wechat(require('./sync-data.json'))
} catch (e) {
  bot = new Wechat()
}

/**
 * 启动机器人
 */
if (bot.prop.uin) {
  // 存在登录数据时，可以随时调用restart进行重启
  //bot.restart()
} else {
  bot.start()
}

/**
 * uuid事件，参数为uuid，根据uuid生成二维码
 */
bot.on('uuid', uuid => {
  qrcode.generate('https://login.weixin.qq.com/l/' + uuid, {
    small: false
  })
  console.log('二维码链接：', 'https://login.weixin.qq.com/qrcode/' + uuid)
})


/**
 * 如何发送消息
 */
bot.on('login', () => {
	console.log('登录了')
})

/**
 * 如何处理会话消息
 */
bot.on('message', msg => {
  console.log(msg)
})

/**
 * 错误事件，参数一般为Error对象
 */
bot.on('error', err => {
  console.error('错误：', err)
})