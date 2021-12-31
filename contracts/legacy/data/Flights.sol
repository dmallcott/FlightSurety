// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "../infra/Operational.sol";

contract Flights is Operational {
    using SafeMath for uint256;

    struct Flight {
        StatusCode statusCode;
        uint256 updatedTimestamp;
        address airline;
    }

    enum StatusCode {
        STATUS_CODE_UNKNOWN,
        STATUS_CODE_ON_TIME,
        STATUS_CODE_LATE_AIRLINE,
        STATUS_CODE_LATE_WEATHER,
        STATUS_CODE_LATE_TECHNICAL,
        STATUS_CODE_LATE_OTHER
    }

    // Data
    mapping(bytes32 => Flight) private flights;


    // Events
    event FlightRegistered(bytes32 _flight);

    function _registerFlight(
        address _airline,
        string memory _flight,
        uint256 _timestamp
    ) internal {
        require(
            _timestamp > block.timestamp,
            "Can't register a flight in the past"
        );

        bytes32 flightKey = _getFlightKey(_airline, _flight, _timestamp);

        require(
            flights[flightKey].airline == address(0),
            "Flight already exists"
        );

        flights[flightKey] = Flight(
            StatusCode.STATUS_CODE_UNKNOWN,
            block.timestamp,
            _airline
        );

        emit FlightRegistered(flightKey);
    }

    function _getFlightKey(
        address airline,
        string memory flight,
        uint256 timestamp
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    function _updateFlightStatus(bytes32 _flight, uint8 statusCode) internal {
        flights[_flight].statusCode = StatusCode(statusCode);
        flights[_flight].updatedTimestamp = block.timestamp;
    }
}
