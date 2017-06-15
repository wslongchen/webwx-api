var nodemailer = require('nodemailer');
var maile = {};

maile.send = function (from,title,content,callback){
var transporter = nodemailer.createTransport({
  service: 'qq',
  auth: {
    user: '1007310431@qq.com',
    pass: 'kpflegjyoidmbbeh'
  }
  });
  var mailOptions = {
    from: '小安安<1007310431@qq.com>', // 发送者
    to: '1049058427@qq.com', // 接受者,可以同时发送多个,以逗号隔开
    subject: title, // 标题
    //text: 'Hello world', // 文本
    html:  content// html代码
  };
  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      callback(err,null)
      return;
    }
    callback(null,info);
  });
}
module.exports = maile;