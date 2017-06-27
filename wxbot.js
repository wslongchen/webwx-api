#!/usr/bin/env node
// 导入基本模块
var wechatapi = require('./src/wechatapi');
var config = require('./libs/core/config');
var schedule = require('node-schedule');

//联系人列表
var MemberList =new Array();
var publicUsersList=new Array();
var specialUsersList = new Array();
var groupList =new Array();
var groupUsers={};
var time1;

exports.start=function(){
	wechatapi.getUUID();
	time1=setInterval(test,1000);
	 // var data =decodeHtmlEntity("@天天 你港的我完全听不懂啊老铁！[尴尬]");
	  //console.log(data);
}

function test(){
	if(config.retFlag){
			wechatapi.wxStatusNotify(function(data){
				var result=JSON.parse(data);
				if(result.BaseResponse.Ret==0){
				    if(config.isDebug){
				      console.log("开启微信状态通知成功...");
				    }
				    //getContact();
				    wechatapi.sendTextMessage("@天天 你港的我完全听不懂啊老铁！[尴尬]",config.user.UserName,'filehelper');
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

function getContact(){
	wechatapi.getContact(function(data){
		var result=JSON.parse(data);
	  	if(result.BaseResponse.Ret==0){
		    if(config.isDebug){
		      console.log("获取联系人列表成功...共"+result.MemberCount +'位联系人');
		    }
		    for(var i=0;i<result.MemberList.length;i++){
		    	var member=result.MemberList[i];
		    	if(member.VerifyFlag != 0){//公众号/服务号
		    		publicUsersList.push(member);
		    	}else if(wechatapi.SPECIALUSER.toString().indexOf(member.UserName) > -1){//特殊账号
		    		specialUsersList.push(member);

		    	}else if(member.UserName.substr(0,2)=='@@'){//群聊
		    		groupList.push(member);

		    	}else if(member.UserName==config.user.UserName){//自己

		    	}else{
		    		MemberList.push(member);
		    	}
		    }
		    if(groupList.length >0){
		    	//获取群成员
		    	var groupIds=new Array();
		    	for(var i=0;i<groupList.length;i++){
		    		groupIds.push(groupList[i].UserName);
		    	}
		    	if(groupIds.length>0){
		    		fetchGroupContacts(groupIds);
		    	}
		    }
		  }else{
		    if(config.isDebug){
		      console.log("获取联系人列表失败...");
		    }
		 }
		 listen();
	});
	
}

function listen(){
	syncCheck();
}

var count=1;


function syncCheck(){
	wechatapi.syncCheck(function(data){
			var check=data.match(/synccheck=(\S*)/)[1];
			var result=eval("("+check+")");
			var retCode =result.retcode;
			if(retCode==0){
				handle(result.selector);
			}else if(retCode =='1101'){
				if(config.isDebug){
			    	console.log("微信登出...");
			    }
			}else if(retCode =='1102'){
				if(config.isDebug){
			    	console.log("手机端微信登出...");
			    }
			}else{
				count++;
				if(config.isDebug){
			    	console.log("微信监听失败...切换线路"+count);
			    }
			    config.wxHost.check_host=config.wxHost['check_host'+count];
			    console.log(config.wxHost.check_host);
			    if(count==6){
			    	count =1;
			    }
			    listen();
			    
			}
		});
}

function handle(selector){
	if(selector==2){
		//新消息
		wechatapi.webwxsync(function(data){
			var result=JSON.parse(data);
			handle_msg(result);
			
		});
		
	}else if(selector==7){
		//进入/离开聊天界面
		wechatapi.webwxsync(function(data){
			setTimeout(listen,5000);
		});
	}else if(selector==0){
		//正常
		setTimeout(listen,5000);
	}else if(selector==4){
		// 保存群聊到通讯录
        // 修改群名称
        // 新增或删除联系人
        // 群聊成员数目变化
       wechatapi.webwxsync(function(data){
        	var result=JSON.parse(data);
        	setTimeout(listen,5000);
			//handle_msg(result);
		});
        
	}
	
}

function handle_msg(result){
	if(result.BaseResponse.Ret!=0){
		setTimeout(syncCheck,5000);
		return;
	}
	config.syncKey = result.SyncKey;
	var msgListCount = result.AddMsgList.length;
	if(msgListCount==0){
		setTimeout(syncCheck,5000);
		return;
	}

	var AddMsgList = result.AddMsgList;
	for(var m in AddMsgList){
		var msgType = AddMsgList[m].MsgType;
		var msgId = AddMsgList[m].MsgId;
		var content = AddMsgList[m].Content;
		if(content.length>1){
			content=content.replace('&lt','<').replace('&gt', '>');
		}
		/*if(content.trim().length==0){
			return;
		}*/
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
		}else{
			continue;
		}
		if(wechatapi.getAccountType(fromUserName) == '群聊'){
			var username =content.match(/(\S*):/)[1];
			var user = getUserInfoGroup(fromUserName,username);
			var group = getGroupInfo(fromUserName);
			if(group == undefined){
				group ={
					NickName : '陌生群'
				};
			}
			if(user == undefined){
				user ={
					NickName : '群中陌生人'
				};
			}
			if(msgType == 1){
				content=unescape(content.replace(/\u/g, "%u"));
				console.log(content);
				var msg=content.match(/<br\/>(\S*)/)[1];
				if(msg.substr(0,1).trim()=='@'){
					var infos=msg.split(' ');
					console.log(infos);
					if(infos.length>0){
						if(infos[0].replace("@","").trim() == +config.user.NickName.trim()){
							//@自己的消息
							msg=content.replace(username+":<br/>","").replace('@'+user.NickName,"").trim();
							if(msg.length>0 && config.isDebug){
								console.log("@自己的消息["+group.NickName+"("+user.NickName+")]:"+msg);
								wechatapi.sendTextMessage("@"+user.NickName+" 你港的我完全听不懂啊老铁！[尴尬]",config.user.UserName,fromUserName);
							}else{
								wechatapi.sendTextMessage("@"+user.NickName+" @我搞毛",config.user.UserName,fromUserName);
							}
							if(config.isDebug){
								console.log("@了自己["+group.NickName+"("+user.NickName+")]");
							}

						}else{
							if(config.isDebug){
								console.log('收到群消息['+user.NickName+']:'+msg);
							}
						}
					}
					
				}else{
					if(config.isDebug){
						console.log('收到群消息['+user.NickName+']:'+msg);
					}
				}
			}
		}else{
			var user =getUserInfo(fromUserName);
			var msg =content;
			if(user.UserName == config.user.UserName){
				var to = getUserInfo(toUserName);
				if(wechatapi.getAccountType(toUserName) == '群聊'){
					var group = getGroupInfo(toUserName);
					if(group == undefined){
						group ={
							NickName : '陌生群'
						};
					}
					if(config.isDebug){
						console.log('回复群消息['+group.NickName+']:'+msg);
					}
					continue;
				}
				if(to ==undefined){
					if(wechatapi.SPECIALUSER.toString().indexOf(member.UserName) > -1){
						//特殊账号
						to = {
							NickName : '特殊账号'
						};
					}
					to = {
						NickName : '陌生人'
					};
				}
				if(config.isDebug){
					console.log('回复个人消息['+to.NickName+']:'+msg);
				}
				continue;
			}
			if(config.isDebug){
				console.log('收到个人消息['+user.NickName+']:'+msg);
			}
		}
	}
	setTimeout(syncCheck,5000);
}

function handle_mod(result){

}

function fetchGroupContacts(groupIds){
	wechatapi.getGroupList(groupIds,function(data){
		var result=JSON.parse(data);
	  	if(result.BaseResponse.Ret==0){
	  		var contactList =result.ContactList;
	  		for(var i=0;i<contactList.length;i++){
	  			var member_list=contactList[i];
	  			groupUsers[member_list.UserName] = member_list;
	  		}

	  	}else{
	  		if(config.isDebug){
	  			console.log('获取群成员失败...');
	  		}
	  	}
	});
}

//获取用户信息
function getUserInfo(name){
	if(name == config.user.UserName){
		return config.user;
	}

	for(var i=0;i<MemberList.length;i++){
		var member = MemberList[i];
		if(member.UserName == name){
			return member;
		}
	}
}

function getUserInfoGroup(groupId,name){
	if(name == config.user.UserName){
		return config.user;
	}
	var user=groupUsers[groupId];
	if(user!=undefined){
		for(var i=0;i<user.MemberList.length;i++){
		var member = user.MemberList[i];
		if(member.UserName == name){
			return member;
		}
	}

	}
	
}

function getGroupInfo(groupId){
	var group=groupUsers[groupId];
	if(group!=undefined){
		return group;
	}
	
}