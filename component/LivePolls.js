import { httpRequest, alertError, httpRequestPromise } from '../utils/utils'
// import { HubConnectionBuilder } from '../../@aspnet/signalr'
// import * as firebase from '../../firebase'

export default class LivePolls {
    constructor(eventID, pollsID, idToken, DomainType = 0) {
        this.eventID = eventID
        this.pollsID = pollsID
        this.sessionID = ""
        this.idToken = idToken
        this.DomainType = DomainType
        this.socketDomain = "https://websocket.meetstat.co"
        this.callback_start = undefined
        this.callback_result = undefined
        this.callback_end = undefined
        this.apiVersion = undefined
    }
    init() {
        return new Promise((resolve, reject) => {
            const livePolls = this
            const HubConnectionBuilder = require('../../@aspnet/signalr').HubConnectionBuilder
            const HttpTransportType = require('../../@aspnet/signalr').HttpTransportType
            const firebase = require("../../firebase")
            this.eventLogin().then(function (loginData) {
                firebase.auth().signInWithCustomToken(loginData.EventAccessToken).then(function () {
                    firebase.auth().currentUser.getIdToken().then(function (newIdToken) {
                        livePolls.idToken = newIdToken
                        livePolls.findSession().then(function (sessionData) {
                            livePolls.sessionID = sessionData.ID
                            const options = {
                                skipNegotiation: true,
                                transport: HttpTransportType.WebSockets,
                                accessTokenFactory: () => livePolls.idToken
                            }
                            livePolls.connection = new HubConnectionBuilder().withUrl(livePolls.socketDomain + "/Hub_LivePolls?SessionID=" + livePolls.sessionID, options).build();
                            livePolls.connection.start().then(() => {
                                livePolls.connection.on("QuestionStart", (response) => {
                                    if (livePolls.callback_start) {
                                        livePolls.callback_start(response)
                                    } else if (!livePolls.callback_start) {
                                        console.warn("【注意】即時投票未定義『QuestionStart』之函式")
                                    }
                                })
                                livePolls.connection.on("QuestionResult", (response) => {
                                    if (livePolls.callback_result) {
                                        livePolls.callback_result(response)
                                    } else if (!livePolls.callback_result) {
                                        console.warn("【注意】即時投票未定義『QuestionResult』之函式")
                                    }
                                })
                                livePolls.connection.on("SessionEnd", (response) => {
                                    if (livePolls.callback_end) {
                                        livePolls.callback_end(response)
                                    } else if (!livePolls.callback_end) {
                                        console.warn("【注意】即時投票未定義『SessionEnd』之函式")
                                    }
                                })
                                resolve(true)
                            }).catch(error => {
                                console.log(error)
                                alert("連線失敗")
                                reject(error)
                            })
                        })
                    })
                })
            })
        })
    }
    findSession() {
        return new Promise((resolve, reject) => {
            const apiUrl = "/LivePolls/FindSession/" + this.pollsID
            let headerConfig = [
                {
                    name: "Authorization",
                    value: "bearer " + this.idToken
                }
            ]
            if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
            httpRequestPromise("get", apiUrl, true, {}, headerConfig, 99, false).then(response => {
                resolve(response)
            }).catch(error => {
                let jsonErr = null
                try {
                    jsonErr = JSON.parse(error)
                    reject(jsonErr)
                } catch (err) {
                    console.log(err)
                    reject(error)
                }
            })
        })
    }
    getLivePolls() {
        return new Promise((resolve, reject) => {
            const apiUrl = "/LivePolls/" + this.sessionID
            let headerConfig = [
                {
                    name: "Authorization",
                    value: "bearer " + this.idToken
                }
            ]
            if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
            httpRequestPromise("get", apiUrl, true, {}, headerConfig, 99, false).then(response => {
                resolve(response)
            }).catch(error => {
                let jsonErr = null
                try {
                    jsonErr = JSON.parse(error)
                    reject(jsonErr)
                } catch (err) {
                    console.log(err)
                    reject(error)
                }
            })
        })
    }
    //登入活動
    eventLogin() {
        return new Promise((resolve, reject) => {
            const apiUrl = "/Account/EventLogin"
            const postData = {
                "EventID": this.eventID
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
                alertError(JSON.parse(error))
                reject(JSON.parse(error))
            })
        })
    }
}
