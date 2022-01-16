var Oracles = require('../build/contracts/Oracles.json');
var Config = require('./config.json');
var Web3 = require('web3');

var registeredOracles = [];

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
let oracles = new web3.eth.Contract(Oracles.abi, config.oracleAddress);

// .on('data', function(event){
//     console.log(event); // same results as the optional callback above
// });

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
    
    listenToEvents();
}

async function registerOracle(account) {
    if (!account) return;

    console.log("Attempting to register oracle: " + account);
    let registrationFee = web3.utils.toWei("1");
    return oracles.methods.registerOracle().send({
        from: account,
        value: registrationFee,
        gas: 4712388
    })
    .then(function(receipt) {
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

async function submitResponse(oracle, index, airline, flight, timestamp) {
    console.log("Submitting oracle response");
    let statusCode = 3; // STATUS_CODE_LATE_WEATHER
    await oracles.methods.submitOracleResponse(index, airline, flight, timestamp, statusCode)
            .send({ from: oracle });
}

async function listenToEvents() {
    oracles.events.OracleRequest({
        fromBlock: 0
    }, function (error, event) {
        if (error) {
            console.log(error);
        } else {
            console.log(event);
    
            let compatibleOracles = registeredOracles.filter(o => o.indexes.includes(event.returnValues.index));
            
            if (!compatibleOracles) return;
    
            compatibleOracles.forEach(o => {
                submitResponse(
                    o.account,
                    event.returnValues.index,
                    event.returnValues.airline,
                    event.returnValues.flight,
                    event.returnValues.timestamp
                );    
            });            
        }
    });
}

module.exports = { registeredOracles, initOracles, registerOracle, getIndexes };