const mongoose = require('mongoose');

const connectDB = async () => {
	try{
		const options = {
			useNewUrlParser: true, 
			useUnifiedTopology: true,
			useCreateIndex: true
		}
		await mongoose.connect(process.env.MONGO_URI, options)
		console.log("Database connected");
	}
	catch(err){
		console.error(err);
	}
}

module.exports = connectDB;