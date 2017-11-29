var express  = require("express");
var  passport = require('passport');
import PassportError from './../passport/PassportError.js';
import ResponseResult from './../helpers/response-result.js';
import { Response } from "aws-sdk/lib/response";
var inspector = require('schema-inspector');
var  Account = require('./../models/account.js');
var graph = require('fbgraph');
var config = require('../config');
var utils = require('../utils/utils');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({sessionID: req.sessionID, session: req.session});
});

function collectMatchUsers(account) {
    var findUserArray = [];
    if (account.matchedUsers.length > 0) {
        console.log("from cache list");
        account.matchedUsers.forEach(user => {
            findUserArray.push(ResponseResult.customizedUserInfo(user));
        });
    }
    return findUserArray;
}

router.post('/match_users', (req, res) => {
    const userId = req.headers['user-id'];
    const access_token = req.body.access_token;
    const pageNum = req.body.page_number || 1;
    var findUserArray = [];
    
    Account.findMatchedUsersFromCache(userId).then((account) => {
        if (account) {
            
            if (account.matchedUsers.length > 0) {
                findUserArray = collectMatchUsers(account);
                res.json(ResponseResult.getResponseResult(findUserArray, 1, "Found matched user")); 
            }else {
                graph.setAccessToken(access_token);
                graph.setAppSecret(config.fb_secret);
                var gender = account.common_profile.gender; // 0: woman , 1: man 
                var show = account.user_settings.show; // 0: only women, 1: only women, 2: both of men and women
                
                var limit = 20;
                 // get the max distance or set it to 8 kilometers
                var maxDistance = account.user_settings.maxDistance || 100;
            
                // we need to convert the distance to radians
                // the raduis of Earth is approximately 6371 kilometers
                // maxDistance /= 6371;
            
                // mile to meter
                maxDistance = utils.getMeters(maxDistance);
                // get coordinates [ <longitude> , <latitude> ]
                var coords = account.common_profile.location.coordinates || [0,0];
                var minAge = account.user_settings.age.min || 18;
                var maxAge = account.user_settings.age.max || 65;         

                Account.findMatchedUsersInCase(gender, show, account._id, limit, minAge, maxAge, coords, maxDistance, pageNum).then((result) => {
                    console.log("dbResult -> ",result);
                    if (result.docs.length > 0 ){                 
                        sendRequestToFB(account._id, result.docs, result["total"], result["page"], result["pages"], limit, req, res);
                    }else {
                        res.json(ResponseResult.getResponseResult({}, 2, "Not found any matched user"));   
                    }
                });

            }                        
        }else {
            return res.status(404).json(ResponseResult.getResponseResult({}, 0, 'User not found.')); 
        }
    });
   

});

function forceStopRequest(res, foundUsers, match_users, myId) {

    if (match_users.length > 0) {
        Account.updateMatchedUsers(myId, matchUsers);
    }    
    res.json(ResponseResult.getResponseResult(foundUsers, 1, "Found partial matched friends."));
}

function sendRequestToFB(myId, results, total, page, pages, limit, req, res) {
    var responseCounter = 0;
    var foundUsers = [];
    var matchUsers = [];
    const timeObj = setTimeout(function() {forceStopRequest(res, foundUsers, matchUsers, myId)}, 1 * 60 * 2 * 1000);
    for (var i = 0; i < results.length; i++) {
        var user = results[i];
        graph.get('/' + user.o_auth.facebook.id + '?fields=context.fields(all_mutual_friends.limit(10))', function(err, response){
            responseCounter++;
            if (err) {
                console.log("error -> ", err);
            }else {
                if (response) {
                    console.log(JSON.stringify(response));   
                    if (!response.context) {
                        console.log(JSON.stringify(response));                              
                    }else {
                        if (!response.context.all_mutual_friends) {
                        }
                        if (response.context.all_mutual_friends.summary) {
                            var friend_count = response.context.all_mutual_friends.summary.total_count;
                            if (friend_count == 0) {
                                foundUsers.push(ResponseResult.customizedUserInfo(user));
                                matchUsers.push(user._id);
                                Account.updateMatchedUsers(user._id, [myId]);
                            }                
                            if (responseCounter === results.length) {
                                clearTimeout(timeObj);
                                
                                Account.updateMatchedUsers(myId, matchUsers);
                                    // var findUserArray = collectMatchUsers(account);
                                    // res.json(ResponseResult.getResponseResult(findUserArray, 1, "successfully found matched friends", findUserArray.length, total, page, pages, limit));                                    
                                
                                res.json(ResponseResult.getResponseResult(foundUsers, 1, "successfully found matched friends", foundUsers.length, total, page, pages, limit));                            
                            }
                        }                        
                    }
                }
            }          
        });
        
    }
} 

module.exports = router;