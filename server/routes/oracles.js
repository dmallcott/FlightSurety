var express = require('express');
var router = express.Router();

// In charge of communicating with the in-chain oracle

// fake a flight new status
// Upon startup, 20+ oracles are registered and their assigned indexes are persisted in memory

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
