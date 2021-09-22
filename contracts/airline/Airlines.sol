// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "./AirlinePersistence.sol";
import "./FlightsPersistence.sol";

contract Airlines is Ownable, Pausable, AirlinePersistence, FlightsPersistence {
    using SafeMath for uint256;

    constructor(address firstAirline) AirlinePersistence(firstAirline) { }

    function registerAirline(address _airline) override external {
        super._registerAirline(_airline);
    }

    function registerFlight(
        address _airline,
        string memory _flight,
        uint256 _timestamp
    ) override external {
        super._registerFlight(_airline, _flight, _timestamp);
    }
}
