import { httpRequest, alertError, httpRequestPromise } from '../utils/utils'

export default class Quest {
    constructor(questID = "", idToken = "", DomainType = 0) {
        this.questID = questID
        this.DomainType = DomainType
        this.idToken = idToken
    }
    //取得問卷
    getQuest() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/Quest/" + this.questID
                resolve(httpRequest("get", apiUrl, false, {}, [], this.DomainType))
            } catch (error) {
                reject(JSON.parse(error.message))
            }
        })
    }
    //送出問卷
    submitQuest(answer, fileArray = []) {
        return new Promise((resolve, reject) => {
            const apiUrl = "/Quest/" + this.questID
            const postData = new FormData()
            postData.append("AnsJSON", JSON.stringify(answer))
            for (var i = 0; i < fileArray.length; i++) {
                postData.append("Files", fileArray[i])
            }
            const headerConfig = [
                {
                    name: "Authorization",
                    value: "bearer " + this.idToken
                }
            ]
            httpRequestPromise("post", apiUrl, true, postData, headerConfig, this.DomainType, true).then(response => {
                resolve(response)
            }).catch(error => {
                alertError(JSON.parse(error))
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
                resolve(httpRequest("post", apiUrl, false, postData, [], this.DomainType))
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
            httpRequestPromise("post", apiUrl, true, postData, [], this.DomainType).then(response => {
                resolve(response)
            }).catch(error => {
                alertError(JSON.parse(error))
                reject(JSON.parse(error))
            })
        })
    }
    //取得投稿問卷答案
    getQuestReviewDetail() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/Quest/" + this.questID + "/GetAnswerDetail"
                const headerConfig = [
                    {
                        name: "Authorization",
                        value: "bearer " + this.idToken
                    }
                ]
                resolve(httpRequest("get", apiUrl, false, {}, headerConfig, this.DomainType))
            } catch (error) {
                reject(JSON.parse(error.message))
            }
        })
    }
    //送出投稿問卷答案
    submitQuestReview(answers, fileArray = []) {
        const postData = new FormData()
        postData.append("AnsJSON", JSON.stringify(answers))
        for (var i = 0; i < fileArray.length; i++) {
            postData.append("Files", fileArray[i])
        }
        return new Promise((resolve, reject) => {
            const apiUrl = "/Quest/" + this.questID + "/PostAnswer"
            const headerConfig = [
                {
                    name: "Authorization",
                    value: "bearer " + this.idToken
                }
            ]
            httpRequestPromise("post", apiUrl, true, postData, headerConfig, this.DomainType, true).then(response => {
                resolve(response)
            }).catch(error => {
                alertError(JSON.parse(error))
                reject(JSON.parse(error))
            })
        })
    }
}