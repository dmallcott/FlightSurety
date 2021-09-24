// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./Operational.sol";

contract Airlines is Operational {
    using SafeMath for uint256;

    struct Airline {
        address[] registeredBy;
        bool isFunded;
    }

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
    mapping(address => Airline) private airlines;
    mapping(bytes32 => Flight) private flights;

    mapping(address => address[]) private airlinesAwaitingRegistration;

    // Utils
    uint256 public registeredAirlines = 0;

    // Events
    event AirlineAwaitingRegistration(address _airline);
    event AirlineRegistered(address _airline);
    event FlightRegistered(bytes32 _flight);

    constructor(address firstAirline) {
        address[] memory voters = new address[](1);
        voters[0] = firstAirline;
        _register(firstAirline, voters);
        airlines[firstAirline].isFunded = true;
    }

    modifier onlyRegisteredAirline(address _airline) {
        require(
            airlines[_airline].registeredBy.length != 0,
            "That's not a registered airline"
        );
        _;
    }

    modifier onlyFundedAirline() {
        require(
            airlines[msg.sender].isFunded,
            "You haven't funded the contract!"
        );
        _;
    }

    function _register(address _airline, address[] memory _voters) private {
        airlines[_airline] = Airline(_voters, false);
        registeredAirlines++;

        emit AirlineRegistered(_airline);
    }

    function _queueAirlineForRegistration(address _airline) private {
        airlinesAwaitingRegistration[_airline].push(msg.sender);
        address[] memory voters = airlinesAwaitingRegistration[_airline];

        if (registeredAirlines.div(2) <= voters.length) {
            // TODO this division is not working
            _register(_airline, voters);
            delete airlinesAwaitingRegistration[_airline];
        } else {
            emit AirlineAwaitingRegistration(_airline);
        }
    }

    function registerAirline(address _airline)
        public
        onlyRegisteredAirline(msg.sender)
        onlyFundedAirline
    {
        require(
            airlines[_airline].registeredBy.length == 0,
            "Airline already registered"
        );

        if (registeredAirlines < 4) {
            address[] memory voters = new address[](1);
            voters[0] = msg.sender;

            _register(_airline, voters);
        } else {
            _queueAirlineForRegistration(_airline);
        }
    }

    function fund()
        external
        payable
        onlyRegisteredAirline(msg.sender)
        whenNotPaused
    {
        require(msg.value == 10 ether, "The price for activation is 10 ether");
        require(
            !airlines[msg.sender].isFunded,
            "You've already funded the contract"
        );

        airlines[msg.sender].isFunded = true;
    }

    function voteForAirline(address _airline)
        external
        onlyRegisteredAirline(msg.sender)
        onlyFundedAirline
        whenNotPaused
    {
        require(
            airlines[_airline].registeredBy.length == 0,
            "Airline is not registered"
        );

        _queueAirlineForRegistration(_airline);
    }

    function getAirline(address _airline)
        external
        view
        onlyOwner
        returns (address[] memory registeredBy, bool isFunded)
    {
        Airline memory airline = airlines[_airline];

        return (airline.registeredBy, airline.isFunded);
    }

    function registerFlight(
        address _airline,
        string memory _flight,
        uint256 _timestamp
    ) external onlyRegisteredAirline(_airline) whenNotPaused {
        require(
            _timestamp > block.timestamp,
            "Can't register a flight in the past"
        );

        bytes32 flightKey = getFlightKey(_airline, _flight, _timestamp);

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

    function getFlightKey(
        address airline,
        string memory flight,
        uint256 timestamp
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    // TODO this needs some abuse protection
    function _fightStatusChanged(
        address airline,
        string memory flight,
        uint256 timestamp,
        uint8 statusCode
    ) external {
        bytes32 _flight = getFlightKey(airline, flight, timestamp);
        flights[_flight].statusCode = StatusCode(statusCode);
        flights[_flight].updatedTimestamp = block.timestamp;

        // TODO credit insurances and send the money
    }
}
