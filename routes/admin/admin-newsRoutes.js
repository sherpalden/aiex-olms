const express = require('express');
const router =  express.Router();

// controllers require
const adminAuthCtrl = require('../../controllers/http/adminAuthController.js');
const newsCtrl = require('../../controllers/http/newsController.js');

// @route    POST api/admin/news/add-main-category
// @desc     Add a main category for the news.
// @access   Private
router.post('/add-main-category', 
	newsCtrl.addMainCategory, 
	(req, res) => {
	res.status(200);
    res.send({
        "message": "News Main Category Addition Successful"
    })
});

// @route    POST api/admin/news/add-sub-category
// @desc     Add a sub category for the news.
// @access   Private
router.post('/add-sub-category', 
	newsCtrl.addSubCategory, 
	(req, res) => {
	res.status(200);
    res.send({
        "message": "News Sub Category Addition Successful"
    })
});

// @route    PUT api/admin/news/rename-category
// @desc     Rename a category for the news.
// @access   Private
router.put('/add-sub-category', 
	newsCtrl.renameCategory, 
	(req, res) => {
	res.status(200);
    res.send({
        "message": "Category Rename Successful"
    })
});

// @route    GET api/admin/news/all-categories
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

// @route    GET api/admin/news/all-category-tree
// @desc     Retrieve all categories of news section in tree view format
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

// @route    POST api/admin/news/post-news
// @desc     Post a news article
// @access   Private
router.post('/post-news', 
    newsCtrl.uploadNewsFiles, 
    newsCtrl.newsValidation, 
    newsCtrl.postNews, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "News Article Post Successful",
        "newsData": req.newsData
    })
});

// @route    PUT api/admin/news/update-news/:newsID
// @desc     Update a news article
// @access   Private
router.put('/update-news/:newsID', 
    newsCtrl.updateNews, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "News Article Update Successful",
        "newsData": req.newsData
    })
});

// @route    PUT api/admin/news/set-thumbnail/:newsID
// @desc     Set a thumbnal image for a news article
// @access   Private
router.put('/set-thumbnail/:newsID', 
    newsCtrl.setThumbnail, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "News Article thumbnal set Successful",
    })
});


// @route    GET api/admin/news/details/:newsID
// @desc     Retrieve the details of news post.
// @access   Private
router.get('/details/:newsID', 
    newsCtrl.getNewsDetail, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "News Details Retrieval Successful",
    })
});

// @route    GET api/admin/news/all-news/:categoryID
// @desc     Retrieve all news of particular category
// @access   Private
router.get('/all-news/:newsID', 
    newsCtrl.getNewsByCategory, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "News Retrieval of particular category Successful",
    })
});




/*News APIs Ends*/



module.exports = router;