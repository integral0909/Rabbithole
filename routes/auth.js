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
/**
 * require addition info for oauch registration 
 */
router.post('/oauth/register', (req, res) =>{

    //not logged in 
});

router.post('/logout', (req, res) => {
    req.logout();
    req.session.destry();
    res.json({success: true});
});

/**
 * Login with facebook
 */

router.post('/login_facebook', (req, res, next) => {    
    passport.authenticate('local-facebook', (err, user, info) => {        
        if(err) {
            return res.status(500).json(ResponseResult.getResoponseResult({}, 0, err.message));
        }else {
            if(info) {
                if(user){                 
                    res.json(ResponseResult.getResoponseResult(user, 3, "account exists"));
                }
            }else {
                res.json(ResponseResult.getResoponseResult(user, 1, "success"));
            }
        }
    })(req, res, next);
});
module.exports = router;