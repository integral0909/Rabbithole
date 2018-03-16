var cron = require('cron');
var express  = require("express");
var Account = require('./../models/account.js');
var graph = require('fbgraph');
var config = require('../config');
var utils = require('../utils/utils');


exports.performJobUpdateMatchUsers = function () {
    var job1 = new cron.CronJob({
        cronTime: '00 00 00 * * *',
        onTick: function() {
            Account.findPremiumUsers().then(accounts => {
                accounts.forEach(function(account) {
                    graph.setAccessToken(account.o_auth.facebook.access_token);
                    graph.setAppSecret(config.fb_secret);
                    var gender = account.common_profile.gender; // 0: woman , 1: man 
                    var show = account.user_settings.show; // 0: only women, 1: only women, 2: both of men and women
                    var limit = config.cronQueryLimitForPremium;
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
    
                    Account.findMatchedUsersInCase(gender, show, account._id, limit, minAge, maxAge, coords, maxDistance).then((result) => {
                        if (result.docs.length > 0 ){                 
                            sendRequestToFB(account._id, result.docs);
                        }else {
                        }
                    });
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
        graph.get('/' + user.o_auth.facebook.id + '?fields=context.fields(all_mutual_friends.limit(5))', function(err, response){
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
                                Account.updateMatchedUsers(myId, matchUsers);
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
