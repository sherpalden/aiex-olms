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


// @route    POST api/admin/course
// @desc     Create a course
// @access   Private
router.post('/',
    adminAuthCtrl.tokenVerification, 
    courseCtrl.uploadCourseFiles,
    courseCtrl.courseValidation,
    courseCtrl.postCourse, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "Course Creation Successful",
        "courseData": req.courseData
    })
});

// @route    PUT api/admin/course/update-details/:courseID
// @desc     Update a course details
// @access   Private
router.put('/update-details/:courseID',
    adminAuthCtrl.tokenVerification, 
    courseCtrl.updateCourseDetails,
    (req, res) => {
    res.status(200);
    res.send({
        "message": "Course Details Update Successful",
        "courseData": req.courseData
    })
});

// @route    PUT api/admin/course/update-files/:courseID
// @desc     Update a course files
// @access   Private
router.put('/update-files/:courseID',
    adminAuthCtrl.tokenVerification, 
    courseCtrl.updateCourseFiles,
    (req, res) => {
    res.status(200);
    res.send({
        "message": "Course Files Update Successful",
        "courseData": req.courseData
    })
});

// @route    GET api/admin/course/:courseID
// @desc     Get course Details
// @access   Private
router.get('/:courseID',
    adminAuthCtrl.tokenVerification, 
    courseCtrl.getCourseDetails,
    (req, res) => {
    res.status(200);
    res.send({
        "message": "Course Details Retrieval Successful",
        "courseData": req.courseData
    })
});

// @route    DELETE api/admin/course/:courseID
// @desc     Delete a course
// @access   Private
router.delete('/:courseID',
    adminAuthCtrl.tokenVerification, 
    courseCtrl.deleteCourse,
    (req, res) => {
    res.status(200);
    res.send({
        "message": "Course Delete Successful",
    })
});

// @route    GET api/admin/course/all-courses/:categoryID
// @desc     Get Course Details
// @access   Private
router.get('/all-courses/:categoryID',
    adminAuthCtrl.tokenVerification, 
    courseCtrl.getCoursesByCategory,
    (req, res) => {
    res.status(200);
    res.send({
        "message": "Course Details Retrieval Successful",
        "courses": req.courses,
        "total": req.total,
        "nextSkips": req.nextSkips,

    })
});

// @route    GET api/admin/course/search
// @desc     Get Course Details
// @access   Private
router.get('/search',
    adminAuthCtrl.tokenVerification, 
    courseCtrl.searchCourse,
    (req, res) => {
    res.status(200);
    res.send({
        "message": "Course Details Retrieval Successful",
        "results": req.results,
        "nextSkips": req.nextSkips,

    })
});
    
module.exports = router;