var cron = require('cron');
var express  = require("express");
var  passport = require('passport');
import PassportError from './../passport/PassportError.js';
import ResponseResult from './../helpers/response-result.js';
var inspector = require('schema-inspector');
var  Account = require('./../models/account.js');
var graph = require('fbgraph');
var config = require('../config');


exports.performJobUpdateMatchUsers = function () {
    var job1 = new cron.CronJob({
        cronTime: '00 00 00 * * *',
        onTick: function() {
            Account.find().then(accounts => {
                accounts.forEach(function(account) {
                    graph.setAccessToken(account.o_auth.facebook.access_token);
                    graph.setAppSecret(config.fb_secret);
                    var gender = account.common_profile.gender; // 0: woman , 1: man 
                    var show = account.user_settings.show; // 0: only women, 1: only women, 2: both of men and women
                   
                    if (gender == show) {
                        Account.findMatchedUsersInCaseOne(gender, account._id).then((res1) => {
                            if (res1.length > 0 ){
                                // findUserArray.push.apply(findUserArray, res1);                        
                                sendRequestToFB(account._id, res1);
                            }else {
                            }
                        });
                    }else if (gender == 1 - show) {
                        console.log("finding...");
                        Account.findMatchedUsersInCaseTwo(gender, account._id).then((res2) => {
                            if (res2.length > 0) {
                                sendRequestToFB(account._id, res2);
                            }else {
                            }
                        });
                    }               
                }, this);
            });
        },
        start: true,
        timeZone: 'America/Los_Angeles'
    });
};

function sendRequestToFB(myId, results) {
    var responseCounter = 0;
    var matchUsers = [];
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
                                matchUsers.push(user._id);
                            }                
                            if (responseCounter === results.length) {
                                Account.updateMatchedUsers(myId, matchUsers);                                
                            }
                        }                        
                    }
                }
            }          
        });
        
    }
} 
