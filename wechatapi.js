#!/usr/bin/env node
// 导入基本模块
var http = require('https');  
var fs = require('fs');
var request = require('request');
var qs = require('querystring');
var schedule = require('node-schedule');
var xmlreader = require("xmlreader"); 
var job;
var params="";
var user ={};
var syncKey={};
var wxConfig= {
  skey : '',
  wxsid : '',
  wxuin : '',
  pass_ticket : '' ,
  cookie: ''
};

//这是需要提交的数据  
  

var uid="";
var tips=0;






var baseRequest;

















function callbackSyncCheck(data){
   var check=data.match(/syncheck=(\S*)/)[1];
   var result=JSON.parse(check);
   if(result.retcode!=0){
      console.log("失败/退出微信...");
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
function callbackWebwxsync(data){
  var result=JSON.parse(data);
  if(result.BaseResponse.Ret==0){
    console.log("获取最新消息成功...");
    return data;
  }else{
    console.log("获取最新消息失败...");
  }
}




//消息检查
function syncCheck(){
  options.hostname="webpush2.weixin.qq.com";
  options.path='/cgi-bin/mmwebwx-bin/synccheck';
  options.method='GET';
  options.headers = {'Content-Type': 'application/json;charset=utf-8','Content-Length':params.length};
  requestHttps(callbackSyncCheck);
}

//获取最新消息
function webwxsync(){
  options.hostname="wx.qq.com";
  options.path='/cgi-bin/mmwebwx-bin/webwxinit?sid='+wxConfig.wxsid+'&pass_ticket='+wxConfig.pass_ticket+'&skey='+wxConfig.skey;
  options.method='POST';
  var id="e"+ (''+Math.random().toFixed(15)).substring(2, 17);
  var requestData={
    Uin:wxConfig.wxuin,
    Sid:wxConfig.wxsid,
    Skey:wxConfig.skey,
    DeviceID:id
  };
  var data={BaseRequest : requestData,SyncKey:syncKey,rr:new Date().getTime()};
  options.headers = {'Content-Type': 'application/json;charset=utf-8','Content-Length':JSON.stringify(data).length};
  requestHttps(callbackWebwxsync);
}

/*微信封装方法*/

//登陆以及微信初始化

function getUUId(){
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
function waitForLoginSchedule(){
  var rule1     = new schedule.RecurrenceRule();  
  var times1    = [1,6,11,16,21,26,31,36,41,46,51,56];  
  rule1.second  = times1; 
  job=schedule.scheduleJob(rule1, function(){
      waitForLogin();   
  }); 
}

//等待登录
function waitForLogin(){
  config.tips=1;
  config.data = { 
    tip : config.tips,
    uuid : config.uid
  };
  config.options.path=config.wxPath.waitForLogin + qs.stringify(config.data);
  requestHttps(callbackLogin);
}

//请求登录
function login(url){
  var host=url.match(/\/\/(\S*)\/cgi-bin/)[1];
  var p=url.match(/com(\S*)/)[1];
  config.options.hostname=host;
  config.options.path=p+'&fun=new&version=v2';
  requestHttps(callbackCookie);
}

//微信初始化
function wxInit(){
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
function wxStatusNotify(){
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
  requestHttps(callbackStatusNotify);
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
function sendTextMessage(content,from,to){
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
function getContact(){
  config.options.hostname=config.wxHost.main_host;
  config.options.path= config.wxPath.wxStatusNotify;
  config.options.method='POST';
  config.options.headers = {
    'Content-Type': 'application/json;charset=utf-8',
    'Content-Length':config.params.length,
    'Cookie': config.wxCookie
  };
  requestHttps(callbackContact);
}


exports.getUUID = function(){
  getUUId();
}



/*基本网络请求*/
function requestHttps(callback){
  var req = http.request(options, function (res) {   
    res.setEncoding('utf8');
    var headers=res.headers;
    var responseString = '';
    var cookie=headers['set-cookie'];
    res.on('data', function (chunk) { 
        
        responseString += chunk;
    });  
    res.on('end', function() {
      callback(responseString,cookie);
    });
  });  
  
  req.on('error', function (e) {  
      console.log('problem with request: ' + e.message);  
  });  
  
  req.write(config.params+"\n");

  req.end(); 
}

/*回调信息*/

//获取验证码回调
function callbackQrCode(data){
  var uuid=data.match(/\"(\S*)\"/)[1];
  if(uuid!=undefined){
    config.uuid=uuid;
    showQrCode(uuid);
  }
}

//登录二维码
function showQrCode(uuid){
  //下载验证码
  downloadPicture('https://login.weixin.qq.com/qrcode/'+uuid,'qrcode');
  if(config.isDebug){
    console.log("二维码下载完成..");
  }
}

//扫描登录回调
function callbackLogin(data){
  var code=data.match(/code=(\S*);/)[1];
  if(code!=undefined){
    //等待登录
    code=code.replace(/^\s+|\s+$/g, "").trim();
    if(code==200){
       //确认登录
        var base_uri=data.match(/\"(\S*)\"/)[1];
        login(base_uri);
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
  });  
}

//初始化回调
function callbackInit(data){
  var result=JSON.parse(data);
  if(result.BaseResponse.Ret==0){
    if(config.isDebug){
      console.log("初始化成功，昵称为："+result.User.NickName);
    }
    config.user=result.User;
    config.syncKey=result.SyncKey;
  }else{
    if(config.isDebug){
      console.log("初始化微信失败...");
    }
  }
}

//开启微信通知回调
function callbackStatusNotify(data){
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
  var result=JSON.parse(data);
  if(result.BaseResponse.Ret==0){
    if(config.isDebug){
      console.log("获取联系人列表成功...");
    }
  }else{
    if(config.isDebug){
      console.log("获取联系人列表失败...");
    }
  }
}

/*其它方法*/

//下载图片
function downloadPicture(url,filename){
  request(url).pipe(fs.createWriteStream(filename+'.png'));
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