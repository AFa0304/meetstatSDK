import { uploadFile, httpRequest, httpRequestPromise } from '../utils/utils'

export default class Quest {
    constructor(questID = "", idToken = "", DomainType = 0) {
        this.questID = questID
        this.DomainType = DomainType
        this.idToken = idToken
        this.apiVersion = undefined
    }
    //取得問卷
    getQuest() {
        return new Promise((resolve, reject) => {
            try {
                let headerConfig = []
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                const apiUrl = "/Quest/" + this.questID
                resolve(httpRequest("get", apiUrl, false, {}, headerConfig, this.DomainType))
            } catch (error) {
                reject(JSON.parse(error.message))
            }
        })
    }
    //送出問卷
    submitQuest(answer) {
        return new Promise((resolve, reject) => {
            const apiUrl = "/Quest/" + this.questID
            let headerConfig = [
                {
                    name: "Authorization",
                    value: "bearer " + this.idToken
                }
            ]
            const postData = {
                "ansData": answer
            }
            if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
            httpRequestPromise("post", apiUrl, true, postData, headerConfig, this.DomainType).then(response => {
                resolve(response)
            }).catch(error => {
                reject(JSON.parse(error))
            })
        })
    }
    //送出投稿問卷答案
    submitQuestReview(answer) {
        const postData = {
            "ansData": answer
        }
        return new Promise((resolve, reject) => {
            const apiUrl = "/Quest/" + this.questID + "/PostAnswer"
            let headerConfig = [
                {
                    name: "Authorization",
                    value: "bearer " + this.idToken
                }
            ]
            if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
            httpRequestPromise("post", apiUrl, true, postData, headerConfig, this.DomainType, true).then(response => {
                resolve(response)
            }).catch(error => {
                reject(JSON.parse(error))
            })
        })
    }
    //Email重複檢查
    checkEmail(email) {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/Quest/" + this.questID + "/CheckEmail"
                const postData = {
                    "Email": email
                }
                let headerConfig = []
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                resolve(httpRequest("post", apiUrl, false, postData, headerConfig, this.DomainType))
            } catch (error) {
                reject(JSON.parse(error.message))
            }
        })
    }
    //資料重複檢查
    checkQuestionUnion(name, value) {
        const postData = {
            "Name": name,
            "Value": value
        }
        return new Promise((resolve, reject) => {
            const apiUrl = "/Quest/" + this.questID + "/CheckQuestionUnion"
            let headerConfig = []
            if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
            httpRequestPromise("post", apiUrl, true, postData, headerConfig, this.DomainType).then(response => {
                resolve(response)
            }).catch(error => {
                reject(JSON.parse(error))
            })
        })
    }
    //取得投稿問卷答案
    getQuestReviewDetail() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/Quest/" + this.questID + "/GetAnswerDetail"
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
    uploadFile(eventID, file, callback = undefined, questionID = "", fileExtention = []) {
        return new Promise((resolve, reject) => {
            const _apiVersion = this.apiVersion ? this.apiVersion : "3.0"
            if (file) {
                uploadFile(eventID, this.idToken, this.DomainType, file, _apiVersion, callback, questionID, fileExtention).then(response => {
                    resolve(response)
                }).catch(error => {
                    reject(error)
                })
            } else {
                resolve(console.warn("找不到file"))
            }
        })
    }
}