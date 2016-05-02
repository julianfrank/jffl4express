'use strict'

const fs = require('fs')
const inspect = require('util').inspect

/*Generic function to read file within express engine declaration...currently planned to be used only for HTML
Add this into express using this statement =>
        'use strict'
        const app=require('express')()
        const loadJFFL=require('./jffl.js').loadjffl
        app.set('views', './')
        app.set('view engine', 'jffl')
        app.engine('jffl', loadJFFL)

In your app render using the following command inside the middleware
        res.render(<your jffl>,options,callback with parameters (error,rendered html content))

This sample gets called when any '.jfml' file is rendered Parameters are called directly by express, so no coding needed*/

function loadjffl(filePath, options, callback) {//std pattern used by / provided by express
    const params = "{ FilePath: " + filePath + ", Options: " + inspect(options) + " }"//Logging purpose only
    let parsedOptions = {},//Holder for Parsed Options
        returnHTML = "",//Holder for final HTML document being constucted,
        config = {}

    //Read the File provided
    fs.readFile(filePath, (err, content) => {
        if (err) {
            return callback(new Error(err.message))
        } else {
            config = JSON.parse(content.toString())
            let rendered = "<pre>" + JSON.stringify(config) + "<br>" + JSON.stringify(parsedOptions) + "</pre>" + "<br>"

            let loadFiles = (filesArray) => {
                return new Promise((resolve, reject) => {
                    let readText = "", readComplete = false
                    Object.keys(filesArray).map((val, ind) => {
                        console.log('readText:', typeof filesArray[val], filesArray[val])
                        fs.readFile(filesArray[val], (err, content) => {
                            if (err) {
                                reject(err)
                            } else {
                                console.log('readText:', typeof content, content.toString())
                                readText += content.toString()
                                if (ind === filesArray.length) { readComplete = true }
                            }
                        })
                    })
                    if (readComplete) { resolve(readText) }
                })
            }

            let loadSTD = new Promise((resolve, reject) => {
                if (config.html.std) {
                    fs.readFile(config.html.std, (err, stdText) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(stdText.toString())
                        }
                    })
                }
            })

            let loadHEAD = new Promise((resolve, reject) => {
                let headText = '<HEAD><TITLE>' + config.html.title + '</TITLE>'
                if (config.html.head) {
                    loadFiles(config.html.head).then((filesText) => {
                        headText += filesText + '</HEAD>'
                        console.log('headText:', typeof headText, headText)
                        resolve(headText)
                    })
                }
            })

            Promise.all([loadSTD, loadHEAD]).then((texts) => {
                rendered = texts[0] + texts[1] + rendered
                console.log('Rendered:', typeof rendered, rendered.toString())
                return callback(null, rendered)
            }, (err) => {
                return callback(err, rendered += err)
            })

        }
    })

    //Obtain new variables to be injected
    Object.keys(options).map((val) => {
        switch (val) {
            case 'settings': break
            case '_locals': break
            case 'cache': break
            default: parsedOptions[val] = options[val]
        }
    })

    //Inject Parsed Options into HTML Document
    Object.keys(parsedOptions).map((val) => {
        switch (typeof parsedOptions[val]) {
            case 'string': returnHTML += "<script>var " + val + "='" + parsedOptions[val] + "'</Script>"; break
            case 'number': returnHTML += "<script>var " + val + "=" + parsedOptions[val] + "</Script>"; break
            default: returnHTML += "<script>var " + val + "='" + typeof parsedOptions[val] + "'</Script>"
        }
        returnHTML += "<label value=" + parsedOptions[val] + "></label>"
    })


}
module.exports = { loadjffl }