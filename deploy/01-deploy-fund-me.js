const { networkConfig,developmentChain } = require("../helper-hardhat-config");
const {network, ethers}= require('hardhat')
const {verify}= require('../utils/verify')

module.exports = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const {deploy,log} = deployments
  const {deployer} = await getNamedAccounts()

  const chainId = network.config.chainId

  let Address;


  if (chainId == 31337){
      const MockContract = await ethers.getContract("MockV3Aggregator")
      Address = MockContract.address
  }else {
    Address = networkConfig[chainId]["ehtUsdPriceFeed"]
  }

  const FundMe = await deploy("FundMe",{
      from: deployer,
      args:[Address], // agrs for constructor of Contract
      log: true,
      waitConfirmations:network.config.blockConfirmations || 1
  })
  log("Done ---------------------------------------")
  if (!developmentChain.includes[network.name] && process.env.ETHERSCAN_API_KEY){
      await verify(FundMe.address,[Address])
  }

  log("-----------------------------------------------")
};

module.exports.tags = ["all","FundMe"]
