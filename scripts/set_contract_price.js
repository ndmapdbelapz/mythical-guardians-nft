/**
 * set_contract_price.js
 * Updates the on-chain mint price of MythicalGuardiansNFT on Robinhood Chain Mainnet.
 * 
 * $0.10 USD = 0.00004 ETH (at ~$2,500/ETH)
 * 
 * Usage:
 *   node scripts/set_contract_price.js <OWNER_PRIVATE_KEY> [PRICE_IN_ETH]
 * Example:
 *   node scripts/set_contract_price.js 0xYOUR_KEY 0.00004
 */

const { ethers } = require('ethers');

const CONTRACT_ADDRESS = '0x27a0A6B0DF634719863767832CBF99D3a80d65bd';
const RPC_URL = 'https://rpc.mainnet.chain.robinhood.com';
const CHAIN_ID = 4663;

async function main() {
  const privateKey = process.argv[2] || process.env.PRIVATE_KEY;
  const targetPriceEth = process.argv[3] || '0.00004'; // Default ~0.10 USD

  if (!privateKey) {
    console.log('Error: Please provide the owner private key.');
    console.log('Usage: node scripts/set_contract_price.js <OWNER_PRIVATE_KEY> [PRICE_IN_ETH]');
    console.log('\nAlternatively, the owner can click the "Set Price" button directly in the web UI when connected with MetaMask!');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL, { chainId: CHAIN_ID, name: 'Robinhood Chain Mainnet' });
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log('Connected Wallet:', wallet.address);

  const abi = [
    'function owner() view returns (address)',
    'function mintPrice() view returns (uint256)',
    'function setMintPrice(uint256 newPrice) external'
  ];

  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

  const ownerAddr = await contract.owner();
  console.log('Contract Owner:  ', ownerAddr);

  if (ownerAddr.toLowerCase() !== wallet.address.toLowerCase()) {
    console.error('Error: Connected wallet is not the owner of this contract!');
    process.exit(1);
  }

  const currentPriceBn = await contract.mintPrice();
  console.log('Current Mint Price:', ethers.formatEther(currentPriceBn), 'ETH');

  const newPriceWei = ethers.parseEther(targetPriceEth);
  console.log(`Setting new Mint Price to ${targetPriceEth} ETH (~$0.10 USD)...`);

  const tx = await contract.setMintPrice(newPriceWei);
  console.log('Transaction broadcast! Hash:', tx.hash);
  console.log('Waiting for confirmation on Robinhood Chain...');
  const receipt = await tx.wait();
  console.log('Confirmed in block:', receipt.blockNumber);

  const updatedPriceBn = await contract.mintPrice();
  console.log('Verified Updated Mint Price on-chain:', ethers.formatEther(updatedPriceBn), 'ETH');
  console.log('SUCCESS! Mint price successfully updated to $0.10 (', targetPriceEth, 'ETH).');
}

main().catch(console.error);
