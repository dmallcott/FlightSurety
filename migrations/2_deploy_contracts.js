const Airlines = artifacts.require("Airlines");
const Insurances = artifacts.require("Insurances");
const Oracles = artifacts.require("Oracles");

module.exports = function(deployer) {

    // I don't see the point of hard coding this?
    let firstAirline = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
    
    deployer.deploy(Airlines, firstAirline);
    deployer.deploy(Insurances);
    deployer.deploy(Oracles);
}