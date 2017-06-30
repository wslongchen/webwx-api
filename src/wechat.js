#!/usr/bin/env node
// 导入基本模块
import wxCore from './wxcore'
import {
  getCONF,
  isStandardBrowserEnv,
} from './utils'

/*微信核心类*/
class wxCore {
  constructor(){
    this.prop = {
      uuid : '',
      uin : '',
      sid : '',
      skey : '',
      pass_ticket : '',
      syncKeyStr : '',
      syncKey  : {
        List : []
      }
    }
    this.conf = getCONF()
    this.cookie = {}
    this.user = {}
    this.request = new Request({
      Cookie : this.cookie
    })
  }

  get wxData(){
    return {
      prop : this.prop,
      conf : this.conf,
      cookie : this.cookie,
      user : this.user
    }
  }

  set wxData(data){
    Object.keys(data).forEach(key =>{
      Object.assign(this[key],data[key])
    })
  }

  getUUID(){
    let data = {
      method : 'POST',
      url : this.conf.API_jsLogin
    }
    return Promise.resolve().then(() => {
      return this.request(data).then(result => {
        let window = { QRLogin : {} }
        eval(result.data)
        assert.equal(window.QRLogin.code,200,ress)
        this.prop.uuid = window.QRLogin.uuid
        return window.QRLogin.uuid
      })
    }).catch(err => {
      err.msg = 'UUID获取失败'
    })
  }


  
}


/**
 * 获取用户UUID
 *
 * @returns  void
 *
 * @date     2017-06-28
 * @author   MrPan<www.mrpann.cn>
 */
exports.getUUID = () => {
  return new Promise((resolve,reject) => {
    config.data = {  
      appid : 'wx782c26e4c19acffb',  
      fun : 'new',
      lang : 'zh_CN'
    };
    config.options.hostname = config.wxHost.login_host;
    config.options.path = '/jslogin?' + qs.stringify(config.data);
    requestHttps(resolve,reject);
  });
}

/**
 * 显示二维码
 *
 * 可配置wxapi.qrCodeType(png=>图片下载显示，cmd=>终端显示)
 *
 * @param    {string}  uuid     用户uuid
 * @returns  void
 *
 * @date     2017-06-28
 * @author   MrPan<www.mrpann.cn>
 */
exports.showQrCode = (uuid) => {
  return new Promise((resolve,reject) => {
    //下载验证码
    if(wxapi.qrCodeType == 'png'){
      request('https://login.weixin.qq.com/qrcode/'+uuid,'qrcode').pipe(fs.createWriteStream(filename+'.png'));
      resolve({code : 0, msg : "二维码下载成功，请扫描..."})
    }else if(wechatapi.qrCodeType == 'cmd'){
      qrcode.generate('https://login.weixin.qq.com/l/'+uuid, function (qrcode) {
        console.log(qrcode);
        resolve({code : 0, msg : '二维码显示成功，请扫描...'});
      });
    }else{
      reject({code : 999,msg : '未设置二维码类型'});
    }
  });
}

/**
 * 等待用户登陆
 *
 * @param    {int}  tips     扫描标志
 * @param    {string}  uuid  用户uuid
 * @returns  void
 *
 * @date     2017-06-28
 * @author   MrPan<www.mrpann.cn>
 */
exports.waitForLogin = (tips,uuid) => {
  return new Promise((resolve,reject) => {
    config.data = { 
      tip : tips,
      uuid : uuid
    };
    config.options.path=config.wxPath.waitForLogin+'?' + qs.stringify(config.data);
    requestHttps(resolve,reject);
  });
}

/**
 * 初始化
 *
 * @returns  void
 *
 * @date     2017-06-28
 * @author   MrPan<www.mrpann.cn>
 */
exports.wxInit = () => {
  return new Promise((resolve,reject) => {
    config.data={
        BaseRequest : {
          Uin:config.wxConfig.wxuin,
          Sid:config.wxConfig.wxsid,
          Skey:config.wxConfig.skey,
          DeviceID:deviceID
        }
    };
    config.params=JSON.stringify(config.data);

    config.options.hostname= config.wxHost.main_host;
    config.options.path=config.wxPath.wxInit+'?r='+new Date().getTime()+'&pass_ticket='+config.wxConfig.pass_ticket+'&skey='+config.wxConfig.skey;
    config.options.method='POST';
    config.options.headers = {
      'Content-Type': 'application/json;charset=utf-8',
      'Content-Length':config.params.length,
      'Cookie': config.wxCookie
    };
    requestHttps(resolve,reject);
  });
}

/**
 * 登陆
 *
 * @param    {string}  url  登陆链接
 * @returns  void
 *
 * @date     2017-06-28
 * @author   MrPan<www.mrpann.cn>
 */
