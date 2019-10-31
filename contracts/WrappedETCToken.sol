pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC777/ERC777.sol";

contract WrappedETCToken is ERC777 {

    event Deposit(address indexed _owner, uint _value);
    event Withdrawal(address indexed _owner, uint _value);
    
    constructor () public ERC777("WrappedETC", "WETC", new address[](0)) {
    }

    function() external payable {
        deposit();
    }

    function deposit() public payable {
        super._mint(msg.sender, msg.sender, msg.value, "", "");
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint wad) public {
        this.burn(wad, "");
        msg.sender.transfer(wad);
        emit Withdrawal(msg.sender, wad);
    }
}