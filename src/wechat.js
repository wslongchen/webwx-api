// 导入基本模块
import wxCore from './wxcore'
import EventEmitter from 'events'
import _ from 'lodash'

import {
  getCONF,
  isStandardBrowserEnv,
} from './utils'

import ContactFactory from './interface/contact'
import MessageFactory from './interface/message'

import _debug from 'debug'
const debug = _debug('wechat')

/*微信实现类*/
class Wechat extends wxCore {
  constructor(data){
    super(data)
    _.extend(this,new EventEmitter())
    this.state = this.conf.STATE.init
    this.contacts = {}
    this.Contact = ContactFactory(this)
    this.Message = MessageFactory(this)
    this.lastSyncTime = 0
    this.syncThreadingId = 0
    this.syncErrorCount = 0
    this.checkPollingId = 0
    this.retryPollingId = 0
  }

  start(){
    debug('微信启动...')
    return this._login().then(() => this._init())
  }

  restart(){
    debug('微信重启...')
    return this._init().catch(err => {
      if(err.response){
        throw err
      }else{
        let err =new Error('重启出错,一分钟后重启')
        debug(err)
        this.emit('error',err)
        return new Promise(resolve => {
          setTimeout(resolve,60*1000)
        }).then(() => this.init())
      }
    }).catch(err => {
      debug(err)
      this.emit('error',err)
      this.stop()
    })
  }

  stop () {
    debug('微信登出...')
    clearTimeout(this.retryPollingId)
    clearTimeout(this.checkPollingId)
    this.logout()
    this.state = this.conf.STATE.logout
    this.emit('logout')
  }

  //登录方法
  _login () {
    const checkLogin = () => {
      return this.checkLogin().then(result => {
        if(result.code === 201 && result.userAvatar){
          this.emit('user-avatar',result.userAvatar)
        }
        if(result.code !== 200){
          debug('登录方法(checkLogin):',result.code)
          return checkLogin()
        }else{
          return result
        }
      })
    }
    return this.getUUID().then(uuid => {
      debug('getUUID: ',uuid)
      this.emit('uuid',uuid)
      this.state =this.conf.STATE.uuid
      return checkLogin()
    }).then(result => {
      debug('checkLogin:',res.redirect_uri)
      return this.login()
    })
  }

  //初始化方法
  _init(){
    return this.init().then(() => {
      this.notifyStates()
      .catch(err => this.emit('error',err))
      this._getContact().then(contact => {
        debug('获取联系人数量共：',contacts.length)
        this.updateContacts(contacts);
      })
      this.state = this.conf.STATE.login
      this.lastSyncTime = Date.now()
      this.syncPolling()
      this.checkPolling()
      this.emit('login')
    })
  }

  //获取联系人
  _getContact(Seq = 0){
    let contacts = [] 
    return this.getContact(Seq).then(result => {
      contacts = result.MemberList || []
      if(result.Seq){
        return this._getContact(res.Seq).then(_contacts => contacts = contacts.concat(_contacts || []))
      }
    }).then(() => {
      if(Seq == 0){
        let emptyGroup = contacts.filter(contact => contact.UserName.startsWith('@@') && contact.MemberCount == 0)
        if(emptyGroup.length !=0){
          return this.batchGetContact(emptyGroup).then(_contacts => contacts = contacts.concat(_contacts || []))
        }
      }else{
        return contacts;
      }
    }).catch(err => {
      this.emit('error',err)
      return contacts
    })
  }

  //同步
  syncThreading(id = ++this.syncThreadingId){
    if(this.state !== this.conf.STATE.login || this.syncThreadingId !== id){
      return
    }
    this.syncCheck().then(selector => {
      debug('获取消息状态：',selector)
      if(+selector !== this.conf.SYNCCHECK_SELECTOR_NORMAL){
        return this.sync().then(data => {
          this.syncErrorCount = 0;
          this.handleSync(data)
        })
      }
    })
  }

  updateContacts(contacts){
    if(!contacts || contacts.length == 0){
      return
    }
    contacts.forEach(contact => {
      if(this.contacts[contact.UserName]){
        let oldContact =this.contacts[contact.UserName]
        for(let i in contact){
          contact[i] || delete contact[i]
        }
        Object.assign(oldContact,contact)
        this.Contact.extend(oldContact)
      }else{
        this.contacts[contact.UserName] = this.Contact.extend(contact)
      }
    })
    this.emit('contacts-updated',contacts)
  }




}

Wechat.STATE = getCONF().STATE

exports = module.exports = Wechat