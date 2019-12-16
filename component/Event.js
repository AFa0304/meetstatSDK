import { isGuid, httpRequest, alertError, httpRequestPromise } from '../utils/utils'

export default class Event {
    constructor(eventID = "", idToken = "", isBeta = false) {
        this.isSending = false
        this.isBeta = isBeta
        this.eventID = eventID
        this.idToken = idToken
        this.speakerList = getSpeakerList(eventID, this.isBeta)
        this.agendaList = getAgendaList(eventID, this.isBeta)
        this.questList = getQuestList(eventID, this.isBeta)
        this.luckyDrawList = getLuckyDrawList(eventID, this.isBeta)
        this.eventData = getEventData(eventID, this.isBeta)
    }
    //取得CheckIn資料
    getClientCheckIn() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/ClientCheckin"
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
    //取得註冊表單
    getRegQuest() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/" + this.eventID + "/EventReg"
                resolve(httpRequest("get", apiUrl, false, {}, [], this.isBeta))
            } catch (error) {
                reject(JSON.parse(error.message))
            }
        })
    }
    //送出註冊表單
    submitRegQuest(data) {
        if (this.isSending) {
            return new Promise((resolve) => {
                resolve("執行中，請勿重複發送")
            })
        }
        this.isSending = true
        return new Promise((resolve, reject) => {
            const apiUrl = "/" + this.eventID + "/EventReg"
            httpRequestPromise("post", apiUrl, false, data, [], this.isBeta).then(response => {
                resolve(response)
            }).catch(error => {
                let jsonErr = null
                try{
                    jsonErr = JSON.parse(error)
                    alertError(jsonErr)
                    reject(jsonErr)
                }catch(err){
                    //錯誤response非Object時
                    console.log(err)
                    alert("送出失敗")
                    reject(error)
                }
            }).finally(() => {
                this.isSending = false
            })
        })
    }
    //取得獎品清單
    getLuckyDrawList() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/" + this.eventID + "/LuckyDraw"
                resolve(httpRequest("get", apiUrl, false, {}, [], this.isBeta).Items)
            } catch (error) {
                reject(JSON.parse(error.message))
            }
        })
    }
    //查詢中獎物品
    getDrawItem() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/" + this.eventID + "/LuckyDraw/MyDrawItem"
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
    // 取得Agenda (搜尋ID or 字串 => 若找不到或超過一組則throw error)
    getAgenda(searchStr = "") {
        return new Promise((resolve, reject) => {
            // 傳入後判斷是否為Guid   是=>搜尋ID   否=>搜尋整個Array
            let agendaID = ""
            if (isGuid(searchStr)) {
                const result = this.agendaList.find(function (agenda) {
                    return agenda.ID === searchStr
                })
                result ? agendaID = result.ID : reject(new Error("查無此ID"))
            } else {
                let resultAry = []
                this.agendaList.map((agenda) => {
                    if (JSON.stringify(agenda).indexOf(searchStr) !== -1) {
                        resultAry.push(agenda)
                    }
                    return null
                })

                resultAry.length === 1 ? agendaID = resultAry[0].ID : resultAry.length > 1 ? reject(new Error("查到多組包含'" + searchStr + "'的Agenda")) : reject(new Error("查無包含'" + searchStr + "'的Agenda"))
            }
            resolve(httpRequest("get", "/" + this.eventID + "/Agenda/" + agendaID, false, {}, [], this.isBeta))
        })
    }
    // 取得Speaker資料
    getSpeaker(speakerID) {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/" + this.eventID + "/Agenda/Speaker/" + speakerID
                resolve(httpRequest("get", apiUrl, false, {}, [], this.isBeta))
            } catch (error) {
                reject(JSON.parse(error.message))
            }
        })
    }
    // 造訪紀錄
    setVisitRecord() {
        const apiUrl = "/" + this.eventID + "/Analytics"
        const data = {
            "FrontSiteURL": window.location.href
        }
        try {
            httpRequest("post", apiUrl, false, data, [], this.isBeta)
        } catch (error) {
            console.log(error)
        }
    }
    //登入活動
    eventLogin() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/Account/EventLogin"
                const data = {
                    "EventID": this.eventID
                }
                const headerConfig = [
                    {
                        name: "Authorization",
                        value: "bearer " + this.idToken
                    }
                ]
                resolve(httpRequest("post", apiUrl, false, data, headerConfig, this.isBeta))
            } catch (error) {
                reject(JSON.parse(error.message))
            }
        })
    }
    //取得Firebase帳戶資料
    getAccountInfo() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/Account/Info"
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
    getUserRegData(email, name) {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/" + this.eventID + "/Customize/GetUserRegData"
                const headerConfig = [
                    {
                        name: "Authorization",
                        value: "bearer " + this.idToken
                    }
                ]
                const postData = {
                    "Email": email,
                    "Name": name
                }
                resolve(httpRequest("post", apiUrl, false, postData, headerConfig, this.isBeta))
            } catch (error) {
                reject(JSON.parse(error.message))
            }
        })
    }
    getRegData() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/Account/RegData"
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
    //取得QR Code&票卷
    getTickets() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/Ticket"
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
}

//取得獎項清單
function getLuckyDrawList(eventID, isBeta) {
    const apiUrl = "/" + eventID + "/LuckyDraw"
    return (httpRequest("get", apiUrl, false, {}, [], isBeta).Items)
}
//取得問卷清單
function getQuestList(eventID, isBeta) {
    const apiUrl = "/" + eventID + "/GetQuest"
    return (httpRequest("get", apiUrl, false, {}, [], isBeta).Items)
}
//取得Speaker清單
function getSpeakerList(eventID, isBeta) {
    const apiUrl = "/" + eventID + "/Agenda/Speaker/List"
    return (httpRequest("get", apiUrl, false, {}, [], isBeta).Items)
}
//取得Agenda清單
function getAgendaList(eventID, isBeta) {
    const apiUrl = "/" + eventID + "/Agenda"
    return (httpRequest("get", apiUrl, false, {}, [], isBeta).Agendas)
}
//取得Event資料
function getEventData(eventID, isBeta) {
    const apiUrl = "/" + eventID
    return (httpRequest("get", apiUrl, false, {}, [], isBeta))
}