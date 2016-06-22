'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var PlaceAttendant = new Schema({ place_id: String, username: String});



module.exports = mongoose.model('PlaceAttendant', PlaceAttendant);