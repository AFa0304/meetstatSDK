// 問卷input onChange處理並return answers
/*
    event:input event
    answers:舊的answers
*/
export function handleAnswerChange(event, answers) {
    const target = event.currentTarget
    const questionID = target.getAttribute("name")
    const type = target.type
    const value = target.value
    let isExist = false
    if (type === "checkbox") {
        const checked = target.checked
        let exist_index = 0
        answers.map((answer, index) => {
            if (answer.name === questionID && answer.value === value) {
                isExist = true
                exist_index = index
            }
            return null
        })
        if (checked && !isExist) {
            const obj = {
                "name": questionID,
                "value": value
            }
            answers.push(obj)
        } else if (!checked && isExist) {
            answers.splice(exist_index, 1)
        }
    } else { //單選or問答
        answers.map((answer) => {
            if (answer.name === questionID) {
                isExist = true
                answer.value = value
            }
            return null
        })
        if (!isExist) {
            const obj = {
                "name": questionID,
                "value": value
            }
            answers.push(obj)
        }
    }
    return answers
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

