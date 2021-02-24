import { getErrorMessage, httpRequest, httpRequestPromise, eventLogin } from '../utils/utils'

export default class LuckyDraw {
    constructor(eventID = "", luckyDrawID = "", idToken = "", DomainType = 0) {
        this.eventID = eventID
        this.luckyDrawID = luckyDrawID
        this.idToken = idToken
        this.DomainType = DomainType
        this.apiVersion = undefined
    }
    //查詢剩餘抽獎券數量
    getMyLotteryCount() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/" + this.eventID + "/LuckyDraw/" + this.luckyDrawID + "/MyLotteryCount"
                let headerConfig = [
                    {
                        name: "Authorization",
                        value: "bearer " + this.idToken
                    }
                ]
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                resolve(httpRequest("get", apiUrl, false, {}, headerConfig, this.DomainType))
            } catch (error) {
                reject(getErrorMessage(error))
            }
        })
    }
    //查詢有無抽獎資格
    getCheckValid() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/" + this.eventID + "/LuckyDraw/" + this.luckyDrawID + "/CheckValid"
                let headerConfig = [
                    {
                        name: "Authorization",
                        value: "bearer " + this.idToken
                    }
                ]
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                resolve(httpRequest("get", apiUrl, false, {}, headerConfig, this.DomainType))
            } catch (error) {
                reject(getErrorMessage(error))
            }
        })
    }
    //獎品清單
    getLuckyDrawList() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/" + this.eventID + "/LuckyDraw/" + this.luckyDrawID
                let headerConfig = [
                    {
                        name: "Authorization",
                        value: "bearer " + this.idToken
                    }
                ]
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                resolve(httpRequest("get", apiUrl, false, {}, headerConfig, this.DomainType))
            } catch (error) {
                reject(getErrorMessage(error))
            }
        })
    }
    //查詢中獎物品
    getMyDrawItem() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/" + this.eventID + "/LuckyDraw/" + this.luckyDrawID + "/MyDrawItem"
                let headerConfig = [
                    {
                        name: "Authorization",
                        value: "bearer " + this.idToken
                    }
                ]
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                resolve(httpRequest("get", apiUrl, false, {}, headerConfig, this.DomainType))
            } catch (error) {
                reject(getErrorMessage(error))
            }
        })
    }
    postDraw() {
        return new Promise((resolve, reject) => {
            const apiUrl = "/" + this.eventID + "/LuckyDraw/" + this.luckyDrawID + "/Draw"
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
                reject(getErrorMessage(error))
            })
        })
    }
    eventLogin() {
        return new Promise((resolve, reject) => {
            eventLogin(this.eventID, this.idToken, this.apiVersion, this.DomainType).then((eventToken) => {
                this.idToken = eventToken
                resolve(eventToken)
            }).catch(error => {
                reject(getErrorMessage(error).message)
            })
        })
    }
}