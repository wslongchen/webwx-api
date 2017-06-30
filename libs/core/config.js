exports.wxConfig = {
	skey : '',
  	wxsid : '',
  	wxuin : '',
  	pass_ticket : ''
  };
exports.wxHost = {
	login_host : 'login.weixin.qq.com',
	main_host : 'wx.qq.com',
	main_host2 : 'wx2.qq.com',
	check_host : 'webpush.weixin.qq.com',
	check_host2 : 'webpush.wx2.qq.com',
	check_host3 : 'webpush.wx8.qq.com',
	check_host4 : 'webpush.wx.qq.com',
	check_host5 : 'webpush.web2.wechat.com',
	check_host6 : 'webpush.web.wechat.com',
};
exports.wxPath = {
	wxInit : '/cgi-bin/mmwebwx-bin/webwxinit',
	wxQrCode : 'https://login.weixin.qq.com/qrcode/',
	waitForLogin : '/cgi-bin/mmwebwx-bin/login',
	wxStatusNotify : '/cgi-bin/mmwebwx-bin/webwxstatusnotify',
	getContact : '/cgi-bin/mmwebwx-bin/webwxgetcontact',
	getGroupContact : '/cgi-bin/mmwebwx-bin/webwxbatchgetcontact',
	syncCheck : '/cgi-bin/mmwebwx-bin/synccheck',
	webWxSync : '/cgi-bin/mmwebwx-bin/webwxsync',
	webWxSendMsg : '/cgi-bin/mmwebwx-bin/webwxsendmsg',
	createChatRoom : '/cgi-bin/mmwebwx-bin/webwxcreatechatroom',
	updateChatRoom : '/cgi-bin/mmwebwx-bin/webwxupdatechatroom',
	wxCheckUrl : '/cgi-bin/mmwebwx-bin/webwxcheckurl',
	wxVerifyUser : '/cgi-bin/mmwebwx-bin/webwxverifyuser',
	wxFeedback : '/cgi-bin/mmwebwx-bin/webwxsendfeedback',
	wxReport : '/cgi-bin/mmwebwx-bin/webwxstatreport',
	wxSearch : '/cgi-bin/mmwebwx-bin/webwxsearchcontact',
	wxoplog : '/cgi-bin/mmwebwx-bin/webwxoplog',
	checkUpload : '/cgi-bin/mmwebwx-bin/webwxcheckupload',
	wxRevokeMsg : '/cgi-bin/mmwebwx-bin/webwxrevokemsg',
	wxPushLoginUrl : '/cgi-bin/mmwebwx-bin/webwxpushloginurl',
	wxGetIcon : '/cgi-bin/mmwebwx-bin/webwxgeticon',
	wxSendMsgImg : '/cgi-bin/mmwebwx-bin/webwxsendmsgimg',
	wxSendMsgVedio : '/cgi-bin/mmwebwx-bin/webwxsendvideomsg',
	wxSendMsgEmoticon : '/cgi-bin/mmwebwx-bin/webwxsendemoticon',
	wxSendAppMsg : '/cgi-bin/mmwebwx-bin/webwxsendappmsg',
	wxGetHeadImg : '/cgi-bin/mmwebwx-bin/webwxgetheadimg',
	wxGetMsgImg : '/cgi-bin/mmwebwx-bin/webwxgetmsgimg',
	wxGetMedia : '/cgi-bin/mmwebwx-bin/webwxgetmedia',
	wxGetVideo : '/cgi-bin/mmwebwx-bin/webwxgetvideo',
	wxLogout : '/cgi-bin/mmwebwx-bin/webwxlogout',
	wxGetVoice : '/cgi-bin/mmwebwx-bin/webwxgetvoice'


};
exports.wxCookie;
exports.options={
	hostname : '',
	port : '443',
	path : '',
	method : 'GET',
	rejectUnauthorized: false,
    requestCert: true,
    headers : {
    }

};
exports.data={};
exports.uuid;
exports.tips=1;
exports.params="";
exports.resbonseData="";
exports.user={};
exports.contact={};
exports.syncKey={};
exports.isDebug =true;
exports.retFlag=false;