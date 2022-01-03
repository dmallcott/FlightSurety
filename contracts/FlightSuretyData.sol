// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./infra/Operational.sol";
import "./infra/AuthorizedControl.sol";

contract FlightSuretyData is Ownable, Operational {
    using SafeMath for uint256;

    struct Airline {
        address[] registeredBy;
        bool isFunded;
    }

    struct Insurance {
        address insuree;
        uint256 amount;
    }

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    mapping(address => Airline) airlines;
    mapping(address => address[]) airlinesAwaitingRegistration;
    uint256 public registeredAirlines = 0;

    mapping(bytes32 => Insurance[]) insurances;
    mapping(address => uint256) credits;
    uint256 MAX_INSURANCE = 1 ether;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    event AirlineAwaitingRegistration(address _airline);
    event AirlineRegistered(address _airline);

    event InsurancePurchased(
        bytes32 _flight,
        uint256 insuredAmount,
        uint256 refundedExcess
    );
    event CreditApplied(bytes32 _flight, address _receiver);

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    modifier onlyRegisteredAirline() {
        require(
            airlines[msg.sender].registeredBy.length != 0,
            "You aren't a registered airline"
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

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    constructor(address firstAirline) {
        address[] memory voters = new address[](1);
        voters[0] = firstAirline;
        _register(firstAirline, voters);
        airlines[firstAirline].isFunded = true;
    }

    /********************************************************************************************/
    /*                                          AIRLINES                                        */
    /********************************************************************************************/

    function _register(address _airline, address[] memory _voters) private {
        airlines[_airline] = Airline(_voters, false);
        registeredAirlines++;

        emit AirlineRegistered(_airline);
    }

    function _queueAirlineForRegistration(address _airline) private {
        airlinesAwaitingRegistration[_airline].push(msg.sender);
        address[] memory voters = airlinesAwaitingRegistration[_airline];

        if (registeredAirlines.div(2) <= voters.length) {
            _register(_airline, voters);
            delete airlinesAwaitingRegistration[_airline];
        } else {
            emit AirlineAwaitingRegistration(_airline);
        }
    }

    /**
     * @dev Add an airline to the registration queue
     *      Can only be called from FlightSuretyApp contract
     *
     */
    function registerAirline(address _airline)
        external
        onlyRegisteredAirline
        onlyFundedAirline
        returns (uint256)
    {
        require(
            airlines[_airline].registeredBy.length == 0,
            "Airline already registered"
        );

        if (registeredAirlines < 4) {
            address[] memory voters = new address[](1);
            voters[0] = msg.sender;

            _register(_airline, voters);

            return airlines[_airline].registeredBy.length;
        } else {
            _queueAirlineForRegistration(_airline);

            return airlinesAwaitingRegistration[_airline].length;
        }
    }

    /**
     * @dev Initial funding for the insurance. Unless there are too many delayed flights
     *      resulting in insurance payouts, the contract should be self-sustaining
     *
     */
    function fund() external payable onlyRegisteredAirline {
        require(msg.value == 10 ether, "The price for activation is 10 ether");
        require(
            !airlines[msg.sender].isFunded,
            "You've already funded the contract"
        );

        airlines[msg.sender].isFunded = true;
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

    /********************************************************************************************/
    /*                                         INSURANCE                                        */
    /********************************************************************************************/

    function _refund(uint256 amount) private {
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

    /**
     * @dev Buy insurance for a flight
     *
     */
    function buy(bytes32 _flight) external payable whenNotPaused {
        require(msg.value > 0, "Can't insure you for nothing!");

        uint256 received = msg.value;

        uint256 amountToInsure;
        uint256 excessToRefund;

        if (received > MAX_INSURANCE) {
            excessToRefund = received - MAX_INSURANCE;
            amountToInsure = MAX_INSURANCE;

            insurances[_flight].push(Insurance(msg.sender, amountToInsure));

            _refund(excessToRefund);
        } else {
            amountToInsure = received;

            insurances[_flight].push(Insurance(msg.sender, amountToInsure));
        }

        emit InsurancePurchased(_flight, amountToInsure, excessToRefund);
    }

    /**
     *  @dev Credits payouts to insurees
     */
    function creditInsurees(bytes32 _flight) external whenNotPaused {
        Insurance[] memory _insurances = insurances[_flight];

        for (uint256 i = 0; i < _insurances.length; i++) {
            credits[_insurances[i].insuree] = _insurances[i].amount.mul(2);
            // TODO limit to authorised contracts
        }
    }

    function availableCredit()
        external
        view
        returns (uint256 _availableCredit)
    {
        return credits[msg.sender];
    }

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
     */
    function pay() external whenNotPaused {
        uint256 amountToPay = credits[msg.sender];
        require(amountToPay > 0, "Address has no credit");

        delete credits[msg.sender];

        (bool sent, ) = msg.sender.call{value: amountToPay}("");
        require(sent, "Failed to send Ether");
    }

    /**
     * @dev Fallback function for funding smart contract.
     *
     */
    receive() external payable {
        this.fund();
    }
}

// next step: migrate tests
