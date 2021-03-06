import { httpRequestPromise, getFetchData, eventLogin, getErrorMessage } from '../utils/utils'
import '../css/draw.css'

export default class Draw {
    constructor(eventID = "", drawID = "", idToken = "", DomainType = 0) {
        this.DomainType = DomainType
        this.eventID = eventID
        this.drawID = drawID
        this.idToken = idToken
        this.apiVersion = undefined
        // draw
        this.drawDatas = undefined
        this.templates = undefined
        this.graffitiWall = undefined
        this.selectedTemplateID = ""
    }
    async init(dom) {   // ※要先event login完
        const taskList = [
            this.getDrawData(),
            this.getTemplates(),
            this.getGraffitiWall()
        ]
        await Promise.all(taskList).then(response => {
            this.drawDatas = response[0]
            this.templates = response[1]
            this.graffitiWall = response[2]
            if (dom) {
                const container = document.createElement("div")
                container.id = "draw-container"
                container.style.paddingBottom = (this.drawDatas.Height / this.drawDatas.Width) * 100 + "%"
                dom.appendChild(container)
            }
        }).catch(error => {
            throw (JSON.stringify({ Message: error.toString() }))
        })
    }
    //更改template
    changeTemplate(templateID) {
        let targetTemplate = this.templates.Items.find(x => x.ID === templateID)
        if (targetTemplate) {
            this.selectedTemplateID = templateID
            document.getElementById("draw-container").style.backgroundImage = "url(" + targetTemplate.URL + ")"
        } else {
            alert("查無此template")
        }
    }
    //取得draw data
    getDrawData() {
        return new Promise((resolve, reject) => {
            try {
                let apiUrl = "/Draw/" + this.drawID
                let headerConfig = [
                    {
                        name: "Authorization",
                        value: "bearer " + this.idToken
                    }
                ]
                if (this.eventID) { apiUrl += ("?eventID=" + this.eventID) }
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                resolve(getFetchData("get", apiUrl, headerConfig, this.DomainType))
                // resolve(httpRequest("get", apiUrl, false, {}, headerConfig, this.DomainType))
            } catch (error) {
                reject(getErrorMessage(error))
            }
        })
    }
    //取得template list
    getTemplates() {
        return new Promise((resolve, reject) => {
            try {
                let apiUrl = "/Draw/" + this.drawID + "/Template"
                let headerConfig = [
                    {
                        name: "Authorization",
                        value: "bearer " + this.idToken
                    }
                ]
                if (this.eventID) { apiUrl += ("?eventID=" + this.eventID) }
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                resolve(getFetchData("get", apiUrl, headerConfig, this.DomainType))
                // resolve(httpRequest("get", apiUrl, false, {}, headerConfig, this.DomainType))
            } catch (error) {
                reject(getErrorMessage(error))
            }
        })
    }
    //取得Draw塗鴉牆
    getGraffitiWall() {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = "/Draw/" + this.drawID + "/GraffitiWall?eventID=" + this.eventID
                let headerConfig = [
                    {
                        name: "Authorization",
                        value: "bearer " + this.idToken
                    }
                ]
                if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
                resolve(getFetchData("get", apiUrl, headerConfig, this.DomainType))
                // resolve(httpRequest("get", apiUrl, false, {}, headerConfig, this.DomainType))
            } catch (error) {
                reject(getErrorMessage(error))
            }
        })
    }
    //繪圖
    drawTextToPng() {
        return new Promise((resolve, reject) => {
            function getDrawTextDatas() {
                let _drawTexts = []
                const containerStyles = window.getComputedStyle(document.getElementById("draw-container"))
                const containerWidth = parseInt(containerStyles.width.replace("px", ""))
                const containerHeight = parseInt(containerStyles.width.replace("px", ""))
                const allText = document.getElementsByClassName("draw-text")
                allText.forEach(textRef => {
                    if (textRef.nodeName === "DIV") {
                        if (textRef.textContent.length) {
                            const textStyles = window.getComputedStyle(textRef)
                            const text_x = parseInt(textStyles.left.replace("px", ""))
                            const text_y = parseInt(textStyles.top.replace("px", ""))
                            const text_fontSize = parseInt(window.getComputedStyle(textRef.childNodes[0]).fontSize.replace("px", ""))
                            let textDatas = {
                                "fontRatio": text_fontSize / containerWidth,
                                "fontColorHex": rgbToHex(window.getComputedStyle(textRef.childNodes[0]).color),
                                "text": textRef.childNodes[0].innerHTML.replace(/<br>/g, "\n"),
                                "textName": textRef.getAttribute("name"),
                                "type": textRef.getAttribute("drawType"),
                                "textPointX": text_x,
                                "textPointY": text_y,
                                "drawWidth": containerWidth,
                                "drawHeight": containerHeight
                            }
                            if (textRef.getAttribute("frameStart")) { textDatas["FrameStart"] = textRef.getAttribute("frameStart") }
                            if (textRef.getAttribute("frameEnd")) { textDatas["FrameEnd"] = textRef.getAttribute("frameEnd") }
                            return _drawTexts.push(textDatas)
                        }
                    } else {
                        const textStyles = window.getComputedStyle(textRef)
                        const text_x = parseInt(textStyles.left.replace("px", ""))
                        const text_y = parseInt(textStyles.top.replace("px", ""))
                        const text_fontSize = parseInt(window.getComputedStyle(textRef).fontSize.replace("px", ""))
                        let textDatas = {
                            "fontRatio": text_fontSize / containerWidth,
                            "fontColorHex": rgbToHex(window.getComputedStyle(textRef.childNodes[0]).color),
                            "text": textRef.value,
                            "textName": textRef.getAttribute("name"),
                            "type": textRef.getAttribute("drawType"),
                            "textPointX": text_x,
                            "textPointY": text_y,
                            "drawWidth": containerWidth,
                            "drawHeight": containerHeight
                        }
                        if (textRef.getAttribute("frameStart")) { textDatas["FrameStart"] = textRef.getAttribute("frameStart") }
                        if (textRef.getAttribute("frameEnd")) { textDatas["FrameEnd"] = textRef.getAttribute("frameEnd") }
                        return _drawTexts.push(textDatas)
                    }
                });
                return _drawTexts
            }
            let apiUrl = "/Draw/" + this.drawID + "/DrawText"
            const postDatas = {
                "templateID": this.selectedTemplateID,
                "drawTexts": getDrawTextDatas(),
                "outputWidth": this.drawDatas.Width,
                "outputHeight": this.drawDatas.Height
            }
            let headerConfig = [
                {
                    name: "Authorization",
                    value: "bearer " + this.idToken
                }
            ]
            if (this.eventID) { apiUrl += ("?eventID=" + this.eventID) }
            if (this.apiVersion) { headerConfig.push({ name: "api-version", value: this.apiVersion }) }
            httpRequestPromise("post", apiUrl, true, postDatas, headerConfig, this.DomainType).then(response => {
                resolve(response)
            }).catch(error => {
                reject(getErrorMessage(error))
            })
        })
    }
    //登入活動
    eventLogin() {
        return new Promise((resolve, reject) => {
            eventLogin(this.eventID, this.idToken, this.apiVersion, this.DomainType).then((eventToken) => {
                this.idToken = eventToken
                resolve(eventToken)
            }).catch(error => {
                reject(getErrorMessage(error).message)
            })
        })
    }
}

