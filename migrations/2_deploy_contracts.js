const TokenFarm = artifacts.require("TokenFarm")
const DaiToken = artifacts.require('DaiToken')
const StonkToken = artifacts.require('StonkToken')

module.exports = async function(deployer , network , accounts) {

  // Deploying Dai Token and Applying Handle \\
  await deployer.deploy(DaiToken)
  const daiToken = await DaiToken.deployed()

  // Deploying Stonk Token and Applying Handle \\
  await deployer.deploy(StonkToken)
  const stonkToken = await StonkToken.deployed()

  // Deploying Token Farm and Applying Handle \\
  await deployer.deploy(TokenFarm , daiToken.address , stonkToken.address)
  const tokenFarm = await TokenFarm.deployed()
  
  // Transfer all tokens to TokenFarm ( 1 million ) \\
  await stonkToken.transfer(tokenFarm.address , '1000000000000000000000000')

  // Transfer 100 Mock DAI to investor \\
  await daiToken.transfer(accounts[1] , '100000000000000000000')
}