import { httpRequest, httpRequestPromise, eventLogin, getErrorMessage } from '../utils/utils'

export default class Pay {
    constructor(invoiceID = "", eventUserID = "", idToken = "", DomainType = 0) {
        this.invoiceID = invoiceID
        this.eventUserID = eventUserID
        this.DomainType = DomainType
        this.idToken = idToken
        this.apiVersion = undefined
    }
    //刷退
    cancelAuthorization(eventID, cancelDatas) {
        return new Promise((resolve, reject) => {
            this.eventLogin(eventID).then(() => {
                let apiUrl = "/Pay/CancelAuthorization/" + this.invoiceID
                let postDatas = {}
                let headerConfig = [
                    {
                        name: "Authorization",
                        value: "bearer " + this.idToken
                    }
                ]
                if (cancelDatas) { postDatas = cancelDatas }
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                httpRequestPromise("post", apiUrl, true, postDatas, headerConfig, this.DomainType).then(response => {
                    resolve(response)
                }).catch(error => {
                    reject(getErrorMessage(error))
                })
            })
        })
    }
    //取得收據
    getReceipt() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/Pay/Receipt"
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
    //註冊取得付款頁資訊
    getReg() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/Pay/Reg?InvoiceID=" + this.invoiceID + "&EventUserID=" + this.eventUserID
                let headerConfig = []
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                resolve(httpRequest("get", apiUrl, false, {}, headerConfig, this.DomainType))
            } catch (error) {
                reject(getErrorMessage(error))
            }
        })
    }
    //開啟金流付款頁
    getGoPay() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/Pay/GoPay?InvoiceID=" + this.invoiceID + "&EventUserID=" + this.eventUserID
                let headerConfig = []
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                resolve(httpRequest("get", apiUrl, false, {}, headerConfig, this.DomainType))
            } catch (error) {
                let jsonErr = null
                try {
                    jsonErr = JSON.parse(error)
                    reject(jsonErr)
                } catch (err) {
                    reject(getErrorMessage(error))
                }
            }
        })
    }
    //查詢收據
    getInvoiceDatas() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/Pay/Query/" + this.invoiceID
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
    //登入活動
    eventLogin(eventID) {
        return new Promise((resolve, reject) => {
            eventLogin(eventID, this.idToken, this.apiVersion, this.DomainType).then((eventToken) => {
                this.idToken = eventToken
                resolve(eventToken)
            }).catch(error => {
                reject(getErrorMessage(error).message)
            })
        })
    }
}