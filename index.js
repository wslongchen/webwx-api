#!/usr/bin/env node
'use strict'
// 引入工具模块
var ProgressBar = require('./libs/core/progressbar');
 
// 初始化一个进度条长度为 50 的 ProgressBar 实例
var pb = new ProgressBar('下载进度', 50);
 
// 这里只是一个 pb 的使用示例，不包含任何功能
var num = 0, total = 10;
function downloading() {
 if (num <= total) {
  // 更新进度条
  pb.render({ completed: num, total: total });
 
  num++;
  setTimeout(function (){
   downloading();
  }, 500)
 }
}
downloading();