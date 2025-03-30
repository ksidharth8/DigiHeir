// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Will is Ownable, ReentrancyGuard {
    struct Beneficiary {
        address payable addr;
        uint256 share;
        bool exists;
    }

    struct WillData {
        string ipfsHash;
        uint256 lastActivity;
        uint256 inactivityPeriod;
        bool exists;
    }

    mapping(address => WillData) public wills;
    mapping(address => mapping(address => Beneficiary)) public beneficiaries;
    mapping(address => uint256) public beneficiaryCount;

    event WillCreated(address indexed owner, string ipfsHash);
    event BeneficiaryAdded(address indexed owner, address indexed beneficiary, uint256 share);
    event WillExecuted(address indexed owner, address indexed beneficiary, uint256 amount);
    event InactivityPeriodUpdated(address indexed owner, uint256 newPeriod);

    constructor() Ownable() {
        _transferOwnership(msg.sender);
    }

    function createWill(string memory _ipfsHash, uint256 _inactivityPeriod) external {
        require(!wills[msg.sender].exists, "Will already exists");
        require(_inactivityPeriod > 0, "Inactivity period must be greater than 0");
        
        wills[msg.sender] = WillData({
            ipfsHash: _ipfsHash,
            lastActivity: block.timestamp,
            inactivityPeriod: _inactivityPeriod,
            exists: true
        });

        emit WillCreated(msg.sender, _ipfsHash);
    }

    function addBeneficiary(address payable _beneficiary, uint256 _share) external {
        require(wills[msg.sender].exists, "Will does not exist");
        require(!beneficiaries[msg.sender][_beneficiary].exists, "Beneficiary already exists");
        require(_share > 0, "Share must be greater than 0");
        
        beneficiaries[msg.sender][_beneficiary] = Beneficiary({
            addr: _beneficiary,
            share: _share,
            exists: true
        });
        
        beneficiaryCount[msg.sender]++;
        emit BeneficiaryAdded(msg.sender, _beneficiary, _share);
    }

    function updateInactivityPeriod(uint256 _newPeriod) external {
        require(wills[msg.sender].exists, "Will does not exist");
        require(_newPeriod > 0, "Inactivity period must be greater than 0");
        
        wills[msg.sender].inactivityPeriod = _newPeriod;
        emit InactivityPeriodUpdated(msg.sender, _newPeriod);
    }

    function recordActivity() external {
        require(wills[msg.sender].exists, "Will does not exist");
        wills[msg.sender].lastActivity = block.timestamp;
    }

    function executeWill(address payable _owner) external nonReentrant {
        WillData storage will = wills[_owner];
        require(will.exists, "Will does not exist");
        require(
            block.timestamp >= will.lastActivity + will.inactivityPeriod,
            "Inactivity period not met"
        );

        uint256 totalBeneficiaries = beneficiaryCount[_owner];
        require(totalBeneficiaries > 0, "No beneficiaries found");

        uint256 contractBalance = address(this).balance;
        require(contractBalance > 0, "No funds to distribute");

        // Create an array to store beneficiary addresses
        address[] memory beneficiaryAddresses = new address[](totalBeneficiaries);
        uint256 index = 0;

        // First pass: collect all beneficiary addresses
        for (uint256 i = 0; i < totalBeneficiaries; i++) {
            address beneficiaryAddr = address(uint160(i)); // Convert index to address
            if (beneficiaries[_owner][beneficiaryAddr].exists) {
                beneficiaryAddresses[index] = beneficiaryAddr;
                index++;
            }
        }

        // Second pass: distribute funds
        for (uint256 i = 0; i < index; i++) {
            Beneficiary storage beneficiary = beneficiaries[_owner][beneficiaryAddresses[i]];
            if (beneficiary.exists) {
                uint256 shareAmount = (contractBalance * beneficiary.share) / 100;
                beneficiary.addr.transfer(shareAmount);
                emit WillExecuted(_owner, beneficiary.addr, shareAmount);
            }
        }

        // Clean up
        delete wills[_owner];
        for (uint256 i = 0; i < index; i++) {
            delete beneficiaries[_owner][beneficiaryAddresses[i]];
        }
        delete beneficiaryCount[_owner];
    }

    // Function to receive ETH
    receive() external payable {}
} 