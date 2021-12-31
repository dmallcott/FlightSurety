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
        let expectedCredit = web3.utils.toWei('1', 'ether');
        let insuree = accounts[0];

        await contract.credit(flightId);

        assert.equal(await contract.availableCredit({from: insuree}), expectedCredit, "Wrong creddit");
    });

    it(`can withdraw my credit`, async function () {
        var BN = web3.utils.BN;

        let insuree = accounts[0];
        let startingBalance = await web3.eth.getBalance(insuree);
        let expectedBalance = new BN(startingBalance).add(new BN(await web3.utils.toWei('1', 'ether'))).toString();

        await contract.withdraw({from: insuree});

        let balanceAfterWithdraw = await web3.eth.getBalance(insuree);

        assert.equal(await contract.availableCredit({from: insuree}), 0, "Wrong creddit");
        assert.equal(expectedBalance, balanceAfterWithdraw, "Wrong balance");
    });

});