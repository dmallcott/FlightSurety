import Web3 from "web3";
import FlightSuretyApp from "../../build/contracts/FlightSuretyApp.json";

const App = {
  web3: null,
  account: null,
  contract: null,

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
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  fillAirline: function () {
    document.getElementById("inputAirlineAddress").value = "0x65400CEA4A9B8aEE80aDa894aD0746bcDFd6072A";
    document.getElementById("inputAirlineName").value = "Ryanair";
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