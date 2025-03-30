# DigiHeir - Blockchain-Based Digital Will & Inheritance System

DigiHeir is a decentralized will execution system that allows users to store their wills securely on IPFS and set predefined conditions for inheritance distribution using Ethereum smart contracts.

## Features

- Create digital wills with multiple beneficiaries
- Store will documents securely on IPFS
- Set inactivity periods for automatic asset distribution
- Execute wills automatically after inactivity period
- Modern React frontend with Tailwind CSS
- Comprehensive smart contract testing

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MetaMask or another Web3 wallet
- Local IPFS node (optional, can use Infura IPFS)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/digiheir.git
cd digiheir
```

2. Install dependencies:
```bash
npm install
cd frontend
npm install
cd ..
```

3. Create environment files:

In the root directory, create `.env`:
```
INFURA_PROJECT_ID=your_infura_project_id
INFURA_PROJECT_SECRET=your_infura_project_secret
```

In the frontend directory, create `.env`:
```
REACT_APP_CONTRACT_ADDRESS=your_deployed_contract_address
REACT_APP_INFURA_PROJECT_ID=your_infura_project_id
REACT_APP_INFURA_PROJECT_SECRET=your_infura_project_secret
```

## Smart Contract Development

1. Compile contracts:
```bash
npx hardhat compile
```

2. Run tests:
```bash
npx hardhat test
```

3. Deploy to local network:
```bash
npx hardhat node
npx hardhat run scripts/deploy.ts --network localhost
```

4. Deploy to testnet:
```bash
npx hardhat run scripts/deploy.ts --network goerli
```

## Frontend Development

1. Start the development server:
```bash
cd frontend
npm start
```

2. Build for production:
```bash
npm run build
```

## Usage

1. Connect your Web3 wallet (MetaMask)
2. Create a new will:
   - Upload your will document
   - Set inactivity period
   - Add beneficiaries with their share percentages
3. View and manage your will:
   - Check last activity
   - Update inactivity period
   - Execute will after inactivity period

## Security Considerations

- Always test with small amounts first
- Double-check beneficiary addresses
- Keep your private keys secure
- Use hardware wallets for large amounts
- Review smart contract code before deployment

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenZeppelin for smart contract libraries
- Hardhat for development environment
- React and Tailwind CSS for frontend
- IPFS for decentralized storage 