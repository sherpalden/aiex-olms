const express = require('express')
const router =  express.Router()

// controllers require
const adminAuthCtrl = require('../../controllers/http/adminAuthController.js')
const courseCtrl = require('../../controllers/http/courseController.js')


// @route    POST api/admin/course/add-main-category
// @desc     Add a main category for the course.
// @access   Private
router.post('/add-main-category', 
    adminAuthCtrl.tokenVerification,
    courseCtrl.addMainCourseCategory, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "course Main Category Addition Successful"
    })
});

// @route    POST api/admin/course/add-sub-category
// @desc     Add a sub category for the course.
// @access   Private
router.post('/add-sub-category', 
    adminAuthCtrl.tokenVerification,
    courseCtrl.addSubCourseCategory, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "course Sub Category Addition Successful"
    })
});

// @route    PUT api/admin/course/rename-category
// @desc     Rename a category for the course.
// @access   Private
router.put('/rename-category', 
    adminAuthCtrl.tokenVerification,
    courseCtrl.renameCourseCategory, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "course Category Rename Successful"
    })
});


// @route    GET api/admin/course/all-categories
// @desc     Retrieve all categories of courses
// @access   Private
router.get('/all-categories',
    adminAuthCtrl.tokenVerification, 
    courseCtrl.getAllCourseCategoryTree, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "All Categories of course Retrieval Successful",
        "categories": req.categories
    })
});



module.exports = router;