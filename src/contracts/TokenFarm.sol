// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.4;

import "./StonkToken.sol";
import "./DaiToken.sol";

// Token Farm Contract - Values And Functions
contract TokenFarm {

    // Token Farm Values
    string public name = "Stonks Token Farm";
    address public owner;
    DaiToken public daiToken;
    StonkToken public stonkToken;

    // Token Farm User State
    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    // Constructor ( Assigning Handles For Each Contract - Dai Token , Stonk Token , Token Farm )
    constructor(DaiToken _daiToken , StonkToken _stonkToken) {

        // Contract Handles || Dai Token , Stonk Token , TokenFarm
        daiToken = _daiToken;
        stonkToken = _stonkToken;
        owner = msg.sender;
    }
    
    // Token Function ( Allows Investors To Stake Dai Token To Token Farm )
    function stakeDaiTokens(uint _amount) public {
        require(_amount > 0 , 'You Have No Money :/');
        daiToken.transferFrom(msg.sender , address(this) , _amount);
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;
        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    // Token Function ( Allows Investors To Unstake Dai Token From Token Farm )
    function unstakeDaiTokens() public {
        uint balance = stakingBalance[msg.sender];
        require(balance > 0 , 'You Have No Staking Balance :/');
        daiToken.transfer(msg.sender , balance);
        stakingBalance[msg.sender] = 0;
        isStaking[msg.sender] = false;
    }

    // Token Function ( Allows Token Farm Owner To Issue Stonk Tokens To Investors )
    function issueTokens() public {
        require(msg.sender == owner , 'Issuer Of Tokens Must Be Owner Of Token Farm Smart Contract');
        for ( uint i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if ( balance > 0 ) {
                stonkToken.transfer(recipient , balance * 3);
            }            
        }
    }

}