// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./Operational.sol";

contract Insurances is Operational {
    using SafeMath for uint256;

    uint256 MAX_INSURANCE = 1 ether;

    mapping(address => mapping(bytes32 => uint256)) insurances;
    mapping(address => uint256) credits; // TODO you can collect twice with this

    event InsurancePurchased(bytes32 _flight, uint256 insuredAmount, uint256 refundedExcess);
    event CreditApplied(bytes32 _flight, address _receiver);

    modifier zeroOrMore() {
        require(msg.value > 0, "Can't insure you for nothing!");
        _;
    }

    function _refund(uint256 amount) private {
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

    function buyInsurance(bytes32 _flight)
        external
        payable
        zeroOrMore
        whenNotPaused
    {
        uint256 received = msg.value;

        uint256 amountToInsure;
        uint256 excessToRefund;

        if (received > MAX_INSURANCE) {
            excessToRefund = received - MAX_INSURANCE;
            amountToInsure = MAX_INSURANCE;

            insurances[msg.sender][_flight] = amountToInsure;

            _refund(excessToRefund);
        } else {
            amountToInsure = received;

            insurances[msg.sender][_flight] = amountToInsure;
        }

        emit InsurancePurchased(_flight, amountToInsure, excessToRefund);
    }

    function credit(address _insuree) external payable whenNotPaused {
        credits[_insuree] = msg.value;
    }

    function availableCredit()
        external
        view
        returns (uint256 _availableCredit)
    {
        return credits[msg.sender];
    }

    function withdraw() external whenNotPaused {
        uint256 amountToPay = credits[msg.sender];
        require(amountToPay > 0, "Address has no credit");

        delete credits[msg.sender];

        (bool sent, ) = msg.sender.call{value: amountToPay}("");
        require(sent, "Failed to send Ether");
    }
}
