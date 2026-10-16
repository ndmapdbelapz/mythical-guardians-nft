/**
 * set_treasury.js
 * Updates the treasury recipient of MythicalGuardiansNFT on Robinhood Chain Mainnet.
 * 
 * Usage:
 *   node scripts/set_treasury.js <OWNER_PRIVATE_KEY> [NEW_TREASURY_ADDRESS]
 * 
 * Example:
 *   node scripts/set_treasury.js 0xYOUR_KEY 0xC7F9B41E07a1CC37b551A3D0814E1ba15F2B6B07
 */

const { ethers } = require('ethers');

const CONTRACT_ADDRESS = '0x27a0A6B0DF634719863767832CBF99D3a80d65bd';
const RPC_URL = 'https://rpc.mainnet.chain.robinhood.com';
const CHAIN_ID = 4663;

async function main() {
  const privateKey = process.argv[2] || process.env.PRIVATE_KEY;
  const targetTreasury = process.argv[3] || '0xC7F9B41E07a1CC37b551A3D0814E1ba15F2B6B07';

  if (!privateKey) {
    console.log('Error: Please provide the owner private key.');
    console.log('Usage: node scripts/set_treasury.js <OWNER_PRIVATE_KEY> [NEW_TREASURY_ADDRESS]');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL, { chainId: CHAIN_ID, name: 'Robinhood Chain Mainnet' });
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log('Connected Wallet:', wallet.address);

  const abi = [
    'function owner() view returns (address)',
    'function treasury() view returns (address)',
    'function setTreasury(address newTreasury) external'
  ];

  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

  const ownerAddr = await contract.owner();
  console.log('Contract Owner:  ', ownerAddr);

  if (ownerAddr.toLowerCase() !== wallet.address.toLowerCase()) {
    console.error('Error: Connected wallet is not the owner of this contract!');
    process.exit(1);
  }

  const currentTreasury = await contract.treasury();
  console.log('Current Treasury:', currentTreasury);

  console.log(`Setting new Treasury to ${targetTreasury}...`);
  const tx = await contract.setTreasury(targetTreasury);
  console.log('Transaction broadcast! Hash:', tx.hash);
  console.log('Waiting for confirmation on Robinhood Chain...');
  const receipt = await tx.wait();
  console.log('Confirmed in block:', receipt.blockNumber);

  const updatedTreasury = await contract.treasury();
  console.log('Verified Updated Treasury on-chain:', updatedTreasury);
  console.log('SUCCESS! Treasury recipient successfully updated.');
}

main().catch(console.error);
