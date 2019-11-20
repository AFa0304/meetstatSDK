import { httpRequest } from '../utils/utils'

export default class Quest {
    constructor(questID = "", isBeta = false) {
        this.questID = questID
        this.isBeta = isBeta
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
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/Quest/" + this.questID
                resolve(httpRequest("post", apiUrl, false, data, [], this.isBeta))
            } catch (error) {
                reject(JSON.parse(error.message))
            }
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