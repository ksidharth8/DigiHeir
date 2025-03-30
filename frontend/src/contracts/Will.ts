import { ethers } from "ethers";

export const WillABI = [
  "function createWill(string memory _ipfsHash, uint256 _inactivityPeriod) external",
  "function addBeneficiary(address payable _beneficiary, uint256 _share) external",
  "function updateInactivityPeriod(uint256 _newPeriod) external",
  "function recordActivity() external",
  "function executeWill(address payable _owner) external",
  "function wills(address) public view returns (string memory ipfsHash, uint256 lastActivity, uint256 inactivityPeriod, bool exists)",
  "function beneficiaries(address, address) public view returns (address payable addr, uint256 share, bool exists)",
  "function beneficiaryCount(address) public view returns (uint256)",
  "event WillCreated(address indexed owner, string ipfsHash)",
  "event BeneficiaryAdded(address indexed owner, address indexed beneficiary, uint256 share)",
  "event WillExecuted(address indexed owner, address indexed beneficiary, uint256 amount)",
  "event InactivityPeriodUpdated(address indexed owner, uint256 newPeriod)"
];

export interface WillContract extends ethers.Contract {
  createWill: (ipfsHash: string, inactivityPeriod: number) => Promise<ethers.ContractTransaction>;
  addBeneficiary: (beneficiary: string, share: number) => Promise<ethers.ContractTransaction>;
  updateInactivityPeriod: (newPeriod: number) => Promise<ethers.ContractTransaction>;
  recordActivity: () => Promise<ethers.ContractTransaction>;
  executeWill: (owner: string) => Promise<ethers.ContractTransaction>;
  wills: (address: string) => Promise<{
    ipfsHash: string;
    lastActivity: ethers.BigNumber;
    inactivityPeriod: ethers.BigNumber;
    exists: boolean;
  }>;
  beneficiaries: (owner: string, beneficiary: string) => Promise<{
    addr: string;
    share: ethers.BigNumber;
    exists: boolean;
  }>;
  beneficiaryCount: (address: string) => Promise<ethers.BigNumber>;
} 