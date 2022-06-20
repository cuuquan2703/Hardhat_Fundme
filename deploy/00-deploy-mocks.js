const {network}= require('hardhat')
const {developmentChain,INITIAL_ANSWER,DECIMALS} = require('../helper-hardhat-config')

module.exports = async (hre) => {
    const { getNamedAccounts, deployments } = hre;
    const {deploy,log} = deployments
    const {deployer} = await getNamedAccounts()
  
    const chainId = network.config.chainId
  
    if (chainId == 31337){
        console.log("Mock is deploying---------------------------")
        const Mock = await deploy("MockV3Aggregator",{
            contract: "MockV3Aggregator",
            from: deployer,
            args:[DECIMALS,INITIAL_ANSWER], // agrs for constructor of Contract
            log: true,
        })
        log("---------------------------------------------")
    }
  };

  module.exports.tags = ["all","mocks"]