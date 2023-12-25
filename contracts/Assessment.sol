// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    mapping(address => uint256) public shares;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event GcdResult(uint256 result);
    event SharesTransferred(address from, address to, uint256 shareAmount);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
        shares[msg.sender] = 100; // Initially, the owner holds 100 shares
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint256 _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint256 _previousBalance = balance;
        require(balance >= _withdrawAmount, "Insufficient balance");

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    function gcd(uint256 _a, uint256 _b) public returns (uint256) {
        while (_b != 0) {
            uint256 temp = _b;
            _b = _a % _b;
            _a = temp;
        }

        // emit the result
        emit GcdResult(_a);

        return _a;
    }

    function transferShares(address _recipient, uint256 _shareAmount) public {
        require(msg.sender != _recipient, "Cannot transfer shares to yourself");
        require(shares[msg.sender] >= _shareAmount, "Insufficient shares to transfer");

        // Transfer shares
        shares[msg.sender] -= _shareAmount;
        shares[_recipient] += _shareAmount;

        // emit the event
        emit SharesTransferred(msg.sender, _recipient, _shareAmount);
    }
}
