// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract FlightSuretyData is Ownable, Pausable {
    using SafeMath for uint256;

    // Data variables

    mapping(address => Airline) airlines;
    uint256 public registeredAirlines = 0;

    mapping(address => address[]) airlinesAwaitingRegistration;

    struct Airline {
        address registeredBy;
    }

    // Events

    event AirlineRegistered(address _airline);

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

    constructor(address firstAirline) {
        airlines[firstAirline] = Airline(msg.sender); // TODO extract
        registeredAirlines++;
    }

    function _registerUpToFourthAirline(address _airline) internal {
        require(airlines[msg.sender].registeredBy != address(0), "Right now, only registered airlines can register other airlines");

        airlines[_airline] = Airline(msg.sender);
        registeredAirlines++;
    }

    function _registerFifthOnwardsAirline(address _airline) internal {
        // require consesus

        airlines[_airline] = Airline(msg.sender); // TODO (I think this will just use the app contract?)
        registeredAirlines++;
    }

    function _queueAirlineForRegistration(address _airline) internal {
        airlinesAwaitingRegistration[_airline].push(msg.sender);

        if (airlinesAwaitingRegistration[_airline].length.div(registeredAirlines) > 0) {
            _registerFifthOnwardsAirline(_airline);
            delete airlinesAwaitingRegistration[_airline];
        }
    }

    function registerAirline(address _airline) public whenNotPaused {
        require(airlines[_airline].registeredBy == address(0), "Airline already registered");

        if (registeredAirlines < 4) {
            _registerUpToFourthAirline(_airline);
        } else {
            _queueAirlineForRegistration(_airline);
        }

        emit AirlineRegistered(_airline);
    }

    /**
     * @dev Buy insurance for a flight
     *
     */
    function buy() external payable whenNotPaused {}

    /**
     *  @dev Credits payouts to insurees
     */
    function creditInsurees() external pure {}

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
     */
    function pay() external pure {}

    /**
     * @dev Initial funding for the insurance. Unless there are too many delayed flights
     *      resulting in insurance payouts, the contract should be self-sustaining
     *
     */
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
