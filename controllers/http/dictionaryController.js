// require node modules
const mongoose = require('mongoose');
const Busboy = require('busboy');
const fs = require('fs');
const path = require('path');
const is = require('type-is');
const util = require('util');
const appendField = require('append-field');

//require database models
const Users = require('../../models/users/users.js');
const Admins = require('../../models/users/admins.js');
const Dictionary = require('../../models/dictionary/dictionary.js');

//require project files
const errObj = require('../../error/errorHandler.js');
const validationRule = require('../validationController.js');
const fileDeleter = require('../../helpers/http/deleteFiles.js');


const uploadDictionaryFiles = async (req, res, next) => {
	let images = [];
    let filesUploaded = [];
	try {
		if(!is(req, ['multipart'])) return next(new errObj.BadRequestError("The content type must be multipart/form-data"));
        const busboy = new Busboy({headers: req.headers, highWaterMark: 2 * 1024 * 1024});
        busboy.on('field', (fieldname, value) => {
            appendField(req.body, fieldname, value)
        });
        busboy.on('file', (key, file, name, encoding, mimetype) => {
        	try{
	            const fileExt = path.extname(name);
	            const fileNameSplitted = name.split('.');
	            const filename = fileNameSplitted[fileNameSplitted.length - 2] + '-' + Date.now() + fileExt;
	            if(fileExt === '.jpeg' || fileExt === '.jpg' ||  fileExt === '.png' || fileExt === '.gif'){
	                images.push(filename);
	                filesUploaded.push(`./public/uploads/temp/${filename}`);
	            	file.pipe(fs.createWriteStream(`./public/uploads/temp/${filename}`));
	            }
	            else {
	                return next(new errObj.BadRequestError("Invalid file type!!!"));
	            }
        	}
        	catch(err){return next(err)}
        });
        busboy.on('finish', (err) => {
            if (err) return next(err)
            req.images = images;
            req.filesUploaded = filesUploaded;
            debugger
            next();
        });
        req.pipe(busboy);
	}
    catch(err) {
    	try {
			await fileDeleter.deleteFiles(filesUploaded);
		}
		catch(err){
			next(err);
		}
        next(err)
    }
}

const dictionaryValidation = async (req, res, next) => {
	try {
		const requiredFields = ['keyword', 'description'];
		for(field of requiredFields){
			if(!req.body[field] || (validationRule.notEmptyValidation(req.body[field]) === false)){
				throw new errObj.BadRequestError(`${field} field is required and cannot be empty.`);
			}
		}
		debugger
		next();
	}
	catch(err) {
		try {
			await fileDeleter.deleteFiles(req.filesUploaded);
		}
		catch(err){
			next(err);	
		}
		next(err);
	}
}

const postDictionary = async (req, res, next) => {
	try {
		const DictionaryData = await Dictionary.create({ 
			keyword: req.body.keyword,
			description: req.body.description,
			images: req.images,
			relatedWords: req.body.relatedWords || null,
			youtubeLinks: req.body.youtubeLinks || null,
		})
		const rename = util.promisify(fs.rename);
		for(file of req.images){
			await rename(`./public/uploads/temp/${file}`, `./public/uploads/dictionary/${file}`);
		}
		req.DictionaryData = DictionaryData;
		debugger
		next();
	}
    catch(err) {
    	try {
			await fileDeleter.deleteFiles(req.filesUploaded);
		}
		catch(err){
			next(err);
		}
		next(err);
    }
}

