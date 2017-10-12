// var mongoose = require('mongoose');
import mongoose from 'mongoose';
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

const type = "facebook email".split(' ');

const Account = new Schema({
    type : {type: String, enum : type},    
    username: {type: String, default: 'none'},
    newUser: { type: Boolean, default: false },
    isFlagged: {type: Boolean, default: false},
    isVerified: {type: Boolean, default: false},
    device_token:String,
    platform: {type: Number, required: true,default: 1}, //  1: iOS , 2: Android , 3: Web
    common_profile: {        
        phone_number: String,
        email: String,
        firstName: { type: String, default: "" },
        lastName: { type: String, default: "" },
        gender: { type: Number, default: -1 }, //1: Male , 0: Female, -1: None
        avatar: { type: String, default: 'none' },
        age: {type: Number, min: 18, max: 65 },
        location: {
            lat: {type: Number, default: 0 },
            long: {type: Number, default: 0 }
        },
        zipCode: String,
        city: {type: String}
    }, 
    user_setting: {
    },
    o_auth: {
        facebook:{
            id: String,
            access_token: String
        }
    },
    fbFriends: [{
        id: String,
        firstname: { type: String, default: "" },
        lastname: { type: String, default: "" },
        name: { type: String, default: '' },
        picture: { type: String, default: 'none' },
    }]

});

// Static methods

Account.statics.findUser = function(username) {
    return this.findOne({'username': username}).exec();
}

Account.statics.unregister = function(accountId) {
    return this.remove({_id: accountId}).exec();
}

Account.statics.findUserByEmail = function(email) {
    return this.findOne({ 'common_profile.email': email}).exec();
}

Account.statics.findUserByFacebookId = function(id) {
    return this.findOne({ 'o_auth.facebook.id' : id });
}

Account.statics.findUserByGender = function(gender) {
    return this.findOne({'common_profile.gender' : gender }).exec();
}

Account.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

//Count of female users

Account.statics.countOfSpecialGenderUsers = function(gender) {
    return this.count({'common_profile.gender': gender}).exec();
}

Account.statics.search = function(username) {
    console.log("q : = : ", username);
    const re = new RegExp(username, "i");
    return this.find(
        {'username': { $regex: re }},
        { 
            'username': true,
            'common_profile.avatar': true
        })
        .limit(20)
        .sort({'username': 1})
        .exec();
    
}
//

module.exports = mongoose.model('Account', Account);