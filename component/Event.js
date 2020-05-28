import { isGuid, httpRequest, alertError, httpRequestPromise, getFetchData } from '../utils/utils'

export default class Event {
    constructor(eventID = "", idToken = "", isBeta = false) {
        this.isBeta = isBeta
        this.eventID = eventID
        this.idToken = idToken
        this.speakerList = []
        this.agendaList = []
        this.questList = []
        this.luckyDrawList = []
        this.eventData = {}
    }
    async init() {
        const isBeta = this.isBeta
        const eventID = this.eventID
        const taskList = [
            getSpeakerList(eventID, isBeta),
            getAgendaList(eventID, isBeta),
            getQuestList(eventID, isBeta),
            getLuckyDrawList(eventID, isBeta),
            getEventData(eventID, isBeta)
        ]
        await Promise.all(taskList).then(response => {
            this.speakerList = response[0].Items
            this.agendaList = response[1].Agendas
            this.questList = response[2].Items
            this.luckyDrawList = response[3].Items
            this.eventData = response[4]
        }).catch(error => {
            throw new Error(JSON.stringify({ Message: error.toString() }))
        })
    }
    //註冊取得付款頁資訊
    getSuccess(eventUserID, invoiceID) {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/" + this.eventID + "/EventReg/" + eventUserID + (invoiceID ? "?InvoiceID=" + invoiceID : "")
                resolve(httpRequest("get", apiUrl, false, {}, [], this.isBeta))
            } catch (error) {
                reject(JSON.parse(error.message))
            }
        })
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
    submitRegQuest(answer, fileArray = []) {
        return new Promise((resolve, reject) => {
            const apiUrl = "/" + this.eventID + "/EventReg"
            const postData = new FormData()
            postData.append("AnsJSON", JSON.stringify(answer))
            for (var i = 0; i < fileArray.length; i++) {
                postData.append("Files", fileArray[i])
            }
            httpRequestPromise("post", apiUrl, true, postData, [], this.isBeta, true).then(response => {
                resolve(response)
            }).catch(error => {
                let jsonErr = null
                try {
                    jsonErr = JSON.parse(error)
                    alertError(jsonErr)
                    reject(jsonErr)
                } catch (err) {
                    //錯誤response非Object時
                    console.log(err)
                    alert("送出失敗")
                    reject(error)
                }
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
    eventLogin(isAlertError = true) {
        return new Promise((resolve, reject) => {
            const apiUrl = "/Account/EventLogin"
            const headerConfig = [
                {
                    name: "Authorization",
                    value: "bearer " + this.idToken
                }
            ]
            const postData = {
                "EventID": this.eventID
            }
            httpRequestPromise("post", apiUrl, true, postData, headerConfig, this.isBeta).then(response => {
                resolve(response)
            }).catch(error => {
                if (isAlertError) {
                    alertError(JSON.parse(error))
                }
                reject(JSON.parse(error))
            })
        })
    }
    //登入會議室
    meetLogin(isAlertError = true) {
        return new Promise((resolve, reject) => {
            const apiUrl = "/Account/MeetLogin"
            const headerConfig = [
                {
                    name: "Authorization",
                    value: "bearer " + this.idToken
                }
            ]
            httpRequestPromise("post", apiUrl, true, {}, headerConfig, this.isBeta).then(response => {
                resolve(response)
            }).catch(error => {
                if (isAlertError) {
                    alertError(JSON.parse(error))
                }
                reject(JSON.parse(error))
            })
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
    getUserRegDataEmailName(email, name) {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/" + this.eventID + "/Customize/UserRegData_EmailName"
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
    getUserRegDataNameMobile(mobile, name) {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/" + this.eventID + "/Customize/UserRegData_NameMobile"
                const headerConfig = [
                    {
                        name: "Authorization",
                        value: "bearer " + this.idToken
                    }
                ]
                const postData = {
                    "Mobile": mobile,
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
    //取得會議室連結
    getMeet() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/Meet"
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
    //取得Mosaic預覽圖
    getMosaicFullImage(mosaicID) {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/" + this.eventID + "/Mosaic/" + mosaicID + "/GetClientFullImage"
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
    //上傳Mosaic預覽圖
    uploadMosaicTile(mosaicID, base64) {
        return new Promise((resolve, reject) => {
            const apiUrl = "/" + this.eventID + "/Mosaic/" + mosaicID + "/UploadTileImage_FullImage"
            const headerConfig = [
                {
                    name: "Authorization",
                    value: "bearer " + this.idToken
                }
            ]
            const postData = {
                "ImageBase64": base64
            }
            httpRequestPromise("post", apiUrl, true, postData, headerConfig, this.isBeta).then(response => {
                resolve(response)
            }).catch(error => {
                alertError(JSON.parse(error))
                reject(JSON.parse(error))
            })
        })
    }
    //取得投票
    getVote() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/" + this.eventID + "/Vote"
                resolve(httpRequest("get", apiUrl, false, {}, [], this.isBeta))
            } catch (error) {
                reject(JSON.parse(error.message))
            }
        })
    }
    //取得投票選項
    getVoteOptions(voteID) {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/" + this.eventID + "/Vote/" + voteID
                resolve(httpRequest("get", apiUrl, false, {}, [], this.isBeta))
            } catch (error) {
                reject(JSON.parse(error.message))
            }
        })
    }
    //投票
    voteIt(voteID, optionID) {
        return new Promise((resolve, reject) => {
            const apiUrl = "/" + this.eventID + "/Vote/" + voteID + "/VoteIt?OptionID=" + optionID
            const headerConfig = [
                {
                    name: "Authorization",
                    value: "bearer " + this.idToken
                }
            ]
            httpRequestPromise("post", apiUrl, true, {}, headerConfig, this.isBeta).then(response => {
                resolve(response)
            }).catch(error => {
                console.log(error)
                alertError(JSON.parse(error))
                reject(JSON.parse(error))
            })
        })
    }
    //Firebase註冊
    newUser(name, mobile) {
        return new Promise((resolve, reject) => {
            const apiUrl = "/Register/NewUser"
            const headerConfig = [
                {
                    name: "Authorization",
                    value: "bearer " + this.idToken
                }
            ]
            const postData = {
                EventID: this.eventID,
                Name: name,
                Mobile: mobile
            }
            httpRequestPromise("post", apiUrl, true, postData, headerConfig, this.isBeta).then(response => {
                resolve(response)
            }).catch(error => {
                alertError(JSON.parse(error))
                reject(JSON.parse(error))
            })
        })
    }
    //修改註冊資料
    editAccount(answer, fileArray = []) {
        return new Promise((resolve, reject) => {
            const apiUrl = "/Account/Edit/Edit"
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
            httpRequestPromise("post", apiUrl, true, postData, headerConfig, this.isBeta).then(response => {
                resolve(response)
            }).catch(error => {
                console.log(error)
                alertError(JSON.parse(error))
                reject(JSON.parse(error))
            })
        })
    }
}

//取得獎項清單
function getLuckyDrawList(eventID, isBeta) {
    const apiUrl = "/" + eventID + "/LuckyDraw"
    return getFetchData("get", apiUrl, [], isBeta)
}
//取得問卷清單
function getQuestList(eventID, isBeta) {
    const apiUrl = "/" + eventID + "/GetQuest"
    return getFetchData("get", apiUrl, [], isBeta)
}
//取得Speaker清單
function getSpeakerList(eventID, isBeta) {
    const apiUrl = "/" + eventID + "/Agenda/Speaker/List"
    return getFetchData("get", apiUrl, [], isBeta)
}
//取得Agenda清單
function getAgendaList(eventID, isBeta) {
    const apiUrl = "/" + eventID + "/Agenda"
    return getFetchData("get", apiUrl, [], isBeta)
}
//取得Event資料
function getEventData(eventID, isBeta) {
    const apiUrl = "/" + eventID
    return getFetchData("get", apiUrl, [], isBeta)
}

