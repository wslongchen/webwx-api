// 导入基本模块
import path from 'path'
import _debug from 'debug'
import FormData from 'form-data'
import mime from 'mime'
import {
  getCONF,
  Request,
  isStandardBrowserEnv,
  assert,
  getClientMsgId,
  getDeviceID
} from './utils'

const debug = _debug('wxCore')

/*微信核心类*/
export default class wxCore {
  constructor(data){
    this.prop = {
      uuid : '',
      uin : '',
      sid : '',
      skey : '',
      pass_ticket : '',
      wxDataTicket : '',
      syncKeyStr : '',
      syncKey  : {
        List : []
      },
    }
    this.conf = getCONF()
    this.cookie = {}
    this.user = {}
    this.request = new Request({
      Cookie : this.cookie
    })

    if(data){
      this.wx =data
    }
  }

  get wxData(){
    return {
      prop : this.prop,
      conf : this.conf,
      cookie : this.cookie,
      user : this.user,
    }
  }

  set wxData(data){
    Object.keys(data).forEach(key =>{
      Object.assign(this[key],data[key])
    })
  }

  getUUID(){
    let options = {
      method : 'POST',
      url : this.conf.API_jsLogin,
    }
    return Promise.resolve().then(() => {
      return this.request(options).then(result => {
        let window = { QRLogin : {} }
        eval(result.data)
        assert.equal(window.QRLogin.code,200,result)
        this.prop.uuid = window.QRLogin.uuid
        return window.QRLogin.uuid
      })
    }).catch(err => {
      err.msg = 'UUID获取失败'
      throw err
    })
  }

  checkLogin(){
    let params = {
      'tip' : 0,
      'uuid' : this.prop.uuid,
      'loginicon' : true,
    }
    let options = {
      method : 'GET',
      url : this.conf.API_login,
      params : params,
    }
    return Promise.resolve().then(() => {
      return this.request(options).then(result => {
        let window = {}
        eval(result.data)
        assert.notEqual(window.code,400,result)
        if(window.code === 200){
          this.conf = getCONF(window.redirect_uri.match(/(?:\w+\.)+\w+/)[0])
          this.redirectUri = window.redirect_uri
        }else if(window.code === 201 && window.userAvatar){
          //头像
        }
        return window;
      })
    }).catch(err => {
      debug(err)
      err.msg = '获取确认信息失败'
      throw err
    })
  }

  init(){
    let params = {
      'pass_ticket' : this.prop.pass_ticket,
      'skey' : this.prop.skey,
      'r' : ~new Date(),
    }
    let data = {
      BaseRequest : this.getBaseRequest()
    }
    let options = {
      method : 'POST',
      url : this.conf.API_webwxinit,
      params : params,
      data : data,
    }
    return Promise.resolve().then(() => {
      return this.request(options).then(result => {
        let data =result.data
        assert.equal(data.BaseResponse.Ret,0,result)
        this.prop.skey = data.SKey || this.prop.skey
        this.updateSyncKey(data)
        Object.assign(this.user,data.User)
        return this.user
      })
    })
  }

  notifyStates(){
    let params = {
      pass_ticket : this.prop.pass_ticket,
      lang : 'zh_CN',
    }
    let data = {
      'BaseRequest' : this.getBaseRequest(),
      'Code' : to ? 1 : 3,
    }
    let options = {
      method : 'POST',
      url : this.conf.API_webwxstatusnotify,
      params : params,
      data : data,
    }
    return Promise.resolve().then(() => {
      return this.request(options).then(result => {
        let data = result.data
        assert.equal(data.BaseResponse.Ret,0,result)
      })
    }).catch(err => {
      debug(err)
      err.msg = '状态通知失败'
      throw err
    })
  }

  batchGetContact(contacts){
    let params = {
      'pass_ticket' : this.prop.pass_ticket,
      'type' : 'ex',
      'r' : +new Date(),
      'lang' : 'zh_CN',
    }
    let data = {
      'BaseRequest' : this.getBaseRequest(),
      'Count' : contacts,
      'List' : contacts
    }
    return Promise.resolve().then(() => {
      return this.request(options).then(result => {
        let data =result.data;
        assert.equal(data.BaseResponse.Ret,0,result)
        return data.ContactList
      })
    }).catch(err => {
      debug(err)
      err.msg = '批量获取联系人失败'
      throw err
    })
  }

