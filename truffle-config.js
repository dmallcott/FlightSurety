// const HDWalletProvider = require('@truffle/hdwallet-provider');
//
// const fs = require('fs');
// const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
  networks: {
    develop: {
      host: "127.0.0.1",
      network_id: 5777,
      port: 9545,
      accounts: 20,
      defaultEtherBalance: 500
    },
    rinkeby: {
      provider: () => new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/efe263b4367b4828aedbdc9bc0f1e759`),
        network_id: 4,       
        gas: 4500000,        
        gasPrice: 10000000000
    },
  },
  
  // Configure your compilers
  compilers: {
    solc: {
      version: "^0.8.0"
    }
  }
};
