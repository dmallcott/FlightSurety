// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "./InsuranceRepository.sol";
import "./CreditRepository.sol";

// Add some business logic here
contract Insurances is Ownable, Pausable, InsuranceRepository, CreditRepository {
    
    function getInsurance(bytes32 _flight)
        external
        view
        override
        returns (uint256 _insuredAmount)
    {
        return super._getInsurance(_flight);
    }

    function buy(bytes32 _flight) external payable override {
        super._buy(_flight);
    }

    function credit(address _insuree) override external payable {
        // require insuree to have insurance
        super._credit(_insuree);

    }
 
    function availableCredit() override external view returns (uint256 _availableCredit) {
        return super._availableCredit();
    }

    function withdraw(address _insuree) override external {
        super._withdraw(_insuree);
    }
}
