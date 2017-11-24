var express  = require("express");
var  passport = require('passport');
import PassportError from './../passport/PassportError.js';
import ResponseResult from './../helpers/response-result.js';
import { Response } from "aws-sdk/lib/response";
var inspector = require('schema-inspector');
var  Account = require('./../models/account.js');
var graph = require('fbgraph');
var config = require('../config');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({sessionID: req.sessionID, session: req.session});
});

router.post('/match_users', (req, res) => {
    const userId = req.headers['user-id'];
    const access_token = req.body.access_token;
    var findUserArray = [];
    Account.findMutualFriends(userId).then((account) => {
        if (account) {
            if (account.matchedUsers.length > 0) {
                console.log("from cache list");
                account.matchedUsers.forEach(user => {
                    findUserArray.push(ResponseResult.customizedUserInfo(user));
                });

                res.json(ResponseResult.getResoponseResult(findUserArray, 1, "Found matched user")); 
            }else {
                graph.setAccessToken(access_token);
                graph.setAppSecret(config.fb_secret);
                var gender = account.common_profile.gender; // 0: woman , 1: man 
                var show = account.user_settings.show; // 0: only women, 1: only women, 2: both of men and women
               
                if (gender == show) {
                    Account.findMatchedUsersInCaseOne(gender, account._id).then((res1) => {
                        if (res1.length > 0 ){
                            // findUserArray.push.apply(findUserArray, res1);                        
                            sendRequestToFB(account._id, res1, req, res);
                        }else {
                            res.json(ResponseResult.getResoponseResult({}, 1, "Not found any matched user"));   
                        }
                    });
                }else if (gender == 1 - show) {
                    console.log("finding...");
                    Account.findMatchedUsersInCaseTwo(gender, account._id).then((res2) => {
                        if (res2.length > 0) {
                            sendRequestToFB(account._id, res2, req, res);
                        }else {
                            res.json(ResponseResult.getResoponseResult({}, 1, "Not found any matched user"));   
                        }
                    });
                }   

            }                        
        }else {
            return res.status(404).json(ResponseResult.getResoponseResult({}, 0, 'User not found.')); 
        }
    });

});

function forceStopRequest(res, foundUsers, match_users) {
    Account.updateMatchedUsers(myId, matchUsers);
    res.json(ResponseResult.getResoponseResult(foundUsers, 1, "Found partial matched friends."));
}

function sendRequestToFB(myId, results, req, res) {
    var responseCounter = 0;
    var foundUsers = [];
    var matchUsers = [];
    const timeObj = setTimeout(function() {forceStopRequest(res, foundUsers, matchUsers)}, 1 * 60 * 2 * 1000);
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
                            if (friend_count > 0) {
                                foundUsers.push(ResponseResult.customizedUserInfo(user));
                                matchUsers.push(user._id);
                            }                
                            if (responseCounter === results.length) {
                                clearTimeout(timeObj);
                                Account.updateMatchedUsers(myId, matchUsers);                                
                                res.json(ResponseResult.getResoponseResult(foundUsers, 1, "successfully found matched friends"));    
                            }
                        }                        
                    }
                }
            }          
        });
        
    }
} 

module.exports = router;