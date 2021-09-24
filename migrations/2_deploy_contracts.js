const Data = artifacts.require("Data");
const Oracles = artifacts.require("Oracles");

module.exports = async function(deployer) {

    // I don't see the point of hard coding this?
    let firstAirline = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
    
    const data = await deployer.deploy(Data, firstAirline);
    const oracle = await deployer.deploy(Oracles);

    await data.authorizeContract(oracle.address);
}