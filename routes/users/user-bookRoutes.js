const express = require('express')
const router =  express.Router()

// controllers require
const adminAuthCtrl = require('../../controllers/http/adminAuthController.js')
const bookCtrl = require('../../controllers/http/bookController.js')


// @route    POST api/admin/book/add-topic
// @desc     Add topic for books
// @access   Private
router.post('/add-topic', 
    adminAuthCtrl.tokenVerification,
    bookCtrl.addBookTopic, 
    (req, res) => {    
    res.status(200);
    res.send({
        "message": "Book Topic Addition Successful",
        "topic": req.topic
    })
});

module.exports = router