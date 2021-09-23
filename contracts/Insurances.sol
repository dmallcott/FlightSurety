// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract Insurances is Ownable, Pausable {
    using SafeMath for uint256;

    mapping(address => mapping(bytes32 => uint256)) private insurances;
    mapping(address => uint256) internal credits;

    event InsurancePurchased(
        bytes32 _flight,
        uint256 insuredAmount,
        uint256 refundedExcess
    );

    event CreditApplied(bytes32 _flight, address _receiver);

    uint256 private MAX_INSURANCE = 1 ether;

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

    function getInsurance(bytes32 _flight)
        external
        view
        onlyOwner
        returns (uint256 _insuredAmount)
    {
        return insurances[msg.sender][_flight];
    }

    function credit(address _insuree) external payable {
        credits[_insuree] = msg.value;
    }

    function availableCredit()
        external
        view
        returns (uint256 _availableCredit)
    {
        return credits[msg.sender];
    }

    function withdraw(address _insuree) external {
        uint256 amountToPay = credits[_insuree];
        require(amountToPay > 0, "Address has no credit");

        delete credits[_insuree];

        (bool sent, ) = _insuree.call{value: amountToPay}("");
        require(sent, "Failed to send Ether");
    }
}
