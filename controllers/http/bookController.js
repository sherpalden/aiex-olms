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
const Books = require('../../models/digital_library/books.js')
const BookCategories = require('../../models/digital_library/bookCategories.js')

//require project files
const errObj = require('../../error/errorHandler.js')
const validationRule = require('../validationController.js')
const fileDeleter = require('../../helpers/http/deleteFiles.js')



const addMainBookCategory = async (req, res, next) => {
	try{
		if(!req.body.categoryName || (validationRule.notEmptyValidation(req.body.categoryName) === false)){
			return next(new errObj.BadRequestError("categoryName field is required and cannot be empty."));
		}
		let rootCategory = await BookCategories.findOne({parentID: null});
		if(!rootCategory){
			rootCategory = await BookCategories.create({name: "root", parentID: null});
		}
		const category = await BookCategories.create({
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

const addSubBookCategory = async (req, res, next) => {
	try{
		if(!req.body.categoryName || (validationRule.notEmptyValidation(req.body.categoryName) === false)){
			return next(new errObj.BadRequestError("categoryName field is required and cannot be empty."));
		}
		if(!req.body.parentID || (validationRule.notEmptyValidation(req.body.parentID) === false)){
			return next(new errObj.BadRequestError("parentID field is required and cannot be empty."));
		}
		if(req.body.parentID.split('').length != 24) return next(new errObj.BadRequestError("Invalid parentID"));

		const category = await BookCategories.findOne({_id: req.body.parentID});
		if(!category) return next(new errObj.NotFoundError("Category corresponding to parentID not found"));

		const newCategory = await BookCategories.create({
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

const renameBookCategory = async (req, res, next) => {
	try{
		if(!req.body.newName || (validationRule.notEmptyValidation(req.body.newName) === false)){
			return next(new errObj.BadRequestError("newName field is required and cannot be empty."));
		}
		if(!req.body.categoryID || (validationRule.notEmptyValidation(req.body.categoryID) === false)){
			return next(new errObj.BadRequestError("categoryID field is required and cannot be empty."));
		}
		if(req.body.categoryID.split('').length != 24) return next(new errObj.BadRequestError("Invalid categoryID"));

		const category = await BookCategories.findOne({_id: req.body.categoryID});
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

const getAllBookCategory = async (req, res, next) => {
	try{
		const categories = await BookCategories.find({});
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



const uploadBookFiles = async (req, res, next) => {
	let image;
    let filesUploaded = [];
    let pdf;
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
            if(fileExt === '.jpeg' || fileExt === '.jpg' ||  fileExt === '.png'){
                image = filename;
                filesUploaded.push(`./public/uploads/temp/${filename}`);
            	file.pipe(fs.createWriteStream(`./public/uploads/temp/${filename}`));
            }
            else if(fileExt === '.pdf'){
                pdf = filename;
                filesUploaded.push(`./public/uploads/temp/${filename}`);
            	file.pipe(fs.createWriteStream(`./public/uploads/temp/${filename}`));
            }
            else {
                return next(new errObj.BadRequestError("Invalid file type!!!"));
            }
        });
        busboy.on('finish', (err) => {
            if (err) return next(err)
            if(image) {req.image = image}
            if(pdf) {req.pdf = pdf}
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

const bookValidation = async (req, res, next) => {
	try {
		const requiredFields = ['title', 'abstract', 'categoryID', 'publisher', 'edition', 'publicationDate', 'isbn', 'doi'];
		if(!(req.image && req.pdf)) throw new errObj.BadRequestError("Files of book and its thumbnail image is required");
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
		if(validationRule.dateValidation(req.body.publicationDate) === false){
			throw new errObj.BadRequestError("Invalid publicationDate");
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

const postBook = async (req, res, next) => {
	try {
		const BookData = await Books.create({ 
			title: req.body.title,
			authors: JSON.parse(req.body.authors),
			categoryID: req.body.categoryID,
			publisher: req.body.publisher,
			abstract: req.body.abstract,
			edition: req.body.edition,
			publicationDate: req.body.publicationDate,
			isbn: req.body.isbn,
			doi: req.body.doi,
			thumbnail: req.image,
			pdf: req.pdf,
		})
		const rename = util.promisify(fs.rename);
		await rename(`./public/uploads/temp/${req.image}`, `./public/uploads/books/${req.image}`);
		await rename(`./public/uploads/temp/${req.pdf}`, `./public/uploads/books/${req.pdf}`);
		req.BookData = BookData;
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

const updateBookDetails = async (req, res, next) => {
	try{
		if(!req.params.bookID) return next(new errObj.BadRequestError("bookID is required as url parameter"))
		if(req.body.bookID.split('').length != 24) return next(new errObj.BadRequestError("Invalid bookID"))
		const bookID = mongoose.Types.ObjectId(req.params.bookID)
		const book = await Books.findOne({_id: bookID})
		if(!book) return next(new errObj.NotFoundError("Book not found."))

		const bookFields = ['title', 'publisher', 'abstract', 'edition', 'isbn', 'doi']
		for(field of bookFields){
			if(req.body[field]){
				if(validationRule.notEmptyValidation(req.body[field]) === false){
					return next(new errObj.BadRequestError(`${field} field cannot be empty.`))
				}
				book[field] = req.body[field]
			}
		}
		if(req.body.categoryID){
			if(req.body.categoryID.split('').length != 24) return next(new errObj.BadRequestError("Invalid categoryID"));
			book.categoryID = req.body.categoryID
		}
		if(req.body.publicationDate){
			if(validationRule.dateValidation(req.body.publicationDate) === false){
				return next(new errObj.BadRequestError("Invalid publicationDate"))
			}
			book.publicationDate = req.body.publicationDate;
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
			book.authors = JSON.parse(req.body.authors)
		}
		await book.save();
		next();
	}
	catch(err){
		next(err)
	}
}

const updateBookFiles = async (req, res, next) => {
	try{
		if(!req.params.bookID) return next(new errObj.BadRequestError("bookID is required as url parameter"))
		if(req.params.bookID.split('').length != 24) return next(new errObj.BadRequestError("Invalid bookID"))
		const bookID = mongoose.Types.ObjectId(req.params.bookID)
		const book = await Books.findOne({_id: bookID})
		if(!book) return next(new errObj.NotFoundError("Book not found."))

		let filesToBeDeleted = []
		if(req.image){
			if(book.thumbnail) { filesToBeDeleted.push(`./public/uploads/books/${book.thumbnail}`) }
			book.thumbnail = req.image
		}
		if(req.pdf){
			if(book.pdf) { filesToBeDeleted.push(`./public/uploads/books/${book.pdf}`) }
			book.pdf = req.pdf
		}
		await fileDeleter.deleteFiles(filesToBeDeleted)
		await book.save()
		next()
	}
	catch(err){
		next(err)
	}
}

const deleteBook = async (req, res, next) => {
	try{
		if(!req.params.bookID) return next(new errObj.BadRequestError("bookID is required as url parameter"))
		if(req.params.bookID.split('').length != 24) return next(new errObj.BadRequestError("Invalid bookID"))
		const bookID = mongoose.Types.ObjectId(req.params.bookID)
		const book = await Books.findOne({_id: bookID})
		if(!book) return next(new errObj.NotFoundError("Book not found."))
		let filesToBeDeleted = []
		if(book.thumbnail) { filesToBeDeleted.push(`./public/uploads/books/${book.thumbnail}`) }
		if(book.pdf) { filesToBeDeleted.push(`./public/uploads/books/${book.pdf}`) }
		await fileDeleter.deleteFiles(filesToBeDeleted)
		await Books.deleteOne({_id: bookID})
		next()
	}
	catch(err){
		next(err)
	}
}

const getBookDetails = async (req, res, next) => {
	try{
		if(!req.params.bookID) return next(new errObj.BadRequestError("bookID is required as url parameter"))
		if(req.params.bookID.split('').length != 24) return next(new errObj.BadRequestError("Invalid bookID"))
		const bookID = mongoose.Types.ObjectId(req.params.bookID)
		const books = await Books.aggregate([
			{ $match: {_id: bookID}},
			{ $lookup: 
				{ 
					from: 'book_categories', 
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
		if(books.length < 1) return next(new errObj.NotFoundError("Book not found."))
		req.book = books[0]
		next()
	}
	catch(err){
		next(err)
	}
}

const getBooksByCategory = async (req, res, next) => {
	try{
		let skips = 0, limit = 10;
        if(req.query.skips) {skips = parseInt(req.query.skips);}
        if(req.query.limit) {limit = parseInt(req.query.limit);}
        let nextSkips = skips + limit;

		if(!req.params.categoryID) return next(new errObj.BadRequestError("categoryID is required as url parameter"))
		if(req.params.categoryID.split('').length != 24) return next(new errObj.BadRequestError("Invalid categoryID"))
		const categoryID = mongoose.Types.ObjectId(req.params.categoryID)

		const books = await Books.aggregate([
			{ $match: {categoryID: categoryID}},
			{ $skip: skips},
			{ $limit: limit},
			{ $lookup: 
				{ 
					from: 'book_categories', 
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

		// if(books.length < 1) return next(new errObj.NotFoundError("Book not found."))

		const totalBooks = await Books.countDocuments({categoryID: categoryID})
		if(totalBooks < nextSkips) {nextSkips = null}
        req.nextSkips = nextSkips;
    	req.total = totalBooks;
		req.books = books;
		next();
	}
	catch(err){
		next(err)
	}
}


const parseFormData = (req, res, next) => {
	try{
		if(!is(req, ['multipart'])) return next(new errObj.BadRequestError("The content type must be multipart/form-data"));
        const busboy = new Busboy({headers: req.headers});
        busboy.on('field', (fieldname, value) => {
            appendField(req.body, fieldname, value)
        });
        busboy.on('finish', (err) => {
        	const jsonObj = {
				employees:[
				  {firstName:"John", lastName:"Doe"},
				  {firstName:"Anna", lastName:"Smith"},
				]
			}
			const jsonData = JSON.stringify(jsonObj)
            next();
        });
        req.pipe(busboy);
	}
	catch(err){
		next(err)
	}
}

module.exports = {
	addMainBookCategory,
	addSubBookCategory,
	renameBookCategory,
	getAllBookCategory,

	uploadBookFiles,
	bookValidation,
	postBook,
	updateBookDetails,
	updateBookFiles,
	deleteBook,
	getBookDetails,
	getBooksByCategory,


	parseFormData
}