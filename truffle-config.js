const path = require("path");
require('chai/register-should');
const PrivateKeyProvider = require('truffle-privatekey-provider');
const fs = require('fs');

//pubkey: 0x009F69e2af8fC10e862173E0F2D8493077dAe503
const privateKey = fs.readFileSync(".secret").toString().trim();
const provider = new PrivateKeyProvider(privateKey, "http://localhost:8002/core-geth/dev/1.11.2");

module.exports = {

  contracts_build_directory: path.join(__dirname, "client/src/contracts"),

  networks: {
    development: {
      host: "127.0.0.1",
      port: 9545,
      network_id: "*",
    },

    gethdev: {
      provider: provider,
      gas: 6350992,
      gasPrice: 20000000000,
      network_id: 1337,
      networkCheckTimeout: 60000,
    }
  },

  // Configure your compilers
  compilers: {
    solc: {
      settings: {
       optimizer: {
         enabled: true,
         runs: 200
       },
      }
    }
  }
}
