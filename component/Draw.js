import { alertError, httpRequestPromise, httpRequest } from '../utils/utils'


export default class Draw {
    constructor(eventID = "", drawID = "", idToken = "", DomainType = 0) {
        this.DomainType = DomainType
        this.eventID = eventID
        this.drawID = drawID
        this.idToken = idToken
        this.apiVersion = undefined
    }
    //取得Draw塗鴉牆
    getGraffitiWall() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/Draw/" + this.drawID + "/GraffitiWall?EventID=" + this.eventID
                let headerConfig = [
                    {
                        name: "Authorization",
                        value: "bearer " + this.idToken
                    }
                ]
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                resolve(httpRequest("get", apiUrl, false, {}, headerConfig, this.DomainType))
            } catch (error) {
                reject(JSON.parse(error.message))
            }
        })
    }
    //繪圖
    drawTextToPng(datas) {
        return new Promise((resolve, reject) => {
            const apiUrl = "/Draw/" + this.drawID + "/DrawTextToPng"
            let headerConfig = [
                {
                    name: "Authorization",
                    value: "bearer " + this.idToken
                }
            ]
            if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
            httpRequestPromise("post", apiUrl, true, datas, headerConfig, this.DomainType).then(response => {
                resolve(response)
            }).catch(error => {
                let jsonErr = null
                try {
                    jsonErr = JSON.parse(error)
                    alertError(jsonErr)
                    reject(jsonErr)
                } catch (err) {
                    //錯誤response非Object時
                    console.log(err)
                    alert("送出失敗")
                    reject(error)
                }
            })
        })
    }
}