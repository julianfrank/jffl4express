'use strict'

const app=require('express')()

const loadHTML=require('../loadhtml.js').loadHTML
app.engine('html', loadHTML)