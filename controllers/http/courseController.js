// require node modules
const mongoose = require('mongoose')
const Busboy = require('busboy')
const fs = require('fs')
const path = require('path')
const is = require('type-is')
const util = require('util')
const appendField = require('append-field')

//require database models
const Users = require('../../models/users/users.js')
const Admins = require('../../models/users/admins.js')
const Courses = require('../../models/digital_library/courses.js')
const CourseCategories = require('../../models/digital_library/courseCategories.js')

//require project files
const errObj = require('../../error/errorHandler.js')
const validationRule = require('../validationController.js')
const fileDeleter = require('../../helpers/http/deleteFiles.js')



const addMainCourseCategory = async (req, res, next) => {
	try{
		if(!req.body.categoryName || (validationRule.notEmptyValidation(req.body.categoryName) === false)){
			return next(new errObj.BadRequestError("categoryName field is required and cannot be empty."));
		}
		let rootCategory = await CourseCategories.findOne({parentID: null});
		if(!rootCategory){
			rootCategory = await CourseCategories.create({name: "root", parentID: null});
		}
		const category = await CourseCategories.create({
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

const addSubCourseCategory = async (req, res, next) => {
	try{
		if(!req.body.categoryName || (validationRule.notEmptyValidation(req.body.categoryName) === false)){
			return next(new errObj.BadRequestError("categoryName field is required and cannot be empty."));
		}
		if(!req.body.parentID || (validationRule.notEmptyValidation(req.body.parentID) === false)){
			return next(new errObj.BadRequestError("parentID field is required and cannot be empty."));
		}
		if(req.body.parentID.split('').length != 24) return next(new errObj.BadRequestError("Invalid parentID"));

		const category = await CourseCategories.findOne({_id: req.body.parentID});
		if(!category) return next(new errObj.NotFoundError("Category corresponding to parentID not found"));

		const newCategory = await CourseCategories.create({
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

const renameCourseCategory = async (req, res, next) => {
	try{
		if(!req.body.newName || (validationRule.notEmptyValidation(req.body.newName) === false)){
			return next(new errObj.BadRequestError("newName field is required and cannot be empty."));
		}
		if(!req.body.categoryID || (validationRule.notEmptyValidation(req.body.categoryID) === false)){
			return next(new errObj.BadRequestError("categoryID field is required and cannot be empty."));
		}
		if(req.body.categoryID.split('').length != 24) return next(new errObj.BadRequestError("Invalid categoryID"));

		const category = await CourseCategories.findOne({_id: req.body.categoryID});
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

const getAllCourseCategoryTree = async (req, res, next) => {
	try{
		const categories = await CourseCategories.find({});
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

const getAllCourseCategories = async (req, res, next) => {
	try{
		const categories = await CourseCategories.find({});
		req.categories = categories;
		debugger
		next();
	}
	catch(err){
		next(err);
	}
}

const uploadCourseFiles = async (req, res, next) => {
    let filesUploaded = [];
    let thumbnail;
    let courseFiles = [];
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
            	courseFiles.push(filename);
                filesUploaded.push(`./public/uploads/temp/${filename}`);
            	file.pipe(fs.createWriteStream(`./public/uploads/courses/${filename}`));
            }
            else if(fileExt === '.jpeg' || fileExt === '.jpg' || fileExt === '.png'){
            	thumbnail = filename;
                filesUploaded.push(`./public/uploads/temp/${filename}`);
            	file.pipe(fs.createWriteStream(`./public/uploads/courses/${filename}`));
            }
            else {
                return next(new errObj.BadRequestError("Invalid file type!!!"));
            }
        });
        busboy.on('finish', (err) => {
            if (err) return next(err)
            if(thumbnail) {req.thumbnail = thumbnail};
            req.filesUploaded = filesUploaded;
            req.courseFiles = courseFiles;
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

const courseValidation = async (req, res, next) => {
	try {
		const requiredFields = ['title', 'description', 'categoryID', 'level'];
		if(!(req.thumbnail)) throw new errObj.BadRequestError("course thumbnail image is required");
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

const postCourse = async (req, res, next) => {
	try {
		const courseData = await Courses.create({ 
			title: req.body.title,
			authors: JSON.parse(req.body.authors),
			categoryID: req.body.categoryID,
			level: req.body.level,
			description: JSON.parse(req.body.description),
			thumbnail: req.thumbnail,
			files: req.files,
		})
		const rename = util.promisify(fs.rename);
		await rename(`./public/uploads/temp/${req.thumbnail}`, `./public/uploads/courses/${req.thumbnail}`);
		for (file of req.files){
			await rename(`./public/uploads/temp/${file}`, `./public/uploads/courses/${file}`);
		}
		req.courseData = courseData;
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

const updateCourseDetails = async (req, res, next) => {
	try{
		if(!req.params.courseID) return next(new errObj.BadRequestError("courseID is required as url parameter"))
		if(req.body.courseID.split('').length != 24) return next(new errObj.BadRequestError("Invalid courseID"))
		const courseID = mongoose.Types.ObjectId(req.params.courseID)
		const course = await Courses.findOne({_id: courseID})
		if(!course) return next(new errObj.NotFoundError("course not found."))

		const courseFields = ['title', 'categoryID', 'level']
		for(field of courseFields){
			if(req.body[field]){
				if(validationRule.notEmptyValidation(req.body[field]) === false){
					return next(new errObj.BadRequestError(`${field} field cannot be empty.`))
				}
				course[field] = req.body[field]
			}
		}
		if(req.body.categoryID){
			if(req.body.categoryID.split('').length != 24) return next(new errObj.BadRequestError("Invalid categoryID"));
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
			course.authors = JSON.parse(req.body.authors)
		}
		if(req.body.description){
			course.description = JSON.parse(req.body.description);
		}
		await course.save();
		next();
	}
	catch(err){
		next(err)
	}
}

const updatecourseFiles = async (req, res, next) => {
	try{
		if(!req.params.courseID) return next(new errObj.BadRequestError("courseID is required as url parameter"))
		if(req.params.courseID.split('').length != 24) return next(new errObj.BadRequestError("Invalid courseID"))
		const courseID = mongoose.Types.ObjectId(req.params.courseID)
		const course = await Courses.findOne({_id: courseID})
		if(!course) return next(new errObj.NotFoundError("course not found."))

		let filesToBeDeleted = []
		if(req.image){
			if(course.thumbnail) { filesToBeDeleted.push(`./public/uploads/courses/${course.thumbnail}`) }
			course.thumbnail = req.image
		}
		if(req.pdf){
			if(course.pdf) { filesToBeDeleted.push(`./public/uploads/courses/${course.pdf}`) }
			course.pdf = req.pdf
		}
		await fileDeleter.deleteFiles(filesToBeDeleted)
		await course.save()
		next()
	}
	catch(err){
		next(err)
	}
}

const deletecourse = async (req, res, next) => {
	try{
		if(!req.params.courseID) return next(new errObj.BadRequestError("courseID is required as url parameter"))
		if(req.params.courseID.split('').length != 24) return next(new errObj.BadRequestError("Invalid courseID"))
		const courseID = mongoose.Types.ObjectId(req.params.courseID)
		const course = await Courses.findOne({_id: courseID})
		if(!course) return next(new errObj.NotFoundError("course not found."))
		let filesToBeDeleted = []
		if(course.thumbnail) { filesToBeDeleted.push(`./public/uploads/courses/${course.thumbnail}`) }
		for (file of course.files){
			filesToBeDeleted.push(`./public/uploads/courses/${file}`)
		}
		await fileDeleter.deleteFiles(filesToBeDeleted)
		await Courses.deleteOne({_id: courseID})
		next()
	}
	catch(err){
		next(err)
	}
}

const getcourseDetails = async (req, res, next) => {
	try{
		if(!req.params.courseID) return next(new errObj.BadRequestError("courseID is required as url parameter"))
		if(req.params.courseID.split('').length != 24) return next(new errObj.BadRequestError("Invalid courseID"))
		const courseID = mongoose.Types.ObjectId(req.params.courseID)
		const courses = await Courses.aggregate([
			{ $match: {_id: courseID}},
			{ $lookup: 
				{ 
					from: 'course_categories', 
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
		if(courses.length < 1) return next(new errObj.NotFoundError("course not found."))
		req.course = courses[0]
		next()
	}
	catch(err){
		next(err)
	}
}

const getcoursesByCategory = async (req, res, next) => {
	try{
		let skips = 0, limit = 10;
        if(req.query.skips) {skips = parseInt(req.query.skips);}
        if(req.query.limit) {limit = parseInt(req.query.limit);}
        let nextSkips = skips + limit;

		if(!req.params.categoryID) return next(new errObj.BadRequestError("categoryID is required as url parameter"))
		if(req.params.categoryID.split('').length != 24) return next(new errObj.BadRequestError("Invalid categoryID"))
		const categoryID = mongoose.Types.ObjectId(req.params.categoryID)

		const courses = await Courses.aggregate([
			{ $match: {categoryID: categoryID}},
			{ $skip: skips},
			{ $limit: limit},
			{ $lookup: 
				{ 
					from: 'course_categories', 
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

		// if(courses.length < 1) return next(new errObj.NotFoundError("course not found."))

		const totalcourses = await Courses.countDocuments({categoryID: categoryID})
		if(totalcourses < nextSkips) {nextSkips = null}
        req.nextSkips = nextSkips;
    	req.total = totalcourses;
		req.courses = courses;
		next();
	}
	catch(err){
		next(err)
	}
}

module.exports = {
	addMainCourseCategory,
	addSubCourseCategory,
	renameCourseCategory,
	getAllCourseCategoryTree,
	getAllCourseCategories
}
