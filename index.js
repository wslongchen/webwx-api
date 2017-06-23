#!/usr/bin/env node
// 导入基本模块
var mailer = require("./libs/core/mail");
var wechatapi = require('./wechatapi');
var config = require('./libs/core/config');
var schedule = require('node-schedule');

//wechatapi.getUUID();
//test();

ss();
function ss(){
	tt(1);
}
function tt(id){
	if(id==1){

		uu(id);
	}
}

function uu(id){
	console.log(id);
	setTimeout(ss,3000);
}


var time1=setInterval(test,1000);
function test(){
	if(config.retFlag){
			wechatapi.wxStatusNotify(function(data){
				var result=JSON.parse(data);
				if(result.BaseResponse.Ret==0){
				    if(config.isDebug){
				      console.log("开启微信状态通知成功...");
				    }
				    listen();
				  }else{
				    if(config.isDebug){
				      console.log("开启微信状态通知失败...");
				    }
				}
			});
			clearTimeout(time1);
		}else{
		}
}

function listen(){
	wechatapi.syncCheck(function(data){
		var check=data.match(/synccheck=(\S*)/)[1];
		var result=eval("("+check+")");
		var retCode =result.retCode;
		if(retCode==0){
			handle(result.selector);
		}else if(retCode == 1100){
			if(config.isDebug){
		    	console.log("失败/登出微信...");
		    }
		}
		
	});
}
 

function handle(selector){
	console.log('新消息...');
	console.log('新消息...');
	console.log('新消息...');
	console.log('新消息...');
	if(selector==2){
		//新消息
		console.log('新消息...');
		wechatapi.webwxsync(function(data){
			console.log('监听：'+data);
			var result=JSON.parse(data);
			handle_msg(result);
		});
		
	}else if(selector==7){
		//进入/离开聊天界面
		wechatapi.webwxsync(function(data){
			
		});
	}else if(selector==0){
		//正常
	}else if(selector==4){
		// 保存群聊到通讯录
        // 修改群名称
        // 新增或删除联系人
        // 群聊成员数目变化
        wechatapi.webwxsync(function(data){
        	var result=JSON.parse(check);
			handle_msg(result);
		});
        
	}
	setTimeout(listen,3000);
}

function handle_msg(result){
	var msgListCount = result.AddMsgList.length;
	if(msgListCount==0){
		return;
	}

	var AddMsgList = result.AddMsgList;
	for(var m in AddMsgList){
		var msgType = AddMsgList[m].MsgType;
		var msgId = AddMsgList[m].MsgId;
		var content = AddMsgList[m].Content.replace('&lt','<').replace('&gt', '>');
		var fromUserName = AddMsgList[m].FromUserName;
		var toUserName = AddMsgList[m].ToUserName;

		if(msgType == 1){
			//文本消息
		}else if(msgType == 3){
			//图片消息
		}else if(msgType == 34){
			//语音消息
		}else if(msgType == 47){
			//动画表情
		}else if(msgType == 10000){
			//系统消息
		}else if(msgType == 10002){
			//撤回消息
		}
		console.log('收到消息：'+content);
		if(wechatapi.getAccountType(fromUserName) == '群聊'){
			if(msgType == 1){
				content = content .replace('<br/>','').trim();
				var msg=data.match(/code=(\S*);/)[1];
				
				if(msg.substr(0,1).trim()=='@'){

				}
			}
		}else{

		}
	}

}

function handle_mod(result){

}