export class DrawText {
    constructor(x = 0, y = 0, fontSize = 16, fontColor = "#ffffff", initText = "", textName = "", frameStart = undefined, frameEnd = undefined, type = 1, drawType = 1) {
        this.id = ""
        this.x = x
        this.y = y
        this.fontSize = fontSize
        this.fontColor = fontColor
        this.text = initText
        this.textName = textName
        this.frameStart = frameStart
        this.frameEnd = frameEnd
        this.type = type  // 1=div  2=textarea
        this.drawType = drawType // 1=text  2=image
        this.init()
    }
    init() {
        const container = document.getElementById("draw-container")
        if (container) {
            const allText = document.getElementsByClassName("draw-text")
            const textDom = document.createElement(this.type === 1 ? "div" : "textarea")
            textDom.className = "draw-text"
            textDom.setAttribute("name", this.textName)
            textDom.setAttribute("drawType", this.drawType)
            textDom.id = "draw-text-" + (allText.length + 1)
            textDom.style.left = this.x + "%"
            textDom.style.top = this.y + "%"
            this.id = textDom.id
            if (this.frameStart) { textDom.setAttribute("frameStart", this.frameStart) }
            if (this.frameEnd) { textDom.setAttribute("frameEnd", this.frameEnd) }
            if (this.type === 1) {
                const pre = document.createElement("pre")
                pre.style.fontSize = this.fontSize + "px"
                pre.style.color = this.fontColor
                pre.style.wordBreak = "break-all"
                pre.style.lineHeight = 1.2
                pre.style.overflow = "visible"
                pre.style.fontWeight = "bold"
                pre.style.margin = 0
                pre.innerText = this.text
                textDom.appendChild(pre)
            }
            if (this.type === 2) {
                textDom.style.fontSize = this.fontSize + "px"
                textDom.style.color = this.fontColor
                textDom.style.wordBreak = "break-all"
                textDom.style.lineHeight = 1.2
                textDom.style.overflow = "visible"
                textDom.style.fontWeight = "bold"
                textDom.value = this.text
            }

            container.appendChild(textDom)
        }
    }
    inputText(text) {
        this.text = text
        if (this.type === 1) {
            document.getElementById(this.id).childNodes[0].innerText = text
        } else {
            document.getElementById(this.id).value = text
        }
    }
}

function rgbToHex(color) {
    color = "" + color;
    if (!color || color.indexOf("rgb") < 0) {
        return;
    }

    if (color.charAt(0) == "#") {
        return color;
    }

    var nums = /(.*?)rgb\((\d+),\s*(\d+),\s*(\d+)\)/i.exec(color),
        r = parseInt(nums[2], 10).toString(16),
        g = parseInt(nums[3], 10).toString(16),
        b = parseInt(nums[4], 10).toString(16);

    return "#" + (
        (r.length == 1 ? "0" + r : r) +
        (g.length == 1 ? "0" + g : g) +
        (b.length == 1 ? "0" + b : b)
    );
}