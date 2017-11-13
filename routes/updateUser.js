var express  = require("express");
var  passport = require('passport');
import PassportError from './../passport/PassportError.js';
import ResponseResult from './../helpers/response-result.js';
var inspector = require('schema-inspector');
var  Account = require('./../models/account.js');

const router = express.Router();

/**
 * Update user FBFriends
 */

router.post('/update_fbFriends', (req, res, next) => {     
    const userId = req.body.user_id;
    const friends = req.body.friends;
    const username = req.body.username;
    const isFlagged = req.body.isFlagged;

    Account.findByIdAndUpdate(userId,
        {
            $set: {username: username, isFlagged: isFlagged, isVerified: true},
            $push: { fbFriends: { $each: friends}}
        },
        {safe: true, upsert: true, new: true, multi: true }).then (account =>{
            if (account) {
                res.json(ResponseResult.getResoponseResult(ResponseResult.customizedUserInfo(account), 1, "success"));
            }else {
                return res.status(404).json(ResponseResult.getResoponseResult({}, 0, 'User not found')); 
            }
    });
       
});

/**
 * Get count of female users
 */

 router.post('/female_count', (req, res, next) => {
    const userId = req.headers['user_id']; 
    Account.countOfSpecialGenderUsers(0).then((count) => {
        console.log("Number of users : ", count);
        res.json(ResponseResult.getResoponseResult({count: count}, 1, "success"));        
    });
 });

 /**
  * Update user settings
  */

  router.post('/update_user_settingss', (req, res, next) => {
    const userId = req.headers['user_id'];

    const zipCode = req.body.zipCode;
    const maxDistance = req.body.maxDistance;
    const age = req.body.age;
    const enabled_discovery = req.body.enabled_discovery;
    const enabled_notification = req.body.enabled_notification;
    const enabled_newMessages = req.body.enabled_newMessages;
    const enabled_newMatches = req.body.enabled_newMatches;
    const enabled_discreetNotification = req.body.enabled_discreetNotification;
    const use_myLocation = req.body.use_myLocation;
    const show = req.body.show;


    Account.findByIdAndUpdate(userId,
        {
            $set: {
                'user_settings.zipCode': zipCode, 
                'user_settings.maxDistance': maxDistance, 
                'user_settings.age': age,
                'user_settings.enabled_discovery': enabled_discovery,
                'user_settings.enabled_notification': enabled_notification,
                'user_settings.enabled_newMessages': enabled_newMessages,
                'user_settings.enabled_newMatches': enabled_newMatches,
                'user_settings.enabled_discreetNotification': enabled_discreetNotification,
                'user_settings.use_myLocation': use_myLocation,
                'user_settings.show': show
            }
        },
        {safe: true, upsert: true, new: true, multi: true }).then (account =>{

            if (account) {
                res.json(ResponseResult.getResoponseResult(ResponseResult.customizedUserInfo(account), 1, "success"));
            }else {
                return res.status(404).json(ResponseResult.getResoponseResult({}, 0, 'User not found')); 
            }

    });
  });

module.exports = router;