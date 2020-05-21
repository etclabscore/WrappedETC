require('chai/register-should');
const path = require("path");
const PrivateKeyProvider = require('truffle-privatekey-provider');
const fs = require('fs');
const keyth = require('keythereum');

const keyPubAddress = '7d38c531e7544625a4ea96437d7fe5c2918f3307';
const keyFilePath = '/home/ia/dev/bakaoh/WrappedETC/keystore/key';
const keyFileDir = '/home/ia/dev/bakaoh/WrappedETC/';

const keyobj = keyth.importFromFile(keyPubAddress, keyFileDir);
const privateKey = keyth.recover('', keyobj);
const privateKeyHex = privateKey.toString('hex');

console.log('private key', privateKeyHex);

// const privateKey = fs.readFileSync("").toString().trim();
// const privateKey = "0x7d38c531e7544625a4ea96437d7fe5c2918f3307";
const provider = new PrivateKeyProvider(privateKeyHex, "http://localhost:7545");

module.exports = {

  contracts_build_directory: path.join(__dirname, "client/src/contracts"),

  networks: {
    development: {
      host: "127.0.0.1",
      gas: 6350000,
      port: 7545,
      network_id: "*",
    }

    // kotti: {
    //   provider: () => new HDWalletProvider(mnemonic, "https://www.ethercluster.com/kotti"),
    //   network_id: 6,
    //   gasPrice: 2000000000,
    //   confirmations: 2,
    //   timeoutBlocks: 200,
    //   skipDryRun: true
    // }
  },

  // Configure your compilers
  compilers: {
    solc: {
      settings: {
       optimizer: {
         enabled: false,
         runs: 200
       } // ,
       // evmVersion: "byzantium"
      }
    }
  }
}