const updateDictionary = async (req, res, next) => {
	try{
		if(!req.params.dictionaryID) return next(new errObj.BadRequestError("dictionaryID is required as url parameter!"))
		if(req.params.dictionaryID.split('').length != 24) return next(new errObj.BadRequestError('Invalid dictionaryID'))
		const dictionaryID = mongoose.Types.ObjectId(req.params.dictionaryID);
		const dictionary = await Dictionary.findOne({_id: dictionaryID});
		if(!dictionary) return next(new errObj.NotFoundError("Dictionary corresponding to the dictionaryID not found"));

		const dictionaryFields = ['keyword', 'description'];
		for(field of dictionaryFields){
			if(req.body[field]){
				if(validationRule.notEmptyValidation(req.body[field]) === false){
					return next(new errObj.BadRequestError(`${field} field cannot be empty`));
				}
				dictionary[field] = req.body[field];
			}
		}
		if(req.body.relatedWords){
			dictionary.relatedWords = req.body.relatedWords;
		}
		if(req.body.youtubeLinks){
			dictionary.youtubeLinks = req.body.youtubeLinks;
		}
		if(req.body.imagesToBeDeleted){
			const imagesToBeDeleted = JSON.parse(req.body.imagesToBeDeleted);
			for(image of imagesToBeDeleted){
				await fileDeleter.deleteFile(`./public/uploads/dictionary/${image}`);
				dictionary.images.pull(image);
			}
		}
		if(req.images.length > 0){
			const rename = util.promisify(fs.rename);
			for(image of req.images){
				await rename(`./public/uploads/temp/${image}`, `./public/uploads/dictionary/${image}`);
				dictionary.images.push(image);
			}
		}
		dictionary.updatedAt = Date.now();
		await dictionary.save();
		req.dictionaryData = dictionary;
		debugger
		next();
	}
	catch(err){
		next(err);
	}
}

const deleteDictionary = async (req, res, next) => {
	try{
		if(!req.params.dictionaryID) return next(new errObj.BadRequestError("dictionaryID is required as url parameter!"))
		if(req.params.dictionaryID.split('').length != 24) return next(new errObj.BadRequestError('Invalid dictionaryID'))
		const dictionaryID = mongoose.Types.ObjectId(req.params.dictionaryID);
		const dictionary = await Dictionary.findOne({_id: dictionaryID});
		if(!dictionary) return next(new errObj.NotFoundError("Dictionary corresponding to the dictionaryID not found"));
		for(image of news.images){
			await fileDeleter.deleteFile(`./public/uploads/dictionary/${image}`);
		}
		await Dictionary.deleteOne({_id: dictionaryID});
		debugger
		next();
	}
	catch(err){
		next(err);
	}
}

const searchDictionary = async (req, res, next) => {
	try{
		let skips = 0, limit = 10;
        if(req.query.skips) {skips = parseInt(req.query.skips);}
        if(req.query.limit) {limit = parseInt(req.query.limit);}
        let nextSkips = skips + limit;

        const searchKey = req.query.searchKey;
        const results = await Dictionary.aggregate([
            { $match: { $text: { $search: searchKey } } },
            { $sort: { score: { $meta: "textScore" } } },
            { $skip: skips},
            { $limit: limit},
        ])

        if(results.length < limit) {nextSkips = null}
        req.nextSkips = nextSkips;
        req.results = results;
        next()
	}
	catch(err){
		next(err);
	}
}

const searchDictionary_v1 = async (req, res, next) => {
	try{
		let skips = 0, limit = 10;
        if(req.query.skips) {skips = parseInt(req.query.skips);}
        if(req.query.limit) {limit = parseInt(req.query.limit);}
        let nextSkips = skips + limit;

        const searchKey = req.query.searchKey;
        var pattern = new RegExp(searchKey);
        // const results = await Dictionary.aggregate([
        //     { $regexMatch: { input: "$keyword", regex: pattern, $options: "i" } },
        //     { $skip: skips},
        //     { $limit: limit},
        //     { $project: {keyword: 1}}
        // ])
        const results = await Dictionary.find({keyword: {$regex: pattern, $options: "i"}}).skip(skips).limit(limit);

        if(results.length < limit) {nextSkips = null}
        req.nextSkips = nextSkips;
        req.results = results;
        next();	
	}
	catch(err){
		next(err);
	}
}

module.exports = {
	uploadDictionaryFiles,
	dictionaryValidation,
	postDictionary,
	updateDictionary,
	deleteDictionary,

	searchDictionary,
	searchDictionary_v1,
}