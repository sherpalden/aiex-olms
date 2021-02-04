// require node modules
const mongoose = require('mongoose')
const Busboy = require('busboy')
const fs = require('fs')
const path = require('path')
const is = require('type-is')
const util = require('util')
var appendField = require('append-field')

//require database models
const Users = require('../../models/users/users.js')
const Admins = require('../../models/users/admins.js')
const Jnms = require('../../models/digital_library/journalAndMagazines.js')
const JnmCategories = require('../../models/digital_library/journalMagazineCategories.js')

//require project files
const errObj = require('../../error/errorHandler.js')
const validationRule = require('../validationController.js')
const fileDeleter = require('../../helpers/http/deleteFiles.js')



const addMainJnmCategory = async (req, res, next) => {
	try{
		if(!req.body.categoryName || (validationRule.notEmptyValidation(req.body.categoryName) === false)){
			return next(new errObj.BadRequestError("categoryName field is required and cannot be empty."));
		}
		let rootCategory = await JnmCategories.findOne({parentID: null});
		if(!rootCategory){
			rootCategory = await JnmCategories.create({name: "root", parentID: null});
		}
		const category = await JnmCategories.create({
			name: req.body.categoryName,
			parentID: rootCategory._id
		})
		debugger
		next();
	}
	catch(err){
		next(err);
	}
}

const addSubJnmCategory = async (req, res, next) => {
	try{
		if(!req.body.categoryName || (validationRule.notEmptyValidation(req.body.categoryName) === false)){
			return next(new errObj.BadRequestError("categoryName field is required and cannot be empty."));
		}
		if(!req.body.parentID || (validationRule.notEmptyValidation(req.body.parentID) === false)){
			return next(new errObj.BadRequestError("parentID field is required and cannot be empty."));
		}
		if(req.body.parentID.split('').length != 24) return next(new errObj.BadRequestError("Invalid parentID"));

		const category = await JnmCategories.findOne({_id: req.body.parentID});
		if(!category) return next(new errObj.NotFoundError("Category corresponding to parentID not found"));

		const newCategory = await JnmCategories.create({
			name: req.body.categoryName,
			parentID: req.body.parentID
		})
		debugger
		next();
	}
	catch(err){
		next(err);
	}
}

const renameJnmCategory = async (req, res, next) => {
	try{
		if(!req.body.newName || (validationRule.notEmptyValidation(req.body.newName) === false)){
			return next(new errObj.BadRequestError("newName field is required and cannot be empty."));
		}
		if(!req.body.categoryID || (validationRule.notEmptyValidation(req.body.categoryID) === false)){
			return next(new errObj.BadRequestError("categoryID field is required and cannot be empty."));
		}
		if(req.body.categoryID.split('').length != 24) return next(new errObj.BadRequestError("Invalid categoryID"));

		const category = await JnmCategories.findOne({_id: req.body.categoryID});
		if(!category) return next(new errObj.NotFoundError("Category corresponding to categoryID not found"));

		category.name = req.body.newName;
		await category.save();
		debugger
		next();
	}
	catch(err){
		next(err);
	}
}

const getAllJnmCategory = async (req, res, next) => {
	try{
		const categories = await JnmCategories.find({});
		let data = categories.map(el => {
			let parentID;
			if(el.parentID != null) {parentID = el.parentID.toString();}
			else parentID = null;
			return {
				_id: el._id.toString(),
				name: el.name,
				parentID: parentID
			}
		})
		const idMapping = data.reduce((acc, el, i) => {
			acc[el._id] = i;
			return acc;
		}, {});

		let root;
		data.forEach(el => {
			if (el.parentID === null) {
				root = el;
				return;
			}
			const parentEl = data[idMapping[el.parentID]];
			parentEl.children = [...(parentEl.children || []), el];
		});
		req.categories = root.children;
		debugger
		next();
	}
	catch(err){
		next(err);
	}
}



