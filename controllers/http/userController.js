const errObj = require('../../error/errorHandler.js');
const Users = require('../../models/users/users.js');

const fileDeleter = require('../../helpers/http/deleteFiles.js')

const getUserProfile = async (req, res, next) => {
	try{
		const userID = req.userID;
		const user = await Users.findOne({_id: userID}, {_id:1, firstName:1, lastName:1, email:1});
		if(!user) next(new errObj.NotFoundError("User not Found"));
		req.profile = user;
		debugger
		next();
	}
	catch(err){
		next(err);
	}
}

const updateProfilePic = async (req, res, next) => {
	if(!is(req, ['multipart'])) return next(new errObj.BadRequestError("The content type must be multipart/form-data"));
	const limits = {
		files: 1, fileSize: 5*1024*1024
	}
    const busboy = new Busboy({headers: req.headers, limits});
    busboy.on('file', (key, file, name, encoding, mimetype) => {
        const fileExt = path.extname(name);
        const fileNameSplitted = name.split('.');
        const filename = fileNameSplitted[fileNameSplitted.length - 2] + '-' + Date.now() + fileExt;
        if(fileExt === '.jpeg' || fileExt === '.jpg' || fileExt === '.png'){
        	req.profilePic = filename;
        	file.pipe(fs.createWriteStream(`./public/uploads/user-profile/${filename}`));
        }
        else {
            return next(new errObj.BadRequestError("Invalid file type!!!"));
        }
    });
    busboy.on('filesLimit', () => {
    	return next(new errObj.BadRequestError("Atmost only one file is accepted."))
    });
    busboy.on('finish', async (err) => {
        if (err) return next(err);
        try{
        	const user = Users.findOne({_id: req.userID});
        	if(!user) return next(new errObj.NotFoundError("User not found"));
        	await fileDeleter.deleteFile(`./public/uploads/user-profile/${user.profilePic}`);
        	user.profilePic = req.profilePic;
        	await user.save();
        }catch(err){
        	return next(err)
        }
        next();
    });
    req.pipe(busboy);
}

module.exports = {
	getUserProfile,
	updateProfilePic,
}