  login(){
    let options = {
      method : 'GET',
      url : this.redirectUri,
      params : {
        fun : 'new'
      }
    }
    return Promise.resolve().then(() => {
      return this.request(options).then(result => {
        let pm =result.data.match(/<ret>(.*)<\/ret>/)
        if(pm && pm[1] === '0'){
          this.prop.skey = result.data.match(/<skey>(.*)<\/skey>/)[1]
          this.prop.sid = result.data.match(/<wxsid>(.*)<\/wxsid>/)[1]
          this.prop.uin = result.data.match(/<wxuin>(.*)<\/wxuin>/)[1]
          this.prop.pass_ticket = result.data.match(/<pass_ticket>(.*)<\/pass_ticket>/)[1]
        }
        if(result.headers['set-cookie']){
          result.headers['set-cookie'].forEach(item => {
            if(/webwx.*?data.*?ticket/i.test(item)){
              this.prop.wxDataTicket = item.match(/=(.*?);/)[1]
            }else if(/wxuin/i.test(item)){
              this.prop.sid = item.match(/=(.*?);/)[1]
            }
          })
        }
      })
    }).catch(err => {
      debug(err)
      err.msg = '登录失败'
      throw err
    })
  }

  syncCheck(){
    let params = {
      'r' : +new Date(),
      'sid' : this.prop.sid,
      'uin' : this.prop.uin,
      'skey' : this.prop.skey,
      'deviceid' : getDeviceID(),
      'synckey' : this.prop.syncKeyStr,
    }
    let options = {
      method : 'GET',
      url : this.conf.API_synccheck,
      params : params,
    }
    return Promise.resolve().then(() => {
      return this.request(options).then(result => {
        let window = {
          synccheck : {}
        }
        eval(result.data)
        assert.equal(window.synccheck.retcode,this.conf.SYNCCHECK_RET_SUCCESS,result)
        return window.synccheck.selector
      })
    }).catch(err => {
      debug(err)
      err.msg = '同步失败'
      throw err
    })
  }

  sync(){
    let params = {
      'sid' : this.prop.sid,
      'skey' : this.prop.skey,
      'pass_ticket' : this.prop.pass_ticket,
      'lang' : 'zh_CN',
    }
    let data = {
      'BaseRequest' : this.getBaseRequest(),
      'SyncKey' : this.prop.syncKey,
      'rr' : ~new Date()
    }
    return Promise.resolve().then(() => {
      return this.request(options).then(result => {
        let data =result.data
        assert.equal(data.BaseResponse.Ret,0,result)
        this.updateSyncKey(data)
        THIS.prop.skey = data.SKey || this.prop.skey
        return data
      })
    }).catch(err => {
      debug(err)
      err.msg = '获取新信息失败'
      throw err
    })
  }

  logout(){
    let params = {
      redirect : 1,
      type : 0,
      skey : this.prop.skey,
      lang : 'zh_CN'
    }
    let options = {
      method : 'POST',
      url : this.conf.API_webwxlogout
    }
    return Promise.resolve().then(() => {
      return this.request(options).then(result => {
        return '登出成功'
      }).catch(err => {
        debug(err)
        return '可能成功'
      })
    })
  }

  sendText(msg ,to){
    let params = {
      'pass_ticket': this.prop.pass_ticket,
      'lang': 'zh_CN',
    }
    let clientMsgId = getClientMsgId()
    let data = {
      'BaseRequest': this.getBaseRequest(),
        'Scene': 0,
        'Msg': {
          'Type': this.conf.MSGTYPE_TEXT,
          'Content': msg,
          'FromUserName': this.user['UserName'],
          'ToUserName': to,
          'LocalID': clientMsgId,
          'ClientMsgId': clientMsgId,
        }
    }
    let options = {
      method : 'POST',
      url : this.conf.API_webwxsendmsg,
      params : params,
      data : data
    }
    return Promise.resolve().then(() => {
      return this.request(options).then(result => {
        let data = result.data
        assert.equal(data.BaseResponse.Ret,0,result)
        return data
      })
    }).catch(err => {
      debug(err)
      err.msg = '发送文本信息失败'
      throw err
    })
  }

  sendEmoticon(id,to){
    let params = {
      'fun' : 'sys',
      'pass_ticket' : this.prop.pass_ticket,
      'lang' : 'zh_CN',
    }
    let clientMsgId = getClientMsgId()
    let data = {
      'BaseRequest' : this.getBaseRequest(),
      'Scene' : 0,
      'Msg' : {
        'Type' : this.conf.MSGTYPE_EMOTICON,
        'EmojiFlag' : 2,
        'FromUserName' : this.user['UserName'],
        'ToUserName' : to,
        'LocalID' : clientMsgId,
        'ClientMsgId' : clientMsgId,
      }
    }
    if (id.indexOf('@') === 0) {
      data.Msg.MediaId = id
    } else {
      data.Msg.EMoticonMd5 = id
    }
    let options = {
      method : 'POST',
      url : this.conf.API_webwxsendemoticon,
      params : params,
      data : data,
    }
    return Promise.resolve().then(() => {
      return this.request(options).then(result => {
        let data = result.data;
        assert.equal(data.BaseResponse.Ret,0,result)
        return data
      })
    }).catch(err => {
      debug(err)
      err.msg ='发送表情信息失败'
      throw err
    })
  }

