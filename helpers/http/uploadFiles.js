const fs = require('fs');

const uploadFile =  (file, filePath) => {
    return new Promise((resolve, reject) => {
    	fs.open(filePath, 'w', (err, fd) => { 
            if(!err) {
                fs.write(fd, file.data, (err) => {
                    if (!err) resolve();
                    else reject(err); 
                })
            }
            else reject(err);
        })
    })
}

const uploadFiles =  (files, filePath) => {
    return new Promise((resolve, reject) => {
    })
}

module.exports = {
	uploadFiles,	
	uploadFile
}