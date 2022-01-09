var Oracles = require('../build/contracts/Oracles.json');
var Config = require('./config.json');
var Web3 = require('web3');

var registeredOracles = [];

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
let oracles = new web3.eth.Contract(Oracles.abi, config.oracleAddress);

oracles.events.OracleRequest({
    fromBlock: 0
}, function (error, event) {
    if (error) console.log(error)
    console.log(event)
});

// Upon startup, 20+ oracles are registered and their assigned indexes are persisted in memory
async function initOracles() {
    console.log("Initialising oracles");

    let accounts = await web3.eth.getAccounts();

    for (let i = 0; i < 20; i++) {
        let indexes = await this.registerOracle(accounts[i]);

        registeredOracles.push({
            "account": accounts[i],
            "indexes": indexes
        });
    }
}

async function registerOracle(account) {
    if (!account) return;

    console.log("Attempting to register oracle: " + account);
    let registrationFee = web3.utils.toWei("1");
    return oracles.methods.registerOracle().send({
        from: account,
        value: registrationFee
    }).then(function(receipt) {
        return receipt.events.OracleRegistered.returnValues.indexes;
    });
}

async function getIndexes(account) {
    if (!account) return;

    console.log("Fetching indexes for account: " + account)
    return oracles.methods.getMyIndexes().call({
        from: account
    });
}

module.exports = { registeredOracles, initOracles, registerOracle, getIndexes };