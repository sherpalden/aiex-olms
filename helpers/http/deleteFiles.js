const fs = require('fs');

const deleteFiles =  (filePaths) => {
    return new Promise((resolve, reject) => {
        for(filePath of filePaths){
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, err => {
                    if(err){
                        reject(err);
                    }
                });
            }
        }
        resolve();
    })
}

const deleteFile =  (filePath) => {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, err => {
                if(err){
                    reject(err);
                }
            });
        }
    resolve();
    })
}

module.exports = {
	deleteFiles,
	deleteFile
}
















