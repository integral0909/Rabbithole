// var mongoose = require('mongoose');
import mongoose from 'mongoose';
var mongoosePaginate = require('mongoose-paginate');
var uniqueValidator = require('mongoose-unique-validator');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

const type = "facebook email".split(' ');

const Account = new Schema({
    isPremium: {type: Boolean, default: false},
    type : {type: String, enum : type},    
    username: {type: String, default: 'none'},
    newUser: { type: Boolean, default: false },
    isFlagged: {type: Boolean, default: false},
    isVerified: {type: Boolean, default: false},
    device_token:String,
    platform: {type: Number, required: true, default: 1}, //  1: iOS , 2: Android , 3: Web
    common_profile: {        
        phone_number: String,
        email: String,
        firstName: { type: String, default: "" },
        lastName: { type: String, default: "" },
        gender: { type: Number, default: -1 }, //1: Male , 0: Female, -1: None
        avatar: { type: String, default: 'none' },
        age: {type: Number, min: 18, max: 65, default: 20 },
        location: {
            type: {type: String, default: 'Point'},
            coordinates: [Number]
        },        
    }, 
    user_settings: {
        zipCode: { type: String, default: "" },
        city: { type: String, default: "" },
        maxDistance: {type: Number, default: 100},
        age: {
            min: { type: Number, min: 18, max: 50, default: 18},
            max: {type: Number, min: 18, max: 50, default: 50}
        },
        enabled_discovery: {type: Boolean, default: true},
        enabled_notification: {type: Boolean, default: true},
        enabled_newMessages: {type: Boolean, default: true},
        enabled_newMatches: {type: Boolean, default: true},
        enabled_discreetNotifications: {type: Boolean, default: true},
        use_myLocation: {type: Boolean, default: true},
        show: {type: Number, default: 0} // 0: only women, 1: only men, 2: both of men and women 
    },
    o_auth: {
        facebook:{
            id: {type: String, required: true, unique: true},
            access_token: {type: String, required: true},
            picture: { type: String, default: '' },
        }
    },
    fbFriends: [{
        id: String,
        firstname: { type: String, default: "" },
        lastname: { type: String, default: "" },
        name: { type: String, default: '' },
        picture: { type: String, default: 'none' },
    }],
    matchedUsers: [{
        type: Schema.Types.ObjectId, 
        ref: 'Account'
    }]

});

Account.plugin(mongoosePaginate);
Account.plugin(uniqueValidator);

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

// Find mutual friends

Account.statics.findMatchedUsersFromCache = function(id) {
    return  this.findById(id)
                .populate('matchedUsers')
                .exec();
}

// Case 1: Find match users : gender -> gender , show -> show
Account.statics.findMatchedUsersInCaseOne = function(value, myId) {
    return this.find({
        $and: [{'common_profile.gender' : value}, {'user_settings.show': value}, {'_id': {$ne: myId}}]
    })
    .exec();
}
// Case 2: Find match users : gender -> 1-gender , show -> show
Account.statics.findMatchedUsersInCase = function(gender, lookingFor, myId, limit, minAge, maxAge,coords, maxDistance,pageNum) {
    // return this.find({
    //     $and: [
    //         {'common_profile.gender' : gender},
    //         {'user_settings.show': lookingFor},
    //         {'_id': {$ne: myId}},
    //         {'common_profile.gender.age': { $gt: minAge, $lt: maxAge }},
    //         {'common_profile.location': {
    //             $near:
    //             {
    //                 $geometry: {
    //                     type: "Point",
    //                     coordinates: coords
    //                 },
    //                 $maxDistance: maxDistance
    //             }                   
    //         }
    //     }
    // ]})
    // .limit(limit).exec();

    return this.paginate({
        $and: [
            {'common_profile.gender' : lookingFor},
            {'user_settings.show': gender},
            {'_id': {$ne: myId}},
            {'isVerified': true},
            {'common_profile.age': { $gt: minAge, $lt: maxAge }},
            {'common_profile.location': {
                $near:
                {
                    $geometry: {
                        type: "Point",
                        coordinates: coords
                    },
                    $maxDistance: maxDistance
                }                   
            }
        }
    ]}, {page: pageNum, limit: limit});
}
// update matched users

Account.statics.updateMatchedUsers = function(myId, users) {
    this.findByIdAndUpdate(myId,
        {
            $addToSet: { matchedUsers: { $each: users}}
        })
        // .populate('matchedUsers')
        .lean()
        .exec();    
}

// Find premium users

Account.statics.findPremiumUsers = function() {
    this.find({isPremium: true})
        .exec();
}


// Find User by

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
Account.index({ 'common_profile.location': '2dsphere' });
module.exports = mongoose.model('Account', Account);