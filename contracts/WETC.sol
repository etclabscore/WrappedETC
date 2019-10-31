pragma solidity ^0.5.0;

import "./UnlimitedAllowanceERC777.sol";

/**
 * @dev Implementation of the WETC token contract.
 *
 * Supply mechanism is based on msg.value of creation transaction.
 * msg.value tokens are minted to msg.sender address of creation transaction.
 */

contract WETC is UnlimitedAllowanceERC777 {
    event Deposit(address indexed owner, uint value);
    event Withdrawal(address indexed owner, uint value);

    constructor(

    )
        UnlimitedAllowanceERC777("Wrapped ETC", "WETC", new address[](0))
        public
    {

    }

        /** @dev Fallback function to deposit() when ETC is sent to the contract. */
    function()
        external
        payable
    {
        deposit();
    }

    /** @dev Exchange ETC for WETC 1:1 using _mint()
    *
    *   Emits Minted and Transfer events too.
    */
    function deposit()
        public
        payable
    {
        super._mint(_msgSender(), _msgSender(), msg.value, "", "");
        emit Deposit(msg.sender, msg.value);
    }

    /** @dev Exchange WETC for ETC 1:1 using _mint()
    *
    *   Emits Burned and Transfer events too.
    */
    function withdraw(uint amount)
        public
    {
        super._burn(_msgSender(), _msgSender(), amount, "", "");
        emit Withdrawal(msg.sender, amount);
    }
}