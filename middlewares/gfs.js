const Busboy = require('busboy');
const bl = require('bl');
const fs = require('fs');
const path = require('path');
const util = require('util');
const is = require('type-is');
const mongoose = require('mongoose');

const errObj = require('../error/errorHandler');

const gfs = require('../db/gfsInit.js');

const gfsUpload = (req, res, next) => {
    try {
        if(!is(req, ['multipart'])){
           return next(new errObj.BadRequestError("Content-Type should be multipart/form-data")); 
        }
        const busboy = new Busboy({headers: req.headers});
        let filesUploaded = [];
        busboy.on('field', (fieldname, val) => {
            req.body[fieldname] = val;
        });
        busboy.on('file', async (key, file, name, enc, mimetype) => {
            try {
                const fileExt = path.extname(name);
                const fileNameSplitted = name.split('.');
                const filename = fileNameSplitted[fileNameSplitted.length - 2] + '-' + Date.now() + fileExt;
                if(fileExt === '.jpeg' || fileExt === '.jpg' ||  fileExt === '.png' || fileExt === '.gif'){
                    filesUploaded.push(filename);
                    const gfsBucketObj = await gfs;
                    const gfsDictionaryBucket = gfsBucketObj.dictionary;
                    const gfsWriteableStream = gfsDictionaryBucket.openUploadStream(filename);
                    file.pipe(gfsWriteableStream);
                }
                else return next(new errObj.BadRequestError("Invalid file type!!!"));
            }
            catch(err){next(err)};
        })
        busboy.on('finish', (err) => {
            if (err) return next(err);
            req.filesUploaded = filesUploaded;
            next();
        });
        req.pipe(busboy);
    }
    catch(err) {
        next(err)
    }
}

const gfsDelete = (fileID, bucketObj) => {
    return new Promise((resolve, reject) => {
        bucketObj.delete(fileID, (err) => {
            if(err) reject(err);
            resolve();
        })
    })
}

const deleteGfsFile = async (req, res, next) => {
    try {
        const gfsBucketObj = await gfs;
        const gfsDictionaryBucket = gfsBucketObj.dictionary;
        const fileID = mongoose.Types.ObjectId(req.params.fileID);
        await gfsDelete(fileID, gfsDictionaryBucket);
        next();
    }
    catch(err){
        next(err);
    }
}

const getGfsImage = async (req, res, next) => {
    try {
        const gfsBucketObj = await gfs;
        const gfsDictionaryBucket = gfsBucketObj.dictionary;
        const imgName = req.params.imgName;
        const readableStream = gfsDictionaryBucket.openDownloadStreamByName(imgName);
        res.status(200);
        res.setHeader('Content-Type', 'image/jpeg');
        readableStream.pipe(res);
    }
    catch(err){
        next(err);
    }
}

module.exports = {
    gfsUpload,
    deleteGfsFile,
    getGfsImage
}
