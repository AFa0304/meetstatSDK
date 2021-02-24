// 問卷input onChange處理並return answers
/*
    event:input event
    answers:舊的answers
*/
export function handleAnswerChange(event, answers, isExtensionalValue = false) {
    const target = event.currentTarget
    const questionID = target.getAttribute("name")
    const type = target.type
    const value = target.value
    if (type === "checkbox") {
        const exist_index = answers.findIndex(x => (x.name === questionID && x.value === value))
        const isExist = exist_index !== -1
        const checked = target.checked
        if (checked && !isExist) {
            const obj = {
                "name": questionID,
                "value": value
            }
            answers.push(obj)
        } else if (!checked && isExist) {
            answers.splice(exist_index, 1)
        }
    } else if (type === "file") {
        if (event.target.files[0]) {
            const fileType = event.target.files[0].name.split(".")[event.target.files[0].name.split(".").length - 1]
            const uploadFile = new File([event.target.files[0]], questionID + "." + fileType, { type: event.target.files[0].type })
            const exist_index = answers.findIndex(x => x.name.indexOf(questionID) !== -1)
            const isExist = exist_index !== -1
            if (isExist) {
                answers[exist_index] = uploadFile
            } else {
                answers.push(uploadFile)
            }
        }
    } else { //單選or問答
        let exist_index = answers.findIndex(x => x.name === questionID)

        if (isExtensionalValue) {
            const optionID = target.getAttribute("optionid")
            exist_index = answers.findIndex(x => x.name === questionID && x.value === optionID)
        }

        let isExist = exist_index !== -1

        if (!isExist) {
            const obj = {
                "name": questionID,
                [isExtensionalValue ? "extensionalValue" : "value"]: value
            }
            answers.push(obj)
        } else {
            answers[exist_index][isExtensionalValue ? "extensionalValue" : "value"] = value
            if (!isExtensionalValue) {
                delete answers[exist_index]["extensionalValue"]
            }
        }
    }
    return answers
}

export function handleAnswerChangeByID(questionID, value, answers, isExtensionalValue = false) {
    const exist_index = answers.findIndex(x => x.name === questionID)
    if (exist_index === -1) {
        const obj = {
            "name": questionID,
            [isExtensionalValue ? "extensionalValue" : "value"]: value
        }
        answers.push(obj)
    } else {
        answers[exist_index][isExtensionalValue ? "extensionalValue" : "value"] = value
    }
    return answers
}

export function handleDependentAnswerChangeByID(questionID, value, dependents, dependentGroupID, dependentIndex, isExtensionalValue = false) {
    let _dependents = JSON.parse(JSON.stringify(dependents))
    if (isDependentVaild(_dependents, dependentGroupID, dependentIndex)) {
        const targetRegForm = _dependents.DependentGroup.find(x => x.ID === dependentGroupID).DependentsRegForms[dependentIndex]
        let answers = targetRegForm.FormSubmit.ans ? targetRegForm.FormSubmit.ans : []
        answers = handleAnswerChangeByID(questionID, value, answers, isExtensionalValue)
        return _dependents
    }
}
export function handleDependentAnswerChange(event, dependents, dependentGroupID, dependentIndex, isExtensionalValue = false) {
    let _dependents = JSON.parse(JSON.stringify(dependents))
    if (isDependentVaild(_dependents, dependentGroupID, dependentIndex)) {
        const targetRegForm = _dependents.DependentGroup.find(x => x.ID === dependentGroupID).DependentsRegForms[dependentIndex]
        let answers = targetRegForm.FormSubmit.ans ? targetRegForm.FormSubmit.ans : []
        answers = handleAnswerChange(event, answers, isExtensionalValue)
        return _dependents
    }
}

// 取得URL參數(IE需安裝 url-search-params-polyfill )
export function getURLParams(name) {
    let uri = window.location.search.substring(1)
    let params = new URLSearchParams(uri)
    return params.get(name)
}

// 新增or修改URL參數(若參數已存在會替換掉原本參數，若無則新增)
export function setURLParam(key, value) {
    if (!window.history.pushState) {
        return;
    }
    if (!key) {
        return;
    }
    let url = new URL(window.location.href);
    let params = new window.URLSearchParams(window.location.search);
    if (value === undefined || value === null) {
        params.delete(key);
    } else {
        params.set(key, value);
    }

    url.search = params;
    url = url.toString();
    window.history.replaceState({ url: url }, null, url);
}

// File轉換Base64
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            resolve(reader.result)
        };
        reader.onerror = function (error) {
            reject(error)
            console.log("檔案轉Base64錯誤!", error);
        }
    })
}

// 偵測網址並return HTML DOM <a></a>
export function setUrlToDOM(str) {
    let result = "" + str
    const URLs = result.match(/\bhttps?:\/\/\S+/gi);
    if (URLs) {
        for (var i = 0; i < URLs.length; i++) {
            if (result.indexOf("href=\"" + URLs[i]) === -1) {
                result = result.replace(URLs[i], "<a target='_blank' href='" + URLs[i] + "'>" + URLs[i] + "</a>")
            }
        }
    }
    return result
}


function isDependentVaild(dependent, dependentGroupID, dependentIndex) {
    if (dependent.dependentGroups) {
        let targetDependentGroup = dependent.DependentGroup.find(x => x.ID === dependentGroupID)
        if (targetDependentGroup) {
            if (targetDependentGroup.DependentsRegForms) {
                let targetRegForm = targetDependentGroup.DependentsRegForms[dependentIndex]
                if (targetRegForm) {
                    if (targetRegForm.FormSubmit) {
                        return true
                    } else {
                        console.warn("FormSubmit不存在")
                        return false
                    }
                } else {
                    console.warn("dependentsRegForms[index]不存在")
                    return false
                }
            } else {
                console.warn("找不到dependentsRegForms")
                return false
            }
        } else {
            console.warn("找不到目標dependentGroup")
            return false
        }
    } else {
        console.warn("找不到dependents.dependentGroups")
        return false
    }
}