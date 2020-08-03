import { isGuid, httpRequest, alertError, httpRequestPromise, getFetchData } from '../utils/utils'
import { auth } from '../../firebase'

export default class Event {
    constructor(eventID = "", idToken = "", DomainType = 0) {
        this.DomainType = DomainType
        this.eventID = eventID
        this.idToken = idToken
        this.speakerList = []
        this.agendaList = []
        this.questList = []
        this.luckyDrawList = []
        this.eventData = {}
        this.apiVersion = undefined
    }
    async init() {
        const DomainType = this.DomainType
        const eventID = this.eventID
        let headerConfig = []
        if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
        const taskList = [
            getSpeakerList(eventID, DomainType, headerConfig),
            getAgendaList(eventID, DomainType, headerConfig),
            getQuestList(eventID, DomainType, headerConfig),
            getLuckyDrawList(eventID, DomainType, headerConfig),
            getEventData(eventID, DomainType, headerConfig)
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
                let headerConfig = []
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                resolve(httpRequest("get", apiUrl, false, {}, headerConfig, this.DomainType))
            } catch (error) {
                reject(JSON.parse(error.message))
            }
        })
    }
    //檢查Email是否已被註冊
    checkEmailExist(email) {
        return new Promise((resolve, reject) => {
            const postData = {
                "email": email
            }
            let apiUrl = "/" + this.eventID + "/Customize/CheckEmailExist"
            let headerConfig = []
            if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
            httpRequestPromise("post", apiUrl, true, postData, headerConfig, this.DomainType, false).then(response => {
                resolve(response)
            }).catch(error => {
                let jsonErr = null
                try {
                    jsonErr = JSON.parse(error)
                    reject(jsonErr)
                } catch (err) {
                    console.log(err)
                    reject(error)
                }
            })
        })
    }
    //Client CheckIn
    clientCheckIn(agendaID, checkInType) {
        return new Promise((resolve, reject) => {
            this.eventLogin().then(() => {
                let apiUrl = "/ClientCheckin/CheckIn" + "?CheckInType=" + checkInType
                let headerConfig = [
                    {
                        name: "Authorization",
                        value: "bearer " + this.idToken
                    }
                ]
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                if (agendaID) {
                    apiUrl += "&AgendaID=" + agendaID
                }
                httpRequestPromise("post", apiUrl, true, {}, headerConfig, this.DomainType).then(response => {
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
        })
    }
    //取得CheckIn資料
    getClientCheckIn() {
        return new Promise((resolve, reject) => {
            this.eventLogin().then(() => {
                try {
                    const apiUrl = "/ClientCheckin"
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
        })
    }
    //取得註冊表單
    getRegQuest() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/" + this.eventID + "/EventReg"
                let headerConfig = []
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                resolve(httpRequest("get", apiUrl, false, {}, headerConfig, this.DomainType))
            } catch (error) {
                reject(JSON.parse(error.message))
            }
        })
    }
    //送出註冊表單
    submitRegQuest(answer, fileArray = [], isAlertError = true) {
        return new Promise((resolve, reject) => {
            const apiUrl = "/" + this.eventID + "/EventReg"
            const postData = new FormData()
            let headerConfig = []
            if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
            postData.append("AnsJSON", JSON.stringify(answer))
            for (var i = 0; i < fileArray.length; i++) {
                postData.append("Files", fileArray[i])
            }
            httpRequestPromise("post", apiUrl, true, postData, headerConfig, this.DomainType, true).then(response => {
                resolve(response)
            }).catch(error => {
                let jsonErr = null
                try {
                    jsonErr = JSON.parse(error)
                    if (isAlertError) { alertError(jsonErr) }
                    reject(jsonErr)
                } catch (err) {
                    //錯誤response非Object時
                    console.log(err)
                    if (isAlertError) { alert("送出失敗") }
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
                let headerConfig = []
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                resolve(httpRequest("get", apiUrl, false, {}, headerConfig, this.DomainType).Items)
            } catch (error) {
                reject(JSON.parse(error.message))
            }
        })
    }
    //查詢中獎物品
    getDrawItem() {
        return new Promise((resolve, reject) => {
            this.eventLogin().then(() => {
                try {
                    const apiUrl = "/" + this.eventID + "/LuckyDraw/MyDrawItem"
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
        })
    }
    // 取得Agenda (搜尋ID or 字串 => 若找不到或超過一組則throw error)
    getAgenda(searchStr = "") {
        return new Promise((resolve, reject) => {
            // 傳入後判斷是否為Guid   是=>搜尋ID   否=>搜尋整個Array
            let agendaID = ""
            let headerConfig = []
            if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
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
            resolve(httpRequest("get", "/" + this.eventID + "/Agenda/" + agendaID, false, {}, headerConfig, this.DomainType))
        })
    }
    // 取得Speaker資料
    getSpeaker(speakerID) {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/" + this.eventID + "/Agenda/Speaker/" + speakerID
                let headerConfig = []
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                resolve(httpRequest("get", apiUrl, false, {}, headerConfig, this.DomainType))
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
            let headerConfig = []
            if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
            httpRequest("post", apiUrl, false, data, headerConfig, this.DomainType)
        } catch (error) {
            console.log(error)
        }
    }
    //登入活動
    eventLogin(isAlertError = true) {
        return new Promise((resolve, reject) => {
            const event = this
            const apiUrl = "/Account/EventLogin"
            const postData = {
                "EventID": this.eventID
            }
            let headerConfig = [
                {
                    name: "Authorization",
                    value: "bearer " + this.idToken
                }
            ]
            if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
            httpRequestPromise("post", apiUrl, true, postData, headerConfig, this.DomainType).then(response => {
                auth().signInWithCustomToken(response.EventAccessToken).then(function () {
                    auth().currentUser.getIdToken().then(function (newIdToken) {
                        event.idToken = newIdToken
                        resolve(response)
                    })
                })
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
            this.eventLogin().then(() => {
                const apiUrl = "/Account/MeetLogin"
                let headerConfig = [
                    {
                        name: "Authorization",
                        value: "bearer " + this.idToken
                    }
                ]
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                httpRequestPromise("post", apiUrl, true, {}, headerConfig, this.DomainType).then(response => {
                    resolve(response)
                }).catch(error => {
                    if (isAlertError) {
                        alertError(JSON.parse(error))
                    }
                    reject(JSON.parse(error))
                })
            })
        })
    }
    //取得Firebase帳戶資料
    getAccountInfo() {
        return new Promise((resolve, reject) => {
            this.eventLogin().then(() => {
                try {
                    const apiUrl = "/Account/FirebaseInfo"
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
        })
    }
    getUserRegDataEmailName(email, name) {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/" + this.eventID + "/Customize/UserRegData_EmailName"
                const postData = {
                    "Email": email,
                    "Name": name
                }
                let headerConfig = [
                    {
                        name: "Authorization",
                        value: "bearer " + this.idToken
                    }
                ]
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                resolve(httpRequest("post", apiUrl, false, postData, headerConfig, this.DomainType))
            } catch (error) {
                reject(JSON.parse(error.message))
            }
        })
    }
    getUserRegDataNameMobile(mobile, name) {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/" + this.eventID + "/Customize/UserRegData_NameMobile"
                const postData = {
                    "Mobile": mobile,
                    "Name": name
                }
                let headerConfig = [
                    {
                        name: "Authorization",
                        value: "bearer " + this.idToken
                    }
                ]
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                resolve(httpRequest("post", apiUrl, false, postData, headerConfig, this.DomainType))
            } catch (error) {
                reject(JSON.parse(error.message))
            }
        })
    }
    getRegData() {
        return new Promise((resolve, reject) => {
            this.eventLogin().then(() => {
                try {
                    const apiUrl = "/Account/RegData"
                    let headerConfig = [
                        {
                            name: "Authorization",
                            value: "bearer " + this.idToken
                        }
                    ]
                    if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                    resolve(httpRequest("get", apiUrl, false, {}, headerConfig, this.DomainType))
                } catch (error) {
                    console.log(error)
                    let jsonErr = null
                    try {
                        jsonErr = JSON.parse(error)
                        console.log(jsonErr)
                        reject(jsonErr)
                    } catch (err) {
                        //錯誤response非Object時
                        console.log(err)
                        reject({
                            message: "發生錯誤"
                        })
                    }
                    // reject(JSON.parse(error.message))
                }
            })
        })
    }
    //取得QR Code&票卷
    getTickets() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/Ticket"
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
    //取得會議室連結
    getMeet() {
        return new Promise((resolve, reject) => {
            this.eventLogin().then(() => {
                try {
                    const apiUrl = "/Meet"
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
        })
    }
    //取得Mosaic預覽圖
    getMosaicFullImage(mosaicID) {
        return new Promise((resolve, reject) => {
            this.eventLogin().then(() => {
                try {
                    const apiUrl = "/" + this.eventID + "/Mosaic/" + mosaicID + "/GetClientFullImage"
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
        })
    }
    //上傳Mosaic預覽圖
    uploadMosaicTile(mosaicID, base64) {
        return new Promise((resolve, reject) => {
            this.eventLogin().then(() => {
                const apiUrl = "/" + this.eventID + "/Mosaic/" + mosaicID + "/UploadTileImage_FullImage"
                const postData = {
                    "ImageBase64": base64
                }
                let headerConfig = [
                    {
                        name: "Authorization",
                        value: "bearer " + this.idToken
                    }
                ]
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                httpRequestPromise("post", apiUrl, true, postData, headerConfig, this.DomainType).then(response => {
                    resolve(response)
                }).catch(error => {
                    alertError(JSON.parse(error))
                    reject(JSON.parse(error))
                })
            })
        })
    }
    //取得投票
    getVote() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/" + this.eventID + "/Vote"
                let headerConfig = []
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                resolve(httpRequest("get", apiUrl, false, {}, headerConfig, this.DomainType))
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
                let headerConfig = []
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                resolve(httpRequest("get", apiUrl, false, {}, headerConfig, this.DomainType))
            } catch (error) {
                reject(JSON.parse(error.message))
            }
        })
    }
    //投票
    voteIt(voteID, optionID) {
        return new Promise((resolve, reject) => {
            this.eventLogin().then(() => {
                const apiUrl = "/" + this.eventID + "/Vote/" + voteID + "/VoteIt?OptionID=" + optionID
                let headerConfig = [
                    {
                        name: "Authorization",
                        value: "bearer " + this.idToken
                    }
                ]
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                httpRequestPromise("post", apiUrl, true, {}, headerConfig, this.DomainType).then(response => {
                    resolve(response)
                }).catch(error => {
                    console.log(error)
                    alertError(JSON.parse(error))
                    reject(JSON.parse(error))
                })
            })
        })
    }
    //Firebase註冊
    newUser(name, mobile) {
        return new Promise((resolve, reject) => {
            const apiUrl = "/Register/NewUser"
            const postData = {
                EventID: this.eventID,
                Name: name,
                Mobile: mobile
            }
            let headerConfig = [
                {
                    name: "Authorization",
                    value: "bearer " + this.idToken
                }
            ]
            if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
            httpRequestPromise("post", apiUrl, true, postData, headerConfig, this.DomainType).then(response => {
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
            this.eventLogin().then(() => {
                const apiUrl = "/Account/Edit"
                let postData = new FormData()
                postData.append("AnsJSON", JSON.stringify(answer))
                for (var i = 0; i < fileArray.length; i++) {
                    postData.append("Files", fileArray[i])
                }
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
        })
    }
    getEditData() {
        return new Promise((resolve, reject) => {
            this.eventLogin().then(() => {
                try {
                    const apiUrl = "/Account/Edit"
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
        })
    }
}

//取得獎項清單
function getLuckyDrawList(eventID, DomainType, headerConfig = []) {
    const apiUrl = "/" + eventID + "/LuckyDraw"
    return getFetchData("get", apiUrl, headerConfig, DomainType)
}
//取得問卷清單
function getQuestList(eventID, DomainType, headerConfig = []) {
    const apiUrl = "/" + eventID + "/GetQuest"
    return getFetchData("get", apiUrl, headerConfig, DomainType)
}
//取得Speaker清單
function getSpeakerList(eventID, DomainType, headerConfig = []) {
    const apiUrl = "/" + eventID + "/Agenda/Speaker/List"
    return getFetchData("get", apiUrl, headerConfig, DomainType)
}
//取得Agenda清單
function getAgendaList(eventID, DomainType, headerConfig = []) {
    const apiUrl = "/" + eventID + "/Agenda"
    return getFetchData("get", apiUrl, headerConfig, DomainType)
}
//取得Event資料
function getEventData(eventID, DomainType, headerConfig = []) {
    const apiUrl = "/" + eventID
    return getFetchData("get", apiUrl, headerConfig, DomainType)
}

