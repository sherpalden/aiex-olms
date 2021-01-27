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
const BookTopics = require('../../models/digital_library/bookTopics.js')

//require project files
const errObj = require('../../error/errorHandler.js')
const validationRule = require('../validationController.js')
const fileDeleter = require('../../helpers/http/deleteFiles.js')


const addBookTopic = async (req, res, next) => {
	try{
		if(!req.body.bookTopic || (validationRule.notEmptyValidation(req.body.bookTopic) === false)){
			return next(new errObj.BadRequestError("bookTopic field is required and cannot be empty."))
		}
		let topic = await BookTopics.findOne({name: req.body.bookTopic.trim()})
		if(topic) return next(new errObj.BadRequestError("This book topic already exits"))
		topic = await BookTopics.create({
			name: req.body.bookTopic.trim()
		})
		req.topic = topic
		debugger
		next();
	}
	catch(err){
		next(err);
	}
}

const renameBookTopic = async (req, res, next) => {
	try{
		if(!req.body.topicName || (validationRule.notEmptyValidation(req.body.topicName) === false)){
			return next(new errObj.BadRequestError("newName field is required and cannot be empty."))
		}
		if(!req.body.topicID || (validationRule.notEmptyValidation(req.body.topicID) === false)){
			return next(new errObj.BadRequestError("topicID field is required and cannot be empty."))
		}
		if(req.body.topicID.split('').length != 24) return next(new errObj.BadRequestError("Invalid topicID"));

		const topic = await BookTopics.findOne({_id: req.body.topicID});
		if(!topic) return next(new errObj.NotFoundError("Book topic corresponding to topicID not found"));

		topic.name = req.body.topicName;
		await topic.save();
		debugger
		next();
	}
	catch(err){
		next(err);
	}
}

const getBookTopics = async (req, res, next) => {
	try{
		const bookTopics = await BookTopics.find({});
		req.bookTopics = bookTopics;
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
		const requiredFields = ['title', 'abstract', 'topicID', 'publisher', 'edition', 'publicationDate', 'isbn', 'doi'];
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
		if(req.body.topicID.split('').length != 24) return next(new errObj.BadRequestError("Invalid topicID"));
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
			topicID: req.body.topicID,
			publisher: req.body.publisher,
			abstract: req.body.abstract,
			edition: req.body.edition,
			publicationDate: req.body.publicationDate,
			isbn: req.body.isbn,
			doi: req.body.doi,
			thumbnail: req.image,
			pdf: req.req.pdf,
		})
		const rename = util.promisify(fs.rename);
		await rename(`./public/uploads/temp/${req.image}`, `./public/uploads/books/${req.image}`);
		await rename(`./public/uploads/temp/${req.req.pdf}`, `./public/uploads/books/${req.req.pdf}`);
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
		if(req.body.topicID){
			if(req.body.topicID.split('').length != 24) return next(new errObj.BadRequestError("Invalid topicID"));
			book.topicID = req.body.topicID
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
		if(req.body.bookID.split('').length != 24) return next(new errObj.BadRequestError("Invalid bookID"))
		const bookID = mongoose.Types.ObjectId(req.params.bookID)
		const book = await Books.findOne({_id: bookID})
		if(!book) return next(new errObj.NotFoundError("Book not found."))

		let filesToBeDeleted = []
		if(req.image){
			if(book.image) { filesToBeDeleted.push(`./public/uploads/books/${book.image}`) }
			book.thumbnail = req.image
		}
		if(req.pdf){
			if(book.pdf) { filesToBeDeleted.push(`./public/uploads/books/${book.pdf}`) }
			book.thumbnail = req.pdf
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
		if(req.body.bookID.split('').length != 24) return next(new errObj.BadRequestError("Invalid bookID"))
		const bookID = mongoose.Types.ObjectId(req.params.bookID)
		const book = await Books.findOne({_id: bookID})
		if(!book) return next(new errObj.NotFoundError("Book not found."))
		let filesToBeDeleted = []
		if(book.image) { filesToBeDeleted.push(`./public/uploads/books/${book.image}`) }
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
		if(req.body.bookID.split('').length != 24) return next(new errObj.BadRequestError("Invalid bookID"))
		const bookID = mongoose.Types.ObjectId(req.params.bookID)
		const books = await Books.aggregate([
			{ $match: {_id: bookID}},
			{ $lookup: 
				{ 
					from: 'book_topics', 
					let: { topic_id: "$topicID" },
					pipeline: [
						{ $match: { $expr: { $eq: ["$_id", "$$topic_id"] } } },
						{ $project: {name: 1}}
					],
					as: 'topicInfo'
				}
			},
			{ $unwind: '$topicInfo'},
		])
		if(books.length < 1) return next(new errObj.NotFoundError("Book not found."))
		req.book = books[0]
		next()
	}
	catch(err){
		next(err)
	}
}

const getBooksByTopic = async (req, res, next) => {
	try{
		let skips = 0, limit = 10;
        if(req.query.skips) {skips = parseInt(req.query.skips);}
        if(req.query.limit) {limit = parseInt(req.query.limit);}
        let nextSkips = skips + limit;

		if(!req.params.topicID) return next(new errObj.BadRequestError("topicID is required as url parameter"))
		if(req.body.topicID.split('').length != 24) return next(new errObj.BadRequestError("Invalid topicID"))
		const topicID = mongoose.Types.ObjectId(req.params.topicID)

		const books = await Books.aggregate([
			{ $match: {topicID: topicID}},
			{ $skip: skips},
			{ $limit: limit},
			{ $lookup: 
				{ 
					from: 'book_topics', 
					let: { topic_id: "$topicID" },
					pipeline: [
						{ $match: { $expr: { $eq: ["$_id", "$$topic_id"] } } },
						{ $project: {name: 1}}
					],
					as: 'topicInfo'
				}
			},
			{ $unwind: '$topicInfo'},
		])

		if(books.length < 1) return next(new errObj.NotFoundError("Book not found."))

		const totalBooks = Books.countDocuments({topicID: topicID})
		if(totalBooks < nextSkips) {nextSkips = null}
        req.nextSkips = nextSkips;
    	req.total = totalBooks;
		req.books = books;
	}
	catch(err){
		next(err)
	}
}

module.exports = {
	addBookTopic,
	renameBookTopic,
	getBookTopics,

	uploadBookFiles,
	bookValidation,
	postBook,
	updateBookDetails,
	updateBookFiles,
	deleteBook,
	getBookDetails,
}