  uploadMedia(file,filename,toUserName){
    return Promise.resolve().then(() => {
      let name ,type,size,ext,mediatype,data
      return new Promise((resolve,reject)=>{
        if((typeof (File) !== 'undefined' && file.constructor == File) || (typeof (Blob) !== 'undefined' && file.constructor ==Blob)){
          name = file.name || 'file'
          type = file.type
          size = file.size
          data = file
          return resolve()
        }else if(Buffer.isBuffer(file)){
          if(!filename){
            return reject(new Error('文件名未知'))
          }
          name = filename
          type = mime.lookup(name)
          size = file.length
          data = filename
          return resolve()
        }else if(file.readable){
          if(!file.path && !filename){
            return reject(new Error('文件名未知'))
          }
          name = path.basename(file.path || filename)
          type = mime.lookup(name)
          file.pipe(bl((err,buffer) => {
            if(err){
              return reject(err)
            }
            size = buffer.length
            data = buffer
            return resolve()
          }))
        }
      }).then(() => {
        ext = name.match(/.*\.(.*)/)
        if(ext){
          ext = ext[1].toLowerCase()
        }else{
          ext = ''
        }
        switch(ext){
          case 'bmp' :
          case 'jpeg' :
          case 'jpg' :
          case 'png' :
            mediatype = 'pic'
            break
          case 'mp4':
            mediatype = 'video'
            break
          default:
            mediatype = 'doc'
        }
        let clientMsgId = getClientMsgId()
        let uploadMediaRequest = JSON.stringify({
          BaseRequest: this.getBaseRequest(),
          ClientMediaId: clientMsgId,
          TotalLen: size,
          StartPos: 0,
          DataLen: size,
          MediaType: 4,
          UploadType: 2,
          FromUserName: this.user.UserName,
          ToUserName: toUserName || this.user.UserName
        })
        let form = new FormData()
        form.append('name', name)
        form.append('type', type)
        form.append('lastModifiedDate', new Date().toGMTString())
        form.append('size', size)
        form.append('mediatype', mediatype)
        form.append('uploadmediarequest', uploadMediaRequest)
        form.append('webwx_data_ticket', this.prop.wxDataTicket)
        form.append('pass_ticket', encodeURI(this.prop.pass_ticket))
        form.append('filename', data, {
          filename: name,
          contentType: type,
          knownLength: size
        })
        return new Promise((resolve,reject) => {
          if(isStandardBrowserEnv){
            return resolve({
              data : form,
              headers : {}
            })
          }else {
            form.pipe(bl((err,buffer) => {
              if(err){
                return reject(err)
              }
              return resolve({
                data : buffer,
                headers : from.getHeaders()
              })
            }))
          }
        })
      }).then(data => {
        let params = {f: 'json'}
        let options = {
          method : 'POST',
          url : this.conf.API_webwxuploadmedia,
          headers : data.headers,
          params : params,
          data : data.data
        }
        return this.request(options).then(result => {
          let data = result.data
          let mediaId = data.MediaId
          assert.ok(mediaId,result)
          return {
            name : name,
            size : size,
            ext : ext,
            mediatype : mediatype,
            mediaId : mediaId
          }
        })
      }).catch(err => {
        debug(err)
        err.msg ='上传媒体文件失败'
        throw err
      })
    })
  }

  updateSyncKey(data){
    if(data.SyncKey){
      this.prop.syncKey =data.SyncKey
    }
    if(data.SyncCheckKey){
      let synckeylist =[]
      for(let e = data.SyncCheckKey.List, o = 0,n = e.length;n > o; o++){
        synckeylist.push(e[o]['Key'] + '_' + e[o]['Val'])
      }
      this.prop.syncKeyStr = synckeylist.join('|')
    }else if(!this.prop.syncKeyStr && data.SyncKey){
      let synckeylist = []
      for(let e = data.SyncCheckKey.List, o = 0,n = e.length;n > o; o++){
        synckeylist.push(e[o]['Key'] + '_' + e[o]['Val'])
      }
      this.prop.syncKeyStr = synckeylist.join('|')
    }
  }

  getBaseRequest () {
    return {
      Uin: parseInt(this.prop.uin),
      Sid: this.prop.sid,
      Skey: this.prop.skey,
      DeviceID: getDeviceID()
    }
  }
  
}

