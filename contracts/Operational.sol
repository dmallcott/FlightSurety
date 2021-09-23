// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract Operational is Ownable, Pausable {

    function isOperational() external view returns (bool) {
        return !paused();
    }

    function setOperatingStatus(bool activate) external onlyOwner {
        if (paused() && activate) {
            _unpause();
        } else if (!paused() && !activate) {
            _pause();
        }
    }
}