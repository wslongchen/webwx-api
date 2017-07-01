// 导入基本模块
var http = require('https');  
var fs = require('fs');
var request = require('request');
var qs = require('querystring');
var config = require('../libs/core/config');
var schedule = require('node-schedule');
var xmlreader = require("xmlreader"); 
var qrcode = require('qrcode-terminal');
var job;
var wechatapi={};

/*微信封装方法*/

//登陆以及微信初始化
var deviceID="e"+ (''+Math.random().toFixed(15)).substring(2, 17);

wechatapi.getUUID= function (callback){
  config.data = {  
    appid : 'wx782c26e4c19acffb',  
    fun : 'new',
    lang : 'zh_CN'
  };
  config.options.hostname = config.wxHost.login_host;
  config.options.path = '/jslogin?' + qs.stringify(config.data);
  //发起请求
  if(callback){
    requestHttps(callback);
  }else{
    requestHttps(callbackQrCode);
  }
}

//实时监听登录情况,每5秒执行一次
wechatapi.waitForLoginSchedule=function (){
  var rule1     = new schedule.RecurrenceRule();  
  var times1    = [1,6,11,16,21,26,31,36,41,46,51,56];  
  rule1.second  = times1; 
  job=schedule.scheduleJob(rule1, function(){
      wechatapi.waitForLogin(); 
  }); 
}

//等待登录
wechatapi.waitForLogin = function (callback){
  config.tips=1;
  config.data = { 
    tip : config.tips,
    uuid : config.uuid
  };
  config.options.path=config.wxPath.waitForLogin+'?' + qs.stringify(config.data);
  if(callback){
    requestHttps(callback);
  }else{
    requestHttps(callbackLogin);
  }
}

//请求登录
wechatapi.login = function (url){
  var host=url.match(/\/\/(\S*)\/cgi-bin/)[1];
  var p=url.match(/com(\S*)/)[1];
  config.options.hostname=host;
  config.options.path=p+'&fun=new&version=v2';
  requestHttps(callbackCookie);
}

//微信初始化
wechatapi.wxInit = function (callback){
  if(config.isDebug){
    console.log("微信初始化...");
  }
  
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
  if(callback){
    requestHttps(callback);
  }else{
    requestHttps(callbackInit);
  }
}

//开启微信状态通知
wechatapi.wxStatusNotify = function(callback){
  config.options.hostname=config.wxHost.main_host;
  config.options.path=config.wxPath.wxStatusNotify + '?lang=zh_CN&pass_ticket='+config.wxConfig.pass_ticket;
  config.options.method='POST';
  //var id="e"+ (''+Math.random().toFixed(15)).substring(2, 17);
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
  requestHttps(callback);
}

//发送消息
function webwxsendmsg(msg){
  config.options.hostname=config.wxHost.main_host;
  config.options.path=config.wxPath.webWxSendMsg + '?lang=zh_CN&pass_ticket='+config.wxConfig.pass_ticket;
  config.options.method='POST';
  //var id="e"+ (''+Math.random().toFixed(15)).substring(2, 17);
  config.data={
      BaseRequest : {
        Uin : config.wxConfig.wxuin,
        Sid : config.wxConfig.wxsid,
        Skey : config.wxConfig.skey,
        DeviceID : deviceID
      },
      Msg : msg
  };
  config.params=JSON.stringify(config.data);
  config.options.headers = {
    'Content-Type': 'application/json;charset=utf-8',
    'Content-Length': Buffer.byteLength(config.params,'utf8')
  };
  console.log(config.params);
  console.log(config.options);
  if(callback){
    requestHttps(callback);
  }else{
    requestHttps(callbackWebwxsendmsg);
  }
}

//发送文字消息
wechatapi.sendTextMessage = function (content,from,to,callback){
  var id=(+new Date + Math.random().toFixed(3)).replace('.', '');
  var msg={
      Type : 1,
      Content : content,
      FromUserName : from,
      ToUserName : to,
      LocalID : id,
      ClientMsgId : id
    };
    if(config.isDebug){
      console.log('发送文字消息：'+content);
    }
    webwxsendmsg(msg,callback);
}

//获取联系人
wechatapi.getContact = function(callback){
  config.options.hostname=config.wxHost.main_host;
  config.options.path= config.wxPath.getContact+'?r='+ new Date().getTime()+'&skey='+config.wxConfig.skey+'&pass_ticket='+config.wxConfig.pass_ticket;;
  config.options.method='POST';
  //var id="e"+ (''+Math.random().toFixed(15)).substring(2, 17);
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
  requestHttps(callback);
}

