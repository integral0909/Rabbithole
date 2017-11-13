var express = require('express');
var router = express.Router();
var  Account = require('./../models/account.js');

router.get('/', (req, res) => {
    res.json({sessionID: req.sessionID, session: req.session});
});

router.post('/', (req, res, next) => {
    
    let deviceToken = req.body.deviceToken;
    let longitude = req.body.long;
    let latitude = req.body.lat;
    let facebookId = Date.now();
    let gender = req.body.gender;
    let email = req.body.email;
    let avatar =  req.body.avatar;
    let username = req.body.username;
    let show = req.body.show;

    console.log("Test register => ", gender);
    console.log("Test register - username => ", username);
    Account.findUserByFacebookId(facebookId).then(account => {
        //account exists
        if(account) {
            req.flash('info', 'User is exist already.');
            res.redirect('/test_reg');
        }else {
            const newAccount = new Account();
            newAccount.type = "facebook";
            newAccount.o_auth.facebook.id = facebookId;
            newAccount.device_token = deviceToken;
            newAccount.platform = 1;
            newAccount.newUser = true;
            newAccount.username = username;
            newAccount.isVerified = true;
            newAccount.user_settings.show = show;
            if(req.body.lat && req.body.long) newAccount.common_profile.location = {'type': 'Point', 'coordinates': [req.body.long, req.body.lat]};
            if(gender) newAccount.common_profile.gender = req.body.gender;
            if(email) newAccount.common_profile.email = req.body.email;
            if(avatar) newAccount.common_profile.avatar = req.body.avatar;

            newAccount.save().then(doc => {
                req.flash('info', 'User created successfully.');
                res.redirect('/test_reg');
            });           
        }
    });
});

module.exports = router;