var FlightSuretyData = artifacts.require("FlightSuretyData");
const truffleAssert = require('truffle-assertions');

contract('Flight Surety Tests', async (accounts) => {

    let firstAirline = accounts[2];
    let secondAirline = accounts[3];
    let thirdAirline = accounts[4];
    let fourthAirline = accounts[5];
    let fifthAirline = accounts[6];
    let flightId = web3.utils.asciiToHex("flight1");

    var contract;

    before('setup contract', async () => {
        contract = await FlightSuretyData.new(firstAirline);
    });

    it(`firstAirline is registered on contract deployement`, async function () {
        assert.equal(await contract.registeredAirlines.call(), 1, "Wrong number of airlines initialised")
    });

    it(`can't register an airline twice`, async function () {
        await truffleAssert.reverts(
            contract.registerAirline(firstAirline, { from: firstAirline }),
            "Airline already registered"
        );
    });

    it(`for the first four airlines, only an airline can register another airline`, async function () {
        await truffleAssert.reverts(
            contract.registerAirline(secondAirline, { from: secondAirline })
        );
    });

    it(`for the first four airlines, first airline can register second airline`, async function () {
        await truffleAssert.passes(contract.registerAirline(secondAirline, { from: firstAirline }));
        await truffleAssert.passes(contract.registerAirline(thirdAirline, { from: firstAirline }));
        await truffleAssert.passes(contract.registerAirline(fourthAirline, { from: firstAirline }));

        assert.equal(await contract.registeredAirlines.call(), 4, "Wrong number of airlines")
    });

    it(`for the fifth onwards airline, add them to the registration queue`, async function () {
        let fifthAirline = accounts[6];
        await truffleAssert.passes(contract.registerAirline(fifthAirline, { from: firstAirline }));

        assert.equal(await contract.registeredAirlines.call(), 4, "Wrong number of airlines")
    });

    it(`can fund an airline only with 10 eth`, async function () {
        await truffleAssert.reverts(contract.fund({ from: thirdAirline, value: web3.utils.toWei('5') }));
        await truffleAssert.reverts(contract.fund({ from: thirdAirline, value: web3.utils.toWei('12') }));
        await truffleAssert.passes(contract.fund({ from: thirdAirline, value: web3.utils.toWei('10') }));

        let airline = await contract.getAirline(thirdAirline);
        assert.equal(airline.isFunded, true, "Airline should be funded");
    });

    it(`can vote an airline`, async function () {
        assert.equal(await contract.registeredAirlines.call(), 4, "Wrong number of airlines")
        await truffleAssert.passes(contract.fund({ from: secondAirline, value: web3.utils.toWei('10') }));
        await truffleAssert.passes(contract.registerAirline(fifthAirline, { from: secondAirline }));

        assert.equal(await contract.registeredAirlines.call(), 5, "Wrong number of airlines")
    });

    // it(`can add a flight`, async function () {
    //     truffleAssert.eventEmitted(
    //         await contract.registerFlight(firstAirline, "FR3132", Date.now() + 60000),
    //         'FlightRegistered'
    //     );
    // });

    it(`can't purchase insurance for zero eth`, async function () {
        await truffleAssert.reverts(
            contract.buy(flightId, { value: 0 }),
            "Can't insure you for nothing!"
        );
    });

    it(`refunds the excess of buying insurance`, async function () {
        let amountToSend = web3.utils.toWei('1.5', 'ether');
        let expectedCost = web3.utils.toWei('1', 'ether');
        let expectedRefund = amountToSend - expectedCost;

        let result = await contract.buy(flightId, { value: amountToSend });
        
        truffleAssert.eventEmitted(result, 'InsurancePurchased', (ev) => {
            return ev.insuredAmount == expectedCost && ev.refundedExcess == expectedRefund;
        });
    });

    it(`can buy insurance`, async function () {
        let amountToSend = web3.utils.toWei('0.5', 'ether');
        let result = await contract.buy(flightId, { value: amountToSend });
        
        truffleAssert.eventEmitted(result, 'InsurancePurchased', (ev) => {
            return ev.insuredAmount == amountToSend;
        });
    });

    it(`can credit insurees`, async function () {
        let expectedCredit = web3.utils.toWei('1', 'ether');
        let insuree = accounts[0];

        await contract.creditInsurees(flightId);

        assert.equal(await contract.availableCredit({from: insuree}), expectedCredit, "Wrong creddit");
    });

    it(`can withdraw my credit`, async function () {
        var BN = web3.utils.BN;

        let insuree = accounts[0];
        let startingBalance = await web3.eth.getBalance(insuree);
        let expectedBalance = new BN(startingBalance).add(new BN(await web3.utils.toWei('1', 'ether'))).toString();

        await contract.pay({from: insuree});

        let balanceAfterWithdraw = await web3.eth.getBalance(insuree);

        assert.equal(await contract.availableCredit({from: insuree}), 0, "Wrong credit");
        // assert.equal(expectedBalance, balanceAfterWithdraw, "Wrong balance"); TODO missing gas fee ? 
    });
});