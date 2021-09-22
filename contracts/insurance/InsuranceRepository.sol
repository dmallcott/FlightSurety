// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface ExposedMethods {

    function buy(bytes32 _flight) external payable;

    function getInsurance(bytes32 _flight) external view returns (uint256 _insuredAmount);
}

abstract contract InsuranceRepository is ExposedMethods {
    using SafeMath for uint256;

    mapping(address => mapping(bytes32 => uint256)) private insurances;

    event InsurancePurchased(
        bytes32 _flight,
        uint256 insuredAmount,
        uint256 refundedExcess
    );

    uint256 private MAX_INSURANCE = 1 ether;

    modifier zeroOrMore() {
        require(msg.value > 0, "Can't insure you for nothing!");
        _;
    }

    function _refund(uint256 amount) private {
        (bool sent, ) = msg.sender.call { value: amount }("");
        require(sent, "Failed to send Ether");
    }

    function _buy(bytes32 _flight) internal zeroOrMore {
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

    function _getInsurance(bytes32 _flight) internal view returns (uint256 _insuredAmount) {
        return insurances[msg.sender][_flight];
    }
}