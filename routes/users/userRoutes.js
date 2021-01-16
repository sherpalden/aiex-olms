const express = require('express');
const router =  express.Router();

// controllers require
const userAuthCtrl = require('../../controllers/http/userAuthController.js');
const userCtrl = require('../../controllers/http/userController.js');

// @route    POST api/user/register
// @desc     Register a new user
// @access   Public
router.post('/register', 
	userAuthCtrl.registerValidation, 
	userAuthCtrl.checkUniqueEmail, 
	userAuthCtrl.hash, 
	userAuthCtrl.registerUser,
    // userAuthCtrl.sendVerificationEmail,
	(req, res) => {
	res.status(201);
    res.send({
        "message": "Partial registration is successful. Please verify your email for the complete registration.\
        Verification email has been sent to "+req.body.email.trim(),
    })
});

// @route    PUT api/user/verify-email
// @desc     Verify user email
// @access   Public
router.put('/verify-email', 
    userAuthCtrl.verifyUserEmail, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "User Email Verification Successful.",
    })
});

// @route    POST api/user/login
// @desc     Aunthenticate the user for login into the system.
// @access   Public
router.post('/login',
    userAuthCtrl.checkUser, 
    userAuthCtrl.matchPassword,
    userAuthCtrl.getToken,
    (req, res) => {
    res.status(200);
    res.send({
        "message": "Login Successful",
        "accessToken": req.accessToken,
    })
});

// @route    POST api/user/signUp/google
// @desc     Register a new user with google account
// @access   Public
router.post('/signUp/google', 
    userAuthCtrl.authenticateGoogleUser,
    userAuthCtrl.checkUniqueEmail,
    userAuthCtrl.registerUser,
    userAuthCtrl.getToken, 
    (req, res) => {
    res.status(201);
    res.send({
        "message": "SignUp With Google Successful",
        "accessToken": req.accessToken,
    })
});

// @route    POST api/user/login/google
// @desc     Authenticate the user for login into the system with google
// @access   Public
router.post('/login/google', 
    userAuthCtrl.authenticateGoogleUser, 
    userAuthCtrl.checkUser,
    userAuthCtrl.getToken,     
    (req, res) => {
    res.status(200);
    res.send({
        "message": "Login With Google Successful",
        "accessToken": req.accessToken,
    })
});

// @route    GET api/user/forgot-password
// @desc     Process the forgot password request from the client
// @access   Public
router.get('/forgot-password', 
	userAuthCtrl.forgotPassword, 
	(req, res) => {
    res.status(200);
    res.send({
        "message": "Password reset request successfully processed\
        and reset link is sent to the email, "+req.body.email,
    })
});

// @route    PUT user/reset-password
// @desc     Update the user login password
// @access   Public
router.put('/reset-password', 
	userAuthCtrl.resetPassword,
	(req, res) => {
    res.status(200);
    res.send({
        "message": "Password Reset Successful",
    })
});


// @route    GET api/user/profile
// @desc     Retrieve the user profile
// @access   Private
router.get('/profile', 
    userAuthCtrl.tokenVerification,
    userCtrl.getUserProfile,
    (req, res) => {
    res.status(200);
    res.send({
        "message": "User Profile Retrieval Successful",
        "profile": req.profile,
    })
});

module.exports = router;

