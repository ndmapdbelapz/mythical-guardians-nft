/**
 * deploy_to_giwa.js
 * Deployment script for MythicalGuardiansNFT onto GIWA Sepolia Testnet (Chain ID 91342)
 *
 * Usage:
 *   node scripts/deploy_to_giwa.js <PRIVATE_KEY>
 *   or:
 *   $env:PRIVATE_KEY="0x..."; node scripts/deploy_to_giwa.js
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const GIWA_RPC_URL = 'https://sepolia-rpc.giwa.io';
const GIWA_CHAIN_ID = 91342;
const EXPLORER_URL = 'https://sepolia-explorer.giwa.io';

async function main() {
  const privateKey = process.argv[2] || process.env.PRIVATE_KEY;

  if (!privateKey) {
    console.log('===============================================================');
    console.log('GIWA TESTNET DEPLOYMENT SCRIPT');
    console.log('===============================================================');
    console.log('Target Network: GIWA Sepolia Testnet');
    console.log('Chain ID:       91342');
    console.log('RPC Endpoint:   ' + GIWA_RPC_URL);
    console.log('Block Explorer: ' + EXPLORER_URL);
    console.log('---------------------------------------------------------------');
    console.log('ERROR: No private key provided.');
    console.log('Usage: node scripts/deploy_to_giwa.js <YOUR_PRIVATE_KEY>');
    console.log('Or deploy directly in 1-click via the web UI at http://127.0.0.1:3000');
    console.log('===============================================================');
    process.exit(1);
  }

  console.log('Connecting to GIWA Sepolia Testnet (' + GIWA_RPC_URL + ')...');
  const provider = new ethers.JsonRpcProvider(GIWA_RPC_URL);

  const wallet = new ethers.Wallet(privateKey, provider);
  const deployerAddress = await wallet.getAddress();
  const balance = await provider.getBalance(deployerAddress);

  console.log('Deployer Address:', deployerAddress);
  console.log('Deployer Balance:', ethers.formatEther(balance), 'ETH');

  if (balance === 0n) {
    console.error('CRITICAL: Deployer account has 0 ETH on GIWA Sepolia Testnet.');
    console.error('Please request testnet ETH from a GIWA faucet (e.g. Nodit / OmniHub) before deploying.');
    process.exit(1);
  }

  // Load Compiled Artifact
  const artifactPath = path.join(__dirname, '..', 'contracts', 'MythicalGuardiansNFT.json');
  if (!fs.existsSync(artifactPath)) {
    console.error('Artifact not found! Run npm run compile or node scripts/compile_contracts.js first.');
    process.exit(1);
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  console.log('Deploying MythicalGuardiansNFT (MAX_SUPPLY = 2222)...');
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

  // Constructor arguments: name, symbol, baseURI, royaltyReceiver
  const baseURI = 'http://127.0.0.1:3000/metadata/json/';
  const contract = await factory.deploy(
    'Mythical Beasts and Guardians',
    'MYTHIC',
    baseURI,
    '0x1f4E6F90F0fD9A0C52cc0901D1fc53a333636043'
  );

  console.log('Deployment transaction broadcast! Hash:', contract.deploymentTransaction().hash);
  console.log('Waiting for block confirmation on GIWA...');

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log('\n===============================================================');
  console.log('DEPLOYMENT SUCCESSFUL ON GIWA SEPOLIA TESTNET!');
  console.log('===============================================================');
  console.log('Contract Address:', contractAddress);
  console.log('View on Explorer:', `${EXPLORER_URL}/address/${contractAddress}`);
  console.log('Transaction:     ', `${EXPLORER_URL}/tx/${contract.deploymentTransaction().hash}`);
  console.log('===============================================================');

  // Save to web assets
  const contractInfo = {
    address: contractAddress,
    network: 'GIWA Sepolia',
    chainId: GIWA_CHAIN_ID,
    rpcUrl: GIWA_RPC_URL,
    explorerUrl: EXPLORER_URL,
    deployedAt: new Date().toISOString(),
    deployer: deployerAddress,
    txHash: contract.deploymentTransaction().hash
  };

  const savePath = path.join(__dirname, '..', 'web', 'assets', 'contract_address.json');
  fs.writeFileSync(savePath, JSON.stringify(contractInfo, null, 2));
  console.log('Saved active contract to web/assets/contract_address.json');
}

main().catch(err => {
  console.error('Deployment failed:', err);
  process.exit(1);
});
