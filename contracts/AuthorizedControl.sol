// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AuthorizedControl is Ownable {

    mapping(address => uint8) private authorizedContracts;

    modifier onlyAuthorizedContract() {
        require(authorizedContracts[msg.sender] != 0, "You're not authorised to do this");
        _;
    }

    function authorizeContract(address _authorized) external onlyOwner {
        authorizedContracts[_authorized] = 1;
    }


    function deauthorizeContract(address _authorized) external onlyOwner {
        delete authorizedContracts[_authorized];
    }
}