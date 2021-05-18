import React, { Component } from 'react'
import Web3 from 'web3'
import DaiToken from '../abis/DaiToken.json'
import StonkToken from '../abis/StonkToken.json'
import TokenFarm from '../abis/TokenFarm.json'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'

class App extends Component {

  // Load Web3 And Blockchain Data Before Rendering User Interface
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  // Load Blockchain Data
  async loadBlockchainData() {
    
    // Web3 Handle
    const web3 = window.web3
    
    // Accounts Handle
    const accounts = await web3.eth.getAccounts()
    
    // Setting 'account' State
    this.setState({ account: accounts[0] })
    
    // Network ID Handle
    const networkId = await web3.eth.net.getId()

    // Dai Token Data Handle
    const daiTokenData = DaiToken.networks[networkId]

    // If Dai Token Is Detected On The Network * Create JavaScript / Web3 Version Of ABI *
    if (daiTokenData) { 
      const daiToken = new web3.eth.Contract(DaiToken.abi , daiTokenData.address)
      this.setState({ daiToken })
      let daiTokenBalance = await daiToken.methods.balanceOf(this.state.account).call()
      this.setState({ daiTokenBalance: daiTokenBalance.toString() })
    } else {  

      // If Dai Token Is Not Detected On The Network * Alert *
      window.alert('DaiToken Contract Not Deployed To Detected Network')
    }

    // Stonk Token Data Handle
    const stonkTokenData = StonkToken.networks[networkId]

    // If Stonk Token Is Detected On The Network * Create JavaScript / Web3 Version Of ABI *
    if (stonkTokenData) { 
      const stonkToken = new web3.eth.Contract(StonkToken.abi , stonkTokenData.address)
      this.setState({ stonkToken })
      let stonkTokenBalance = await stonkToken.methods.balanceOf(this.state.account).call()
      this.setState({ stonkTokenBalance: stonkTokenBalance.toString() })
    } else {  

      // If Stonk Token Is Not Detected On The Network * Alert *
      window.alert('StonkToken Contract Not Deployed To Detected Network')
    }

    // Token Farm Data Handle
    const tokenFarmData = TokenFarm.networks[networkId]

    // If Token Farm Is Detected On The Network * Create JavaScript / Web3 Version Of ABI *
    if (tokenFarmData) { 
      const tokenFarm = new web3.eth.Contract(TokenFarm.abi , tokenFarmData.address)
      this.setState({ tokenFarm })
      let stakingBalance = await tokenFarm.methods.stakingBalance(this.state.account).call()
      this.setState({ stakingBalance: stakingBalance.toString() })
    } else {  

      // If Token Farm Is Not Detected On The Network * Alert *
      window.alert('TokenFarm Contract Not Deployed To Detected Network')
    }

    // When Blockchain Data Is Finished Loading, Set Loading State To False
    this.setState({ loading: false })
  }

  // Load Web3
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert('You Dont Seem To Be Using An Ethereum Browser. You Should Consider Trying MetaMask :D')
    }
  }

  // Stake Tokens Function
  stakeTokens = (amount) => {

    // Set Loading State To True
    this.setState({ loading: true })

    // Call DaiTokens Approve Funtion To Allow User To Send Dai Tokens To Token Farm By Adding Dai Tokens To Users Staking Allowance
    this.state.daiToken.methods.approve(this.state.tokenFarm._address , amount).send({ from: this.state.account }).on('transactionHash' , (hash) => {

      // Call Token Farms Stake Tokens Funciton To Send Dai Tokens From Users Staking Allowance To Token Farm , Then Add Tokens To Users Staking Balance
      this.state.tokenFarm.methods.stakeDaiTokens(amount).send({ from: this.state.account }).on('transactionHash' , (hash) => {

        // Set Loading State To False
        this.setState({ loading: false })
      })
    })
  }

  // Unstake Tokens Function
  unstakeTokens = (amount) => {

    // Set Loading State To True
    this.setState({ loading: true })

    // Call Token Farms Unstake Funtion To Send Dai Tokens From Stakig Farm To User
    this.state.tokenFarm.methods.unstakeDaiTokens().send({ from: this.state.account }).on('transactionHash' , (hash) => {
      
      // Set Loading State To False
      this.setState({ loading: false })
    })
  }

  // React State
  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      daiToken: {},
      stonkToken: {},
      tokenFarm: {},
      daiTokenBalance: '0',
      stonkTokenBalance: '0',
      stakingBalance: '0',
      loading: true
    }
  }

  render() {

    let content 

    // While Blockchain Data Is Loading , Render 'Loading...'
    if (this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>

    // When Blockchain Data Is Finished Loading , Render 'Main'
    } else {

      // Passing State To Main
      content = <Main
        daiTokenBalance={this.state.daiTokenBalance}
        stonkTokenBalance={this.state.stonkTokenBalance}
        stakingBalance={this.state.stakingBalance}
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
      />
    }
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>
                
                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
