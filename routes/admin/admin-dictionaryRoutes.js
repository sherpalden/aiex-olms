const express = require('express');
const router =  express.Router();

// controllers require
const adminAuthCtrl = require('../../controllers/http/adminAuthController.js');
const dictionaryCtrl = require('../../controllers/http/dictionaryController.js');

// @route    POST api/admin/dictionary
// @desc     Post a dictionary
// @access   Private
router.post('/', 
    adminAuthCtrl.tokenVerification,
    dictionaryCtrl.uploadDictionaryFiles, 
    dictionaryCtrl.dictionaryValidation, 
    dictionaryCtrl.postDictionary, 
    (req, res) => {	
    res.status(200);
    res.send({
        "message": "Dictionary Post Successful",
        "dictionaryData": req.dictionaryData
    })
});

router.post('/bulk-upload', 
    adminAuthCtrl.tokenVerification,
    dictionaryCtrl.uploadCsvDictionary,
    dictionaryCtrl.bulkPostDictionary,
    (req, res) => {    
    res.status(200);
    res.send({
        "message": "Dictionary Bulk upload Successful",
    })
});

// @route    PUT api/admin/dictionary/:dictionaryID
// @desc     Update a dictionary
// @access   Private
router.put('/:dictionaryID', 
    adminAuthCtrl.tokenVerification,
    dictionaryCtrl.uploadDictionaryFiles, 
    dictionaryCtrl.updateDictionary, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "Dictionary Update Successful",
        "dictionaryData": req.dictionaryData
    })
});

// @route    DELETE api/admin/dictionary/:dictionaryID
// @desc     Delete a dictionary
// @access   Private
router.delete('/:dictionaryID', 
    adminAuthCtrl.tokenVerification,
    dictionaryCtrl.deleteDictionary, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "Dictionary Delete Successful",
    })
});

// @route    GET api/admin/dictionary/search
// @desc     Retrieve keyword search results
// @access   Private
router.get('/search', 
    adminAuthCtrl.tokenVerification,
    // dictionaryCtrl.searchDictionary, 
    dictionaryCtrl.searchDictionary_v1, 
    (req, res) => {
    res.status(200);
    res.send({
        "message": "Dictionary keyword search Successful",
        "results": req.results,
        "nextSkips": req.nextSkips,
    })
});

module.exports = router;