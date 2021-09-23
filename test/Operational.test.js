
var Operational = artifacts.require("Operational");
const truffleAssert = require('truffle-assertions');

contract('Operational Tests', async (accounts) => {

    let owner = accounts[0];
    let unauthorizedAddress = accounts[1];

    var dataContract;

    before('setup contract', async () => {
        dataContract = await Operational.new();
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
});