exports.login = (url) => {
  return new Promise((resolve,reject) => {
    var host=url.match(/\/\/(\S*)\/cgi-bin/)[1];
    var p=url.match(/com(\S*)/)[1];
    config.options.hostname=host;
    config.options.path=p+'&fun=new&version=v2';
    requestHttps(resolve,reject);
  });
}

/**
 * 微信状态开启
 *
 * @returns  void
 *
 * @date     2017-06-28
 * @author   MrPan<www.mrpann.cn>
 */
exports.wxStatusNotify = () => {
  return new Promise((resolve,reject) => {
    config.options.hostname=config.wxHost.main_host;
    config.options.path=config.wxPath.wxStatusNotify + '?lang=zh_CN&pass_ticket='+config.wxConfig.pass_ticket;
    config.options.method='POST';
    var clientMsgId = (+new Date + Math.random().toFixed(3)).replace('.', '');
    config.data={
        BaseRequest : {
          Uin : config.wxConfig.wxuin,
          Sid : config.wxConfig.wxsid,
          Skey : config.wxConfig.skey,
          DeviceID : deviceID
        },
        Code : 3,
        FromUserName : config.user.UserName,
        ToUserName :config.user.UserName,
        ClientMsgId:clientMsgId
    };

    config.params=JSON.stringify(config.data);
    config.options.headers = {
      'Content-Type': 'application/json;charset=utf-8',
      'Content-Length':config.params.length
    };
    requestHttps(resolve,reject);
  });
}

/**
 * 发送文本消息
 *
 * @param    {string}  content     内容
 * @param    {String}   from         发送人
 * @param    {string}  to   接收人
 * @returns  void
 *
 * @date     2017-06-28
 * @author   MrPan<www.mrpann.cn>
 */
exports.wxSendTextMsg = (content,from,to) => {
  return new Promise((resolve,reject) => {
    config.options.hostname=config.wxHost.main_host;
    config.options.path=config.wxPath.webWxSendMsg + '?lang=zh_CN&pass_ticket='+config.wxConfig.pass_ticket;
    config.options.method='POST';
    var id=(+new Date + Math.random().toFixed(3)).replace('.', '');
    config.data={
        BaseRequest : {
          Uin : config.wxConfig.wxuin,
          Sid : config.wxConfig.wxsid,
          Skey : config.wxConfig.skey,
          DeviceID : deviceID
        },
        Msg : {
          Type : 1,
          Content : content,
          FromUserName : from,
          ToUserName : to,
          LocalID : id,
          ClientMsgId : id
        }
    };
    config.params=JSON.stringify(config.data);
    config.options.headers = {
      'Content-Type': 'application/json;charset=utf-8',
      'Content-Length': Buffer.byteLength(config.params,'utf8')
    };
    requestHttps(resolve,reject);
  });
}

/**
 * 获取联系人列表
 *
 * @returns  void
 *
 * @date     2017-06-28
 * @author   MrPan<www.mrpann.cn>
 */
exports.getContact = () => {
  return new Promise((resolve,reject) => {
    config.options.hostname=config.wxHost.main_host;
    config.options.path= config.wxPath.getContact+'?r='+ new Date().getTime()+'&skey='+config.wxConfig.skey+'&pass_ticket='+config.wxConfig.pass_ticket;;
    config.options.method='POST';
    config.data={
        BaseRequest : {
          Uin : config.wxConfig.wxuin,
          Sid : config.wxConfig.wxsid,
          Skey : config.wxConfig.skey,
          DeviceID : deviceID
        }
    };
    config.params=JSON.stringify(config.data);
    config.options.headers = {
      'Content-Type': 'application/json;charset=utf-8',
      'Content-Length':config.params.length,
      'Cookie': config.wxCookie
    };
    requestHttps(resolve,reject);
  });
}

/**
 * 获取群列表
 *
 * @param    {array}   groupIds         群ID数组
 * @returns  void
 *
 * @date     2017-06-28
 * @author   MrPan<www.mrpann.cn>
 */
exports.getGroupList = (groupIds) => {
  return new Promise((resolve,reject) => {
    config.options.hostname=config.wxHost.main_host;
    config.options.path= config.wxPath.getGroupContact+'?type=ex&r='+ new Date().getTime()+'&pass_ticket='+config.wxConfig.pass_ticket;
    config.options.method='POST';
    var Lists=new Array();
    for(var i=0;i<groupIds.length;i++){
      var list = {
        UserName : groupIds[i],
        EncryChatRoomId : ''
      };
      Lists.push(list);
    }
    config.data={
        BaseRequest : {
          Uin : config.wxConfig.wxuin,
          Sid : config.wxConfig.wxsid,
          Skey : config.wxConfig.skey,
          DeviceID : deviceID
        },
        Count : groupIds.length,
        List : Lists
    };
    config.params = JSON.stringify(config.data);
    config.options.headers = {
      'Content-Type': 'application/json;charset=utf-8',
      'Content-Length':config.params.length,
      'Cookie': config.wxCookie
    };
    requestHttps(resolve,reject);
  });
}

