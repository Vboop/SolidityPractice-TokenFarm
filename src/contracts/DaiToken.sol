// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.4;

// Token Contract - Values And Functions
contract DaiToken {
    
    // Token Values
    string  public name = "Dai Token";
    string  public symbol = "DAI";
    uint256 public totalSupply = 1000000000000000000000000; // 1 million tokens ( Wei )
    uint8   public decimals = 18;

    // Transfer Event - To Log Transfers To The BlockChain
    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    // Approval Event - To Log Approvals To The BlockChain
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    // Token Values ( Stores {balance / uint256} For {user / address} )
    mapping(address => uint256) public balanceOf;

    // Token Values ( Stores Amount which Spender Is Still Allowed To Withdraw From Contract Owner )
    mapping(address => mapping(address => uint256)) public allowance;

    // Constructor ( Setting Balance Of Contract Owner To 1 million )
    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }

    // Token Funtion ( Transfers {_value / amount} Of Funds From Contract Owner To {_to / address}  )
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    // Token Function ( Approves {_value / amount} Of Funds From Contract Owner To {_spender / address} )
    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    // Token Function ( Transfers {_value / amount} Of Funds From {_from / sender} To {_to / receiver} )
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
}
