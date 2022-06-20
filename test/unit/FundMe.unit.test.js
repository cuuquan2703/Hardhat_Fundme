const {getNamedAccounts, deployments,ethers} = require("hardhat")
const {assert,expect} = require("chai")

describe("FundMe",function() {
    let fundmeContract
    let MockV3Contract
    let deployer
    const sendingValue = "20000000000000000"
    beforeEach(async function (){
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundmeContract = await ethers.getContract("FundMe",deployer)
        MockV3Contract = await ethers.getContract("MockV3Aggregator",deployer)
    })

    describe("Constructor",async function(){
        it("Set the agrregator address correctly",async function(){ 
            const res = await fundmeContract.getPriceFeed()
            assert.equal(res,MockV3Contract.address)
        })
    })

    describe("Fund",async function(){ 
        it("Fail if yiou dont send enough ETH",async function(){
            await expect(fundmeContract.fund()).to.be.reverted
        })

        it("Update the amount funded data strcuture",async function(){
            await fundmeContract.fund({value:sendingValue})
            const res = await fundmeContract.getAddressToAmountFunded(deployer)
            assert.equal(res.toString(),sendingValue.toString())
        })

        it("Added funder to funder array",async function(){
            await fundmeContract.fund({value:sendingValue})
            const res = fundmeContract.getFunder(0)
            assert.equal(res,deployer)
        })
    })

    describe("Withdrawn",async function(){
        beforeEach(async function(){ 
            await fundmeContract.fund({value:sendingValue})
        })

        it("With draw form single founder",async function(){
            const beginningFundmeBalance = await fundmeContract.provider.getBalance(fundmeContract.address)
            const beginningFounderBalance = await fundmeContract.provider.getBalance(deployer)

            const TxRes = await fundmeContract.withdraw()
            const TxReceipt = await TxRes.wait(1)
            const {gasUsed,effectiveGasPrice} = TxReceipt
            const gasPrice = gasUsed.mul(effectiveGasPrice)

            const endingFundmeBalance = await fundmeContract.provider.getBalance(fundmeContract.address)
            const endingFounderBalance = await fundmeContract.provider.getBalance(deployer)

            assert.equal(endingFundmeBalance, 0)
            assert.equal(beginningFundmeBalance.add(beginningFounderBalance).toString(),endingFounderBalance.add(gasPrice).toString())

        })

        it("Withdraw from multiple founder",async function(){
            const Signers = await ethers.getSigners()
            for (let i=0;i<4;i++){
                const connectedContract = await fundmeContract.connect(Signers[i])
                await connectedContract.fund({value:sendingValue})
            }

            const beginningFundmeBalance = await fundmeContract.provider.getBalance(fundmeContract.address)
            const beginningFounderBalance = await fundmeContract.provider.getBalance(deployer)

            const TxRes = await fundmeContract.withdraw()
            const TxReceipt = await TxRes.wait(1)
            const {gasUsed,effectiveGasPrice} = TxReceipt
            const gasPrice = gasUsed.mul(effectiveGasPrice)

            const endingFundmeBalance = await fundmeContract.provider.getBalance(fundmeContract.address)
            const endingFounderBalance = await fundmeContract.provider.getBalance(deployer)
            
            assert.equal(endingFundmeBalance, 0)
            assert.equal(beginningFundmeBalance.add(beginningFounderBalance).toString(),endingFounderBalance.add(gasPrice).toString())

            await expect(fundmeContract.getFunder(0)).to.be.reverted

            for (let i=0;i<4;i++){
                assert.equal(await fundmeContract.getAddressToAmountFunded(Signers[i].address),0)            
            }
        })
    })

    describe("Only Owner can withdraw",async function(){
        it("",async function(){
            const Signers = await ethers.getSigners()
            const WrongOwner = Signers[1]
            const connectedContract = await fundmeContract.connect(WrongOwner)
            await expect(connectedContract.withdraw()).to.be.reverted
        })
    })

})
