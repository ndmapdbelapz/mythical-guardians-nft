/**
 * deploy_to_robinhood.js
 * Deployment script for MythicalGuardiansNFT onto Robinhood Chain (Arbitrum Orbit L2)
 *
 * Network Options:
 *   - Mainnet: Chain ID 4663 (0x1237), RPC https://rpc.mainnet.chain.robinhood.com
 *   - Testnet: Chain ID 46630 (0xb626), RPC https://rpc.testnet.chain.robinhood.com
 *
 * Payout & Royalties Target:
 *   0xb862866110dbF9aD25d25A85422101d0b03615c3 (100% mint funds + 5% OpenSea royalties)
 *
 * Usage:
 *   node scripts/deploy_to_robinhood.js <PRIVATE_KEY> [--mainnet]
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const DESTINATION_WALLET = '0xC7F9B41E07a1CC37b551A3D0814E1ba15F2B6B07';

const NETWORKS = {
  testnet: {
    name: 'Robinhood Chain Testnet',
    chainId: 46630,
    rpcUrl: 'https://rpc.testnet.chain.robinhood.com',
    explorerUrl: 'https://explorer.testnet.chain.robinhood.com',
    openseaUrl: 'https://testnets.opensea.io/assets/robinhood-testnet'
  },
  mainnet: {
    name: 'Robinhood Chain Mainnet',
    chainId: 4663,
    rpcUrl: 'https://rpc.mainnet.chain.robinhood.com',
    explorerUrl: 'https://robinhoodchain.blockscout.com',
    openseaUrl: 'https://opensea.io/assets/robinhood'
  }
};

async function main() {
  const isMainnet = process.argv.includes('--mainnet');
  const net = isMainnet ? NETWORKS.mainnet : NETWORKS.testnet;
  const privateKey = process.argv.find(arg => arg.startsWith('0x') && arg.length === 66) || process.env.PRIVATE_KEY;

  console.log('===============================================================');
  console.log('👑 ROBINHOOD CHAIN NFT DEPLOYMENT SCRIPT');
  console.log('===============================================================');
  console.log('Target Network:      ', net.name);
  console.log('Chain ID:            ', net.chainId);
  console.log('RPC Endpoint:        ', net.rpcUrl);
  console.log('Block Explorer:      ', net.explorerUrl);
  console.log('---------------------------------------------------------------');
  console.log('💰 Mint Funds Payout: ', DESTINATION_WALLET, '(100% of mint tribute)');
  console.log('🎨 OpenSea Royalties: ', DESTINATION_WALLET, '(5% EIP-2981 royalty)');
  console.log('===============================================================');

  if (!privateKey) {
    console.log('\n[!] NOTICE: No private key provided in CLI argument or environment.');
    console.log('Usage: node scripts/deploy_to_robinhood.js <YOUR_PRIVATE_KEY> [--mainnet]');
    console.log('You can also deploy with 1-click via your browser wallet at http://127.0.0.1:3000\n');
    process.exit(0);
  }

  console.log(`Connecting to ${net.name}...`);
  const provider = new ethers.JsonRpcProvider(net.rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const deployerAddress = await wallet.getAddress();
  const balance = await provider.getBalance(deployerAddress);

  console.log('Deployer Address:    ', deployerAddress);
  console.log('Deployer Balance:    ', ethers.formatEther(balance), 'ETH');

  if (balance === 0n) {
    console.error(`\nCRITICAL: Deployer account has 0 ETH on ${net.name}.`);
    console.error(`Please fund ${deployerAddress} with gas ETH before deploying.`);
    process.exit(1);
  }

  // Load Compiled Artifact
  const artifactPath = path.join(__dirname, '..', 'contracts', 'MythicalGuardiansNFT.json');
  if (!fs.existsSync(artifactPath)) {
    console.error('Artifact not found! Run node scripts/compile_contracts.js first.');
    process.exit(1);
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  console.log('\nDeploying MythicalGuardiansNFT (2,222 Supply)...');
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

  const baseURI = 'http://127.0.0.1:3000/metadata/json/';
  const contract = await factory.deploy(
    'Mythical Beasts and Guardians',
    'MYTHIC',
    baseURI,
    DESTINATION_WALLET
  );

  console.log('Transaction broadcast! Hash:', contract.deploymentTransaction().hash);
  console.log('Waiting for block confirmation on Robinhood Chain...');

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  // Set OpenSea contract storefront URI
  try {
    const contractURI = 'http://127.0.0.1:3000/assets/contract_metadata.json';
    const txUri = await contract.setContractURI(contractURI);
    await txUri.wait();
    console.log('OpenSea Contract Storefront URI set to:', contractURI);
  } catch (err) {
    console.warn('Note: Could not set contractURI automatically:', err.message);
  }

  console.log('\n===============================================================');
  console.log('🎉 DEPLOYMENT SUCCESSFUL ON ROBINHOOD CHAIN!');
  console.log('===============================================================');
  console.log('Contract Address:    ', contractAddress);
  console.log('Treasury Destination:', DESTINATION_WALLET);
  console.log('OpenSea Trading:     ', `${net.openseaUrl}/${contractAddress}`);
  console.log('Block Explorer:      ', `${net.explorerUrl}/address/${contractAddress}`);
  console.log('Transaction:         ', `${net.explorerUrl}/tx/${contract.deploymentTransaction().hash}`);
  console.log('===============================================================');

  // Save to web assets
  const contractInfo = {
    address: contractAddress,
    network: net.name,
    chainId: net.chainId,
    rpcUrl: net.rpcUrl,
    explorerUrl: net.explorerUrl,
    openseaUrl: `${net.openseaUrl}/${contractAddress}`,
    treasury: DESTINATION_WALLET,
    deployedAt: new Date().toISOString(),
    deployer: deployerAddress,
    txHash: contract.deploymentTransaction().hash
  };

  const savePath = path.join(__dirname, '..', 'web', 'assets', 'contract_address.json');
  fs.writeFileSync(savePath, JSON.stringify(contractInfo, null, 2));
  console.log('Saved active contract configuration to:', savePath);
}

main().catch(err => {
  console.error('\nDeployment failed:', err);
  process.exit(1);
});
