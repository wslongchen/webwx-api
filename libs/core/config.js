exports.wxConfig = {
	skey : '',
  	wxsid : '',
  	wxuin : '',
  	pass_ticket : ''
  };
exports.wxHost = {
	login_host : 'login.weixin.qq.com',
	main_host : 'wx.qq.com',
	check_host : 'webpush.weixin.qq.com'
};
exports.wxPath = {
	wxInit : '/cgi-bin/mmwebwx-bin/webwxinit',
	wxQrCode : 'https://login.weixin.qq.com/qrcode/',
	waitForLogin : '/cgi-bin/mmwebwx-bin/login',
	wxStatusNotify : '/cgi-bin/mmwebwx-bin/webwxstatusnotify',
	getContact : '/cgi-bin/mmwebwx-bin/webwxstatusnotify',
	getGroupContact : '/cgi-bin/mmwebwx-bin/webwxbatchgetcontact',
	syncCheck : '/cgi-bin/mmwebwx-bin/synccheck',
	webWxSync : '/cgi-bin/mmwebwx-bin/webwxinit',
	webWxSendMsg : '/cgi-bin/mmwebwx-bin/webwxsendmsg'
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