/**
 * 消息检查
 *
 * @returns  void
 *
 * @date     2017-06-28
 * @author   MrPan<www.mrpann.cn>
 */
exports.syncCheck = () => {
  return new Promise((resolve,reject) => {
    config.options.hostname=config.wxHost.check_host;
    var key ="";
    var keys=config.syncKey.List;
    for(var o in keys){
      key = key +'|'+keys[o].Key+'_'+keys[o].Val;
    }
    if(key.length>1){
      key = key.substr(1,key.length);
    }
    config.data= {
      uin : config.wxConfig.wxuin,
      sid : config.wxConfig.wxsid,
      skey : config.wxConfig.skey,
      synckey : key,
      deviceid : deviceID,
      _ : new Date().getTime(),
      r : new Date().getTime()
    };
    config.options.path=config.wxPath.syncCheck+'?r='+ new Date().getTime()+'&uin='+config.wxConfig.wxuin +'&sid='
    +config.wxConfig.wxsid +'&skey='+config.wxConfig.skey +'&deviceid='+deviceID +'&_='+new Date().getTime()+'&synckey='+key;
    config.options.method='GET';
    config.params=JSON.stringify(config.data);
    config.options.headers = {
      'Content-Type': 'application/json;charset=utf-8',
      'Content-Length':config.params.length,
      'Cookie': config.wxCookie
    };
    requestHttps(resolve,reject);
  });
}

/**
 * 获取消息同步
 *
 * @param    {string}  address     地址
 * @param    {array}   com         商品数组
 * @param    {string}  pay_status  支付方式
 * @returns  void
 *
 * @date     2017-06-28
 * @author   MrPan<www.mrpann.cn>
 */
exports.webWxSync = () => {
  return new Promise((resolve,reject) => {
    config.options.hostname=config.wxHost.main_host;
    config.options.path=config.wxPath.webWxSync+'?sid='+config.wxConfig.wxsid+'&pass_ticket='+config.wxConfig.pass_ticket+'&skey='+config.wxConfig.skey;
    config.options.method='POST';
    //var id="e"+ (''+Math.random().toFixed(15)).substring(2, 17);
    var rr=new Date().getTime();
    config.data={
        BaseRequest : {
          Uin : config.wxConfig.wxuin,
          Sid : config.wxConfig.wxsid,
          Skey : config.wxConfig.skey,
          DeviceID : deviceID
        },
        SyncKey : config.syncKey,
        rr : ~rr
    };
    config.params = JSON.stringify(config.data);
    config.options.headers = {
      'Content-Type': 'application/json;charset=utf-8',
      'Content-Length':config.params.length,
      'Cookie': config.wxCookie
    };
    requestHttps(resolve,reject);
  });
}

/**
 * 创建聊天组
 *
 * @param    {string}   topic         是否置顶
 * @param    {array}   memberList         用户数组
 * @returns  void
 *
 * @date     2017-06-28
 * @author   MrPan<www.mrpann.cn>
 */
exports.createChatRoom = (topic,memberList) => {
  return new Promise((resolve,reject) => {
    config.options.hostname=config.wxHost.main_host;
    config.options.path=config.wxPath.createChatRoom+'?lang=zh_CN&r='+ new Date().getTime()+'&pass_ticket='+config.wxConfig.pass_ticket;
    config.options.method='POST';

    config.data={
        BaseRequest : {
          Uin : config.wxConfig.wxuin,
          Sid : config.wxConfig.wxsid,
          Skey : config.wxConfig.skey,
          DeviceID : deviceID
        },
        Topic : topic,
        MemberCount : memberList.length,
        MemberList : memberList
    };
    config.params = JSON.stringify(config.data);
    config.options.headers = {
      'Content-Type': 'application/json;charset=utf-8',
      'Content-Length':config.params.length,
      'Cookie': config.wxCookie
    };
    requestHttps(resolve,reject);
  });
}

/**
 * 修改聊天组
 *
 * @param    {string}   chatRoomUserName         群Id
 * @param    {array}   memberList         用户数组
 * @returns  void
 *
 * @date     2017-06-28
 * @author   MrPan<www.mrpann.cn>
 */
