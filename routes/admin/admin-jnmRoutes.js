const express = require('express')
const router =  express.Router()

// controllers require
const adminAuthCtrl = require('../../controllers/http/adminAuthController.js')
const jnmCtrl = require('../../controllers/http/jnmController.js')


// @route    POST api/admin/jnm/add-main-category
// @desc     Add a main category for the jnm.
// @access   Private
router.post('/add-main-category', 
    adminAuthCtrl.tokenVerification,
    jnmCtrl.addMainJnmCategory, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "Jnm Main Category Addition Successful"
    })
});

// @route    POST api/admin/jnm/add-sub-category
// @desc     Add a sub category for the jnm.
// @access   Private
router.post('/add-sub-category', 
    adminAuthCtrl.tokenVerification,
    jnmCtrl.addSubJnmCategory, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "Jnm Sub Category Addition Successful"
    })
});

// @route    PUT api/admin/jnm/rename-category
// @desc     Rename a category for the jnm.
// @access   Private
router.put('/rename-category', 
    adminAuthCtrl.tokenVerification,
    jnmCtrl.renameJnmCategory, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "Jnm Category Rename Successful"
    })
});


// @route    GET api/admin/jnm/all-categories
// @desc     Retrieve all categories of jnms
// @access   Private
router.get('/all-categories',
    adminAuthCtrl.tokenVerification, 
    jnmCtrl.getAllJnmCategory, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "All Categories of Jnm Retrieval Successful",
        "categories": req.categories
    })
});


// @route    POST api/admin/jnm
// @desc     Post a jnm
// @access   Private
router.post('/', 
    adminAuthCtrl.tokenVerification,
    jnmCtrl.uploadJnmFiles, 
    jnmCtrl.jnmValidation, 
    jnmCtrl.postJnm, 
    (req, res) => {	
    res.status(200);
    res.send({
        "message": "Jnm Post Successful",
        "jnmData": req.jnmData
    })
});


// @route    PUT api/admin/jnm/update-details
// @desc     Update the jnm details
// @access   Private
router.put('/update-details/:jnmID', 
    adminAuthCtrl.tokenVerification,
    jnmCtrl.updateJnmDetails, 
    (req, res) => {    
    res.status(200);
    res.send({
        "message": "Jnm Details Update Successful",
        "jnmData": req.jnmData
    })
});

// @route    PUT api/admin/jnm//update-files
// @desc     Update the jnm files
// @access   Private
router.put('/update-files/:jnmID', 
    adminAuthCtrl.tokenVerification,
    jnmCtrl.uploadJnmFiles,
    jnmCtrl.updateJnmFiles, 
    (req, res) => {    
    res.status(200);
    res.send({
        "message": "Jnm Files Update Successful",
    })
});

// @route    DELETE api/admin/jnm
// @desc     Delete the jnm
// @access   Private
router.delete('/:jnmID', 
    adminAuthCtrl.tokenVerification,
    jnmCtrl.deleteJnm, 
    (req, res) => {    
    res.status(200);
    res.send({
        "message": "Jnm Deleted Successfully",
    })
});

// @route    GET api/admin/jnm
// @desc     Get the details of the jnm
// @access   Private
router.get('/:jnmID', 
    adminAuthCtrl.tokenVerification,
    jnmCtrl.getJnmDetails, 
    (req, res) => {    
    res.status(200);
    res.send({
        "message": "Jnm Details Retreived Successfully",
        "jnm": req.jnm
    })
});

// @route    GET api/admin/jnm/all-jnms/:categoryID
// @desc     Get all jnms of partucular categoryID
// @access   Private
router.get('/all-jnms/:categoryID', 
    adminAuthCtrl.tokenVerification,
    jnmCtrl.getJnmsByCategory, 
    (req, res) => {    
    res.status(200);
    res.send({
        "message": "Jnms of particular categoryID Retreived Successfully",
        "jnms": req.jnms,
        "total": req.total,
        "nextSkips": req.nextSkips,
    })
});

// @route    GET api/admin/jnm/search
// @desc     Search for a jnm
// @access   Private
router.get('/search',
    adminAuthCtrl.tokenVerification, 
    jnmCtrl.searchJnm,
    (req, res) => {
    res.status(200);
    res.send({
        "message": "Jnm Search Successful",
        "results": req.results,
        "nextSkips": req.nextSkips,
    })
});

module.exports = router