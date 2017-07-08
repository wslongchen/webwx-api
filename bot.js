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
  bot.tulingKey = 'f6a4b574b35b4da1aa1477ca193bb687';
} catch (e) {
  bot = new Wechat()
  //配置图灵key
  bot.tulingKey = 'f6a4b574b35b4da1aa1477ca193bb687';
}

/**
 * 启动机器人
 */
if (bot.prop.uin) {
  // 存在登录数据时，可以随时调用restart进行重启
  bot.restart()
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
 * 联系人更新事件，参数为被更新的联系人列表
 */
bot.on('contacts-updated', contacts => {
  console.log('联系人数量：', Object.keys(bot.contacts).length)
})


bot.on('login', () => {
  console.log('登录了')
  fs.writeFileSync('./sync-data.json', JSON.stringify(bot.wxData))
})

/**
 * 如何处理会话消息
 */
bot.on('message', msg => {
  /**
   * 获取消息时间
   */
   /* console.log(`[*]----------${msg.getDisplayTime()}----------`)*/
   
  
  /**
   * 判断消息类型
   */
  switch (msg.MsgType) {

    case bot.conf.MSGTYPE_TEXT:
    console.log('[*] 有新的消息，注意查收')
    console.log('==============================')
     /**
     * 获取消息发送者的显示名
     */
     if(bot.contacts[msg.FromUserName].isSelf){
      //本人
      console.log('回复消息给：'+bot.contacts[msg.ToUserName].NickName)
     }else{
      console.log('发送人：'+bot.contacts[msg.FromUserName].getDisplayName())
     }
      /**
       * 文本消息
       */
      let m=msg.Content.split(':\n')
      
      if(msg.FromUserName.startsWith('@@')){
        console.log('消息内容：'+m)
        console.log('==============================')
        //群聊
        replyGroupMsg(msg.Content,msg.FromUserName);
      }else{
        console.log('消息内容：'+m)
        console.log('==============================')
        //个人消息
        replySimpleMsg(msg.Content);
      }
      break
    case bot.conf.MSGTYPE_IMAGE:
      /**
       * 图片消息
       */
      console.log('图片消息，暂时不保存')
      console.log('==============================')
     /* bot.getMsgImg(msg.MsgId).then(res => {
        fs.writeFileSync(`./media/${msg.MsgId}.jpg`, res.data)
      }).catch(err => {
        bot.emit('error', err)
      })*/
      break
    case bot.conf.MSGTYPE_VOICE:
      /**
       * 语音消息
       */
      console.log('语音消息，暂时不保存')
      console.log('==============================')
      /*bot.getVoice(msg.MsgId).then(res => {
        fs.writeFileSync(`./media/${msg.MsgId}.mp3`, res.data)
      }).catch(err => {
        bot.emit('error', err)
      })*/
      break
    case bot.conf.MSGTYPE_EMOTICON:
      /**
       * 表情消息
       */
      console.log('表情消息，暂时不保存')
      console.log('==============================')
     /* bot.getMsgImg(msg.MsgId).then(res => {
        fs.writeFileSync(`./media/${msg.MsgId}.gif`, res.data)
      }).catch(err => {
        bot.emit('error', err)
      })*/
      break
    case bot.conf.MSGTYPE_VIDEO:
    case bot.conf.MSGTYPE_MICROVIDEO:
      /**
       * 视频消息
       */
      console.log('视频消息，暂时不保存')
      console.log('==============================')
      /*bot.getVideo(msg.MsgId).then(res => {
        fs.writeFileSync(`./media/${msg.MsgId}.mp4`, res.data)
      }).catch(err => {
        bot.emit('error', err)
      })*/
      break
    case bot.conf.MSGTYPE_APP:
      if (msg.AppMsgType == 6) {
        /**
         * 文件消息
         */
        console.log('文件消息，暂时不保存')
        console.log('==============================')
        /*bot.getDoc(msg.FromUserName, msg.MediaId, msg.FileName).then(res => {
          fs.writeFileSync(`./media/${msg.FileName}`, res.data)
          console.log(res.type);
        }).catch(err => {
          bot.emit('error', err)
        })*/
      }
      break
    default:
      break
  }
 
})

/**
 * 处理好友请求消息
 */
bot.on('message', msg => {
  if (msg.MsgType == bot.conf.MSGTYPE_VERIFYMSG) {
    bot.verifyUser(msg.RecommendInfo.UserName, msg.RecommendInfo.Ticket)
      .then(res => {
        console.log(`通过了 ${bot.Contact.getDisplayName(msg.RecommendInfo)} 好友请求`)
      })
      .catch(err => {
        bot.emit('error', err)
      })
  }
})



/**
 * 错误事件，参数一般为Error对象
 */
bot.on('error', err => {
  console.error('错误：', err)
})

/*
 * 回复个人消息
 */
function replySimpleMsg(msg){

}

/*
 * 回复群消息
 */
function replyGroupMsg(msg,toUserName){
  msg=unescape(msg.replace(/\u/g, "%u"))
  let infos=msg.split(':\n')
  if(infos.length>0){
      let fromName = infos[0];
      let nickName = fromName == undefined ? '陌生人' : fromName
      if(infos[1].startsWith('@')){
        let p=infos[1].replace("@","").split(' ')
        if(p.length > 0){
          let p_name = p[0]
          if(p_name === bot.user.NickName){
            //回复@自己的消息
            //console.log("@自己的消息["+nickName+"]:"+p[1])
            //不是@自己，或者其它消息
            bot.replyMessageByTuling(p[1],toUserName).catch(err => {
              bot.emit('error', err)
            })
          }else{
            //不是@自己，或者其它消息不回复
            
          }
        }
      }else{
          //正常消息不恢复

      }
    }
  /*let g_msg=msg.match(/<br\/>(\S*)/)[1]
  if(g_msg.substr(0,1).trim()=='@'){
    let infos=g_msg.split(' ')
    console.log(infos)
    if(infos.length>0){
      if(infos[0].replace("@","").trim() == bot.user.NickName){
        //@自己的消息
        g_msg=msg.replace(username+":<br/>","").replace('@'+bot.user.NickName,"").trim()
        if(msg.length>0){
          console.log("@自己的消息["+nickName+"("+bot.user.NickName+")]:"+msg)
        }else{
         
        }
        console.log("@了自己["+nickName+"("+bot.user.NickName+")]")

      }
    }
          
  }else{
    console.log('收到群消息['+nickName+']:'+msg)
  }*/
}