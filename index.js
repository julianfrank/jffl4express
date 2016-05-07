'use strict'

const fs = require('fs')
const inspect = require('util').inspect
const path = require('path')

/*Generic function to read file within express engine declaration...currently planned to be used only for HTML
Add this into express using this statement =>
        'use strict'
        const app=require('express')()
        const loadJFFL=require('jffl4express').loadjffl
        app.set('views', '<./jfflview folder>')
        app.set('view engine', 'jffl')
        app.engine('jffl', loadJFFL)

In your app render using the following command inside the middleware
        res.render(<your jffl>,options,callback with parameters (error,rendered html content))

This sample gets called when any '.jffl' file is rendered Parameters are called directly by express, so no coding needed*/

exports.loadjffl = (filePath, options, callback) => {//std pattern used by / provided by express
    //const params = "{ FilePath: " + filePath + ", Options: " + inspect(options) + ", LocalDir " + path.dirname(filePath) + " }"//Logging purpose only
    //console.info("Going to use Parameters as below:\n" + params)
    const localPath = path.dirname(filePath)

    let parsedOptions = {},//Holder for Parsed Options
        returnHTML = "",//Holder for final HTML document being constucted,
        config = {},//Holder for configuration loaded from jffl file
        runParams = ""//holder to Runtime Paramters provided as part of Options to be injected

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
            case 'string': runParams += "<script>var " + val + "='" + parsedOptions[val] + "'</Script>"; break
            case 'number': runParams += "<script>var " + val + "=" + parsedOptions[val] + "</Script>"; break
            default: runParams += "<script>var " + val + "='" + typeof parsedOptions[val] + "'</Script>"
        }
    })

    //Read the jffl File provided
    fs.readFile(filePath, (err, content) => {
        if (err) {
            return callback(new Error(err.message))
        } else {
            config = JSON.parse(content.toString())

            //Helper Function that takes a Array of files, reads them and returns the content as a single String
            //When only a single file needs to be loaded, push it into a Array when feeding
            const loadFiles = (filesArray) => {
                //console.info('Going to read Array ->' + filesArray)
                return new Promise((resolve, reject) => {
                    let readText = ""
                    Object.keys(filesArray).map((val, ind) => {

                        let fullPath = path.format({ dir: localPath, base: filesArray[val] })
                        //console.info('Going to read File ->' + fullPath)
                        fs.readFile(fullPath, (err, content) => {
                            if (err) {
                                console.error('Error Reading File ' + filesArray[val] + ' Error: ' + err)
                                reject(err)
                            } else {
                                readText += content.toString()
                                if (ind === (filesArray.length - 1)) { resolve(readText) }
                            }
                        })

                    })
                })
            }

            let loadSTD = new Promise((resolve, reject) => {
                if (config.html.std) {
                    loadFiles([config.html.std]).then((fileText) => { resolve(fileText) })
                } else {
                    reject('<!doctype html>')
                }
            })

            let loadHEAD = new Promise((resolve, reject) => {
                let headText = '<HEAD>'
                if (config.html.title) { headText += '<TITLE>' + config.html.title + '</TITLE>' }
                if (config.html.head) {
                    loadFiles(config.html.head)
                        .then((filesText) => {
                            loadFiles(config.js)
                                .then((jsText) => {
                                    if (runParams) {
                                        headText = headText + runParams + jsText
                                    } else {
                                        headText += jsText
                                    }
                                    loadFiles(config.css)
                                        .then((cssText) => {
                                            headText = headText
                                                + '<style>' + cssText + '</style>'
                                                + filesText
                                                + '</HEAD>'
                                            resolve(headText)
                                        }, (err) => { reject(headText += err) })
                                }, (err) => { reject(headText += err) })
                        }, (err) => { reject(headText += '</HEAD>') })
                } else {
                    reject(headText += '</HEAD>')
                }
            })

            let loadBODY = new Promise((resolve, reject) => {
                let bodyText = '<BODY>'
                if (config.html.body) {
                    loadFiles(config.html.body).then((filesText) => {
                        resolve(bodyText + filesText + '</BODY>')
                    }, (err) => {
                        reject(bodyText += '</BODY>')
                    })
                } else {
                    reject(bodyText += '</BODY>')
                }
            })

            Promise.all([loadSTD, loadHEAD, loadBODY]).then((texts) => {
                let rendered = texts[0] + texts[1] + texts[2]
                //console.log('Rendered:', typeof rendered, rendered.toString())
                return callback(null, rendered)
            }, (err) => {
                console.error('Error: ' + err)
                return callback(err, rendered += err)
            })

        }
    })
}