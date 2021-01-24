const errObj = require('../../error/errorHandler.js');
const Admins = require('../../models/users/admins.js');

const getAdminProfile = async (req, res, next) => {
	try{
		const adminID = req.adminID;
		const admin = await Admins.findOne({_id: adminID}, {_id:1, firstName:1, lastName:1, email:1});
		if(!admin) next(new errObj.NotFoundError("admin not Found"));
		req.profile = admin;
		debugger
		next();
	}
	catch(err){
		next(err);
	}
}

module.exports = {
	getAdminProfile,
}