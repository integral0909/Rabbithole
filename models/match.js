var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var uniqueValidator = require('mongoose-unique-validator');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

const Match = new Schema({
    
    matchedUsers: [{
        type: Schema.Types.ObjectId, 
        ref: 'Account'
    }]

});

Match.plugin(mongoosePaginate);
Match.plugin(uniqueValidator);