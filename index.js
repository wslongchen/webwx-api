#!/usr/bin/env node
module.exports = require('./src/wechatapi');
module.exports = require('./libs/core/config');
module.exports = require('./wxbot');

var api = require('./src/wxapi');

api.getUUID().then((data) => {
	console.log(data);
});