exports.updateChatRoom = (chatRoomUserName,memberList,fun) => {
  return new Promise((resolve,reject) => {
    config.options.hostname=config.wxHost.main_host;
    config.options.path=config.wxPath.updateChatRoom+'?fun='+fun+'&r='+ new Date().getTime();
    config.options.method='POST';
    config.data={
        BaseRequest : {
          Uin : config.wxConfig.wxuin,
          Sid : config.wxConfig.wxsid,
          Skey : config.wxConfig.skey,
          DeviceID : deviceID
        },
        ChatRoomName : ChatRoomName
    };
    if(fun == 'addmember'){
      config.data.AddMemberList = memberList;
    }else if(fun == 'delmember'){
      config.data.DelMemberList = memberList;
    }else if(fun == 'invitemember'){
      config.data.InviteMemberList = memberList;
    }
    config.params = JSON.stringify(config.data);
    config.options.headers = {
      'Content-Type': 'application/json;charset=utf-8',
      'Content-Length':config.params.length,
      'Cookie': config.wxCookie
    };
    requestHttps(resolve,reject);
  });
}

/**
 * 获取头像
 *
 * @param    {string}   username         用户名
 * @returns  void
 *
 * @date     2017-06-30
 * @author   MrPan<www.mrpann.cn>
 */
exports.getHeadImg = (username) => {
  return new Promise((resolve,reject) => {
    config.options.hostname=config.wxHost.main_host;
    config.options.path=config.wxPath.wxGetHeadImg+'?username='+username+'&skey='+config.wxConfig.skey;
    config.options.method='GET';
    //var id="e"+ (''+Math.random().toFixed(15)).substring(2, 17);
    var rr=new Date().getTime();
    config.data={
        BaseRequest : {
          Uin : config.wxConfig.wxuin,
          Sid : config.wxConfig.wxsid,
          Skey : config.wxConfig.skey,
          DeviceID : deviceID
        },
        SyncKey : config.syncKey,
        rr : ~rr
    };
    config.params = JSON.stringify(config.data);
    config.options.headers = {
      'Content-Type': 'application/json;charset=utf-8',
      'Content-Length':config.params.length
    };
    requestHttps(resolve,reject);
  });
}

/**
 * 消息撤回
 *
 * @param    {string}   msgId         消息Id
 * @param    {string}   toId         发送Id
 * @returns  void
 *
 * @date     2017-06-30
 * @author   MrPan<www.mrpann.cn>
 */
exports.revokeMsg = (msgId,toId) => {
  return new Promise((resolve,reject) => {
    config.options.hostname=config.wxHost.main_host;
    config.options.path=config.wxPath.wxRevokeMsg+'?r='+ new Date().getTime();
    config.options.method='POST';
    var id=(+new Date + Math.random().toFixed(3)).replace('.', '');
    config.data={
        BaseRequest : {
          Uin : config.wxConfig.wxuin,
          Sid : config.wxConfig.wxsid,
          Skey : config.wxConfig.skey,
          DeviceID : deviceID
        },
        ToUserName : toId,
        SvrMsgId : msgId,
        ClientMsgId : id
    };
    config.params = JSON.stringify(config.data);
    config.options.headers = {
      'Content-Type': 'application/json;charset=utf-8',
      'Content-Length':config.params.length
    };
    requestHttps(resolve,reject);
  });
}

/**
 * 推送登陆
 *
 * @param    {string}   uin         uin
 * @returns  void
 *
 * @date     2017-06-30
 * @author   MrPan<www.mrpann.cn>
 */
 exports.pushLogin = (uin) => {
  return new Promise((resolve,reject) => {
    config.options.hostname=config.wxHost.main_host;
    if(uin){
      config.options.path=config.wxPath.wxPushLoginUrl+'?uin='+uin
    }else{
      config.options.path=config.wxPath.wxPushLoginUrl+'?uin='+config.wxConfig.wxuin
    }
    config.options.path=config.wxPath.wxPushLoginUrl+'?uin='+uin
    config.options.method='GET';
    config.params = "";
    config.options.headers = {
    };
    requestHttps(resolve,reject);
  });
}

/*基本网络请求*/
function requestHttps(resolve,reject){
  var req = http.request(config.options, function (res) {
    res.setEncoding('utf-8');
    var headers=res.headers;
    var responseString = '';
    var cookie=headers['set-cookie'];
    res.on('data', function (chunk) { 
        responseString += chunk;
    });  
    res.on('end', function() {
      var statusCode = res.statusCode;
      if(statusCode == 200){
        resolve(responseString,cookie);
      }else{
        reject(responseString);
      }      
    });
  });
  req.on('error', function (e) {  
      reject(e);
  });
  req.write(config.params+"\n");
  req.end();
}

exports.qrCodeType = 'cmd';
