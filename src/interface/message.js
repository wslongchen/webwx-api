import {convertEmoji, formatNum} from '../utils'

const messageProto = {
  init: function (instance) {
    this.MsgType = +this.MsgType
    this.isSendBySelf = this.FromUserName === instance.user.UserName || this.FromUserName === ''

    this.OriginalContent = this.Content
    if (this.FromUserName.indexOf('@@') === 0) {
      this.Content = this.Content.replace(/^@.*?(?=:)/, match => {
        let user = instance.contacts[this.FromUserName].MemberList.find(member => {
          return member.UserName === match
        })
        return user ? instance.Contact.getDisplayName(user) : match
      })
    }

    this.Content = this.Content.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<br\/>/g, '\n')
    this.Content = convertEmoji(this.Content)

    return this
  },
  isSendBy: function (contact) {
    return this.FromUserName === contact.UserName
  },
  getPeerUserName: function () {
    return this.isSendBySelf ? this.ToUserName : this.FromUserName
  },
  getDisplayTime: function () {
    var time = new Date(1e3 * this.CreateTime)
    return time.getHours() + ':' + formatNum(time.getMinutes(), 2)
  }
}

export default function MessageFactory (instance) {
  return {
    extend: function (messageObj) {
      messageObj = Object.setPrototypeOf(messageObj, messageProto)
      return messageObj.init(instance)
    }
  }
}
