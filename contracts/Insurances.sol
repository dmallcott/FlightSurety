// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./Operational.sol";

contract Insurances is Operational {
    using SafeMath for uint256;

    uint256 MAX_INSURANCE = 1 ether;

    struct Insurance {
        address insuree;
        uint256 amount;
    }

    mapping(bytes32 => Insurance[]) insurances;
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

            insurances[_flight].push(Insurance(msg.sender, amountToInsure));

            _refund(excessToRefund);
        } else {
            amountToInsure = received;

            insurances[_flight].push(Insurance(msg.sender, amountToInsure));
        }

        emit InsurancePurchased(_flight, amountToInsure, excessToRefund);
    }

    function _credit(bytes32 _flight) internal whenNotPaused {
        Insurance[] memory _insurances = insurances[_flight];
        
        for (uint256 i = 0; i < _insurances.length; i++) {
            credits[_insurances[i].insuree] = _insurances[i].amount.mul(2);
        }
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
