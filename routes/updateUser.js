var express  = require("express");
var  passport = require('passport');
import PassportError from './../passport/PassportError.js';
import ResponseResult from './../helpers/response-result.js';
var inspector = require('schema-inspector');
var  Account = require('./../models/account.js');
var graph = require('fbgraph');

const router = express.Router();

/**
 * Update user FBFriends
 */

router.post('/update_username', (req, res, next) => {     
    const userId = req.body.user_id;
    const username = req.body.username;

    Account.findByIdAndUpdate(userId,
        {
            $set: {username: username, isVerified: true},
        })
        .then (account =>{
            if (account) {
                res.json(ResponseResult.getResoponseResult(ResponseResult.customizedUserInfo(account), 1, "success"));
            }else {
                return res.status(404).json(ResponseResult.getResoponseResult({}, 0, 'User not found')); 
            }
    });
       
});

/**
 * Find mutual friends
 */

 router.post('/find_mutual_friends', (req, res, next) => {
    const userId = req.headers['user-id'];
    const access_token = req.body.access_token;
    Account.findById(userId).then(account => {
        if (account) {
            graph.setAccessToken(access_token);
            users.forEach(function(account) {
                graph.get('/' + account.o_auth.facebook.id ,{fields: 'context.fields(all_mutual_friends.limit(500))' }, (response => {
                    if (!response.context) {
                        console.log(JSON.stringify(response));                    
                        return res.status(404).json(ResponseResult.getResoponseResult(JSON.stringify(response), 0, 'User not found')); 
                    }
                    if (!response.context.all_mutual_friends) 
                        return res.status(404).json(ResponseResult.getResoponseResult({}, 0, 'Unable to find mutual friends.')); 
                    console.log(JSON.stringify(response));
                    var friends = response.context.all_mutual_friends.data;
                    var responseData = [];
                    console.log("count is => ", friends.length);
                    
                    res.json(ResponseResult.getResoponseResult(friends, 1, "successfully found mutual friends"));    
                }));
            }, this);
            
        }
    });
 });

/**
 * Get count of female users
 */

 router.post('/female_count', (req, res, next) => {
    const userId = req.headers['user-id']; 
    Account.countOfSpecialGenderUsers(0).then((count) => {
        console.log("Number of users : ", count);
        res.json(ResponseResult.getResoponseResult({count: count}, 1, "success"));        
    });
 });

 /**
  * Update user settings
  */

  router.post('/update_user_settingss', (req, res, next) => {
    const userId = req.headers['user-id'];

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