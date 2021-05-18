// Executable Truffle Script
const TokenFarm = artifacts.require('TokenFarm')

// Function To Issue Tokens 
module.exports = async function(callback) {
  let tokenFarm = await TokenFarm.deployed()
  await tokenFarm.issueTokens()
  // Code goes here...
  console.log("Tokens issued!")
  callback()
}