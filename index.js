export class Trigger{
    constructor(triggerID=""){
        this.triggerID = triggerID
    }
    //觸發Trigger
    trigger(){
        return new Promise((resolve,reject)=>{
            try{
                const apiUrl = "/Trigger/"+this.triggerID
                const tokens = getTriggerToken(this.triggerID)
                const headerSetting = [
                    {
                        name:"RequestToken",
                        value:tokens.RequestToken
                    }
                ]
                resolve(httpRequest("post",apiUrl,false,{},headerSetting))
            }catch(error){
                reject(JSON.parse(error.message))
            }
        })
    }
}
export class Quest {
    constructor(questID=""){
        this.questID = questID
    }
    //取得問卷
    getQuest(){
        return new Promise((resolve,reject)=>{
            try{
                const apiUrl = "/Quest/"+this.questID
                resolve(httpRequest("get",apiUrl))
            }catch(error){
                reject(JSON.parse(error.message))
            }
        })
    }
    //送出問卷
    submitQuest(data){
        return new Promise((resolve,reject)=>{
            try{
                const apiUrl = "/Quest/"+this.questID
                resolve(httpRequest("post",apiUrl,false,data))
            }catch(error){
                reject(JSON.parse(error.message))
            }
        })
    }
    //Email重複檢查
    ckeckEmail(email){
        return new Promise((resolve,reject)=>{
            try{
                const apiUrl = "/Quest/"+this.questID+"/CheckEmail"
                const postData = {
                    "Email":email
                }
                resolve(httpRequest("post",apiUrl,false,postData))
            }catch(error){
                reject(JSON.parse(error.message))
            }
        })
    }
    //資料重複檢查
    checkQuestionUnion(name,value){
        return new Promise((resolve,reject)=>{
            try{
                const apiUrl = "/Quest/"+this.questID+"/CheckQuestionUnion"
                const postData = {
                    "Name": name,
                    "Value": value
                }
                resolve(httpRequest("post",apiUrl,false,postData))
            }catch(error){
                reject(JSON.parse(error.message))
            }
        })
    }
}
export class Event {
    constructor(eventID="",idToken=""){
        this.eventID = eventID
        this.idToken = idToken
        this.agendaList = getAgendaList(eventID)
        this.questList = getQuestList(eventID)
        this.luckyDrawList = getLuckyDrawList(eventID)
    }
    //取得獎品清單
    getLuckyDrawList(){
        return new Promise((resolve,reject)=>{
            try{
                const apiUrl = "/"+this.eventID+"/LuckyDraw"
                resolve(httpRequest("get",apiUrl).Items)
            }catch(error){
                reject(JSON.parse(error.message))
            }
        })
    }
    // 取得Agenda (搜尋ID or 字串 => 若找不到或超過一組則throw error)
    getAgenda(searchStr=""){
        return new Promise((resolve,reject)=>{
            // 傳入後判斷是否為Guid   是=>搜尋ID   否=>搜尋整個Array
            let agendaID = ""
            if(isGuid(searchStr)){
                const result = this.agendaList.find(function(agenda){
                    return agenda.ID === searchStr
                })
                result? agendaID=result.ID : reject(new Error("查無此ID"))
            } else {
                let resultAry = []
                this.agendaList.map((agenda)=>{
                    if(JSON.stringify(agenda).indexOf(searchStr)!==-1){
                        resultAry.push(agenda)
                    }
                    return null
                })
                
                resultAry.length===1? agendaID=resultAry[0].ID : resultAry.length>1?reject(new Error("查到多組包含'"+searchStr+"'的Agenda")) : reject(new Error("查無包含'"+searchStr+"'的Agenda"))
            }
            resolve(httpRequest("get","/"+this.eventID+"/Agenda/"+agendaID))
        })
    }
    // 取得Speaker資料
    getSpeaker(speakerID){
        return new Promise((resolve,reject)=>{
            try{
                const apiUrl = "/"+this.eventID+"/Agenda/Speaker/"+speakerID
                resolve(httpRequest("get",apiUrl))
            }catch(error){
                reject(JSON.parse(error.message))
            }
        })
    }
    // 造訪紀錄
    setVisitRecord(){
        const apiUrl = "/"+this.eventID+"/Analytics"
        const data = {
            "FrontSiteURL": window.location.href
        }
        try{
            httpRequest("post",apiUrl,false,data)
        }catch(error){
            console.log(error)
        }
    }
    //登入活動
    eventLogin(){
        return new Promise((resolve,reject)=>{
            try{
                const apiUrl = "/Account/EventLogin"
                const data = {
                    "EventID": this.eventID
                }
                const headerConfig = [
                    {
                        name:"Authorization",
                        value:"bearer "+this.idToken
                    }
                ]
                resolve(httpRequest("post",apiUrl,false,data,headerConfig))
            }catch(error){
                reject(JSON.parse(error.message))
            }
        })
    }
    //取得Firebase帳戶資料
    getAccountInfo(){
        return new Promise((resolve,reject)=>{
            try{
                const apiUrl = "/Account/Info"
                const headerConfig = [
                    {
                        name:"Authorization",
                        value:"bearer "+this.idToken
                    }
                ]
                resolve(httpRequest("get",apiUrl,false,{},headerConfig))
            }catch(error){
                reject(JSON.parse(error.message))
            }
        })
    }
    getRegData(){
        return new Promise((resolve,reject)=>{
            try{
                const apiUrl = "/Account/RegData"
                const headerConfig = [
                    {
                        name:"Authorization",
                        value:"bearer "+this.idToken
                    }
                ]
                resolve(httpRequest("get",apiUrl,false,{},headerConfig))
            }catch(error){
                reject(JSON.parse(error.message))
            }
        })
    }
    //取得QR Code&票卷
    getTickets(){
        return new Promise((resolve,reject)=>{
            try{
                const apiUrl = "/Ticket"
                const headerConfig = [
                    {
                        name:"Authorization",
                        value:"bearer "+this.idToken
                    }
                ]
                resolve(httpRequest("get",apiUrl,false,{},headerConfig))
            }catch(error){
                reject(JSON.parse(error.message))
            }
        })
    }
}
// 取得Trigger AntiforgeryToken
function getTriggerToken(triggerID){
    try{
        const apiUrl = "/Trigger/"+triggerID
        return (httpRequest("get",apiUrl))
    }catch(error){
        return (JSON.parse(error.message))
    }
}
//取得獎項清單
function getLuckyDrawList(eventID){
    const apiUrl = "/"+eventID+"/LuckyDraw"
    return (httpRequest("get",apiUrl).Items)
}
//取得問卷清單
function getQuestList(eventID){
    const apiUrl = "/" + eventID + "/GetQuest"
    return (httpRequest("get",apiUrl).Items)
}
// 取得Agenda清單
function getAgendaList(eventID){
    const apiUrl = "/" + eventID + "/Agenda"
    return (httpRequest("get",apiUrl).Agendas)
}
// 是否為Guid形式
function isGuid(testID) {
    var reg = new RegExp(/^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/);
    if (reg.test(testID)) {
        return true;
    }
    return false;
}
// 發送request
/*
    type: request type
    url: request URL
    isAsync: 是否非同步
    data: request data
    headerSetting: header資料 [{name:'headerName',value:'headerValue'},{name:'headerName2',value:'headerValue2'}]
*/
function httpRequest(type="get",url,isAsync=false,data={},headerSettings=[]){
    const apiDomain = "https://capibeta.meetstat.co"
    const xhr = new XMLHttpRequest()
    xhr.open(type,apiDomain+url,isAsync)
    xhr.setRequestHeader("Content-type", "application/json;charset=UTF-8")
    xhr.withCredentials = true 
    headerSettings.map(setting=>{
        xhr.setRequestHeader(setting.name,setting.value)
    })
    xhr.send(data&&JSON.stringify(data))
    if(xhr.status===200 && xhr.readyState===4){
        var s = xhr.responseText;
        return JSON.parse(s)
    }else{
        if(xhr.response){
            console.log(JSON.parse(xhr.response))
            throw new Error(xhr.response)
        }else{
            throw new Error(xhr)
        }
    }
}