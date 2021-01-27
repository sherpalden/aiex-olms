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


// @route    POST api/admin/book/rename-topic
// @desc     Rename a book topic
// @access   Private
router.put('/rename-topic', 
    adminAuthCtrl.tokenVerification,
    bookCtrl.renameBookTopic, 
    (req, res) => {    
    res.status(200);
    res.send({
        "message": "Book Topic Rename Successful",
        "topic": req.topic
    })
});


// @route    POST api/admin/book/topics
// @desc     Get all book topics
// @access   Private
router.get('/topics', 
    adminAuthCtrl.tokenVerification,
    bookCtrl.getBookTopics, 
    (req, res) => {    
    res.status(200);
    res.send({
        "message": "Book Topics Retrieval Successful",
        "bookTopics": req.bookTopics
    })
});


// @route    POST api/admin/book
// @desc     Post a book
// @access   Private
router.post('/', 
    adminAuthCtrl.tokenVerification,
    bookCtrl.uploadBookFiles, 
    bookCtrl.bookValidation, 
    bookCtrl.postBook, 
    (req, res) => {	
    res.status(200);
    res.send({
        "message": "Book Post Successful",
        "BookData": req.BookData
    })
});


// @route    PUT api/admin/book/update-details
// @desc     Update the book details
// @access   Private
router.put('/update-details/:bookID', 
    adminAuthCtrl.tokenVerification,
    bookCtrl.updateBookDetails, 
    (req, res) => {    
    res.status(200);
    res.send({
        "message": "Book Details Update Successful",
        "BookData": req.BookData
    })
});

// @route    PUT api/admin/book//update-files
// @desc     Update the book files
// @access   Private
router.put('/update-files/:bookID', 
    adminAuthCtrl.tokenVerification,
    bookCtrl.updateBookFiles, 
    (req, res) => {    
    res.status(200);
    res.send({
        "message": "Book Files Update Successful",
    })
});

// @route    DELETE api/admin/book
// @desc     Delete the book
// @access   Private
router.delete('/:bookID', 
    adminAuthCtrl.tokenVerification,
    bookCtrl.deleteBook, 
    (req, res) => {    
    res.status(200);
    res.send({
        "message": "Book Deleted Successfully",
    })
});

// @route    GET api/admin/book
// @desc     Get the details of the book
// @access   Private
router.get('/:bookID', 
    adminAuthCtrl.tokenVerification,
    bookCtrl.getBookDetails, 
    (req, res) => {    
    res.status(200);
    res.send({
        "message": "Book Details Retreived Successfully",
        "book": req.book
    })
});

// @route    GET api/admin/book/all-books/:topicID
// @desc     Get all books of partucular of topicID
// @access   Private
router.get('/all-books/:topicID', 
    adminAuthCtrl.tokenVerification,
    bookCtrl.getBookDetails, 
    (req, res) => {    
    res.status(200);
    res.send({
        "message": "Books of particular topicID Retreived Successfully",
        "books": req.books,
        "total": req.total,
        "nextSkips": req.nextSkips,
    })
});

module.exports = router