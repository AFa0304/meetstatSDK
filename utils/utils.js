// 發送request
/*
    type: request type
    url: request URL
    isAsync: 是否非同步
    data: request data
    headerSetting: header資料 [{name:'headerName',value:'headerValue'},{name:'headerName2',value:'headerValue2'}]
*/
export function httpRequest(type = "get", url, isAsync = false, data = {}, headerSettings = [], isBeta = false) {
    const apiDomain = isBeta ? "https://capibeta.meetstat.co" : "https://capi.meetstat.co"
    const xhr = new XMLHttpRequest()
    xhr.open(type, apiDomain + url, isAsync)
    xhr.setRequestHeader("Content-type", "application/json;charset=UTF-8")
    xhr.withCredentials = true
    headerSettings.map(setting => {
        xhr.setRequestHeader(setting.name, setting.value)
    })
    xhr.send(data && JSON.stringify(data))
    if (xhr.status === 200 && xhr.readyState === 4) {
        var s = xhr.responseText;
        return JSON.parse(s)
    } else {
        if (xhr.response) {
            throw new Error(xhr.response)
        } else {
            throw new Error(xhr)
        }
    }
}
export function httpRequestPromise(type = "get", url, isAsync = false, data = {}, headerSettings = [], isBeta = false) {
    return new Promise((resolve, reject) => {
        const apiDomain = isBeta ? "https://capibeta.meetstat.co" : "https://capi.meetstat.co"
        const xhr = new XMLHttpRequest()
        xhr.open(type, apiDomain + url, isAsync)
        xhr.setRequestHeader("Content-type", "application/json;charset=UTF-8")
        xhr.withCredentials = true
        headerSettings.map(setting => {
            xhr.setRequestHeader(setting.name, setting.value)
        })
        xhr.send(data && JSON.stringify(data))
        if (xhr.status === 200 && xhr.readyState === 4) {
            var s = xhr.responseText;
            resolve(JSON.parse(s))
        } else {
            setTimeout(() => {
                if (xhr.response) {
                    reject(xhr.response)
                } else {
                    reject(new Error(JSON.stringify(xhr)))
                }
            }, 500)
        }
    })
}
export function getFetchData(type = "get", url, headerSettings = [], isBeta = false) {
    let header = {
        "Content-type": "application/json;charset=UTF-8"
    }
    const apiDomain = (isBeta ? "https://capibeta.meetstat.co" : "https://capi.meetstat.co") + url
    headerSettings.map(setting => {
        header[setting.name] = setting.value
    })
    return fetch(apiDomain, {
        method: type,
        // body: data && JSON.stringify(data),
        mode:"cors",
        credentials:"omit"
    }).then(response => {
        return response.json()
    }).catch(error=>{
        console.log(error)
    })
}

// 是否為Guid形式
export function isGuid(testID) {
    var reg = new RegExp(/^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/);
    if (reg.test(testID)) {
        return true;
    }
    return false;
}
// 彈跳request錯誤訊息
export function alertError(error) {
    alert(error.Errors ? error.Errors.length > 0 ? error.Errors[0].Message : error.Message ? error.Message : "操作失敗" : error.Message ? error.Message : "操作失敗")
    console.log(error.Message)
}