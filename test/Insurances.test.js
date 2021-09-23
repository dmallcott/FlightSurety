var Insurances = artifacts.require("Insurances");
const truffleAssert = require('truffle-assertions');

contract('Insurances Tests', async (accounts) => {

    var contract;
    let flightId = web3.utils.asciiToHex("flight1");

    before('setup contract', async () => {
        contract = await Insurances.new();
    });

    it(`can't purchase insurance for zero eth`, async function () {
        await truffleAssert.reverts(
            contract.buyInsurance(flightId, { value: 0 }),
            "Can't insure you for nothing!"
        );
    });

    it(`refunds the excess of buying insurance`, async function () {
        let amountToSend = web3.utils.toWei('1.5', 'ether');
        let expectedCost = web3.utils.toWei('1', 'ether');
        let expectedRefund = amountToSend - expectedCost;

        let result = await contract.buyInsurance(flightId, { value: amountToSend });
        
        truffleAssert.eventEmitted(result, 'InsurancePurchased', (ev) => {
            return ev.insuredAmount == expectedCost && ev.refundedExcess == expectedRefund;
        });
    });

    it(`can buy insurance`, async function () {
        let amountToSend = web3.utils.toWei('0.5', 'ether');
        let result = await contract.buyInsurance(flightId, { value: amountToSend });
        
        truffleAssert.eventEmitted(result, 'InsurancePurchased', (ev) => {
            return ev.insuredAmount == amountToSend;
        });
    });

    it(`can credit insurees`, async function () {
        let credit = web3.utils.toWei('1');
        let insuree = accounts[0];

        await contract.credit(insuree, { value: credit });

        assert.equal(await contract.availableCredit({from: insuree}), credit, "Wrong creddit");
    });

});