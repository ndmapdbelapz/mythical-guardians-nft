const fs = require('fs');
const path = require('path');
const solc = require('solc');

const contractPath = path.join(__dirname, '..', 'contracts', 'MythicalGuardiansNFT.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'MythicalGuardiansNFT.sol': {
      content: source,
    },
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode'],
      },
    },
  },
};

console.log('Compiling MythicalGuardiansNFT.sol with solc 0.8.20...');
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  let hasError = false;
  output.errors.forEach(err => {
    console.log(err.formattedMessage);
    if (err.severity === 'error') hasError = true;
  });
  if (hasError) {
    process.exit(1);
  }
}

const contract = output.contracts['MythicalGuardiansNFT.sol']['MythicalGuardiansNFT'];
const artifact = {
  contractName: 'MythicalGuardiansNFT',
  abi: contract.abi,
  bytecode: contract.evm.bytecode.object,
};

const artifactPath = path.join(__dirname, '..', 'contracts', 'MythicalGuardiansNFT.json');
fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));

// Also write a copy to web/assets/ for frontend use
const webArtifactPath = path.join(__dirname, '..', 'web', 'assets', 'MythicalGuardiansNFT.json');
fs.writeFileSync(webArtifactPath, JSON.stringify(artifact, null, 2));

console.log('Successfully compiled MythicalGuardiansNFT.sol!');
console.log('Bytecode length:', artifact.bytecode.length);
console.log('ABI methods count:', artifact.abi.length);
console.log('Artifact saved to:', artifactPath);
