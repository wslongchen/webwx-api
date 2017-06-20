#!/usr/bin/env node
// 导入基本模块
var mailer = require("./libs/core/mail");
var wechatapi = require('./wechatapi');

wechatapi.getUUID();