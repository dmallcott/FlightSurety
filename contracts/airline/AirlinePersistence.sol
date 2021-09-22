// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface MethodsToOverride {
    function registerAirline(address _airline) external;
}

abstract contract AirlinePersistence is MethodsToOverride {
    using SafeMath for uint256;

    mapping(address => Airline) airlines;
    uint256 public registeredAirlines = 0;

    mapping(address => address[]) airlinesAwaitingRegistration;

    struct Airline {
        address registeredBy;
    }

    event AirlineRegistered(address _airline);

    constructor(address firstAirline) {
        airlines[firstAirline] = Airline(msg.sender); // TODO extract to method
        registeredAirlines++;
    }

    function _registerUpToFourthAirline(address _airline) private {
        require(airlines[msg.sender].registeredBy != address(0), "Right now, only registered airlines can register other airlines");

        airlines[_airline] = Airline(msg.sender);
        registeredAirlines++;
    }

    function _registerFifthOnwardsAirline(address _airline) private {
        airlines[_airline] = Airline(msg.sender); // TODO (I think this will just use the app contract?)
        registeredAirlines++;
    }

    function _queueAirlineForRegistration(address _airline) private {
        airlinesAwaitingRegistration[_airline].push(msg.sender);

        if (airlinesAwaitingRegistration[_airline].length.div(registeredAirlines) > 0) {
            _registerFifthOnwardsAirline(_airline);
            delete airlinesAwaitingRegistration[_airline];
        }
    }

    function _registerAirline(address _airline) internal {
        require(airlines[_airline].registeredBy == address(0), "Airline already registered");

        if (registeredAirlines < 4) {
            _registerUpToFourthAirline(_airline);
        } else {
            _queueAirlineForRegistration(_airline);
        }

        emit AirlineRegistered(_airline);
    }
}
