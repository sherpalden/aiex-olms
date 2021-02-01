const express = require('express');
const router =  express.Router();

// controllers require
const adminAuthCtrl = require('../../controllers/http/adminAuthController.js');
const newsCtrl = require('../../controllers/http/newsController.js');

// @route    POST api/admin/news/add-main-category
// @desc     Add a main category for the news.
// @access   Private
router.post('/add-main-category', 
    adminAuthCtrl.tokenVerification,
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
    adminAuthCtrl.tokenVerification,
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
router.put('/rename-category', 
    adminAuthCtrl.tokenVerification,
	newsCtrl.renameCategory, 
	(req, res) => {
	res.status(200);
    res.send({
        "message": "Category Rename Successful"
    })
});

// @route    PUT api/admin/news/delete-category
// @desc     delete a category for the news.
// @access   Private
router.delete('/delete-category/:categoryID', 
    adminAuthCtrl.tokenVerification,
    newsCtrl.deleteCategory, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "Category delete Successful",
        "subTree": req.subTree
    })
});

// @route    GET api/admin/news/all-categories
// @desc     Retrieve all categories of news section
// @access   Private
router.get('/all-categories',
    adminAuthCtrl.tokenVerification, 
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
    adminAuthCtrl.tokenVerification,
	newsCtrl.getAllCategoryTree, 
	(req, res) => {
	res.status(200);
    res.send({
        "message": "All Categories In Tree View Retrieval Successful",
        "categories": req.categories
    })
});


/*News APIs Begins
*
*
*
*
*
*
*
*/

// @route    POST api/admin/news
// @desc     Post a news article
// @access   Private
router.post('/', 
    adminAuthCtrl.tokenVerification,
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

// @route    POST api/admin/news/upload-images
// @desc     Upload news images
// @access   Private
router.post('/upload-images', 
    adminAuthCtrl.tokenVerification,
    newsCtrl.uploadNewsImages, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "News Images Upload Successful",
        "images": req.images
    })
});

// @route    PUT api/admin/news/:newsID
// @desc     Update a news article
// @access   Private
router.put('/:newsID', 
    adminAuthCtrl.tokenVerification,
    newsCtrl.uploadNewsFiles, 
    newsCtrl.updateNews, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "News Article Update Successful",
        "newsData": req.newsData
    })
});



// @route    DELETE api/admin/news/:newsID
// @desc     Delete a news article
// @access   Private
router.delete('/:newsID', 
    adminAuthCtrl.tokenVerification,
    newsCtrl.deleteNews, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "News Article Delete Successful",
    })
});

// @route    DELETE api/admin/news/:categoryID
// @desc     Delete all news of particular categoryID
// @access   Private
router.delete('/all-news/:categoryID', 
    adminAuthCtrl.tokenVerification,
    newsCtrl.deleteNewsByCategory, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "News of particular category Delete Successful",
    })
});

// @route    PUT api/admin/news/set-thumbnail/:newsID
// @desc     Set a thumbnal image for a news article
// @access   Private
router.put('/set-thumbnail/:newsID', 
    adminAuthCtrl.tokenVerification,
    newsCtrl.setThumbnail, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "News Article thumbnal set Successful",
    })
});


// @route    GET api/admin/news/:newsID
// @desc     Retrieve the details of news post.
// @access   Private
router.get('/:newsID', 
    adminAuthCtrl.tokenVerification,
    newsCtrl.getNewsDetail, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "News Details Retrieval Successful",
        "newsData": req.newsData
    })
});

// @route    GET api/admin/news/:categoryID
// @desc     Retrieve all news of particular category
// @access   Private
router.get('/all-news/:categoryID', 
    adminAuthCtrl.tokenVerification,
    newsCtrl.getNewsByCategory, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "News Retrieval of particular category Successful",
        "news": req.news,
        // "total": req.total,
        // "nextSkips": req.nextSkips
    })
});





/*News APIs Ends*/



module.exports = router;