//获取群列表
wechatapi.getGroupList = function(groupIds,callback){
  config.options.hostname=config.wxHost.main_host;
  config.options.path= config.wxPath.getGroupContact+'?type=ex&r='+ new Date().getTime()+'&pass_ticket='+config.wxConfig.pass_ticket;
  config.options.method='POST';
  //var id="e"+ (''+Math.random().toFixed(15)).substring(2, 17);
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
  requestHttps(callback);
}

//消息检查
wechatapi.syncCheck = function(callback){
  /*if(host){
    config.options.hostname=host;
  }else{
    config.options.hostname=config.wxHost.check_host;
  }*/
  config.options.hostname=config.wxHost.check_host;
  //var id="e"+ (''+Math.random().toFixed(15)).substring(2, 17);
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
  requestHttps(callback);
}

//获取最新消息
wechatapi.webwxsync = function(callback){
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
  requestHttps(callback);
}

//创建聊天室
wechatapi.createChatRoom = function(topic,memberList,callback){
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
  requestHttps(callback);
}

//更新聊天室
wechatapi.updateChatRoom = function(chatRoomUserName,memberList,fun,callback){
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
  requestHttps(callback);
}

//获取头像
wechatapi.getHeadImg = function(username,callback){
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
  requestHttps(callback);
}

//消息撤回
wechatapi.revokeMsg = function(msgId,toId,callback){
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
  requestHttps(callback);
}

//推送登陆
wechatapi.pushLogin = function(uin,callback){
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
  requestHttps(callback);
}

//通过好友请求
wechatapi.verifyUser = function(userName,ticket,callback){
  config.options.hostname=config.wxHost.main_host;
  config.options.path=config.wxPath.wxVerifyUser+'?lang=zh_CN&r='+ new Date().getTime()+'&pass_ticket='+config.wxConfig.pass_ticket;
  config.options.method='POST';
  var id=(+new Date + Math.random().toFixed(3)).replace('.', '');
  config.data={
      BaseRequest : {
        Uin : config.wxConfig.wxuin,
        Sid : config.wxConfig.wxsid,
        Skey : config.wxConfig.skey,
        DeviceID : deviceID
      },
      Opcode : 3,
      VerifyUserListSize : 1,
      VerifyUserList : [{
          Value: UserName,
          VerifyUserTicket: ticket
        }],
      VerifyContent : '',
      SceneListCount : 1,
      SceneList: [33],
      skey : config.wxConfig.skey

  };
  config.params = JSON.stringify(config.data);
  config.options.headers = {
    'Content-Type': 'application/json;charset=utf-8',
    'Content-Length':config.params.length
  };
  requestHttps(callback);
}


//添加好友
wechatapi.addFriend = function(userName,content,callback){
  config.options.hostname=config.wxHost.main_host;
  config.options.path=config.wxPath.wxVerifyUser+'?lang=zh_CN&r='+ new Date().getTime()+'&pass_ticket='+config.wxConfig.pass_ticket;
  config.options.method='POST';
  var id=(+new Date + Math.random().toFixed(3)).replace('.', '');
  config.data={
      BaseRequest : {
        Uin : config.wxConfig.wxuin,
        Sid : config.wxConfig.wxsid,
        Skey : config.wxConfig.skey,
        DeviceID : deviceID
      },
      Opcode : 2,
      VerifyUserListSize : 1,
      VerifyUserList : [{
          Value: UserName,
          VerifyUserTicket: ''
        }],
      VerifyContent : '',
      SceneListCount : 1,
      SceneList: [33],
      skey : config.wxConfig.skey

  };
  config.params = JSON.stringify(config.data);
  config.options.headers = {
    'Content-Type': 'application/json;charset=utf-8',
    'Content-Length':config.params.length
  };
  requestHttps(callback);
}

/*基本网络请求*/
function requestHttps(callback){
  var req = http.request(config.options, function (res) {   
    res.setEncoding('utf-8');
    var headers=res.headers;
    var responseString = '';
    var cookie=headers['set-cookie'];
    res.on('data', function (chunk) { 
        
        responseString += chunk;
    });  
    res.on('end', function() {
      if(config.isDebug){
        //console.log('response body: ' + responseString);
      }
      callback(responseString,cookie);
    });
  });  
  
  req.on('error', function (e) {  
      if(config.isDebug){
        console.log('problem with request: ' + e.message);
      }  
  });  
  
  req.write(config.params+"\n");

  req.end(); 
}

/*回调信息*/

