const express = require('express')
const router =  express.Router()

// controllers require
const adminAuthCtrl = require('../../controllers/http/adminAuthController.js')
const bookCtrl = require('../../controllers/http/bookController.js')



module.exports = router