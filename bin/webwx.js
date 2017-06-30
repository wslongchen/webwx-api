#!/usr/bin/env node  
var wxbot = require('../wxbot')  
var program = require('commander');  
  
program.version('v' + require('../package.json').version)  
       .description('easy to user wechat');

program.command('test')  
       .alias('example')  
       .description('启动一个案例')  
       .action(function () {  
        	wxbot.startBot();
       });
program.parse(process.argv)  
  
if (program.args.length === 0) {  
  program.help()  
}  