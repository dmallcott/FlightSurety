// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract FlightSuretyData is Ownable, Pausable {
    using SafeMath for uint256;

    // Operational control

    function isOperational() public view returns (bool) {
        return !paused();
    }

    function setOperatingStatus(bool enabled) external onlyOwner {
        if (enabled && paused()) {
            _unpause();
        } else if (!enabled && !paused()) {
            _pause();
        }
    }

    constructor(address firstAirline) { }

    function registerAirline(address _airline) public whenNotPaused {
        // super._registerAirline(_airline);
    }

    function buy(bytes32 _flight) external payable whenNotPaused {
        // super._buy(_flight);
    }

    function creditInsurees(address[] memory _creditors) external onlyOwner whenNotPaused {
        // super._creditInsurees(_creditors);
    }

    function pay() external pure {}

    function fund() public payable {}



    function getFlightKey(address airline, string memory flight, uint256 timestamp) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    // Fallbacks
    fallback() external payable {
        fund(); // TODO review
    }

    receive() external payable {
        fund(); // TODO review
    }
}
