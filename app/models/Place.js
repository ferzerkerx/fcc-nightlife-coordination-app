'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Attendant = new Schema({ name: String, username: String});

var Place = new Schema({
    name: String,
    attendants: [Attendant]
});

module.exports = mongoose.model('Place', Place);