const express = require('express')
const router =  express.Router()

// controllers require
const adminAuthCtrl = require('../../controllers/http/adminAuthController.js')
const bookCtrl = require('../../controllers/http/bookController.js')


// @route    POST api/admin/book/add-main-category
// @desc     Add a main category for the book.
// @access   Private
router.post('/add-main-category', 
    adminAuthCtrl.tokenVerification,
    bookCtrl.addMainBookCategory, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "Book Main Category Addition Successful"
    })
});

// @route    POST api/admin/book/add-sub-category
// @desc     Add a sub category for the book.
// @access   Private
router.post('/add-sub-category', 
    adminAuthCtrl.tokenVerification,
    bookCtrl.addSubBookCategory, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "Book Sub Category Addition Successful"
    })
});

// @route    PUT api/admin/book/rename-category
// @desc     Rename a category for the book.
// @access   Private
router.put('/rename-category', 
    adminAuthCtrl.tokenVerification,
    bookCtrl.renameBookCategory, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "Book Category Rename Successful"
    })
});


// @route    GET api/admin/book/all-categories
// @desc     Retrieve all categories of books
// @access   Private
router.get('/all-categories',
    adminAuthCtrl.tokenVerification, 
    bookCtrl.getAllBookCategory, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "All Categories of Book Retrieval Successful",
        "categories": req.categories
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
    bookCtrl.uploadBookFiles,
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

// @route    GET api/admin/book/all-books/:categoryID
// @desc     Get all books of partucular categoryID
// @access   Private
router.get('/all-books/:categoryID', 
    adminAuthCtrl.tokenVerification,
    bookCtrl.getBooksByCategory, 
    (req, res) => {    
    res.status(200);
    res.send({
        "message": "Books of particular categoryID Retreived Successfully",
        "books": req.books,
        "total": req.total,
        "nextSkips": req.nextSkips,
    })
});

router.post('/form-data',
    bookCtrl.parseFormData,
    (req, res) => {
        res.status(200)
        res.send({
            "message": "Parse Successful"
        })
    })

module.exports = router