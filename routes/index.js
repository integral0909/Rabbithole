var express = require('express');
const router = express.Router();

var authentication = require('./authentication');

router.use(Uri('authentication'), authentication);
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Welcome to Rabbithole' });
});

function Uri(route) {

  return '/api/v1/' + route;
}

module.exports = router;
