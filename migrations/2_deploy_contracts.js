const fs = require('fs');

const Data = artifacts.require("Data");
const Oracles = artifacts.require("Oracles");

module.exports = async function(deployer) {

    // I don't see the point of hard coding this?
    let firstAirline = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
    
    await deployer.deploy(Data, firstAirline);
    const data = await Data.deployed();
    await deployer.deploy(Oracles, data.address);
    const oracle = await Oracles.deployed();

    await data.authorizeContract(oracle.address);

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