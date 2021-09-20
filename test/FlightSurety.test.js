
var FlightSuretyData = artifacts.require("FlightSuretyData");
const truffleAssert = require('truffle-assertions');

contract('Flight Surety Tests', async (accounts) => {

    let owner = accounts[0];
    let unauthorizedAddress = accounts[1];
    let firstAirline = accounts[2];
    let secondAirline = accounts[3];

    var dataContract;

    before('setup contract', async () => {
        dataContract = await FlightSuretyData.new(firstAirline);
    });

    it(`(multiparty) has correct initial isOperational() value`, async function () {
        assert.equal(await dataContract.isOperational(), true, "Incorrect initial operating status value");
    });

    it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {
        await truffleAssert.fails(
            dataContract.setOperatingStatus(false, { from: unauthorizedAddress })
        );
    });

    it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {
        await truffleAssert.passes(
            dataContract.setOperatingStatus(true, { from: owner })
        );
    });

    it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {
        // TODO: I don't like their implementation. Will rewrite.
    });

    it(`(multiparty) has correct initial isOperational() value`, async function () {
        assert.equal(await dataContract.isOperational(), true, "Incorrect initial operating status value");
    });

    it(`firstAirline is registered on contract deployement`, async function () {
        assert.equal(await dataContract.registeredAirlines.call(), 1, "Wrong number of airlines initialised")
    });

    it(`can't register an airline twice`, async function () {
        await truffleAssert.fails(
            dataContract.registerAirline(firstAirline),
            truffleAssert.ErrorType.REVERT,
            "Airline already registered"
        );    
    });

    it(`for the first four airlines, only an airline can register another airline`, async function () {
        await truffleAssert.fails(
            dataContract.registerAirline(secondAirline, {from: secondAirline}),
            truffleAssert.ErrorType.REVERT,
            "Right now, only registered airlines can register other airlines"
        );    
    });

    it(`for the first four airlines, first airline can register second airline`, async function () {
        let thirdAirline = accounts[4];
        let fourthAirline = accounts[5];

        await truffleAssert.passes(dataContract.registerAirline(secondAirline, {from: firstAirline})); 
        await truffleAssert.passes(dataContract.registerAirline(thirdAirline, {from: firstAirline}));    
        await truffleAssert.passes(dataContract.registerAirline(fourthAirline, {from: thirdAirline}));       

        assert.equal(await dataContract.registeredAirlines.call(), 4, "Wrong number of airlines")
    });

    it(`for the fifth onwards airline, add them to the registration queue`, async function () {
        let fifthAirline = accounts[6];
        await truffleAssert.passes(dataContract.registerAirline(fifthAirline, {from: fifthAirline}));       

        assert.equal(await dataContract.registeredAirlines.call(), 4, "Wrong number of airlines")
    });

});