const uploadJnmFiles = async (req, res, next) => {
    let filesUploaded = [];
    let thumbnail;
    let jnmFiles = [];
	try {
		if(!is(req, ['multipart'])) return next(new errObj.BadRequestError("The content type must be multipart/form-data"));
        const busboy = new Busboy({headers: req.headers, highWaterMark: 2 * 1024 * 1024});
        busboy.on('field', (fieldname, value) => {
            appendField(req.body, fieldname, value)
        });
        busboy.on('file', (key, file, name, encoding, mimetype) => {
            const fileExt = path.extname(name);
            const fileNameSplitted = name.split('.');
            const filename = fileNameSplitted[fileNameSplitted.length - 2] + '-' + Date.now() + fileExt;
            if(fileExt === '.pdf' || fileExt === '.docx'){
            	jnmFiles.push(filename);
                filesUploaded.push(`./public/uploads/temp/${filename}`);
            	file.pipe(fs.createWriteStream(`./public/uploads/temp/${filename}`));
            }
            else if(fileExt === '.jpeg' || fileExt === '.jpg' || fileExt === '.png'){
            	thumbnail = filename;
                filesUploaded.push(`./public/uploads/temp/${filename}`);
            	file.pipe(fs.createWriteStream(`./public/uploads/temp/${filename}`));
            }
            else {
                return next(new errObj.BadRequestError("Invalid file type!!!"));
            }
        });
        busboy.on('finish', (err) => {
            if (err) return next(err)
            if(thumbnail) {req.thumbnail = thumbnail};
            req.filesUploaded = filesUploaded;
            req.jnmFiles = jnmFiles;
            debugger
            next();
        });
        req.pipe(busboy);
	}
    catch(err) {
    	console.log(err)
    	try {
			await fileDeleter.deleteFiles(filesUploaded);
		}
		catch(err){
			next(err);
		}
        next(err)
    }
}

