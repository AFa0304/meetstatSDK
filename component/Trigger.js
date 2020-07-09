import { httpRequest, alertError } from '../utils/utils'

export default class Trigger {
    constructor(triggerID = "", DomainType = 0) {
        this.triggerID = triggerID
        this.DomainType = DomainType
    }
    //觸發Trigger
    trigger() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/Trigger/" + this.triggerID
                const tokens = getTriggerToken(this.triggerID, this.DomainType)
                const headerSetting = [
                    {
                        name: "RequestToken",
                        value: tokens.RequestToken
                    }
                ]
                resolve(httpRequest("post", apiUrl, false, {}, headerSetting, this.DomainType))
            } catch (error) {
                alertError(JSON.parse(error.message))
                reject(JSON.parse(error.message))
            }
        })
    }
}

// 取得Trigger AntiforgeryToken
function getTriggerToken(triggerID, DomainType) {
    try {
        const apiUrl = "/Trigger/" + triggerID
        return (httpRequest("get", apiUrl, false, {}, [], DomainType))
    } catch (error) {
        return (JSON.parse(error.message))
    }
}