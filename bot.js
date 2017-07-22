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
/*fs.readFile("./qr.jpg", function(err, data) {
    if(err) {
        // Deal with error.
    } else {
        // Deal with data
      console.log(data.length)
    }
  });
 return;*/
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
  fs.writeFileSync('./contacts.json', JSON.stringify(bot.contacts))
})


bot.on('login', () => {
  console.log('登录了')
  //fs.writeFileSync('./sync-data.json', JSON.stringify(bot.wxData))
/*  const rs = fs.createReadStream("./qr.jpg");
  //let data = fs.readFileSync("./qr.jpg")

  bot.sendMsg({file:rs,filename:'qr.jpg'},'filehelper')*/
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
      //bot.updateRemarkName(msg.ToUserName,"老大")
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
        replySimpleMsg(msg.Content,msg.FromUserName);
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
        var message = "你好，我是小安安，如果您来自github，请输入相关羞羞的暗号，将你拉入指定群聊。\n\n\n\nWelcome to here, if you from Github, show me the code ,I will invited you to the group"
        message += '\n\n\n\n当然，你也可以和我痛痛快快的聊一场不冷场的天。'
        return bot.sendMsg(message,msg.RecommendInfo.UserName)
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
function replySimpleMsg(msg,toUserName){
  //const config = require('./data.json')
  let config = JSON.parse(fs.readFileSync('./data.json'))
  let fromUser = bot.contacts[toUserName]
  let manage = config.manageGroups.filter(function(item){
    return item.keyword === msg
  })
  if(manage[0] != undefined){
    //关键字匹配
    let flag =false
    for (let x in bot.contacts){
      if(bot.contacts[x].NickName == manage[0].Name){
        flag = true
        //找到群聊，拉人进群聊
        let memberList = new Array()
        var u = { 'UserName' : toUserName }
        memberList.push(u)
        bot.updateChatroom(bot.contacts[x].UserName,memberList,'addmember').then(result => {
          var message = "@"+fromUser.NickName+" 欢迎加入我们的大家庭！"
          return bot.sendMsg(message,bot.contacts[x].UserName)
        }).catch(err => {
          bot.emit('error', err)
        })
      }
    }
    if(!flag){
      //正常消息
      bot.replyMessageByTuling(msg,toUserName).catch(err => {
        bot.emit('error', err)
      })
    }
  }else{
    //正常消息
    bot.replyMessageByTuling(msg,toUserName).catch(err => {
      bot.emit('error', err)
    })
  }
}

/*
 * 回复群消息
 */
function replyGroupMsg(msg,toUserName){
  //msg=unescape(msg.replace(/\u/g, "%u"))
  let infos=msg.split(':\n')
  if(infos.length>0){
      let fromName = infos[0];
      let nickName = fromName == undefined ? '陌生人' : fromName
      if(infos[1].startsWith('@')){
        if(infos[1].indexOf('@'+bot.user.NickName)>-1){
          let m = infos[1].replace('@'+bot.user.NickName,'').replace(' ','').trim()
            let space = infos[1].split('@'+bot.user.NickName)[1].substr(0,1);
            bot.replyMessageByTuling(m,toUserName).catch(err => {
              bot.emit('error', err)
            })
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