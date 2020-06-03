import { httpRequest, alertError, httpRequestPromise } from '../utils/utils'
import { HubConnectionBuilder } from '../../@aspnet/signalr'
import * as firebase from '../../firebase'

export default class ChatRoom {
    constructor(eventID, idToken, displaySysMsg = true, callback_receiveMsg = undefined, callback_receiveTopMsg = undefined, isBeta = false) {
        this.eventID = eventID
        this.idToken = idToken
        this.chatRoomID = ""
        this.userID = ""
        this.isCustomer = false
        this.isBeta = isBeta
        this.displaySysMsg = displaySysMsg // 是否顯示系統訊息
        this.callback_ReceiveMessage = callback_receiveMsg // 接收訊息CallBack function(response,logs) 若有logs 回傳完整log
        this.callback_ReceiveTopMessage = callback_receiveTopMsg // 接收置頂訊息CallBack
        this.callback_userCount = undefined
        this.apiDomain = isBeta ? "https://capibeta.meetstat.co" : "https://capi.meetstat.co"
    }
    init() {
        return new Promise((resolve, reject) => {
            const chatRoom = this
            this.eventLogin().then(function (loginData) {
                firebase.auth().signInWithCustomToken(loginData.EventAccessToken).then(function () {
                    firebase.auth().currentUser.getIdToken().then(function (newIdToken) {
                        chatRoom.idToken = newIdToken
                        chatRoom.getChatRoom().then(function (response) {
                            chatRoom.chatRoomID = response.ChatRoomID
                            chatRoom.userID = response.UserID
                            chatRoom.isCustomer = response.isCustomer
                            chatRoom.checkChatRoomExpelled().then(function () {
                                chatRoom.connection = new HubConnectionBuilder().withUrl(chatRoom.apiDomain + "/chatHub?ChatRoomID=" + chatRoom.chatRoomID + "&UserID=" + chatRoom.userID + "&isCustomer=" + chatRoom.isCustomer).build()
                                chatRoom.connection.start().then(function () {
                                    if (chatRoom.callback_ReceiveTopMessage && response.TopMessage) { //初始化置頂貼文
                                        chatRoom.callback_ReceiveTopMessage(setUrlToDOM(response.TopMessage))
                                    } else if(!chatRoom.callback_ReceiveTopMessage){
                                        console.warn("【注意】聊天室未定義『接收置頂訊息』之函式")
                                    }
                                    resolve(true)
                                })
                                // 全頻道訊息傳送訊息事件
                                chatRoom.connection.on("ReceiveMessage", function (response) {
                                    const msgData = {
                                        user: response.user,
                                        message: setUrlToDOM(response.message)
                                    }
                                    if (chatRoom.callback_ReceiveMessage && (chatRoom.displaySysMsg || (!chatRoom.displaySysMsg && (response.message.indexOf('進入聊天室') === -1 && response.message.indexOf('離開聊天室') === -1)))) {
                                        chatRoom.callback_ReceiveMessage(msgData)
                                    } else if (!chatRoom.callback_ReceiveMessage) {
                                        console.warn("【注意】聊天室未定義『接收訊息』之函式")
                                    }
                                })
                                // 置頂
                                chatRoom.connection.on("ReceiveTopMessage", function (response) {
                                    if (chatRoom.callback_ReceiveTopMessage && response.TopMessage) {
                                        chatRoom.callback_ReceiveTopMessage(setUrlToDOM(response.topMessage))
                                    } else if(!chatRoom.callback_ReceiveTopMessage) {
                                        console.warn("【注意】聊天室未定義『接收置頂訊息』之函式")
                                    }
                                })
                                // 聊天室人數
                                this.connection.on("UserCount", (response => {
                                    if(chatRoom.callback_userCount){
                                        chatRoom.callback_userCount(response.onlineCount, response.totalCount)
                                    }
                                }))
                            }).catch(function (error) {
                                console.log(error)
                                alert("您沒有權限加入聊天室")
                            })
                        })
                    })
                })
            })
        })
    }
    //取得聊天室狀態
    getChatRoom() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/" + this.eventID + "/ChatRoom/GetChatRoom"
                const headerConfig = [
                    {
                        name: "Authorization",
                        value: "bearer " + this.idToken
                    }
                ]
                resolve(httpRequest("get", apiUrl, false, {}, headerConfig, this.isBeta))
            } catch (error) {
                reject(JSON.parse(error.message))
            }
        })
    }
    //檢查聊天室權限
    checkChatRoomExpelled() {
        return new Promise((resolve, reject) => {
            const apiUrl = "/" + this.eventID + "/ChatRoom/CheckIsExpelled/" + this.chatRoomID + "?UserID=" + this.userID + "&isCustomer=" + this.isCustomer
            const headerConfig = [
                {
                    name: "Authorization",
                    value: "bearer " + this.idToken
                }
            ]
            httpRequestPromise("get", apiUrl, true, {}, headerConfig, this.isBeta).then(response => {
                resolve(response)
            }).catch(error => {
                // alertError(JSON.parse(error))
                reject(JSON.parse(error))
            }).finally(() => {
                this.isSending = false
            })
        })
    }
    //傳送訊息
    sendMessage(message) {
        return new Promise((resolve, reject) => {
            const apiUrl = "/" + this.eventID + "/ChatRoom/SendMessage/" + this.chatRoomID + "?UserID=" + this.userID + "&isCustomer=" + this.isCustomer + "&Message=" + message
            const headerConfig = [
                {
                    name: "Authorization",
                    value: "bearer " + this.idToken
                }
            ]
            httpRequestPromise("post", apiUrl, true, {}, headerConfig, this.isBeta).then(response => {
                resolve(response)
            }).catch(error => {
                alertError(JSON.parse(error))
                reject(JSON.parse(error))
            }).finally(() => {
                this.isSending = false
            })
        })
    }
    //寫入置頂訊息
    postTopMessage(topMessage) {
        return new Promise((resolve, reject) => {
            const apiUrl = "/" + this.eventID + "/ChatRoom/PostTopMessage/" + this.chatRoomID
            const headerConfig = [
                {
                    name: "Authorization",
                    value: "bearer " + this.idToken
                }
            ]
            const postData = {
                TopMessage: topMessage
            }
            httpRequestPromise("post", apiUrl, true, postData, headerConfig, this.isBeta).then(response => {
                resolve(response)
            }).catch(error => {
                alertError(JSON.parse(error))
                reject(JSON.parse(error))
            }).finally(() => {
                this.isSending = false
            })
        })
    }
    //加入聊天室
    joinChatRoom() {
        return new Promise((resolve, reject) => {
            const apiUrl = "/" + this.eventID + "/ChatRoom/JoinChatRoom/" + this.chatRoomID + "?UserID=" + this.userID + "&isCustomer=" + this.isCustomer
            const headerConfig = [
                {
                    name: "Authorization",
                    value: "bearer " + this.idToken
                }
            ]
            httpRequestPromise("post", apiUrl, true, {}, headerConfig, this.isBeta).then(response => {
                resolve(response)
            }).catch(error => {
                alertError(JSON.parse(error))
                reject(JSON.parse(error))
            }).finally(() => {
                this.isSending = false
            })
        })
    }
    //離開聊天室
    exitChatRoom() {
        return new Promise((resolve, reject) => {
            const apiUrl = "/" + this.eventID + "/ChatRoom/ExitChatRoom/" + this.chatRoomID + "?UserID=" + this.userID + "&isCustomer=" + this.isCustomer
            const headerConfig = [
                {
                    name: "Authorization",
                    value: "bearer " + this.idToken
                }
            ]
            httpRequestPromise("post", apiUrl, true, {}, headerConfig, this.isBeta).then(response => {
                resolve(response)
            }).catch(error => {
                alertError(JSON.parse(error))
                reject(JSON.parse(error))
            }).finally(() => {
                this.isSending = false
            })
        })
    }
    //登入活動
    eventLogin() {
        return new Promise((resolve, reject) => {
            const apiUrl = "/Account/EventLogin"
            const headerConfig = [
                {
                    name: "Authorization",
                    value: "bearer " + this.idToken
                }
            ]
            const postData = {
                "EventID": this.eventID
            }
            httpRequestPromise("post", apiUrl, true, postData, headerConfig, this.isBeta).then(response => {
                resolve(response)
            }).catch(error => {
                alertError(JSON.parse(error))
                reject(JSON.parse(error))
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