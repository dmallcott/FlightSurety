var express = require('express');
var router = express.Router();

// I think all I need in this server is an endpoint to trigger the oracles contract

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
