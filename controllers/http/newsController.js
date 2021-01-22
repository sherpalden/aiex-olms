// require node modules
const mongoose = require('mongoose');
const Busboy = require('busboy');
const fs = require('fs');
const path = require('path');
const is = require('type-is');
const util = require('util');
var appendField = require('append-field');

//require database models
const Users = require('../../models/users/users.js');
const Admins = require('../../models/users/admins.js');
const NewsCategories = require('../../models/news/newsCategories.js');
const News = require('../../models/news/news.js');

//require project files
const errObj = require('../../error/errorHandler.js');
const validationRule = require('../validationController.js');
const fileDeleter = require('../../helpers/http/deleteFiles.js')


/*Category management begins here*/

const addMainCategory = async (req, res, next) => {
	try{
		if(!req.body.categoryName || (validationRule.notEmptyValidation(req.body.categoryName) === false)){
			return next(new errObj.BadRequestError("categoryName field is required and cannot be empty."));
		}
		let rootCategory = await NewsCategories.findOne({parentID: null});
		if(!rootCategory){
			rootCategory = await NewsCategories.create({name: "root", parentID: null});
		}
		const category = await NewsCategories.create({
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

const addSubCategory = async (req, res, next) => {
	try{
		if(!req.body.categoryName || (validationRule.notEmptyValidation(req.body.categoryName) === false)){
			return next(new errObj.BadRequestError("categoryName field is required and cannot be empty."));
		}
		if(!req.body.parentID || (validationRule.notEmptyValidation(req.body.parentID) === false)){
			return next(new errObj.BadRequestError("parentID field is required and cannot be empty."));
		}
		if(req.body.parentID.split('').length != 24) return next(new errObj.BadRequestError("Invalid parentID"));

		const category = await NewsCategories.findOne({_id: req.body.parentID});
		if(!category) return next(new errObj.NotFoundError("Category corresponding to parentID not found"));

		const newCategory = await NewsCategories.create({
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

const renameCategory = async (req, res, next) => {
	try{
		if(!req.body.newName || (validationRule.notEmptyValidation(req.body.newName) === false)){
			return next(new errObj.BadRequestError("newName field is required and cannot be empty."));
		}
		if(!req.body.categoryID || (validationRule.notEmptyValidation(req.body.categoryID) === false)){
			return next(new errObj.BadRequestError("categoryID field is required and cannot be empty."));
		}
		if(req.body.categoryID.split('').length != 24) return next(new errObj.BadRequestError("Invalid categoryID"));

		const category = await NewsCategories.findOne({_id: req.body.categoryID});
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

const deleteCategory = async (req, res, next) => {
	try{
		if(!req.params.categoryID) return next(new errObj.BadRequestError("categoryID is required as url parameter!"));
		if(req.params.categoryID.split('').length != 24) return next(new errObj.BadRequestError('Invalid categoryID'));
		const categoryID = mongoose.Types.ObjectId(req.params.categoryID);
		const categories = await NewsCategories.find({});
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
		//An Easy Way to Build a Tree in JavaScript Using Object References//
		const idMapping = data.reduce((acc, el, i) => {
			acc[el._id] = i;
			return acc;
		}, {});

		let root;
		data.forEach(el => {
			// Handle the root element
			if (el.parentID === null) {
				root = el;
				return;
			}
			// Use our mapping to locate the parent element in our data array
			const parentEl = data[idMapping[el.parentID]];
			// Add our current el to its parent's `children` array
			parentEl.children = [...(parentEl.children || []), el];
		});

		function findSubTree(nodeID, root) {
			if(root.children){
				for(category of root.children){
					if(category._id === nodeID) {
						return category;
					}
					console.log(category.name)
					findSubTree(nodeID, category);
				}
				// for(category of root.children){
				// }
			}
		}

		let nodeID = categoryID.toString();
		let subTree = findSubTree(nodeID, root);
		req.subTree = subTree;
		next();
	}
	catch(err){
		next(err);
	}
}

const getAllCategories = async (req, res, next) => {
	try{
		const categories = await NewsCategories.find({});
		req.categories = categories;
		debugger
		next();
	}
	catch(err){
		next(err);
	}
}

const getAllCategoryTree = async (req, res, next) => {
	try{
		const categories = await NewsCategories.find({});
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
		//An Easy Way to Build a Tree in JavaScript Using Object References//
		const idMapping = data.reduce((acc, el, i) => {
			acc[el._id] = i;
			return acc;
		}, {});

		let root;
		data.forEach(el => {
			// Handle the root element
			if (el.parentID === null) {
				root = el;
				return;
			}
			// Use our mapping to locate the parent element in our data array
			const parentEl = data[idMapping[el.parentID]];
			// Add our current el to its parent's `children` array
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

/*Category management ends here
**
*
*
*
*
*
*
*
*
*
*/

/*News functionality begins here*/
const uploadNewsFiles = async (req, res, next) => {
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

const newsValidation = async (req, res, next) => {
	try {
		const requiredFields = ['title', 'categoryID', 'description'];
		for(field of requiredFields){
			if(!req.body[field] || (validationRule.notEmptyValidation(req.body[field]) === false)){
				throw new errObj.BadRequestError(`${field} field is required and cannot be empty.`);
			}
		}
		if(req.body.categoryID.split('').length != 24) throw new errObj.BadRequestError("Invalid categoryID")
		if(!req.body.metaTags) throw new errObj.BadRequestError("metaTags field is required.");
		const metaTags = JSON.parse(req.body.metaTags);
		if(metaTags.length < 3) throw new errObj.BadRequestError("At least 3 meta tags are required");
		if(!req.body.publishingAt){
			throw new errObj.BadRequestError("publishingAt field is required.");
		}
		if(validationRule.dateValidation(req.body.publishingAt) === false){
			throw new errObj.BadRequestError("Invalid publication Date format");
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

const postNews = async (req, res, next) => {
	try {
		const adminID = req.adminID;
		const newsData = await News.create({ 
			title: req.body.title,
			categoryID: req.body.categoryID,
			description: req.body.description,
			thumbnail: req.images[0] || null,
			images: req.images,
			metaTags: JSON.parse(req.body.metaTags),
			youtubeLink: req.body.youtubeLink || null,
			publishingAt: req.body.publishingAt,
			createdBy: adminID,
		})
		const rename = util.promisify(fs.rename);
		for(file of req.images){
			await rename(`./public/uploads/temp/${file}`, `./public/uploads/news/${file}`);
		}
		req.newsData = newsData;
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

const deleteNews = async (req, res, next) => {
	try{
		if(!req.params.newsID) return next(new errObj.BadRequestError("newsID is required as url parameter!"))
		if(req.params.newsID.split('').length != 24) return next(new errObj.BadRequestError('Invalid newsID'))
		const newsID = mongoose.Types.ObjectId(req.params.newsID);
		const news = await News.findOne({_id: newsID});
		if(!news) return next(new errObj.NotFoundError("News corresponding to the newsID not found"));
		for(image of news.images){
			await fileDeleter.deleteFile(`./public/uploads/news/${image}`);
		}
		await News.deleteOne({_id: newsID});
		debugger
		next();
	}
	catch(err){
		next(err);
	}
}

const deleteNewsByCategory = async (req, res, next) => {
	try{
		if(!req.params.categoryID) return next(new errObj.BadRequestError("categoryID is required as url parameter!"));
		if(req.params.categoryID.split('').length != 24) return next(new errObj.BadRequestError('Invalid categoryID'));
		const categoryID = mongoose.Types.ObjectId(req.params.categoryID);
		console.log(categoryID)
		const allNews = await News.find({categoryID: categoryID});
		if(allNews.length < 1) return next(new errObj.NotFoundError("No news found to delete."));
		for(news of allNews){
			for(image of news.images){
				await fileDeleter.deleteFile(`./public/uploads/news/${image}`);
			}
		}
		await News.deleteMany({categoryID: categoryID});
		debugger 
		next();
	}
	catch(err){
		next(err);
	}
}

const setThumbnail = async (req, res, next) => {
	try{
		if(!req.params.newsID) return next(new errObj.BadRequestError("newsID is required as url parameter!"))
		if(req.params.newsID.split('').length != 24) return next(new errObj.BadRequestError('Invalid newsID'))
		const newsID = mongoose.Types.ObjectId(req.params.newsID);
		if(!req.body.thumbnailImage) return next(new errObj.BadRequestError("thumbnailImage name is required"));
		const news = await News.findOne({_id: newsID});
		if(!news) return next(new errObj.NotFoundError("News corresponding to the newsID not found"));
		if(!news.images.includes(req.body.thumbnailImage)){
			return next(new errObj.NotFoundError("The thumbnail image name not found"));
		}
		news.thumbnail = req.body.thumbnailImage;
		await news.save();
		debugger
		next();
	}
	catch(err){
		next(err);
	}
}

const updateNews = async (req, res, next) => {
	try{
		if(!req.params.newsID) return next(new errObj.BadRequestError("newsID is required as url parameter!"))
		if(req.params.newsID.split('').length != 24) return next(new errObj.BadRequestError('Invalid newsID'))
		const newsID = mongoose.Types.ObjectId(req.params.newsID);
		const news = await News.findOne({_id: newsID});
		if(!news) return next(new errObj.NotFoundError("News corresponding to the newsID not found"));

		const newsFields = ['title', 'categoryID', 'description'];
		for(field of newsFields){
			if(req.body[field]){
				if(validationRule.notEmptyValidation(req.body[field]) === false){
					return next(new errObj.BadRequestError(`${field} field cannot be empty`));
				}
				news[field] = req.body[field];
			}
		}
		if(req.body.categoryID){
			if(req.body.categoryID.split('').length != 24) return next(new errObj.BadRequestError("Invalid categoryID"));
			news.categoryID = req.body.categoryID;
		}
		if(req.body.metaTags){
			const metaTags = JSON.parse(req.body.metaTags);
			if(metaTags.length < 3) return next(new errObj.BadRequestError("At least 3 tags are required!!!"))
			news.metaTags = req.body.metaTags;
		}
		if(req.body.youtubeLink){
			news.youtubeLink = req.body.youtubeLink;
		}
		if(req.body.publishingAt){
			if(validationRule.dateValidation(req.body.publishingAt) === false){
				return next(new errObj.BadRequestError("Invalid publishingAt Date format"));
			}
			news.publishingAt = req.body.publishingAt;
		}
		if(req.body.imagesToBeDeleted){
			const imagesToBeDeleted = JSON.parse(req.body.imagesToBeDeleted);
			for(image of imagesToBeDeleted){
				await fileDeleter.deleteFile(`./public/uploads/news/${image}`);
				news.images.pull(image);
			}
		}
		if(req.images.length > 0){
			const rename = util.promisify(fs.rename);
			for(image of req.images){
				await rename(`./public/uploads/temp/${image}`, `./public/uploads/news/${image}`);
				news.images.push(image);
			}
		}
		news.updatedAt = Date.now();
		await news.save();
		req.newsData = news;
		debugger
		next();
	}
	catch(err){
		next(err);
	}
}

const getNewsDetail = async (req, res, next) => {
	try{
		if(!req.params.newsID) return next(new errObj.BadRequestError("newsID is required as url parameter!"))
		if(req.params.newsID.split('').length != 24) return next(new errObj.BadRequestError('Invalid newsID'))
		const newsID = mongoose.Types.ObjectId(req.params.newsID);

		let newsData = await News.aggregate([
			{$match: {_id: newsID}},
			{$lookup: 
				{ 
					from: 'admins', 
					let: { admin_id: "$createdBy" },
					pipeline: [
						{ $match: { $expr: { $eq: ["$_id", "$$admin_id"] } } },
						{ $project: {firstName: 1, lastName: 1, role: 1 }}
					],
					as: 'adminInfo'
				}
			},
			{$unwind: '$adminInfo'},
		]);
		if(newsData.length < 1) return next(new errObj.NotFoundError("News corresponding to given newsID not found"));
		newsData = newsData[0];
		const categoryID = newsData.categoryID;
		let categoryHierarchy = [];
		const categories = await NewsCategories.find({});

		function findTreeHierarchyLevel(categoryID){
			for(category of categories){
				if(category._id.equals(categoryID) || category._id == categoryID){
					categoryHierarchy.push({_id: category._id, name: category.name});
					if(category.parentID === null) return;
					else findTreeHierarchyLevel(category.parentID)
				}
			}
		};
		findTreeHierarchyLevel(categoryID);
		newsData.categoryHierarchy = categoryHierarchy;
		req.newsData = newsData;
		debugger
		next();
	}
	catch(err){
		next(err);
	}
}

const getNewsByCategory = async (req, res, next) => {
	try{
		if(!req.params.categoryID) return next(new errObj.BadRequestError("categoryID is required as url parameter!"));
		if(req.params.categoryID.split('').length != 24) return next(new errObj.BadRequestError('Invalid categoryID'))
		const categoryID = mongoose.Types.ObjectId(req.params.categoryID);

		const news = await News.aggregate([
			{$match: {categoryID: categoryID}},
			{$lookup: 
				{ 
					from: 'news_categories', 
					pipeline: [
						{ $match: {_id: categoryID} },
						{ $project: {name: 1, _id: 0}}
					],
					as: 'categoryInfo'
				}
			},
			{$unwind: '$categoryInfo'},
			{$lookup: 
				{ 
					from: 'admins', 
					let: { admin_id: "$createdBy" },
					pipeline: [
						{ $match: { $expr: { $eq: ["$_id", "$$admin_id"] } } },
						{ $project: {firstName: 1, lastName: 1, role: 1 }}
					],
					as: 'adminInfo'
				}
			},
			{$unwind: '$adminInfo'},
		]);
		req.news = news;
		debugger
		next();
	}
	catch(err){
		next(err);
	}
}

const getNewsByCategoryForUser = async (req, res, next) => {
	try{
		if(!req.params.categoryID) return next(new errObj.BadRequestError("categoryID is required as url parameter!"));
		if(req.params.categoryID.split('').length != 24) return next(new errObj.BadRequestError('Invalid categoryID'))
		const categoryID = mongoose.Types.ObjectId(req.params.categoryID);
		const currentDate = Date.now();
		const news = await News.aggregate([
			// {$match: {categoryID: categoryID}},
			{ $match: {$and: [{categoryID: categoryID}, {publishingAt: {$lte: new Date(currentDate)}}]}},
			{$lookup: 
				{ 
					from: 'news_categories', 
					pipeline: [
						{ $match: {_id: categoryID}},
						{ $project: {name: 1, _id: 0}}
					],
					as: 'categoryInfo'
				}
			},
			{$unwind: '$categoryInfo'},
			{$lookup: 
				{ 
					from: 'admins', 
					let: { admin_id: "$createdBy" },
					pipeline: [
						{ $match: { $expr: { $eq: ["$_id", "$$admin_id"] } } },
						{ $project: {firstName: 1, lastName: 1, role: 1 }}
					],
					as: 'adminInfo'
				}
			},
			{$unwind: '$adminInfo'},
		]);
		req.news = news;
		console.log(news[0]);
		debugger
		next();
	}
	catch(err){
		next(err);
	}
}



/*News functionality ends here*/


module.exports = {
	addMainCategory,
	addSubCategory,
	renameCategory,
	deleteCategory,
	getAllCategories,
	getAllCategoryTree,

	uploadNewsFiles,
	newsValidation,
	postNews,
	setThumbnail,
	updateNews,
	deleteNews,
	deleteNewsByCategory,

	getNewsDetail,
	getNewsByCategory,
	getNewsByCategoryForUser,
}