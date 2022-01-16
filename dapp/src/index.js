import Web3 from "web3";
import FlightSuretyApp from "../../build/contracts/FlightSuretyApp.json";

class Flight {
  constructor(code, time, key) {
    this.code = code;
    this.time = time;
    this.key = key;
  }
}

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
        new Flight(code1, when1, key1)
      );
      let code2 = "EJ1111"
      var when2 = new Date()
      when2.setDate(when2.getDate() + 1) // Tomorrow
      let key2 = await this.contract.methods.registerFlight(this.account, code2, when2.getTime()).call();
      this.flights.push(
        new Flight(code2, when2, key2)
      );
      for (let i in this.flights) {
        var newDiv = document.createElement("option");
        newDiv.value = this.flights[i].code;
        newDiv.innerHTML = this.flights[i].code + " @ " + this.flights[i].time.toISOString();
        document.getElementById("dropdownFlights").appendChild(newDiv);
      }

    } catch (error) {
      // console.log(error);
      // alert("Could not initialise flights");
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
        new Flight(flightCode, flightTime, result)
      );

      document.getElementById("flightSuccess").innerHTML = "Flight registered with key: " + result;
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
      await this.contract.methods.buyInsurance(flightToInsure.key._flightKey).send({ from: this.account, value: this.web3.utils.toWei(insuranceAmount) });
  
      document.getElementById("insuranceSuccess").innerHTML = "Insurance purchased!";
      document.getElementById("insuranceSuccess").hidden = false;  
      document.getElementById("insuranceError").hidden = true; 
    } catch (error) {
      document.getElementById("insuranceError").innerHTML = error.message;
      document.getElementById("insuranceError").hidden = false;  
      document.getElementById("insuranceSuccess").hidden = true;
    }
  },

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