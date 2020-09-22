// 發送request
/*
    type: request type
    url: request URL
    isAsync: 是否非同步
    data: request data
    headerSetting: header資料 [{name:'headerName',value:'headerValue'},{name:'headerName2',value:'headerValue2'}]
*/
export function httpRequest(type = "get", url, isAsync = false, data = {}, headerSettings = [], DomainType = 0) {
    const apiDomain = getDomain(DomainType)
    const xhr = new XMLHttpRequest()
    xhr.open(type, apiDomain + url, isAsync)
    xhr.setRequestHeader("Content-type", "application/json;charset=UTF-8")
    xhr.withCredentials = true
    headerSettings.map(setting => {
        xhr.setRequestHeader(setting.name, setting.value)
    })
    xhr.send(data && JSON.stringify(data))
    if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200 && xhr.readyState === 4) {
            var s = xhr.responseText;
            if (s) {
                return JSON.parse(s)
            } else {
                return ""
            }
        } else {
            if (xhr.response && xhr.response.length) {
                alertError(JSON.parse(xhr.response))
                throw new Error(xhr.response)
            } else {
                const error = {
                    code: xhr.status,
                    message: "發生錯誤"
                }
                alertError(error)
                throw new Error(JSON.stringify(error))
            }
        }
    }
}

export function httpRequestPromise(type = "get", url, isAsync = false, data = {}, headerSettings = [], DomainType = 0, isFormData = false) {
    return new Promise((resolve, reject) => {
        const apiDomain = getDomain(DomainType)
        const xhr = new XMLHttpRequest()
        xhr.open(type, apiDomain + url, isAsync)
        if (isFormData) {
            // xhr.setRequestHeader("Content-type", "multipart/form-data")
            xhr.setRequestHeader("processData", "false")
        } else {
            xhr.setRequestHeader("Content-type", "application/json;charset=UTF-8")
        }
        xhr.withCredentials = true
        headerSettings.map(setting => {
            xhr.setRequestHeader(setting.name, setting.value)
        })
        if (isFormData) {
            xhr.send(data)
        } else {
            xhr.send(data && JSON.stringify(data))
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200 && xhr.readyState === 4) {
                    var s = xhr.responseText;
                    if (s) {
                        resolve(JSON.parse(s))
                    } else {
                        resolve("")
                    }
                } else {
                    setTimeout(() => {
                        if (xhr.response && xhr.response.length) {
                            alertError(JSON.parse(xhr.response))
                            reject(xhr.response)
                        } else {
                            const error = {
                                code: xhr.status,
                                message: "發生錯誤"
                            }
                            alertError(error)
                            reject(JSON.stringify(error))
                        }
                    }, 500)
                }
            }
        }
    })
}
export function getFetchData(type = "get", url, headerSettings = [], DomainType = 0) {
    let header = {
        "Content-type": "application/json;charset=UTF-8"
    }
    const apiDomain = getDomain(DomainType) + url
    headerSettings.map(setting => {
        header[setting.name] = setting.value
    })
    return fetch(apiDomain, {
        method: type,
        headers: header,
        // body: data && JSON.stringify(data),
        mode: "cors",
        credentials: "omit"
    }).then(response => {
        return response
    }).then(response => {
        return response.json()
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
    let errorString = ""
    if (error.Message) {
        errorString += (error.Message + "\n")
    }
    if (error.Errors) {
        error.Errors.map(error => {
            return errorString += ("---" + error.Message + "\n")
        })
    }
    if (!error.Message && !error.Errors) {
        errorString += "操作失敗"
    }
    alert(errorString)
}
function getDomain(domainType) {
    switch (domainType) {
        case 0:
            return "https://capi.meetstat.co"
        case 1:
            return "https://meetstatclientapi-beta.azurewebsites.net"
        case 2:
            return "https://meetstatclientapi-beta2.azurewebsites.net"
        case 3:
            return "https://websocket.meetstat.co"
        default:
            return "https://capi.meetstat.co"
    }
}