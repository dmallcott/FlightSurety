import Web3 from "web3";
import FlightSuretyApp from "../../build/contracts/FlightSuretyApp.json";

const App = {
  web3: null,
  account: null,
  contract: null,

  airlines: [],
  flights: [],

  start: async function () {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = FlightSuretyApp.networks[networkId];
      this.contract = new web3.eth.Contract(
        FlightSuretyApp.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
      console.info("Using account: " + accounts[0]);
      console.info("Eth network initiated correctly.");

      await this.initAirlines();
      await this.initFlights();
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  initAirlines: async function() {
    try {
      await this.contract.methods.registerAirline(this.account, "British Airways").call();
      this.airlines.push(("British Airways"));
      await this.contract.methods.registerAirline(this.account, "Easyjet").call();
      this.airlines.push(("Easyjet"));

      for (let i in this.airlines) {
        var newDiv = document.createElement("option");
        newDiv.value = this.airlines[i];
        newDiv.innerHTML = this.airlines[i];
        document.getElementById("dropdownAirlines").appendChild(newDiv);
      }

    } catch (error) {
      // console.log(error);
      // alert("Could not initialise airlines");
    }
  },

  initFlights: async function() {
    try {
      let code1 = "BA1234"
      var when1 = new Date()
      when1.setDate(when1.getDate() + 1) // Tomorrow
      let key1 = await this.contract.methods.registerFlight(this.account, code1, when1.getTime()).call();
      this.flights.push(
        key1
      );

      let code2 = "EJ1111"
      var when2 = new Date()
      when2.setDate(when2.getDate() + 1) // Tomorrow
      let key2 = await this.contract.methods.registerFlight(this.account, code2, when2.getTime()).call();
      this.flights.push(
        key2
      );
      
      for (let i in this.flights) {
        var newDiv = document.createElement("option");
        newDiv.value = this.flights[i]._flightCode;
        newDiv.innerHTML = this.flights[i]._flightCode + " @ " + new Date(parseInt(this.flights[i]._flightTime)).toLocaleString();
        newDiv.addEventListener("change", this.showFlightStatus(), false);
        document.getElementById("dropdownFlights").appendChild(newDiv);
        newDiv = document.createElement("option");
        newDiv.value = this.flights[i]._flightCode;
        newDiv.innerHTML = this.flights[i]._flightCode + " @ " + new Date(parseInt(this.flights[i]._flightTime)).toLocaleString();
        newDiv.addEventListener("change", this.showFlightStatus(), false);
        document.getElementById("dropdownFlightsStatus").appendChild(newDiv);
      }
    } catch (error) {
      console.log(error);
      // alert("Could not initialise flights");
    } finally {
      this.initFlightStatusCheck();
    }
  },

  initFlightStatusCheck() {
    let self = this;

    this.contract.events.FlightStatusInfo({
        fromBlock: 0
    }, function (error, event) {
        if (error) {
            console.log(error);
        } else {
          let index = self.flights.findIndex(f => 
            f._flightCode == event.returnValues.flight 
            // && f._flightTime == event.returnValues.timestamp // skipping check to make testing easier
          );

          self.flights[index]._status = event.returnValues.status;
          self.showFlightStatus();
        }
    });
  },

  statusToString: function(_status) {
    switch(parseInt(_status)) {
      case 1:
        return "Your flight is on time"
      case 2:
        return "Your flight is late because the airline is not great"
      case 3:
        return "Your flight is late due to weather"
      case 4:
        return "Your flight is late due to a technical fault"
      case 5:
        return "Your flight is late. Too bad."
      case 0:
      default:
        return "We have no idea how your flight is doing"
    }
  },

  showFlightStatus: function() {
    const flight = this.flights[
      document.getElementById("dropdownFlightsStatus").selectedIndex
    ];

    if (flight && flight._status) {
      document.getElementById("flightStatus").innerHTML = this.statusToString(flight._status);
    }
  },

  fillAirline: function () {
    document.getElementById("inputAirlineAddress").value = this.account;
    document.getElementById("inputAirlineName").value = "Ryanair";
  },

  fillFlight: function () {
    document.getElementById("inputFlightAirlineAddress").value = this.account;
    document.getElementById("inputFlightCode").value = "FR3131";
    document.getElementById("inputFlightTime").value = Date.now();
  },

  registerAirline: async function () {
    const airlineAddress = document.getElementById("inputAirlineAddress").value;
    const airlineName = document.getElementById("inputAirlineName").value;
    try {
      let result = await this.contract.methods.registerAirline(airlineAddress, airlineName).call();

      document.getElementById("airlineSuccess").innerHTML = "Airline registered!";
      document.getElementById("airlineSuccess").hidden = false;  
      document.getElementById("airlineError").hidden = true; 
    } catch (error) {
      document.getElementById("airlineError").innerHTML = error.message;
      document.getElementById("airlineError").hidden = false;  
      document.getElementById("airlineSuccess").hidden = true;
    }
    
  },

  fundAirline: async function () {
    const airlineAddress = document.getElementById("inputAirlineAddress").value;
    try {
      let airlineToFund = (!airlineAddress) ? this.account : airlineAddress;

      await this.contract.methods.fundAirline().send({ from: airlineToFund, value: this.web3.utils.toWei("10") });

      document.getElementById("fundingSuccess").innerHTML = "Airline funded!";
      document.getElementById("fundingSuccess").hidden = false;  
      document.getElementById("fundingError").hidden = true; 
    } catch (error) {
      document.getElementById("fundingError").innerHTML = error.message;
      document.getElementById("fundingError").hidden = false;  
      document.getElementById("fundingSuccess").hidden = true;
    }
  },

  registerFlight: async function () {
    const flightAirlineAddress = document.getElementById("inputFlightAirlineAddress").value;
    const flightCode = document.getElementById("inputFlightCode").value;
    const flightTime = document.getElementById("inputFlightTime").value;
    try {
      let result = await this.contract.methods.registerFlight(flightAirlineAddress, flightCode, flightTime).call();

      this.flights.push(
        result
      );

      document.getElementById("flightSuccess").innerHTML = "Flight registered with key: " + result._flightKey;
      document.getElementById("flightSuccess").hidden = false;  
      document.getElementById("flightError").hidden = true; 
    } catch (error) {
      document.getElementById("flightError").innerHTML = error.message;
      document.getElementById("flightError").hidden = false;  
      document.getElementById("flightSuccess").hidden = true;
    }
  },

  buyInsurance: async function () {
    const flightToInsure = this.flights[
      document.getElementById("dropdownFlights").selectedIndex
    ];
    const insuranceAmount = document.getElementById("inputInsuranceAmount").value;
    
    try {
      await this.contract.methods.buyInsurance(flightToInsure._flightKey).send({ from: this.account, value: this.web3.utils.toWei(insuranceAmount) });
  
      document.getElementById("insuranceSuccess").innerHTML = "Insurance purchased!";
      document.getElementById("insuranceSuccess").hidden = false;  
      document.getElementById("insuranceError").hidden = true; 
    } catch (error) {
      document.getElementById("insuranceError").innerHTML = error.message;
      document.getElementById("insuranceError").hidden = false;  
      document.getElementById("insuranceSuccess").hidden = true;
    }
  },

  fetchFlightStatus: async function () {
    const flight = this.flights[
      document.getElementById("dropdownFlightsStatus").selectedIndex
    ];
    
    try {
      let result = await this.contract.methods.fetchFlightStatus(flight.airline, flight._flightCode, flight._flightTime).send({from: this.account});

      document.getElementById("statusRequestSuccess").innerHTML = "Flight status request submitted!";
      document.getElementById("statusRequestSuccess").hidden = false;  
      document.getElementById("statusRequestError").hidden = true; 
    } catch (error) {
      document.getElementById("statusRequestError").innerHTML = error.message;
      document.getElementById("statusRequestError").hidden = false;  
      document.getElementById("statusRequestSuccess").hidden = true;
    }
  },

  checkCredit: async function () {
    try {
      let credit = await this.contract.methods.checkCredit().call({ from: this.account });

      document.getElementById("creditAvailable").innerHTML = credit;
      document.getElementById("creditAvailable").value = credit;

      if (credit > 0) {
        showWithdrawal();
      }
    } catch (error) {
      console.log(error);
    }
  },

  showWithdrawal: function() {
    document.getElementById("withdrawal").visibility = visible;
  },

  withdrawCredits: async function () {
    try {
      await this.contract.methods.withdrawCredits().call({ from: this.account });

      document.getElementById("creditWithdrawalSuccess").innerHTML = "Your credits where withdrawn successfully!";
      document.getElementById("creditWithdrawalSuccess").hidden = false;  
      document.getElementById("creditWithdrawalError").hidden = true; 
    } catch (error) {
      document.getElementById("creditWithdrawalError").innerHTML = error.message;
      document.getElementById("creditWithdrawalError").hidden = false;  
      document.getElementById("creditWithdrawalSuccess").hidden = true;
    }
  }
};

window.App = App;

window.addEventListener("load", async function () {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts
  } else {
    console.log("error!")
    document.getElementById("error").style.visibility = "visible";
  }

  App.start();
});