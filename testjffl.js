'use strict'
const app = require('express')()
const loadJFFL = require('./jffl.js').loadjffl
app.set('views', './')
app.set('view engine', 'jffl')
app.engine('jffl', loadJFFL)

app.use('/', (req, res) => {
    res.render('test', { testvar1: "testvar1", testvar2: 123456789 })
})

app.listen(80, (err) => {
    if (err) {
        console.log('Error while listen' + err)
    } else {
        console.log('listening in 80')
    }
})