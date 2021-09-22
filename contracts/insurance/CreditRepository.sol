// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface MethodsToExpose {
    function credit(address _insuree) external payable;

    function availableCredit() external view returns (uint256 _availableCredit);

    function withdraw(address _insuree) external;
}

abstract contract CreditRepository is MethodsToExpose {
    mapping(address => uint256) internal credits;

    // TODO events

    function _credit(address _insuree) internal {
        credits[_insuree] = msg.value;
    }

    function _availableCredit()
        internal
        view
        returns (uint256 availableCredit)
    {
        return credits[msg.sender];
    }

    function _withdraw(address _insuree) internal {
        uint256 amountToPay = credits[_insuree];
        require(amountToPay > 0, "Address has no credit");

        delete credits[_insuree];

        (bool sent, ) = _insuree.call{value: amountToPay}("");
        require(sent, "Failed to send Ether");
    }
}
