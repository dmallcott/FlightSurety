const fs = require('fs');

const Data = artifacts.require("FlightSuretyData");
const App = artifacts.require("FlightSuretyApp");

module.exports = async function(deployer, network, accounts) {
    let firstAirline = accounts[0];
    
    await deployer.deploy(Data, firstAirline);
    const data = await Data.deployed();
    await deployer.deploy(App, data.address);
    const oracle = await App.deployed();

    let config = {
        localhost: {
            url: 'http://localhost:9545',
            dataAddress: data.address,
            oracleAddress: oracle.address
        }
    }
    fs.writeFileSync(__dirname + '/../dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
    fs.writeFileSync(__dirname + '/../server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
}