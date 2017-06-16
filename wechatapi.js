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
        callback(chunk);
        responseString += chunk;
    });  
    res.on('end', function() {
      console.log('-----resBody-----',responseString);
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
    var id="e"+ new Date().getTime();
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
  console.log("初始化："+data);
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
        console.log("base_uri"+base_uri);
        console.log("确认成功，进行登录");
        job.cancel();
      }else if(code == 201){
        //扫描成功
        tips=0;
        console.log("扫描成功,在微信客户端点击确认");
      }else if(code ==408){
        //登录超时
        console.log("登录超时，请重新扫描");
      }else{
        console.log("登陆中..."+data+",");
      }
  }
}

exports.getUUID = function(){
  //发起请求
  requestHttps(callbackQrCode);
}

function showQrCode(uuid){
  request('https://login.weixin.qq.com/qrcode/'+uuid).pipe(fs.createWriteStream('qrcode.png'));
  console.log("二维码下载完成");
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
  options.path=p;
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
  options.hostname= 'wx2.qq.com';
  options.path='/cgi-bin/mmwebwx-bin/webwxinit?r='+new Date().getTime()+'&pass_ticket='+wxConfig.pass_ticket+'&skey='+wxConfig.skey;
  options.method='POST';
  console.log("path:"+options.path);
  options.headers = {'Content-Type': 'application/json;charset=utf-8','Content-Length':params.length,
  'Cookie': wxConfig.cookie};
  console.log("params:"+params);
  console.log('cookie:'+wxConfig.cookie);
  console.log('method :'+options.method);
  requestHttps(callbackInit);
/*  options= {
    url : 'https://wx2.qq.com/cgi-bin/mmwebwx-bin/webwxinit?r='+new Date().getTime()+'&pass_ticket='+wxConfig.pass_ticket+'&skey='+wxConfig.skey,
    method :'POST',
    json : true,
    body : baseRequest,
    headers:{'Content-Type': 'application/json;charset=utf-8',
  'Cookie': wxConfig.cookie}
  }
  request(options, callback);*/
}

function callback(error, response, data) {
    if (!error && response.statusCode == 200) {
        console.log('----info------',data);
    }
}