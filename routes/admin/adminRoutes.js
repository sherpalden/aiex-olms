const express = require('express');
const router =  express.Router();

// controllers require
const adminAuthCtrl = require('../../controllers/http/adminAuthController.js');
const adminCtrl = require('../../controllers/http/adminController.js');

// @route    POST api/admin/register
// @desc     Register a new admin
// @access   Public
router.post('/register', 
	adminAuthCtrl.registerValidation, 
	adminAuthCtrl.checkUniqueEmail, 
	adminAuthCtrl.hash, 
	adminAuthCtrl.registerAdmin,
    // adminAuthCtrl.sendVerificationEmail,
	(req, res) => {
	res.status(201);
    res.send({
        "message": "Partial registration is successful. Please verify your email for the complete registration.\
        Verification email has been sent to "+req.body.email.trim(),
    })
});

// @route    PUT api/admin/verify-email
// @desc     Verify admin email
// @access   Public
router.put('/verify-email', 
    adminAuthCtrl.verifyAdminEmail, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "Admin Email Verification Successful.",
    })
});

// @route    POST api/admin/login
// @desc     Aunthenticate the admin for login into the system.
// @access   Public
router.post('/login',
    adminAuthCtrl.checkAdmin, 
    adminAuthCtrl.matchPassword,
    adminAuthCtrl.getToken,
    (req, res) => {
    res.status(200);
    res.send({
        "message": "Login Successful",
        "accessToken": req.accessToken,
    })
});

// @route    POST api/admin/signUp/google
// @desc     Register a new admin with google account
// @access   Public
router.post('/signUp/google', 
    adminAuthCtrl.authenticateGoogleUser,
    adminAuthCtrl.checkUniqueEmail,
    adminAuthCtrl.registerAdmin,
    adminAuthCtrl.getToken, 
    (req, res) => {
    res.status(201);
    res.send({
        "message": "SignUp With Google Successful",
        "accessToken": req.accessToken,
    })
});

// @route    POST api/admin/login/google
// @desc     Authenticate the admin for login into the system with google
// @access   Public
router.post('/login/google', 
    adminAuthCtrl.authenticateGoogleUser, 
    adminAuthCtrl.checkAdmin,
    adminAuthCtrl.getToken,     
    (req, res) => {
    res.status(200);
    res.send({
        "message": "Login With Google Successful",
        "accessToken": req.accessToken,
    })
});

// @route    GET api/admin/forgot-password
// @desc     Process the forgot password request from the client
// @access   Public
router.get('/forgot-password', 
	adminAuthCtrl.forgotPassword, 
	(req, res) => {
    res.status(200);
    res.send({
        "message": "Password reset request successfully processed\
        and reset link is sent to the email, "+req.body.email,
    })
});

// @route    PUT admin/reset-password
// @desc     Update the admin login password
// @access   Public
router.put('/reset-password', 
	adminAuthCtrl.resetPassword,
	(req, res) => {
    res.status(200);
    res.send({
        "message": "Password Reset Successful",
    })
});


// @route    GET api/admin/profile
// @desc     Retrieve the admin profile
// @access   Private
router.get('/profile', 
    adminAuthCtrl.tokenVerification,
    adminCtrl.getAdminProfile,
    (req, res) => {
    res.status(200);
    res.send({
        "message": "Admin Profile Retrieval Successful",
        "profile": req.profile,
    })
});

module.exports = router;
