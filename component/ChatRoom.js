import { httpRequest, alertError, httpRequestPromise } from '../utils/utils'

export default class ChatRoom {
    constructor(eventID, token, isBeta = false) {
        this.eventID = eventID
        this.token = token
        this.newToken = ""
        this.isBeta = isBeta
    }
    async init() {
        const thisComponent = this
        const eventID = this.eventID
        const isBeta = this.isBeta
        this.eventLogin().then(function (loginData) {
            thisComponent.token = loginData.EventAccessToken
            thisComponent.getChatRoom().then(function (chatRoomDatas) {
                console.log(chatRoomDatas)
            })
        })
        // const taskList = [
        // ]
        // await Promise.all(taskList).then(response => {
        //     this.speakerList = response[0].Items
        //     this.agendaList = response[1].Agendas
        //     this.questList = response[2].Items
        //     this.luckyDrawList = response[3].Items
        //     this.eventData = response[4]
        // }).catch(error => {
        //     throw new Error(JSON.stringify({ Message: error.toString() }))
        // })
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
    checkChatRoomExpelled(chatroomID, userID, isCustomer) {
        return new Promise((resolve, reject) => {
            const apiUrl = "/" + this.eventID + "/ChatRoom/CheckIsExpelled/" + chatroomID + "?UserID=" + userID + "&isCustomer=" + isCustomer
            const headerConfig = [
                {
                    name: "Authorization",
                    value: "bearer " + this.idToken
                }
            ]
            httpRequestPromise("get", apiUrl, true, {}, headerConfig, this.isBeta).then(response => {
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
    joinChatRoom(chatroomID, userID, isCustomer) {
        return new Promise((resolve, reject) => {
            const apiUrl = "/" + this.eventID + "/ChatRoom/JoinChatRoom/" + chatroomID + "?UserID=" + userID + "&isCustomer=" + isCustomer
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
    //傳送訊息
    sendMessage(chatroomID, userID, isCustomer, message) {
        return new Promise((resolve, reject) => {
            const apiUrl = "/" + this.eventID + "/ChatRoom/JoinChatRoom/" + chatroomID + "?UserID=" + userID + "&isCustomer=" + isCustomer + "&Message=" + message
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