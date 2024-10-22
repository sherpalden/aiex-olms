const express = require('express');
const app = express();
const path = require('path');
// const bodyParser = require('body-parser');

//connect to database
const connectDB = require('./db/dbconfig.js');
connectDB();

//middleware to parse json strings to objects.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//define path to serve static files 
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'client')));

//enable cors
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'content-type,X-Requested-With,authorization');
    next();
});


//userRoutes
const userRoutes = require('./routes/users/userRoutes.js');
app.use('/api/user', userRoutes);

const userNewsRoutes = require('./routes/users/user-newsRoutes.js');
app.use('/api/user/news', userNewsRoutes);

const userDictionaryRoutes = require('./routes/users/user-dictionaryRoutes');
app.use('/api/user/dictionary', userDictionaryRoutes);

const userBookRoutes = require('./routes/users/user-bookRoutes.js');
app.use('/api/user/book', userBookRoutes);

const userCourseRoutes = require('./routes/users/user-courseRoutes.js');
app.use('/api/user/course', userCourseRoutes);

const userJnmRoutes = require('./routes/users/user-jnmRoutes.js');
app.use('/api/user/jnm', userJnmRoutes);

//adminRoutes
const adminRoutes = require('./routes/admin/adminRoutes.js');
app.use('/api/admin', adminRoutes);

const adminNewsRoutes = require('./routes/admin/admin-newsRoutes.js');
app.use('/api/admin/news', adminNewsRoutes);

const adminDictionaryRoutes = require('./routes/admin/admin-dictionaryRoutes.js');
app.use('/api/admin/dictionary', adminDictionaryRoutes);

const adminBookRoutes = require('./routes/admin/admin-bookRoutes.js');
app.use('/api/admin/book', adminBookRoutes);

const adminCourseRoutes = require('./routes/admin/admin-courseRoutes.js');
app.use('/api/admin/course', adminCourseRoutes);

const adminJnmRoutes = require('./routes/admin/admin-jnmRoutes.js');
app.use('/api/admin/jnm', adminJnmRoutes);



const swaggerRoutes = require('./routes/swaggerRoutes.js');
app.use('/api/swagger', swaggerRoutes);

app.get('/', (req, res) => {res.send("aiex-olms running...")});

// error handler
const { UserFacingError } = require('./error/errorHandler.js');
app.use( (err, req, res, next) => {
	console.error(err)
	if(err instanceof UserFacingError){
		res.status(err.statusCode).send({"error": err.message})
		return;
	}
	res.status(err.status || 500);
	res.json(err.message);
});

process.on('uncaughtException', err => {
  console.error('uncaughtError', err)
  process.exit(1) //mandatory (as per the Node.js docs)
})

module.exports = app;

