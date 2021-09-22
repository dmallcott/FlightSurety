// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface Overrides {
    function registerFlight(
        address _airline,
        string memory _flight,
        uint256 _timestamp
    ) external;
}

abstract contract FlightsPersistence is Overrides {
    // Flight status codees
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    struct Flight {
        uint8 statusCode;
        uint256 updatedTimestamp;
        address airline;
    }
    mapping(bytes32 => Flight) private flights;

    // Reference to airlines so you can check the airline is valid
    //Airlines airlines;

    function _registerFlight(
        address _airline,
        string memory _flight,
        uint256 _timestamp
    ) internal {
        // require timestamp in future
        // require no duplicates

        bytes32 flightKey = getFlightKey(_airline, _flight, _timestamp);
        flights[flightKey] = Flight(
            STATUS_CODE_UNKNOWN,
            block.timestamp,
            _airline
        );

        // event
    }

    function getFlightKey(
        address airline,
        string memory flight,
        uint256 timestamp
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }
}
