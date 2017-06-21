exports.wxConfig = {
	skey : '',
  	wxsid : '',
  	wxuin : '',
  	pass_ticket : ''
  };
exports.wxHost = {
	login_host : 'login.weixin.qq.com',
	main_host : 'wx.qq.com',
	check_host : 'webpush2.weixin.qq.com'
};
exports.wxPath = {
	wxInit : '/cgi-bin/mmwebwx-bin/webwxinit',
	wxQrCode : 'https://login.weixin.qq.com/qrcode/',
	waitForLogin : '/cgi-bin/mmwebwx-bin/login',
	wxStatusNotify : '/cgi-bin/mmwebwx-bin/webwxstatusnotify',
	getContact : '/cgi-bin/mmwebwx-bin/webwxstatusnotify',
	syncCheck : '/cgi-bin/mmwebwx-bin/synccheck',
	webWxSync : '/cgi-bin/mmwebwx-bin/webwxinit',
	webWxSendMsg : '/cgi-bin/mmwebwx-bin/webwxsendmsg'
};
exports.wxCookie={};
exports.options={};
exports.data={};
exports.user={};
exports.syncKey={};