// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract DigiHeir is Ownable, ReentrancyGuard {
    struct Beneficiary {
        address payable beneficiaryAddress;
        uint256 sharePercentage;
        bool exists;
    }

    struct Will {
        string ipfsHash;
        uint256 lastActivity;
        uint256 inactivityPeriod;
        bool exists;
        Beneficiary[] beneficiaries;
    }

    mapping(address => Will) public wills;
    mapping(address => bool) public hasWill;

    event WillCreated(address indexed owner, string ipfsHash);
    event WillUpdated(address indexed owner, string ipfsHash);
    event AssetsDistributed(address indexed owner);
    event BeneficiaryAdded(address indexed owner, address indexed beneficiary, uint256 sharePercentage);

    constructor() {}

    function createWill(
        string memory _ipfsHash,
        address[] memory _beneficiaries,
        uint256[] memory _sharePercentages,
        uint256 _inactivityPeriod
    ) external nonReentrant {
        require(!hasWill[msg.sender], "Will already exists");
        require(_beneficiaries.length == _sharePercentages.length, "Arrays length mismatch");
        require(_inactivityPeriod > 0, "Inactivity period must be greater than 0");

        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < _sharePercentages.length; i++) {
            totalPercentage += _sharePercentages[i];
        }
        require(totalPercentage == 100, "Total percentage must be 100");

        Will storage will = wills[msg.sender];
        will.ipfsHash = _ipfsHash;
        will.lastActivity = block.timestamp;
        will.inactivityPeriod = _inactivityPeriod;
        will.exists = true;

        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            will.beneficiaries.push(
                Beneficiary({
                    beneficiaryAddress: payable(_beneficiaries[i]),
                    sharePercentage: _sharePercentages[i],
                    exists: true
                })
            );
        }

        hasWill[msg.sender] = true;
        emit WillCreated(msg.sender, _ipfsHash);
    }

    function updateWill(
        string memory _ipfsHash,
        address[] memory _beneficiaries,
        uint256[] memory _sharePercentages,
        uint256 _inactivityPeriod
    ) external nonReentrant {
        require(hasWill[msg.sender], "Will does not exist");
        require(_beneficiaries.length == _sharePercentages.length, "Arrays length mismatch");
        require(_inactivityPeriod > 0, "Inactivity period must be greater than 0");

        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < _sharePercentages.length; i++) {
            totalPercentage += _sharePercentages[i];
        }
        require(totalPercentage == 100, "Total percentage must be 100");

        Will storage will = wills[msg.sender];
        will.ipfsHash = _ipfsHash;
        will.lastActivity = block.timestamp;
        will.inactivityPeriod = _inactivityPeriod;

        delete will.beneficiaries;
        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            will.beneficiaries.push(
                Beneficiary({
                    beneficiaryAddress: payable(_beneficiaries[i]),
                    sharePercentage: _sharePercentages[i],
                    exists: true
                })
            );
        }

        emit WillUpdated(msg.sender, _ipfsHash);
    }

    function checkInactivityAndDistribute(address _owner) external nonReentrant {
        require(hasWill[_owner], "Will does not exist");
        Will storage will = wills[_owner];
        require(
            block.timestamp >= will.lastActivity + will.inactivityPeriod,
            "Inactivity period not reached"
        );

        uint256 balance = address(_owner).balance;
        require(balance > 0, "No assets to distribute");

        for (uint256 i = 0; i < will.beneficiaries.length; i++) {
            Beneficiary memory beneficiary = will.beneficiaries[i];
            uint256 share = (balance * beneficiary.sharePercentage) / 100;
            (bool success, ) = beneficiary.beneficiaryAddress.call{value: share}("");
            require(success, "Transfer failed");
        }

        emit AssetsDistributed(_owner);
    }

    function getWill(address _owner) external view returns (
        string memory ipfsHash,
        uint256 lastActivity,
        uint256 inactivityPeriod,
        Beneficiary[] memory beneficiaries
    ) {
        require(hasWill[_owner], "Will does not exist");
        Will storage will = wills[_owner];
        return (will.ipfsHash, will.lastActivity, will.inactivityPeriod, will.beneficiaries);
    }

    function getBeneficiaries(address _owner) external view returns (Beneficiary[] memory) {
        require(hasWill[_owner], "Will does not exist");
        return wills[_owner].beneficiaries;
    }
} 