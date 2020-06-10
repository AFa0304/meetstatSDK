import { alertError, httpRequestPromise, httpRequest } from '../utils/utils'


export default class Draw {
    constructor(eventID = "", drawID = "", idToken = "", isBeta = false) {
        this.isBeta = isBeta
        this.eventID = eventID
        this.drawID = drawID
        this.idToken = idToken
    }
    //取得Draw塗鴉牆
    getGraffitiWall() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/Draw/" + this.drawID + "/GraffitiWall?EventID=" + this.eventID
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
    //繪圖
    drawTextToPng(datas) {
        return new Promise((resolve, reject) => {
            const apiUrl = "/Draw/" + this.drawID + "/DrawTextToPng"
            const headerConfig = [
                {
                    name: "Authorization",
                    value: "bearer " + this.idToken
                }
            ]
            httpRequestPromise("post", apiUrl, true, datas, headerConfig, this.isBeta).then(response => {
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