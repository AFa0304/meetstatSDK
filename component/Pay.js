import { httpRequest } from '../utils/utils'

export default class Pay {
    constructor(invoiceID = "", eventUserID = "", DomainType = 0) {
        this.invoiceID = invoiceID
        this.eventUserID = eventUserID
        this.DomainType = DomainType
        this.apiVersion = undefined
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
                reject(JSON.parse(error.message))
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
                reject(JSON.parse(error.message))
            }
        })
    }
}