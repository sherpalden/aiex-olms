const mongoose = require('mongoose');

const options = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true
}
const connect = mongoose.createConnection(process.env.MONGO_URI, options);
const gfs = new Promise((resolve, reject) => {
	connect.once('open', (err) => {
		if(err) reject(err);
		const gfsObj = {
			dictionary: new mongoose.mongo.GridFSBucket(connect.db, {bucketName: "dictionary"}),
			news: new mongoose.mongo.GridFSBucket(connect.db, {bucketName: "news"}),
		} 
		resolve(gfsObj);
	})
})

module.exports = gfs;