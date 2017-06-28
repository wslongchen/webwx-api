#!/usr/bin/env node
// 导入基本模块
var http = require('https');  
var fs = require('fs');
var request = require('request');
var qs = require('querystring');
var config = require('../libs/core/config');
var schedule = require('node-schedule');
var xmlreader = require("xmlreader"); 
var qrcode = require('qrcode-terminal');
var Q = require('q');

/*微信封装方法*/

const deviceID="e"+ (''+Math.random().toFixed(15)).substring(2, 17);



//console.log("getUUID:"+str);



var Me = function(){
    config.data = {  
            appid : 'wx782c26e4c19acffb',  
            fun : 'new',
            lang : 'zh_CN'
          };
          config.options.hostname = config.wxHost.login_host;
          config.options.path = '/jslogin?' + qs.stringify(config.data);
    var deferred = Q.defer();
    requestHttpsDefer(deferred);
    return deferred.promise;
};


var Me2 = function(uuid){
    var deferred=Q.defer();
    showCommandLineQRCode('https://login.weixin.qq.com/l/'+uuid);
    if(config.isDebug){
      console.log("二维码显示成功，请扫描...");
    }
    return deferred.promise;
};


Me().then((result) =>{
            var result =result.toString();
            console.log('str:'+result);
            var uuid=result.match(/\"(\S*)\"/)[1];
            if(uuid!=undefined){
              config.uuid=uuid;
              return Me2(uuid);             
            }
          }).then(function(uid){
              console.log(uid);
          }).catch(function (err) {
    console.error(err);
});



var File_deferd = function(filename,encoding){
    var deferred = Q.defer();
    fs.readFile(filename,encoding,function(err,result){
        if(err){
            deferred.reject(err.toString().red);
        }
        deferred.resolve(result);
    });
    return deferred.promise;
};

//标准的then(onFulfilled,onRejected);
//File_deferd(filename).then(function(result){

//        console.log(result.toString().blue);
//    },function(err){
//        console.log(err.toString().red);
//    }
//);

//用catch()捕获错误
/*File_deferd('filename').then(function(result){

        console.log(result.toString().blue);
    }).catch(function (err) {
    console.error(err);
});*/


//显示命令行二维码
function showCommandLineQRCode(str){
  qrcode.generate(str, function (qrcode) {
    console.log(qrcode);
  });
}










/*基本网络请求*/
function requestHttpsDefer(deferred){
  var req = http.request(config.options, function (res) { 
    res.setEncoding('utf-8');
    var headers=res.headers;
    var responseString = '';
    var cookie=headers['set-cookie'];
    res.on('data', function (chunk) { 
        responseString += chunk;
    });  
    res.on('end', function() {
      deferred.resolve(responseString);
    });
  });  
  req.on('error', function (e) {  
      deferred.reject(e);
  });  
  
  req.write(config.params+"\n");
  req.end(); 
}
