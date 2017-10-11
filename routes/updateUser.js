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
            $set: {username: username, isFlagged: isFlagged},
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
module.exports = router;