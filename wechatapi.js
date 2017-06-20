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

var data = {  
    appid : 'wx782c26e4c19acffb',  
    fun : 'new',
    lang : 'zh_CN'};//这是需要提交的数据  
  
var options = {  
    hostname: 'login.weixin.qq.com',  
    port: 443,  
    path: '/jslogin?' + qs.stringify(data),  
    method: 'GET',
    rejectUnauthorized: false,
    requestCert: true,
    headers : {
    }  
};
var uid="";
var tips=0;

function requestHttps(callback){
  var req = http.request(options, function (res) {   
    res.setEncoding('utf8');
    var headers=res.headers;
    var responseString = '';
    wxConfig.cookie=headers['set-cookie'];
    res.on('data', function (chunk) { 
        
        responseString += chunk;
    });  
    res.on('end', function() {
      callback(responseString);
    });
  });  
  
  req.on('error', function (e) {  
      console.log('problem with request: ' + e.message);  
  });  
  
  req.write(params+"\n");

  req.end(); 
}

function callbackQrCode(data){
  var uuid=data.match(/\"(\S*)\"/)[1];
  if(uuid!=undefined){
    //下载验证码
    showQrCode(uuid);
    uid=uuid;
  }
}

function callbackCookie(data){
  xmlreader.read(data, function(errors, response){  
    if(null !== errors ){  
        console.log(errors)  
        return;  
    }
    wxConfig.skey=response.error.skey.text();
    wxConfig.wxsid=response.error.wxsid.text();
    wxConfig.wxuin=response.error.wxuin.text();
    wxConfig.pass_ticket= response.error.pass_ticket.text();
    var id="e"+ (''+Math.random().toFixed(15)).substring(2, 17);
    var requestData={
      Uin:wxConfig.wxuin,
      Sid:wxConfig.wxsid,
      Skey:wxConfig.skey,
      DeviceID:id
    };
    baseRequest= {BaseRequest:requestData};
    params=JSON.stringify(baseRequest);
    wxInit();
  });  
}
var baseRequest;
function callbackInit(data){
  var result=JSON.parse(data);
  if(result.BaseResponse.Ret==0){
    console.log("初始化成功，昵称为："+result.User.NickName);
    user=result.User;
    syncKey=result.SyncKey;
    //开启状态通知
    wxStatusNotify();
  }else{
    console.log("初始化微信失败~~~");
  }
}

function callbackLogin(data){
  var code=data.match(/code=(\S*);/)[1];
  if(code!=undefined){
    //等待登录
    code=code.replace(/^\s+|\s+$/g, "").trim();
    if(code==200){
       //确认登录
        var base_uri=data.match(/\"(\S*)\"/)[1];
        login(base_uri);
        console.log("确认成功，进行登录");
        job.cancel();
      }else if(code == 201){
        //扫描成功
        tips=0;
        console.log("扫描成功,在微信客户端点击确认");
      }else if(code ==408){
        //超时
      }else{
        console.log("登陆中..."+data+",");
      }
  }
}

function showQrCode(uuid){
  request('https://login.weixin.qq.com/qrcode/'+uuid).pipe(fs.createWriteStream('qrcode.png'));
  console.log("二维码下载完成..");
  scheduleCronstyle();
}

//等待登录
function waitForLogin(){
  tips=1;
  data = { tip:tips,uuid: uid};
  options.path="/cgi-bin/mmwebwx-bin/login?" + qs.stringify(data);
  requestHttps(callbackLogin);
}
//请求登录
function login(url){
  var host=url.match(/\/\/(\S*)\/cgi-bin/)[1];
  var p=url.match(/com(\S*)/)[1];
  options.hostname=host;
  options.path=p+'&fun=new&version=v2';
  requestHttps(callbackCookie);
}

function getUrlParam(url,name){
  var reg = new RegExp("(^|&)"+name+"=([^&]*)(&|$)"); 
  var r =  url.search.substr(1).match(reg);
  var strValue = "";
  if (r!=null){
   strValue= unescape(r[2]);
  }
  return strValue;
}
//实时监听登录情况
function scheduleCronstyle(){
  var rule1     = new schedule.RecurrenceRule();  
  var times1    = [1,6,11,16,21,26,31,36,41,46,51,56];  
  rule1.second  = times1; 
  job=schedule.scheduleJob(rule1, function(){
      waitForLogin();   
  }); 
}

//微信初始化
function wxInit(){
  console.log("微信初始化...");
  options.hostname= 'wx.qq.com';
  options.path='/cgi-bin/mmwebwx-bin/webwxinit?r='+new Date().getTime()+'&pass_ticket='+wxConfig.pass_ticket+'&skey='+wxConfig.skey;
  options.method='POST';
  options.headers = {'Content-Type': 'application/json;charset=utf-8','Content-Length':params.length,
  'Cookie': wxConfig.cookie};
  requestHttps(callbackInit);
}

//开启微信状态通知
function wxStatusNotify(){
  options.hostname="wx.qq.com";
  options.path='/cgi-bin/mmwebwx-bin/webwxstatusnotify?lang=zh_CN&pass_ticket='+wxConfig.pass_ticket;
  options.method='POST';
  var id="e"+ (''+Math.random().toFixed(15)).substring(2, 17);
  var requestData={
    Uin:wxConfig.wxuin,
    Sid:wxConfig.wxsid,
    Skey:wxConfig.skey,
    DeviceID:id
  };
  var clientMsgId=(new Date().getTime()+'').substring(0,4)+(Math.random().toFixed(4)+'').substring(2,6);
  var data={BaseRequest : requestData,Code:3,FromUserName:user.UserName,ToUserName:user.UserName,ClientMsgId:clientMsgId};
  params=JSON.stringify(data);
  options.headers = {'Content-Type': 'application/json;charset=utf-8','Content-Length':params.length};
  requestHttps(callbackStatusNotify);
}

function callbackStatusNotify(data){
  var result=JSON.parse(data);
  if(result.BaseResponse.Ret==0){
    console.log("开启微信状态通知成功...");
    sendTextMessage('1',user.UserName,'filehelper');
  }else{
    console.log("开启微信状态通知失败...");
  }
}
function callbackContact(data){
  var result=JSON.parse(data);
  if(result.BaseResponse.Ret==0){
    console.log("获取联系人列表成功...");
    return data;
  }else{
    console.log("获取联系人列表失败...");
  }
}
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

function callbackWebwxsendmsg(data){
  var result=JSON.parse(data);
  console.log("消息发送:"+data);
  if(result.BaseResponse.Ret==0){
    console.log("消息发送成功...");
  }else{
    console.log("消息发送失败...");
  }
}
//获取联系人
function getContact(){
  options.hostname="wx.qq.com";
  options.path='/cgi-bin/mmwebwx-bin/webwxstatusnotify';
  options.method='POST';
  options.headers = {'Content-Type': 'application/json;charset=utf-8','Content-Length':params.length,
  'Cookie': wxConfig.cookie};
  requestHttps(callbackContact);
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
//发送消息
function webwxsendmsg(msg){
  options.hostname="wx.qq.com";
  options.path='/cgi-bin/mmwebwx-bin/webwxsendmsg?lang=zh_CN&sid='+wxConfig.wxsid+'&pass_ticket='+wxConfig.pass_ticket+'&skey='+wxConfig.skey;
  options.method='POST';
  var id="e"+ (''+Math.random().toFixed(15)).substring(2, 17);
  var requestData={
    Uin:wxConfig.wxuin,
    Sid:wxConfig.wxsid,
    Skey:wxConfig.skey,
    DeviceID:id
  };
  var data={BaseRequest : requestData,
    Msg:msg};
  params=JSON.stringify(data);
  console.log("发送数据"+params);
  options.headers = {'Content-Type': 'application/json;charset=utf-8','Content-Length':params.length};
  requestHttps(callbackWebwxsendmsg);
}

function sendTextMessage(content,from,to){
  var id=(new Date().getTime()+'').substring(0,4)+(Math.random().toFixed(4)+'').substring(2,6);
  var msg={Type:1,
      Content:content,
      FromUserName: from,
      ToUserName : to,
      LocalID: id,
      ClientMsgId:id
    };
    console.log('发送文字消息：'+content);
    webwxsendmsg(msg);
}

//登陆以及微信初始化
exports.getUUID = function(){
  //发起请求
  requestHttps(callbackQrCode);
}