const express = require('express');
const router =  express.Router();

// controllers require
const userAuthCtrl = require('../../controllers/http/userAuthController.js');
const userCtrl = require('../../controllers/http/userController.js');

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


// @route    PUT api/user/profile
// @desc     Update profile picture
// @access   Private
router.put('/profile-picture', 
    userAuthCtrl.tokenVerification,
    userCtrl.updateProfilePic,
    (req, res) => {
    res.status(200);
    res.send({
        "message": "User Profile Picture Update Successful",
        "profilePic": req.profilePic,
    })
});


module.exports = router;

