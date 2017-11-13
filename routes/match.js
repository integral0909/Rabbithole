var express  = require("express");
var  passport = require('passport');
import PassportError from './../passport/PassportError.js';
import ResponseResult from './../helpers/response-result.js';
var inspector = require('schema-inspector');
var  Account = require('./../models/account.js');

const router = express.Router();

router.get('/', (req, res) => {
    res.json({sessionID: req.sessionID, session: req.session});
});

router.post('/match_users', (req, res) => {
    const userId = req.headers['user_id'];
    var findUserArray = [];
    Account.findById(userId).then((account) => {
        if (account) {
            var gender = account.common_profile.gender; // 0: woman , 1: man 
            var show = account.user_settings.show; // 0: only women, 1: only women, 2: both of men and women
           
            if (gender == show) {
                Account.findMatchedUsersInCaseOne(gender).then((res1) => {
                    if (res1.length > 0 ){
                        // findUserArray.push.apply(findUserArray, res1);
                        res1.forEach(function(element) {
                            const user = ResponseResult.customizedUserInfo(element);
                            findUserArray.push(user);
                        }, this);
                    }
                    res.json(ResponseResult.getResoponseResult(findUserArray, 1, "success"));
                });
            }else if (gender == 1 - show) {
                console.log("finding...");
                Account.findMatchedUsersInCaseTwo(gender).then((res2) => {
                    if (res2.length > 0) {

                        res2.forEach(function(element) {
                            const user = ResponseResult.customizedUserInfo(element);
                            findUserArray.push(user);
                        }, this);

                    }
                    console.log(findUserArray);
                    res.json(ResponseResult.getResoponseResult(findUserArray, 1, "success"));
                });
            }


                
        }
    });

});

module.exports = router;