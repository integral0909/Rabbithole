var express  = require("express");
var apn  = require('apn');
var path = require('path');
var  Account = require('../models/account.js');
import mongoose from 'mongoose';

const options = {
  token: {
    key: path.resolve('./config/APNsAuthKey_UK6JPG5SJF.p8'),
    keyId: "UK6JPG5SJF",
    teamId: "TK8TC8D7D3"
  },
  production: false
};

const apnProvider = new apn.Provider(options);

// Send push notification 

/**
 * @params: type :  String =>  inviteFrined (0) :  acceptFriend(1) : sendMessage (2) 
 */
exports.sendPush = async function(tokenArray, message, platform, type, receiver, senderId, notificationId) {

    let account = null;

    try {
        account =  await Account.findById(senderId);
    }catch(error) {
        throw error;
    }

    if (!account) {
        return res
                .status(404)
                .json(ResponseResult.getResoponseResult({}, 0, "User not found"));
    }
    var note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600; //Expires 1 hour from now
    note.badge = 1;
    note.alert =  account.username + message;
    note.payload = {
        "messageFrom": "Prvmsg", 
        "sender": {
            _id: account._id,
            type: account.type,
            common_profile: account.common_profile,
            username: account.username,
            notificationId: notificationId
        },
        "type":type
    };
    console.log("payload => ", note.payload);

    note.topic = "com.acubedlimited.prvmsg";

    for (var i = 0 ; i < tokenArray.length ; i++) {
        var token = tokenArray[i];
        apnProvider.send(note, token).then((result) => {

            if (result.status){
                console.log("error => ", result)    
            }
            console.log("notification sending result => ", result);
        });
    }
};