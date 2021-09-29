var express = require('express');
var router = express.Router();
var contract = require('../oracleContract');


// In charge of communicating with the in-chain oracle

// fake a flight new status
// Upon startup, 20+ oracles are registered and their assigned indexes are persisted in memory

router.get('/', function (req, res, next) {
  res.send(contract.registeredOracles);
});

router.post('/', function (req, res, next) {
  res.send(contract.registerOracle());
});

module.exports = router;
