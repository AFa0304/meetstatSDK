import {httpRequest} from '../utils/utils'

export default class Trigger{
    constructor(triggerID="",isBeta=false){
        this.triggerID = triggerID
        this.isBeta = isBeta
    }
    //觸發Trigger
    trigger(){
        return new Promise((resolve,reject)=>{
            try{
                const apiUrl = "/Trigger/"+this.triggerID
                const tokens = getTriggerToken(this.triggerID,this.isBeta)
                const headerSetting = [
                    {
                        name:"RequestToken",
                        value:tokens.RequestToken
                    }
                ]
                resolve(httpRequest("post",apiUrl,false,{},headerSetting,this.isBeta))
            }catch(error){
                reject(JSON.parse(error.message))
            }
        })
    }
}

// 取得Trigger AntiforgeryToken
function getTriggerToken(triggerID,isBeta){
    try{
        const apiUrl = "/Trigger/"+triggerID
        return (httpRequest("get",apiUrl,false,{},[],isBeta))
    }catch(error){
        return (JSON.parse(error.message))
    }
}