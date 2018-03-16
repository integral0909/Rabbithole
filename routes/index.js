var express = require('express');
const router = express.Router();

var auth = require('./auth');
var profile = require('./profile');
var test_reg  = require('./test_register');
var match = require('./match');

router.use(Uri('auth'), auth);
router.use(Uri('profile'), profile);
router.use(Uri('test_register'), test_reg);
router.use(Uri('match'), match);
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Welcome' });
});

router.get('/test_reg', function(req, res, next) {
  res.render('pages/home/newlink', { title: 'newlink' });
});

function Uri(route) {

  return '/api/v1/' + route;
}

module.exports = router;
