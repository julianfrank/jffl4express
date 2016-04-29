'use strict'

const fs = require('fs')

/*Generic function to read file within express engine declaration...currently planned to be used only for HTML
Add this into express using this statement =>
const loadHTML=require('loadhtml').loadHTML
app.engine('html', loadHTML)

This sample gets called when any '.html' file is rendered Parameters are called directly by express, so no coding needed*/

function loadHTML(filePath, options, callback) {//std pattern used by / provided by express
    fs.readFile(filePath, function (err, content) {
        if (err) return callback(new Error(err.message))
        // this is an extremely simple template engine
        let rendered = content.toString()
        return callback(null, rendered)
    })
}
module.exports = { loadHTML }