// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../infra/Operational.sol";
import "../infra/AuthorizedControl.sol";
import "./Airlines.sol";
import "./Insurances.sol";

contract Data is Operational, AuthorizedControl, Airlines, Insurances {

    constructor(address firstAirline) Operational() AuthorizedControl() Airlines(firstAirline) Insurances() { }

    function getFlightKey(
        address airline,
        string memory flight,
        uint256 timestamp
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    function fightStatusChanged(
        address airline,
        string memory flight,
        uint256 timestamp,
        uint8 statusCode
    ) external onlyAuthorizedContract {
        bytes32 _flight = getFlightKey(airline, flight, timestamp);

        //super._updateFlightStatus(_flight, statusCode);
        //super._credit(_flight);
    }
}