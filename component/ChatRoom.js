import { httpRequest, httpRequestPromise, eventLogin, getErrorMessage } from '../utils/utils'
import { HubConnectionBuilder, HttpTransportType } from '../../@microsoft/signalr'

export default class ChatRoom {
    constructor(eventID, idToken, displaySysMsg = true, callback_receiveMsg = undefined, callback_receiveTopMsg = undefined, DomainType = 3) {
        this.eventID = eventID
        this.idToken = idToken
        this.chatRoomID = ""
        this.userID = ""
        this.isCustomer = false
        this.DomainType = DomainType
        this.displaySysMsg = displaySysMsg // 是否顯示系統訊息
        this.callback_ReceiveMessage = callback_receiveMsg // 接收訊息CallBack function(response,logs) 若有logs 回傳完整log
        this.callback_ReceiveTopMessage = callback_receiveTopMsg // 接收置頂訊息CallBack
        this.callback_userCount = undefined
        this.callback_popup = undefined
        this.callback_popupLiveQuest = undefined
        this.apiDomain = "https://websocket.meetstat.co"
        this.apiVersion = undefined
    }
    init() {
        return new Promise((resolve, reject) => {
            const chatRoom = this
            chatRoom.getChatRoom().then(function (response) {
                chatRoom.chatRoomID = response.ChatRoomID
                chatRoom.checkChatRoomExpelled().then(function () {
                    const options = {
                        skipNegotiation: true,
                        transport: HttpTransportType.WebSockets,
                        accessTokenFactory: () => chatRoom.idToken
                    }
                    chatRoom.connection = new HubConnectionBuilder().withAutomaticReconnect().withUrl(chatRoom.apiDomain + "/Hub_ChatHub?ChatRoomID=" + chatRoom.chatRoomID, options).build()
                    chatRoom.connection.start().then(function () {
                        if (chatRoom.callback_ReceiveTopMessage && response.TopMessage) { //初始化置頂貼文
                            chatRoom.callback_ReceiveTopMessage(setUrlToDOM(response.TopMessage))
                        } else if (!chatRoom.callback_ReceiveTopMessage) {
                            console.warn("【注意】聊天室未定義『接收置頂訊息』之函式")
                        }
                        if (chatRoom.callback_popup && response.PopupAgenda) {
                            chatRoom.callback_popup(response.PopupAgenda)
                        } else if (!chatRoom.callback_popup) {
                            console.warn("【注意】聊天室未定義『接收彈跳視窗』之函式")
                        }
                        if (chatRoom.callback_popupLiveQuest && response.PopupLiveQuest) {
                            chatRoom.callback_popupLiveQuest(response.PopupLiveQuest)
                        } else if (!chatRoom.callback_popupLiveQuest) {
                            console.warn("【注意】聊天室未定義『接收即時問卷』之函式")
                        }
                        resolve(true)
                    })
                    // 彈跳視窗
                    chatRoom.connection.on("ReceivePopupAgenda", function (response) {
                        if (chatRoom.callback_popup) {
                            chatRoom.callback_popup(response)
                        } else if (!chatRoom.callback_popup) {
                            console.warn("【注意】聊天室未定義『接收彈跳視窗』之函式")
                        }
                    })
                    // 全頻道訊息傳送訊息事件
                    chatRoom.connection.on("ReceiveMessage", function (response) {
                        const msgData = {
                            user: response.User,
                            message: setUrlToDOM(response.Message),
                            time: response.Time,
                            role: response.Role
                        }
                        if (chatRoom.callback_ReceiveMessage && (chatRoom.displaySysMsg || (!chatRoom.displaySysMsg && (response.Message.indexOf('進入聊天室') === -1 && response.Message.indexOf('離開聊天室') === -1)))) {
                            chatRoom.callback_ReceiveMessage(msgData)
                        } else if (!chatRoom.callback_ReceiveMessage) {
                            console.warn("【注意】聊天室未定義『接收訊息』之函式")
                        }
                    })
                    // 接收即時問卷
                    chatRoom.connection.on("ReceivePopupLiveQuest", function (response) {
                        if (chatRoom.callback_popupLiveQuest) {
                            chatRoom.callback_popupLiveQuest(response)
                        } else if (!chatRoom.callback_popupLiveQuest) {
                            console.warn("【注意】聊天室未定義『接收即時問卷』之函式")
                        }
                    })
                    // 置頂
                    chatRoom.connection.on("ReceiveTopMessage", function (response) {
                        if (chatRoom.callback_ReceiveTopMessage) {
                            chatRoom.callback_ReceiveTopMessage(setUrlToDOM(response.TopMessage))
                        } else if (!chatRoom.callback_ReceiveTopMessage) {
                            console.warn("【注意】聊天室未定義『接收置頂訊息』之函式")
                        }
                    })
                    // 聊天室人數
                    chatRoom.connection.on("UserCount", (response => {
                        if (chatRoom.callback_userCount) {
                            chatRoom.callback_userCount(response.OnlineCount, response.TotalCount)
                        }
                    }))
                }).catch(function (error) {
                    console.log(error)
                    alert("您沒有權限加入聊天室")
                    reject(error)
                })
            })
        })
    }
    //儲存聊天室彈跳視窗(議程)
    postPopupAgenda(data) {
        return new Promise((resolve, reject) => {
            this.eventLogin().then(() => {
                const apiUrl = "/ChatRoom/PostPopupAgenda/" + this.chatRoomID
                let headerConfig = [
                    {
                        name: "Authorization",
                        value: "bearer " + this.idToken
                    }
                ]
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                httpRequestPromise("post", apiUrl, true, data, headerConfig, this.DomainType).then(response => {
                    resolve(response)
                }).catch(error => {
                    reject(JSON.parse(error))
                }).finally(() => {
                    this.isSending = false
                })
            })
        })
    }
    //儲存聊天室彈跳視窗(即時問卷)
    postPopupLiveQuest(data) {
        return new Promise((resolve, reject) => {
            this.eventLogin().then(() => {
                const apiUrl = "/ChatRoom/PostPopupLiveQuest/" + this.chatRoomID
                let headerConfig = [
                    {
                        name: "Authorization",
                        value: "bearer " + this.idToken
                    }
                ]
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                httpRequestPromise("post", apiUrl, true, data, headerConfig, this.DomainType).then(response => {
                    resolve(response)
                }).catch(error => {
                    reject(JSON.parse(error))
                }).finally(() => {
                    this.isSending = false
                })
            })
        })
    }
    //取得聊天室狀態
    getChatRoom() {
        return new Promise((resolve, reject) => {
            this.eventLogin().then(() => {
                try {
                    const apiUrl = "/ChatRoom/GetChatRoom"
                    let headerConfig = [
                        {
                            name: "Authorization",
                            value: "bearer " + this.idToken
                        }
                    ]
                    if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                    resolve(httpRequest("get", apiUrl, false, {}, headerConfig, this.apiDomain))
                } catch (error) {
                    reject(JSON.parse(error.message))
                }
            })
        })
    }
    //檢查聊天室權限
    checkChatRoomExpelled() {
        return new Promise((resolve, reject) => {
            this.eventLogin().then(() => {
                const apiUrl = "/ChatRoom/CheckIsExpelled/" + this.chatRoomID
                let headerConfig = [
                    {
                        name: "Authorization",
                        value: "bearer " + this.idToken
                    }
                ]
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                httpRequestPromise("get", apiUrl, true, {}, headerConfig, this.DomainType).then(response => {
                    resolve(response)
                }).catch(error => {
                    reject(JSON.parse(error))
                }).finally(() => {
                    this.isSending = false
                })
            })
        })
    }
    //傳送訊息
    sendMessage(message) {
        return new Promise((resolve, reject) => {
            this.eventLogin().then(() => {
                const apiUrl = "/ChatRoom/SendMessage/" + this.chatRoomID + "?Message=" + message
                let headerConfig = [
                    {
                        name: "Authorization",
                        value: "bearer " + this.idToken
                    }
                ]
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                httpRequestPromise("post", apiUrl, true, {}, headerConfig, this.DomainType).then(response => {
                    resolve(response)
                }).catch(error => {
                    reject(JSON.parse(error))
                }).finally(() => {
                    this.isSending = false
                })
            })
        })
    }
    //寫入置頂訊息
    postTopMessage(topMessage) {
        return new Promise((resolve, reject) => {
            this.eventLogin().then(() => {
                const apiUrl = "/ChatRoom/PostTopMessage/" + this.chatRoomID
                const postData = {
                    TopMessage: topMessage
                }
                let headerConfig = [
                    {
                        name: "Authorization",
                        value: "bearer " + this.idToken
                    }
                ]
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                httpRequestPromise("post", apiUrl, true, postData, headerConfig, this.DomainType).then(response => {
                    resolve(response)
                }).catch(error => {
                    reject(JSON.parse(error))
                }).finally(() => {
                    this.isSending = false
                })
            })
        })
    }
    //強制離線
    setOffLine(data) {
        return new Promise((resolve, reject) => {
            this.eventLogin().then(() => {
                const apiUrl = "/ChatRoom/SetOffLine/" + this.chatRoomID
                let headerConfig = [
                    {
                        name: "Authorization",
                        value: "bearer " + this.idToken
                    }
                ]
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                httpRequestPromise("post", apiUrl, true, data, headerConfig, this.DomainType).then(response => {
                    resolve(response)
                }).catch(error => {
                    reject(JSON.parse(error))
                }).finally(() => {
                    this.isSending = false
                })
            })
        })
    }
    //登入活動並換token
    eventLogin() {
        return new Promise((resolve, reject) => {
            eventLogin(this.eventID, this.idToken, this.apiVersion, 0).then((eventToken) => {
                this.idToken = eventToken
                resolve(eventToken)
            }).catch(error => {
                reject(getErrorMessage(error).message)
            })
        })
    }
}

// 偵測網址並return HTML DOM <a></a>
function setUrlToDOM(str) {
    let result = "" + str
    const URLs = result.match(/\bhttps?:\/\/\S+/gi);
    if (URLs) {
        for (var i = 0; i < URLs.length; i++) {
            if (result.indexOf("href=\"" + URLs[i]) === -1) {
                result = result.replace(URLs[i], "<a target='_blank' href='" + URLs[i] + "'>" + URLs[i] + "</a>")
            }
        }
    }
    return result
}