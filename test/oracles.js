var FlightSuretyApp = artifacts.require("FlightSuretyApp");
const truffleAssert = require('truffle-assertions');

contract('Oracles', async (accounts) => {

    var contract;
    var owner = accounts[0];
    var airline = accounts[1];
    var oracle = accounts[2];
    var flight = web3.utils.asciiToHex("FR3231");
    var flightDepartureTime = Date.now() + 600000;

    const TEST_ORACLES_COUNT = 20;

    before('setup contract', async () => {
        contract = await FlightSuretyApp.new(owner, {from: owner});

        // Watch contract events
        const STATUS_CODE_UNKNOWN = 0;
        const STATUS_CODE_ON_TIME = 10;
        const STATUS_CODE_LATE_AIRLINE = 20;
        const STATUS_CODE_LATE_WEATHER = 30;
        const STATUS_CODE_LATE_TECHNICAL = 40;
        const STATUS_CODE_LATE_OTHER = 50;
    });


    it('can register oracles', async () => {

        // ARRANGE
        let fee = await contract.REGISTRATION_FEE.call();

        // ACT
        for (let a = 0; a < TEST_ORACLES_COUNT; a++) {
            await contract.registerOracle({ from: accounts[a], value: fee });
            let result = await contract.getMyIndexes.call({ from: accounts[a] });
            // console.log(`Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`);
        }
    });

    // it('can request flight status', async () => {

    //     // ARRANGE
    //     let flight = 'ND1309'; // Course number
    //     let timestamp = Math.floor(Date.now() / 1000);

    //     // Submit a request for oracles to get status information for a flight
    //     await contract.fetchFlightStatus(airline, flight, timestamp);
    //     // ACT

    //     // Since the Index assigned to each test account is opaque by design
    //     // loop through all the accounts and for each account, all its Indexes (indices?)
    //     // and submit a response. The contract will reject a submission if it was
    //     // not requested so while sub-optimal, it's a good test of that feature
    //     for (let a = 0; a < TEST_ORACLES_COUNT; a++) {

    //         // Get oracle information
    //         let oracleIndexes = await contract.getMyIndexes.call({ from: accounts[a] });
    //         for (let idx = 0; idx < 3; idx++) {

    //             try {
    //                 // Submit a response...it will only be accepted if there is an Index match
    //                 await contract.submitOracleResponse(oracleIndexes[idx], airline, flight, timestamp, STATUS_CODE_ON_TIME, { from: accounts[a] });

    //             }
    //             catch (e) {
    //                 // Enable this when debugging
    //                 // console.log('\nError', idx, oracleIndexes[idx].toNumber(), flight, timestamp);
    //             }

    //         }
    //     }
    // });

    it(`can add a flight`, async function () {
        truffleAssert.eventEmitted(
            await contract.registerFlight(airline, "FR3132", Date.now() + 60000),
            'FlightRegistered'
        );
    });

    it(`can't register oracle for free`, async function () {
        await truffleAssert.reverts(contract.registerOracle({ from: oracle, value: 0 }));
    });

    it(`can register oracle`, async function () {
        await truffleAssert.passes(
            contract.registerOracle({ from: oracle, value: web3.utils.toWei('1') })
        );
    });

    it(`once registered, can fetch my indexes`, async function () {
        await truffleAssert.passes(
            contract.getMyIndexes({ from: oracle })
        )
    });

    it(`once registered, can fetch flight status`, async function () {
        truffleAssert.eventEmitted(
            await contract.fetchFlightStatus(airline, flight, flightDepartureTime),
            'OracleRequest'
        )
    });

    // it(`once registered, can submit a response`, async function () {
    //     let request = await contract.fetchFlightStatus(airline, flight, flightDepartureTime);
    //     let statusCode = 3;
    //     let index = request.logs[0].args.index;

    //     console.log(`Index: ${index}`);
    //     let result = await contract.submitOracleResponse(index, airline, flight, flightDepartureTime, statusCode, { from: oracle });

    //     truffleAssert.eventEmitted(result, 'OracleReport');
    // });
});