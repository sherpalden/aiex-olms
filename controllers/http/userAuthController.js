const bcrypt = require('bcrypt'); //for hashing passwords...
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const request = require("request");
const queryString = require('query-string');
const url = require('url'); 
const sgMail = require('@sendgrid/mail');


//require models
const Users = require('../../models/users/users.js');
const validationRule = require('../validationController.js');

//error handler
const errObj = require('../../error/errorHandler.js');


const checkUniqueEmail = async (req, res, next) => {
    try{
        const email = req.email;
        const user = await Users.findOne({ email: email.trim().toLowerCase() })
        if(user) return next(new errObj.ForbiddenError("Email already exits."));
        debugger
        next();
    }
    catch(err){
        next(err);
    }
}

const registerUser = async (req, res, next) => {
    try {
        const firstName = req.firstName;
        const lastName = req.lastName;
        const email = req.email;
        const user = await Users.create({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            fullName: `${firstName.trim()} ${lastName.trim()}`,
            email: email.trim().toLowerCase(),
        })
        req.userID = user._id;
        debugger
        next();
    }
    catch(err){
        next(err);
    }
}

const checkUser = (req, res, next) => {
    const email = req.email;
    Users.findOne({ email: email.trim().toLowerCase() })
    .then(user => {
        if(!user) return next(new errObj.NotFoundError("User not found with this email!"));
        req.userID = user._id;
        next();
    })
    .catch(err => {
        next(err);
    })
}

const getToken = async (req, res, next) => {
    try {
        const email = req.email;
        req.accessToken = await jwt.sign({ email: email.trim(), userID: req.userID },
                                     process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5000m' });
        next();
    }
    catch(err){
        next(err);
    }
}

const authenticateGoogleUser = (req, res, next) => {
    try {
        const authCode = req.body.authCode;
        const options = {
            method: 'POST', 
            url: 'https://oauth2.googleapis.com/token',
            headers: {'content-type': 'application/x-www-form-urlencoded'},
            form: {
                grant_type: 'authorization_code',
                client_id:  process.env.CLIENT_ID,
                client_secret:  process.env.CLIENT_SECRET,
                code: authCode,
                redirect_uri: 'http://localhost:5000'
            }
        };
        request(options, (error, res) => {
            if (error) next(error);
            try{
                const tokenID = JSON.parse(res.body).id_token;
                const decodedResult = jwt.decode(tokenID);
                req.email = decodedResult.email;
                req.firstName = decodedResult.given_name;
                req.lastName = decodedResult.family_name;
                next();
            }
            catch(err){
                next(err)
            }
        });
    }
    catch(err) {
        next(err);
    }
}

const tokenVerification = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if(!authHeader) return next(new errObj.NotAuthorizedError("Token Required for authorization"))
        const token = authHeader && authHeader.split(' ');
        const accessToken = token[1];
        const userInfo = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        req.userID = userInfo.userID;
        req.email = userInfo.email;
        next();
    }
    catch(err) {
        if(err.message == "jwt expired") next(new errObj.NotAuthorizedError("Unauthorised!!!"));
        next(new errObj.BadRequestError(err.message));
    }
}

module.exports = {
    registerValidation,
    checkUniqueEmail,
    registerUser,
    checkUser,
    getToken,
    authenticateGoogleUser,
    tokenVerification,
}