'use strict';

var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var routesIndex = require('./app/routes/index.js');
var routesApi = require('./app/routes/api.js');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

require('dotenv').load();

mongoose.connect(process.env.MONGO_URI);

app.use(session({
    secret: "secret night",
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
        mongooseConnection:  mongoose.connection})
}));



app.use('/public', express.static(process.cwd() + '/app/public'));

routesIndex(app);
routesApi(app);

var port = process.env.PORT || 8080;
app.listen(port,  function () {
    console.log('Node.js listening on port ' + port + '...');
});
