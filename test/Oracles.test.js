var Oracles = artifacts.require("Oracles");
const truffleAssert = require('truffle-assertions');

contract('Oracles Tests', async (accounts) => {

    var contract;
    var owner = accounts[0];
    var oracle1 = accounts[1];
    var airline = accounts[2];
    var flight = web3.utils.asciiToHex("FR3231");
    var flightDepartureTime = Date.now() + 600000;

    before('setup contract', async () => {
        contract = await Oracles.new(owner);
    });

    it(`can't register oracle for free`, async function () {
        await truffleAssert.reverts(contract.registerOracle({ from: oracle1, value: 0 }));
    });

    it(`can register oracle`, async function () {
        await truffleAssert.passes(
            contract.registerOracle({ from: oracle1, value: web3.utils.toWei('1') })
        );
    });

    it(`once registered, can fetch my indexes`, async function () {
        await truffleAssert.passes(
            contract.getMyIndexes({ from: oracle1 })
        )
    });

    it(`once registered, can fetch flight status`, async function () {
        truffleAssert.eventEmitted(
            await contract.fetchFlightStatus(airline, flight, flightDepartureTime),
            'OracleRequest'
        )
    });

    it(`once registered, can submit a response`, async function () {
        let request = await contract.fetchFlightStatus(airline, flight, flightDepartureTime);
        let statusCode = 3;
        
        let result = await contract.submitOracleResponse(request.logs[0].args.index, airline, flight, flightDepartureTime, statusCode, { from: oracle1 });

        truffleAssert.eventEmitted(result, 'OracleReport');
    });
});