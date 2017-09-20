'use strict';
//Require dependecies
const mongoose = require('mongoose');
//Declare the database schema of a suggestion object
//This is a loose schema, meaning the schema does not get validated
const suggestionSchema = mongoose.Schema({
    id: Number,
    creator: String,
    creatorId: String,
    moderator:String,
    modId: String,
    state: {default: 'created', type: String},
    content: String,
    notificationId: String
});
//Export the database model of the just created schema
const suggestionModel = mongoose.model('Suggestions', suggestionSchema);
module.exports = suggestionModel;