const jnmValidation = async (req, res, next) => {
	try {
		const requiredFields = ['title', 'category', 'abstract', 'categoryID', 'publisher', 'edition', 'publicationDate', 'noOfPages', 'doi'];
		if(!(req.thumbnail)) throw new errObj.BadRequestError("thumbnail image is required");
		for(field of requiredFields){
			if(!req.body[field] || (validationRule.notEmptyValidation(req.body[field]) === false)){
				throw new errObj.BadRequestError(`${field} field is required and cannot be empty.`);
			}
		}
		if(!req.body.authors) throw new errObj.BadRequestError("authors field is required.")
		const authors = JSON.parse(req.body.authors)
		if(authors.length < 1) throw new errObj.BadRequestError("At least one author is required")
		for(author of authors){
			if(!author.firstName || !author.lastName){
				throw new errObj.BadRequestError("firstName and lastName field is required.")
			}
			if(validationRule.notEmptyValidation(author.firstName) === false || validationRule.notEmptyValidation(author.lastName) === false){
				throw new errObj.BadRequestError("firstName and lastName field is required and cannot be empty")
			}
		}
		if(req.body.categoryID.split('').length != 24) return next(new errObj.BadRequestError("Invalid categoryID"));
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

const postJnm = async (req, res, next) => {
	try {
		const jnmData = await Jnms.create({ 
			title: req.body.title,
			category: req.body.category,
			authors: JSON.parse(req.body.authors),
			categoryID: req.body.categoryID,
			noOfPages: parseInt(req.body.noOfPages),
			publisher: req.body.publisher,
			abstract: req.body.abstract,
			edition: req.body.edition,
			publicationDate: req.body.publicationDate,
			keywords: JSON.parse(req.body.keywords) || null,
			youtubeLinks: JSON.parse(req.body.youtubeLinks) || null,
			doi: req.body.doi,
			thumbnail: req.thumbnail,
			files: req.jnmFiles,
		})
		const rename = util.promisify(fs.rename);
		await rename(`./public/uploads/temp/${req.thumbnail}`, `./public/uploads/jnms/${req.thumbnail}`);
		for(file of jnmFiles){
			await rename(`./public/uploads/temp/${file}`, `./public/uploads/jnms/${file}`);
		}
		req.jnmData = jnmData;
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

const updateJnmDetails = async (req, res, next) => {
	try{
		if(!req.params.jnmID) return next(new errObj.BadRequestError("jnmID is required as url parameter"))
		if(req.body.jnmID.split('').length != 24) return next(new errObj.BadRequestError("Invalid jnmID"))
		const jnmID = mongoose.Types.ObjectId(req.params.jnmID)
		const jnm = await Jnms.findOne({_id: jnmID})
		if(!jnm) return next(new errObj.NotFoundError("jnm not found."))

		const jnmFields = ['title', 'category', 'abstract', 'categoryID', 'publisher', 'edition', 'publicationDate', 'noOfPages', 'doi'];
		for(field of jnmFields){
			if(req.body[field]){
				if(validationRule.notEmptyValidation(req.body[field]) === false){
					return next(new errObj.BadRequestError(`${field} field cannot be empty.`))
				}
				jnm[field] = req.body[field]
			}
		}
		if(req.body.categoryID){
			if(req.body.categoryID.split('').length != 24) return next(new errObj.BadRequestError("Invalid categoryID"));
			jnm.categoryID = req.body.categoryID
		}
		if(req.body.authors){
			for(author of authors){
				if(!author.firstName || !author.lastName){
					return next(new errObj.BadRequestError("firstName and lastName field is required."))
				}
				if(validationRule.notEmptyValidation(author.firstName) === false || validationRule.notEmptyValidation(author.lastName) === false){
					return next(new errObj.BadRequestError("firstName and lastName field is required and cannot be empty"))
				}
			}
			jnm.authors = JSON.parse(req.body.authors)
		}
		if(req.body.keywords) {jnm.keywords = JSON.parse(req.body.keywords)};
		if(req.body.youtubeLinks) {jnm.youtubeLinks = JSON.parse(req.body.youtubeLinks)};
		await jnm.save();
		next();
	}
	catch(err){
		next(err)
	}
}

const updateJnmFiles = async (req, res, next) => {
	try{
		if(!req.params.jnmID) return next(new errObj.BadRequestError("jnmID is required as url parameter"))
		if(req.params.jnmID.split('').length != 24) return next(new errObj.BadRequestError("Invalid jnmID"))
		const jnmID = mongoose.Types.ObjectId(req.params.jnmID)
		const jnm = await Jnms.findOne({_id: jnmID})
		if(!jnm) return next(new errObj.NotFoundError("jnm not found."))

		let filesToBeDeleted = [];
		if(req.filesToBeDeleted){
			for(file of filesToBeDeleted){
				if(jnm.files.includes(file)){
					filesToBeDeleted.push(`./public/uploads/jnms/${file}`);
					jnm.files.splice(jnm.files.indexOf(file), 1);
				}
			}
		}
		const rename = util.promisify(fs.rename);
		if(req.thumbnail){
			await rename(`./public/uploads/temp/${req.thumbnail}`, `./public/uploads/jnms/${req.thumbnail}`);
			if(jnm.thumbnail) { filesToBeDeleted.push(`./public/uploads/jnms/${jnm.thumbnail}`) }
			jnm.thumbnail = req.thumbnail
		}
		if(req.jnmFiles){
			for(file of jnmFiles){
				await rename(`./public/uploads/temp/${file}`, `./public/uploads/jnms/${file}`);
				jnm.files.push(file);
			}
		}
		await fileDeleter.deleteFiles(filesToBeDeleted);
		await jnm.save()
		next()
	}
	catch(err){
		next(err)
	}
}

const deleteJnm = async (req, res, next) => {
	try{
		if(!req.params.jnmID) return next(new errObj.BadRequestError("jnmID is required as url parameter"))
		if(req.params.jnmID.split('').length != 24) return next(new errObj.BadRequestError("Invalid jnmID"))
		const jnmID = mongoose.Types.ObjectId(req.params.jnmID)
		const jnm = await Jnms.findOne({_id: jnmID})
		if(!jnm) return next(new errObj.NotFoundError("jnm not found."))
		let filesToBeDeleted = []
		if(jnm.thumbnail) { filesToBeDeleted.push(`./public/uploads/jnms/${jnm.thumbnail}`) }
		for(file of jnm.files){
			filesToBeDeleted.push(`./public/uploads/jnms/${file}`)
		}
		await fileDeleter.deleteFiles(filesToBeDeleted)
		await Jnms.deleteOne({_id: jnmID})
		next()
	}
	catch(err){
		next(err)
	}
}

const getJnmDetails = async (req, res, next) => {
	try{
		if(!req.params.jnmID) return next(new errObj.BadRequestError("jnmID is required as url parameter"))
		if(req.params.jnmID.split('').length != 24) return next(new errObj.BadRequestError("Invalid jnmID"))
		const jnmID = mongoose.Types.ObjectId(req.params.jnmID)
		const jnms = await Jnms.aggregate([
			{ $match: {_id: jnmID}},
			{ $lookup: 
				{ 
					from: 'journal_magazine_categories', 
					let: { category_id: "$categoryID" },
					pipeline: [
						{ $match: { $expr: { $eq: ["$_id", "$$category_id"] } } },
						{ $project: {name: 1}}
					],
					as: 'categoryInfo'
				}
			},
			{ $unwind: '$categoryInfo'},
		])
		if(jnms.length < 1) return next(new errObj.NotFoundError("Jnm not found."))
		req.jnm = jnms[0]
		next()
	}
	catch(err){
		next(err)
	}
}

const getJnmsByCategory = async (req, res, next) => {
	try{
		let skips = 0, limit = 10;
        if(req.query.skips) {skips = parseInt(req.query.skips);}
        if(req.query.limit) {limit = parseInt(req.query.limit);}
        let nextSkips = skips + limit;

		if(!req.params.categoryID) return next(new errObj.BadRequestError("categoryID is required as url parameter"))
		if(req.params.categoryID.split('').length != 24) return next(new errObj.BadRequestError("Invalid categoryID"))
		const categoryID = mongoose.Types.ObjectId(req.params.categoryID)

		const jnms = await Jnms.aggregate([
			{ $match: {categoryID: categoryID}},
			{ $skip: skips},
			{ $limit: limit},
			{ $lookup: 
				{ 
					from: 'journal_magazine_categories', 
					let: { category_id: "$categoryID" },
					pipeline: [
						{ $match: { $expr: { $eq: ["$_id", "$$category_id"] } } },
						{ $project: {name: 1}}
					],
					as: 'categoryInfo'
				}
			},
			{ $unwind: '$categoryInfo'},
		])

		// if(jnms.length < 1) return next(new errObj.NotFoundError("Book not found."))

		const totalJnms = await Books.countDocuments({categoryID: categoryID})
		if(totalBooks < nextSkips) {nextSkips = null}
        req.nextSkips = nextSkips;
    	req.total = totalJnms;
		req.jnms = jnms;
		next();
	}
	catch(err){
		next(err)
	}
}

const searchJnm = async (req, res, next) => {
	try{
		let skips = 0, limit = 10;
        if(req.query.skips) {skips = parseInt(req.query.skips);}
        if(req.query.limit) {limit = parseInt(req.query.limit);}
        let nextSkips = skips + limit;

        const searchKey = req.query.searchKey;
        const results = await Jnms.aggregate([
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


module.exports = {
	addMainJnmCategory,
	addSubJnmCategory,
	renameJnmCategory,
	getAllJnmCategory,

	uploadJnmFiles,
	jnmValidation,
	postJnm,
	updateJnmDetails,
	updateJnmFiles,
	deleteJnm,
	getJnmDetails,
	getJnmsByCategory,


	searchJnm
}