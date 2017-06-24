#!/usr/bin/env node
// 导入基本模块
var http = require('https');  
var fs = require('fs');
var request = require('request');
var qs = require('querystring');
var config = require('./libs/core/config');
var schedule = require('node-schedule');
var xmlreader = require("xmlreader"); 
var qrcode = require('qrcode-terminal');
var job;
var wechatapi={};

/*微信封装方法*/

//登陆以及微信初始化

wechatapi.getUUID= function (){
  config.data = {  
    appid : 'wx782c26e4c19acffb',  
    fun : 'new',
    lang : 'zh_CN'
  };
  config.options.hostname = config.wxHost.login_host;
  config.options.path = '/jslogin?' + qs.stringify(config.data);
  //发起请求
  requestHttps(callbackQrCode);
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
wechatapi.waitForLogin = function (){
  config.tips=1;
  config.data = { 
    tip : config.tips,
    uuid : config.uuid
  };
  config.options.path=config.wxPath.waitForLogin+'?' + qs.stringify(config.data);
  requestHttps(callbackLogin);
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
wechatapi.wxInit = function (){
  if(config.isDebug){
    console.log("微信初始化...");
  }
  var id="e"+ (''+Math.random().toFixed(15)).substring(2, 17);
  config.data={
      BaseRequest : {
        Uin:config.wxConfig.wxuin,
        Sid:config.wxConfig.wxsid,
        Skey:config.wxConfig.skey,
        DeviceID:id
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
  requestHttps(callbackInit);
}

//开启微信状态通知
wechatapi.wxStatusNotify = function(callback){
  config.options.hostname=config.wxHost.main_host;
  config.options.path=config.wxPath.wxStatusNotify + '?lang=zh_CN&pass_ticket='+config.wxConfig.pass_ticket;
  config.options.method='POST';
  var id="e"+ (''+Math.random().toFixed(15)).substring(2, 17);
  var clientMsgId=(new Date().getTime()+'').substring(0,4)+(Math.random().toFixed(4)+'').substring(2,6);
  config.data={
      BaseRequest : {
        Uin : config.wxConfig.wxuin,
        Sid : config.wxConfig.wxsid,
        Skey : config.wxConfig.skey,
        DeviceID : id
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
  config.options.path=config.wxPath.webWxSendMsg + '?lang=zh_CN&sid='+config.wxConfig.wxsid+'&pass_ticket='+config.wxConfig.pass_ticket+'&skey='+config.wxConfig.skey;
  config.options.method='POST';
  var id="e"+ (''+Math.random().toFixed(15)).substring(2, 17);
  config.data={
      BaseRequest : {
        Uin : config.wxConfig.wxuin,
        Sid : config.wxConfig.wxsid,
        Skey : config.wxConfig.skey,
        DeviceID : id
      },
      Msg : msg
  };
  config.params=JSON.stringify(config.data);
  config.options.headers = {
    'Content-Type': 'application/json;charset=utf-8',
    'Content-Length':config.params.length
};
  requestHttps(callbackWebwxsendmsg);
}

//发送文字消息
wechatapi.sendTextMessage = function (content,from,to){
  var id=(new Date().getTime()+'').substring(0,4)+(Math.random().toFixed(4)+'').substring(2,6);
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
    webwxsendmsg(msg);
}

//获取联系人
wechatapi.getContact = function(callback){
  config.options.hostname=config.wxHost.main_host;
  config.options.path= config.wxPath.getContact+'?r='+ new Date().getTime()+'&skey='+config.wxConfig.skey+'&pass_ticket='+config.wxConfig.pass_ticket;;
  config.options.method='POST';
  var id="e"+ (''+Math.random().toFixed(15)).substring(2, 17);
  config.data={
      BaseRequest : {
        Uin : config.wxConfig.wxuin,
        Sid : config.wxConfig.wxsid,
        Skey : config.wxConfig.skey,
        DeviceID : id
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
  var id="e"+ (''+Math.random().toFixed(15)).substring(2, 17);
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
        DeviceID : id
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
  config.options.hostname=config.wxHost.check_host;
  var id="e"+ (''+Math.random().toFixed(15)).substring(2, 17);
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
    deviceid : id,
    _ : new Date().getTime(),
    r : new Date().getTime()
  };
  config.options.path=config.wxPath.syncCheck+'?r='+ new Date().getTime()+'&uin='+config.wxConfig.wxuin +'&sid='
  +config.wxConfig.wxsid +'&skey='+config.wxConfig.skey +'&deviceid='+id +'&_='+new Date().getTime()+'&synckey='+key;
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
  var id="e"+ (''+Math.random().toFixed(15)).substring(2, 17);
  config.data={
      BaseRequest : {
        Uin : config.wxConfig.wxuin,
        Sid : config.wxConfig.wxsid,
        Skey : config.wxConfig.skey,
        DeviceID : id
      },
      SyncKey : config.syncKey,
      rr : new Date().getTime()
  };
  config.params = JSON.stringify(config.data);
  config.options.headers = {
    'Content-Type': 'application/json;charset=utf-8',
    'Content-Length':config.params.length,
    'Cookie': config.wxCookie
  };
  requestHttps(callback);
}

/*基本网络请求*/
function requestHttps(callback){
  var req = http.request(config.options, function (res) {   
    res.setEncoding('utf8');
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



