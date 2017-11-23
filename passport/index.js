var passport = require('passport');
var LocalStrategy  = require('passport-local').Strategy ;
var Account = require('./../models/account');
var bcrypt = require('./../helpers/bcrypt');
var random = require('./../utils/utils').random; 
var texts = require('./../utils/texts');
// var generateHash, compareHash = require('./../helpers/bcrypt');
import PassportError from './PassportError';
var cache = require('./../helpers/cache');
import ResponseResult from './../helpers/response-result.js';


/**
 * Set up passport serialization
 */

passport.serializeUser((user, done) => {
    cache.passport.set(user._id, user); //store user in cache
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    if(cache.passport.has(id)) {
        return done(null, cache.passport.get(id));
    }

    Account.findById(id).exec().then(account => {

            cache.passport.set(id, account);
            done(null, account);
        }
    ).catch((error) => {
        done(error);
    });
});


passport.use('local-facebook', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'facebookId',
        passReqToCallback: true}, ( req, username,facebookId, done) => {

    let deviceToken = req.body.deviceToken;
    let platform = req.body.platform;
    let longitude = req.body.long;
    let latitude = req.body.lat;
    let access_token = req.body.access_token;
    Account.findUserByFacebookId(facebookId).then(account => {
        //account exists
        if(account) {
            account.device_token = deviceToken;
            account.platform = platform;
            account.newUser = false;
            account.o_auth.facebook.access_token = access_token;
            
            if(req.body.lat && req.body.long) 
                account.common_profile.location = {'type': 'Point', 'coordinates': [req.body.long, req.body.lat]};
            account.save().then(doc => {
                return done(null, ResponseResult.customizedUserInfo(doc), "1");
            });          
        }else {
            const newAccount = new Account();
            newAccount.type = "facebook";
            newAccount.o_auth.facebook.id = facebookId;
            newAccount.o_auth.facebook.access_token = access_token;
            newAccount.device_token = deviceToken;
            newAccount.platform = platform;
            newAccount.newUser = true;
            newAccount.username = username;
            if(req.body.lat && req.body.long) 
                newAccount.common_profile.location = {'type': 'Point', 'coordinates': [req.body.long, req.body.lat]};
            if(req.body.gender) newAccount.common_profile.gender = req.body.gender;
            if(req.body.email) newAccount.common_profile.email = req.body.email;
            if(req.body.avatar) newAccount.common_profile.avatar = req.body.avatar;

            newAccount.save().then(doc => {
                return done(null, ResponseResult.customizedUserInfo(doc), null);
            });           
        }
    });


}));

function registerUserWithEmail() {
   
}