//获取验证码回调
function callbackQrCode(data){
  config.resbonseData = data;
  var uuid=data.match(/\"(\S*)\"/)[1];
  if(uuid!=undefined){
    config.uuid=uuid;
    showQrCode(uuid);
  }
}

//登录二维码
function showQrCode(uuid){
  //下载验证码
  if(wechatapi.qrCodeType == 'png'){
    downloadPicture('https://login.weixin.qq.com/qrcode/'+uuid,'qrcode');
    if(config.isDebug){
        console.log("二维码下载完成，请扫描...");
    }
    wechatapi.waitForLoginSchedule();
  }else if(wechatapi.qrCodeType == 'cmd'){
    showCommandLineQRCode('https://login.weixin.qq.com/l/'+uuid);
    if(config.isDebug){
      console.log("二维码显示成功，请扫描...");
    }
    wechatapi.waitForLoginSchedule();
  }
}

//扫描登录回调
function callbackLogin(data){
  config.resbonseData = data;
  var code=data.match(/code=(\S*);/)[1];
  if(code!=undefined){
    //等待登录
    code=code.replace(/^\s+|\s+$/g, "").trim();
    if(code==200){
       //确认登录
        var base_uri=data.match(/\"(\S*)\"/)[1];
        wechatapi.login(base_uri);
        if(config.isDebug){
          console.log("确认成功，进行登录");
        }
        job.cancel();
      }else if(code == 201){
        //扫描成功
        config.tips=0;
        if(config.isDebug){
          console.log("扫描成功,在微信客户端点击确认");  
        }
        
      }else if(code ==408){
        //超时
      }else{
        if(config.isDebug){
          console.log("登陆中...");
        }
        
      }
  }
}

//微信登录cookie回调
function callbackCookie(data,cookie){
  config.resbonseData = data;
  config.wxCookie = cookie;
  xmlreader.read(data, function(errors, response){  
    if(null !== errors ){  
        if(config.isDebug){
          console.log(errors);
        }
        return;  
    }
    config.wxConfig.skey=response.error.skey.text();
    config.wxConfig.wxsid=response.error.wxsid.text();
    config.wxConfig.wxuin=response.error.wxuin.text();
    config.wxConfig.pass_ticket= response.error.pass_ticket.text();
    wechatapi.wxInit();
  });  
}

//初始化回调
function callbackInit(data){
  config.resbonseData = data;
  var result=JSON.parse(data);
  if(result.BaseResponse.Ret==0){
    if(config.isDebug){
      console.log("初始化成功，昵称为："+result.User.NickName);
    }
    config.user=result.User;
    config.syncKey=result.SyncKey;
    config.retFlag=true;
  }else{
    if(config.isDebug){
      console.log("初始化微信失败...");
    }
    config.wxHost.main_host ='wx2.qq.com';
    wechatapi.wxInit();
    config.retFlag=false;
  }
}

//开启微信通知回调
function callbackStatusNotify(data){
  config.resbonseData = data;
  var result=JSON.parse(data);
  if(result.BaseResponse.Ret==0){
    if(config.isDebug){
      console.log("开启微信状态通知成功...");
    }
  }else{
    if(config.isDebug){
      console.log("开启微信状态通知失败...");
    }
  }
}

//微信发送消息回调
function callbackWebwxsendmsg(data){
  config.resbonseData = data;
  console.log(data);
  var result=JSON.parse(data);
  if(result.BaseResponse.Ret==0){
    if(config.isDebug){
      console.log("消息发送成功...");
    }
  }else{
    if(config.isDebug){
      console.log("消息发送失败...");
    }
  }
}

//获取联系人回调
function callbackContact(data){
  config.resbonseData = data;
  var result=JSON.parse(data);
  if(result.BaseResponse.Ret==0){
    if(config.isDebug){
      console.log("获取联系人列表成功...");
    }
    config.contact = result;
  }else{
    if(config.isDebug){
      console.log("获取联系人列表失败...");
    }
  }
}

//检查消息回调
function callbackSyncCheck(data){
   config.resbonseData = data;
   var check=data.match(/syncheck=(\S*)/)[1];
   var result=JSON.parse(check);
   if(result.retcode!=0){
      if(config.isDebug){
        console.log("失败/退出微信...");
      }
   }else{
      if(result.selector==0){
        //正常
      }else if(result.selector==2){
        //新消息
      }else if(result.selector==7){
        //进入/离开聊天界面
      }
   }
}

//同步消息回调
function callbackWebwxsync(data){
  config.resbonseData = data;
  var result=JSON.parse(data);
  if(result.BaseResponse.Ret==0){
    if(config.isDebug){
      console.log("获取最新消息成功...");
    }
  }else{
    if(config.isDebug){
      console.log("获取最新消息失败...");
    }
  }
}

/*其它方法*/

//下载图片
function downloadPicture(url,filename){
  request(url).pipe(fs.createWriteStream(filename+'.png'));
}

//显示命令行二维码
function showCommandLineQRCode(str){
  qrcode.generate(str, function (qrcode) {
    console.log(qrcode);
  });
}

//获取地址根据参数
function getUrlParam(url,name){
  var reg = new RegExp("(^|&)"+name+"=([^&]*)(&|$)"); 
  var r =  url.search.substr(1).match(reg);
  var strValue = "";
  if (r!=null){
   strValue= unescape(r[2]);
  }
  return strValue;
}

/*公共属性*/
wechatapi.MsgType={
  1 : '文本消息',
  3 : '图片消息',
  34 : '语音消息',
  37 : '好友确认消息',
  40 : 'POSSIBLEFRIEND_MSG',
  42 : '共享名片',
  43 : '视频消息',
  47 : '动画表情',
  48 : '位置消息',
  49 : '分享链接',
  50 : 'VOIPMSG',
  51 : '微信初始化消息',
  52 : 'VOIPNOTIFY',
  53 : 'VOIPINVITE',
  62 : '小视频',
  9999 : 'SYSNOTICE',
  10000 : '系统消息',
  10002 : '撤回消息'
};

wechatapi.SPECIALUSER = ["newsapp", "filehelper", "weibo", "qqmail",
            "fmessage", "tmessage", "qmessage", "qqsync",
            "floatbottle", "lbsapp", "shakeapp", "medianote",
            "qqfriend", "readerapp", "blogapp", "facebookapp",
            "masssendapp", "meishiapp", "feedsapp", "voip",
            "blogappweixin", "brandsessionholder", "weixin",
            "weixinreminder", "officialaccounts", "wxitil",
            "notification_messages", "wxid_novlwrv3lqwv11",
            "gh_22b87fa7cb3c", "userexperience_alarm"];

wechatapi.getAccountType = function(username){
   var str=username.substr(0,1).trim();
   if(str=='@'){
      var str2=username.substr(0,2).trim();
      if(str2=='@@'){
        return '群聊';
      }else{
        return '个人账号/公众号';  
      }
   }else{
      var type=otherType[username];
      if(type != undefined){
        return type;
      }else{
        return '未知类型';
      }
   }
}

var otherType = {
  filehelper : '文件助手',
  newsapp : '腾讯新闻', 
  weibo : '微博',
  qqmail : 'QQ邮件', 
  qqfriend :'QQ好友助手', 
};

wechatapi.qrCodeType = 'cmd';

module.exports = wechatapi;



function EncodeUtf8(s1)
{
      var s = escape(s1);
      var sa = s.split("%");
      var retV ="";
      if(sa[0] != "")
      {
         retV = sa[0];
      }
      for(var i = 1; i < sa.length; i ++)
      {
           if(sa[i].substring(0,1) == "u")
           {
               retV += Hex2Utf8(Str2Hex(sa[i].substring(1,5)));

           }
           else retV += "%" + sa[i];
      }

      return retV;
}
function Str2Hex(s)
{
      var c = "";
      var n;
      var ss = "0123456789ABCDEF";
      var digS = "";
      for(var i = 0; i < s.length; i ++)
      {
         c = s.charAt(i);
         n = ss.indexOf(c);
         digS += Dec2Dig(eval(n));

      }
      //return value;
      return digS;
}
function Dec2Dig(n1)
{
      var s = "";
      var n2 = 0;
      for(var i = 0; i < 4; i++)
      {
         n2 = Math.pow(2,3 - i);
         if(n1 >= n2)
         {
            s += '1';
            n1 = n1 - n2;
          }
         else
          s += '0';

      }
      return s;

}
function Dig2Dec(s)
{
      var retV = 0;
      if(s.length == 4)
      {
          for(var i = 0; i < 4; i ++)
          {
              retV += eval(s.charAt(i)) * Math.pow(2, 3 - i);
          }
          return retV;
      }
      return -1;
}
function Hex2Utf8(s)
{
     var retS = "";
     var tempS = "";
     var ss = "";
     if(s.length == 16)
     {
         tempS = "1110" + s.substring(0, 4);
         tempS += "10" + s.substring(4, 10);
         tempS += "10" + s.substring(10,16);
         var sss = "0123456789ABCDEF";
         for(var i = 0; i < 3; i ++)
         {
            retS += "%";
            ss = tempS.substring(i * 8, (eval(i)+1)*8);



            retS += sss.charAt(Dig2Dec(ss.substring(0,4)));
            retS += sss.charAt(Dig2Dec(ss.substring(4,8)));
         }
         return retS;
     }
     return "";
} 
