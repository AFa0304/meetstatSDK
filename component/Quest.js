import { httpRequest, alertError, httpRequestPromise } from '../utils/utils'

export default class Quest {
    constructor(questID = "", isBeta = false) {
        this.questID = questID
        this.isBeta = isBeta
        this.isSending = false
    }
    //取得問卷
    getQuest() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/Quest/" + this.questID
                resolve(httpRequest("get", apiUrl, false, {}, [], this.isBeta))
            } catch (error) {
                reject(JSON.parse(error.message))
            }
        })
    }
    //送出問卷
    submitQuest(data) {
        if (this.isSending) {
            return new Promise((resolve) => {
                resolve("執行中，請勿重複發送")
            })
        }
        this.isSending = true
        return new Promise((resolve, reject) => {
            const apiUrl = "/Quest/" + this.questID
            httpRequestPromise("post", apiUrl, false, data, [], this.isBeta).then(response => {
                resolve(response)
            }).catch(error=>{
                alertError(JSON.parse(error))
                reject(JSON.parse(error))
            }).finally(()=>{
                this.isSending = false
            })
        })
    }
    //Email重複檢查
    ckeckEmail(email) {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/Quest/" + this.questID + "/CheckEmail"
                const postData = {
                    "Email": email
                }
                resolve(httpRequest("post", apiUrl, false, postData, [], this.isBeta))
            } catch (error) {
                reject(JSON.parse(error.message))
            }
        })
    }
    //資料重複檢查
    checkQuestionUnion(name, value) {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/Quest/" + this.questID + "/CheckQuestionUnion"
                const postData = {
                    "Name": name,
                    "Value": value
                }
                resolve(httpRequest("post", apiUrl, false, postData, [], this.isBeta))
            } catch (error) {
                reject(JSON.parse(error.message))
            }
        })
    }
}