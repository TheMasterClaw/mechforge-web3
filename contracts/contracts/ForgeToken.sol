// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ForgeToken
 * @dev ERC20 reward token for MechForge
 */
contract ForgeToken is ERC20, Ownable {
    
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18; // 100M tokens
    
    mapping(address => bool) public minters;
    
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    
    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "Not minter");
        _;
    }
    
    constructor() ERC20("Forge Token", "FORGE") Ownable(msg.sender) {
        // Mint initial supply to owner
        _mint(msg.sender, 10_000_000 * 10**18); // 10M initial supply
    }
    
    function mint(address to, uint256 amount) external onlyMinter {
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }
    
    function addMinter(address minter) external onlyOwner {
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}