const express = require('express');
const router =  express.Router();

// controllers require
const userAuthCtrl = require('../../controllers/http/userAuthController');
const newsCtrl = require('../../controllers/http/newsController');

// @route    GET api/user/news/all-categories
// @desc     Retrieve all categories of news section
// @access   Private
router.get('/all-categories', 
	newsCtrl.getAllCategories, 
	(req, res) => {
	res.status(200);
    res.send({
        "message": "All Categories Retrieval Successful",
        "categories": req.categories
    })
});


// @route    GET api/user/news/all-category-tree
// @desc     Retrieve all categories of news section
// @access   Private
router.get('/all-category-tree', 
	newsCtrl.getAllCategoryTree, 
	(req, res) => {
	res.status(200);
    res.send({
        "message": "All Categories In Tree View Retrieval Successful",
        "categories": req.categories
    })
});




/*News APIs Begins*/

// @route    GET api/user/news/:newsID
// @desc     Retrieve the details of news post.
// @access   Private
router.get('/:newsID', 
    newsCtrl.getNewsDetail, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "News Details Retrieval Successful",
    })
});

// @route    GET api/user/news/:categoryID
// @desc     Retrieve all news of particular category
// @access   Private
router.get('/:newsID', 
    newsCtrl.getNewsByCategory, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "News Retrieval of particular category Successful",
    })
});



/*News APIs Ends*/
module.exports = router;