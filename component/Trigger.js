import { httpRequest, alertError } from '../utils/utils'

export default class Trigger {
    constructor(triggerID = "", DomainType = 0) {
        this.triggerID = triggerID
        this.DomainType = DomainType
        this.apiVersion = undefined
    }
    //觸發Trigger
    trigger() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/Trigger/" + this.triggerID
                const tokens = getTriggerToken(this.triggerID, this.DomainType)
                let headerConfig = [
                    {
                        name: "RequestToken",
                        value: tokens.RequestToken
                    }
                ]
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                resolve(httpRequest("post", apiUrl, false, {}, headerConfig, this.DomainType))
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
        let headerConfig = []
        if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
        return (httpRequest("get", apiUrl, false, {}, headerConfig, DomainType))
    } catch (error) {
        return (JSON.parse(error.message))
    }
}