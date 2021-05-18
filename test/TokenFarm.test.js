const { assert } = require('chai')

const TokenFarm = artifacts.require("TokenFarm")
const DaiToken = artifacts.require('DaiToken')
const StonkToken = artifacts.require('StonkToken')

require('chai')
  .use(require('chai-as-promised'))
  .should()

// Token Conversion To Wei
function tokens(n) {
    return web3.utils.toWei(n , 'ether')
}

// Token Farm Contract Test
contract('TokenFarm' , ([owner , investor]) => {
    let daiToken , stonkToken , tokenFarm

    before(async () => {
        // Load Contracts 
        daiToken = await DaiToken.new()
        stonkToken = await StonkToken.new()
        tokenFarm = await TokenFarm.new(daiToken.address , stonkToken.address)

        // Transfer All Stonk Tokens To Token Farm ( 1 million )
        await stonkToken.transfer(tokenFarm.address , tokens('1000000'))

        // // Transfer Dai Tokens To Investor ( 100 )
        await daiToken.transfer(investor , tokens('100') , { from: owner })
    })
    
    // Test Checks For Dai Token
    describe('Mock Dai Token Deployment' , async () => {
        
        // Test Check To See If Dai Token Has The Correct Name
        it('Has a Name' , async () => {
            let daiToken = await DaiToken.new()
            const name = await daiToken.name()
            assert.equal(name , 'Dai Token')
        })
        // Test Check To See If Dai Token Has The Correct Total Supply
        it('Dai Total Supply is 1 Million Tokens' , async () => {
            let daiToken = await DaiToken.new()
            const totalSupply = await daiToken.totalSupply()
            assert.equal(totalSupply , tokens('1000000'))
        })
    })

    // Test Checks For Stonk Token
    describe('Mock Stonk Token Deployment' , async () => {
        // Test Check To See If Stonk Token Has The Correct Name 
        it('Has a Name' , async () => {
            let stonkToken = await StonkToken.new()
            const name = await stonkToken.name()
            assert.equal(name , 'Stonk Token')
        })
        // Test Check To See If Stonk Token Has The Correct Total Supply
        it('Stonk Total Supply is 1 Million Tokens' , async () => {
            let stonkToken = await StonkToken.new()
            const totalSupply = await stonkToken.totalSupply()
            assert.equal(totalSupply , tokens('1000000'))
        })
        // Test Check To See If Stonk Tokan Has Transfered Its Token Supply To The Token Farm
        it('Stonk Token Contract Has Passed Everything To Token Farm' , async () => {
            let balance = await stonkToken.balanceOf(stonkToken.address)
            assert.equal(balance.toString() , tokens('0'))
        })
    })

    // Test Checks To See If Token Farms Name == 'Stonks Token Farm' + Has 1 Million Tokens Sent From Dai Contract
    describe('Mock Token Farm Deployment' , async () => {
        it('Has a Name' , async () => {
            let tokenFarm = await TokenFarm.new(daiToken.address , stonkToken.address)
            const name = await tokenFarm.name()
            assert.equal(name , 'Stonks Token Farm')
        })
        it('Token Farm Has 1 Million Tokens' , async () => {
            let balance = await stonkToken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString() , tokens('1000000'))
        })
    })

    // Test Checks To See If Investors Are Receiving Rewards For Staking
    describe('Farming Tokens' , async () => {
        it('Dai Token Contract Has Passed 100 DAI To Investor\n\tInvestor Has Staked Dai Successfully\n\tToken Farm Can Issue Token Rewards\n\tInvestors Can Receive Token Rewards\n\tOnly The Owner Can Issue Token Rewards\n\tInvestor Has Unstaked Dai Successfully\n\tInvestor Dai Balances Are Effected By Unstaking\n\tToken Farm Balances Are Effected By Unstaking\n\tInvestors Staking Balances Are Effected By Unstaking' , async () => {
            let result;
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString() , tokens('100'))

            // Allow Token Farm To Receive 100 Tokens From Investor , Stake 100 Tokens From Investor To Token Farm
            await daiToken.approve(tokenFarm.address , tokens('100') , { from: investor })
            await tokenFarm.stakeDaiTokens(tokens('100') , { from: investor })

            // Check Result Of Stake
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString() , tokens('0'))

            // Check Investors Staking Balance
            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString() , tokens('100'))

            // Check If Investor Is Staking
            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString() , 'true')

            // Check If Token Issuing Works
            await tokenFarm.issueToken()

            // Ensure Investors Stonk Balances Are Effected By Token Issuance
            result = await stonkToken.balanceOf(investor)
            assert.equal(result.toString() , tokens('300'))

            // Ensure Only The Owner Can Issue Tokens
            await tokenFarm.issueToken({ from: investor }).should.be.rejected;

            // Check Result Of UnStaking
            await tokenFarm.unstakeDaiTokens({ from: investor })

            // Ensure Investor Dai Balances Are Effected By Unstaking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString() , tokens('100'))

            // Ensure Token Farm Balances Are Effected By Unstaking
            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString() , tokens('0'))

            // Ensure Investors Staking Balances Are Effected By Unstaking
            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString() , tokens('0'))
        })
    })
})