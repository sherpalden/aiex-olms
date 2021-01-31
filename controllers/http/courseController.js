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

module.exports = {
	addMainCourseCategory,
	addSubCourseCategory,
	renameCourseCategory,
	getAllCourseCategoryTree,
	getAllCourseCategories
}
