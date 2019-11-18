const WETC = artifacts.require('WETC');


module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(WETC);
};