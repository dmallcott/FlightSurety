
var Airlines = artifacts.require("Airlines");
const truffleAssert = require('truffle-assertions');

contract('Airlines Tests', async (accounts) => {

    let firstAirline = accounts[2];
    let secondAirline = accounts[3];
    let thirdAirline = accounts[4];
    let fourthAirline = accounts[5];
    let fifthAirline = accounts[6];

    var dataContract;

    before('setup contract', async () => {
        dataContract = await Airlines.new(firstAirline);
    });

    it(`firstAirline is registered on contract deployement`, async function () {
        assert.equal(await dataContract.registeredAirlines.call(), 1, "Wrong number of airlines initialised")
    });

    it(`can't register an airline twice`, async function () {
        await truffleAssert.reverts(
            dataContract.registerAirline(firstAirline, { from: firstAirline }),
            "Airline already registered"
        );
    });

    it(`for the first four airlines, only an airline can register another airline`, async function () {
        await truffleAssert.reverts(
            dataContract.registerAirline(secondAirline, { from: secondAirline })
        );
    });

    it(`for the first four airlines, first airline can register second airline`, async function () {
        await truffleAssert.passes(dataContract.registerAirline(secondAirline, { from: firstAirline }));
        await truffleAssert.passes(dataContract.registerAirline(thirdAirline, { from: firstAirline }));
        await truffleAssert.passes(dataContract.registerAirline(fourthAirline, { from: firstAirline }));

        assert.equal(await dataContract.registeredAirlines.call(), 4, "Wrong number of airlines")
    });

    it(`for the fifth onwards airline, add them to the registration queue`, async function () {
        let fifthAirline = accounts[6];
        await truffleAssert.passes(dataContract.registerAirline(fifthAirline, { from: firstAirline }));

        assert.equal(await dataContract.registeredAirlines.call(), 4, "Wrong number of airlines")
    });

    it(`can fund an airline only with 10 eth`, async function () {
        await truffleAssert.reverts(dataContract.fund({ from: thirdAirline, value: web3.utils.toWei('5') }));
        await truffleAssert.reverts(dataContract.fund({ from: thirdAirline, value: web3.utils.toWei('12') }));
        await truffleAssert.passes(dataContract.fund({ from: thirdAirline, value: web3.utils.toWei('10') }));

        let airline = await dataContract.getAirline(thirdAirline);
        assert.equal(airline.isFunded, true, "Airline should be funded");
    });

    it(`can vote an airline`, async function () {
        assert.equal(await dataContract.registeredAirlines.call(), 4, "Wrong number of airlines")
        await truffleAssert.passes(dataContract.fund({ from: secondAirline, value: web3.utils.toWei('10') }));
        await truffleAssert.passes(dataContract.voteForAirline(fifthAirline, { from: secondAirline }));

        assert.equal(await dataContract.registeredAirlines.call(), 5, "Wrong number of airlines")
    });

    it(`can add a flight`, async function () {
        truffleAssert.eventEmitted(
            await dataContract.registerFlight(firstAirline, "FR3132", Date.now() + 60000),
            'FlightRegistered'
        );
    });
});
