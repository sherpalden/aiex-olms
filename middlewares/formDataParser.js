const Busboy = require('busboy');
const bl = require('bl');
const fs = require('fs');
const path = require('path');
const util = require('util');
const is = require('type-is');

const errObj = require('../error/errorHandler');

const formDataParser = (req, res, next) => {
    try {
        if(!is(req, ['multipart'])){
           return next(new errObj.BadRequestError("Content-Type should multipart/form-data")); 
        }
        const busboy = new Busboy({headers: req.headers, highWaterMark: 2 * 1024 * 1024});
        busboy.on('field', (fieldname, val) => {
            req.body[fieldname] = val;
        });
        req.files = req.files || {};
        busboy.on('file', (key, file, name, enc, mimetype) => {
            file.pipe(bl((err, d) => {
                if (err || !(d.length || name)) { return next(err) }
                const fileExt = path.extname(name);
                const fileNameSplitted = name.split('.');
                const filename = fileNameSplitted[fileNameSplitted.length - 2] + '-' + Date.now() + fileExt;
                const fileData = {
                    data: file.truncated ? null : d,
                    filename: filename || null,
                    encoding: enc,
                    mimetype: mimetype,
                    truncated: file.truncated,
                    size: file.truncated ? null : Buffer.byteLength(d, 'binary')
                };
                req.files[key] = req.files[key] || [];
                req.files[key].push(fileData);
            }));
        })
        busboy.on('finish', (err) => {
            if (err) return next(err);
            next();
        });
        req.pipe(busboy);
    }
    catch(err) {
        next(err)
    }
}

module.exports = {
    formDataParser
}