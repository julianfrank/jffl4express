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
    const params = "{ FilePath: " + filePath + ", Options: " + inspect(options) + " }"
    let parsedOptions = {}

    Object.keys(options).map((val,ind) => { parsedOptions[ind]=val })

    fs.readFile(filePath, function (err, content) {
        if (err) return callback(new Error(err.message))
        let rendered = "<pre>" + content.toString() + "<br>" + params + "</pre>" + "<br>" + JSON.stringify(parsedOptions)
        return callback(null, rendered)
    })
}
module.exports = { loadjffl }