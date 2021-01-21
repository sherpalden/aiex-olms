const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

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

// bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//userRoutes
const userRoutes = require('./routes/users/userRoutes.js');
app.use('/api/user', userRoutes);

const userNewsRoutes = require('./routes/users/user-newsRoutes.js');
app.use('/api/user/news', userNewsRoutes);

//adminRoutes
const adminRoutes = require('./routes/admin/adminRoutes.js');
app.use('/api/admin', adminRoutes);

const adminNewsRoutes = require('./routes/admin/admin-newsRoutes.js');
app.use('/api/admin/news', adminNewsRoutes);

const swaggerRoutes = require('./routes/swaggerRoutes.js');
app.use('/api/swagger', swaggerRoutes);

app.get('/', (req, res) => {res.send("aiex-olms running...")});

// error handler
const { UserFacingError } = require('./error/errorHandler.js');
app.use( (err, req, res) => {
	if(err instanceof UserFacingError){
		res.status(err.statusCode).send({"error": err.message})
		return;
	}
	res.status(err.status || 500);
	res.json(err.message);
});

module.exports = app;

