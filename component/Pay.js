import { httpRequest } from '../utils/utils'

export default class Pay {
    constructor(invoiceID = "", eventUserID = "", DomainType = 0) {
        this.invoiceID = invoiceID
        this.eventUserID = eventUserID
        this.DomainType = DomainType
    }
    //註冊取得付款頁資訊
    getReg() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/Pay/Reg?InvoiceID=" + this.invoiceID + "&EventUserID=" + this.eventUserID
                resolve(httpRequest("get", apiUrl, false, {}, [], this.DomainType))
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
                resolve(httpRequest("get", apiUrl, false, {}, [], this.DomainType))
            } catch (error) {
                reject(JSON.parse(error.message))
            }
        })
    }
}