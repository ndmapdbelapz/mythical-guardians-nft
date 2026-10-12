const fs = require('fs');
const path = require('path');

const METADATA_DIR = path.join(__dirname, '..', 'metadata', 'json');

function updateMetadataUrls(publicDomain) {
  if (!publicDomain) {
    console.error('Usage: node sync_metadata_urls.js <public_domain>');
    console.error('Example: node sync_metadata_urls.js https://username.github.io/mythical-guardians');
    process.exit(1);
  }

  // Remove trailing slash
  const domain = publicDomain.replace(/\/+$/, '');
  const files = fs.readdirSync(METADATA_DIR).filter(f => f.endsWith('.json'));

  console.log(`Updating ${files.length} metadata files with public domain: ${domain}`);

  let updated = 0;
  for (const file of files) {
    const filePath = path.join(METADATA_DIR, file);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const id = data.edition || parseInt(file.replace('.json', ''), 10);

      // Set public internet image URL
      data.image = `${domain}/web/assets/tokens/${id}.svg`;
      data.external_url = `${domain}/#${id}`;

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      updated++;
    } catch (err) {
      console.error(`Error updating ${file}:`, err.message);
    }
  }

  console.log(`Successfully updated ${updated} metadata files!`);
}

const targetDomain = process.argv[2];
if (targetDomain) {
  updateMetadataUrls(targetDomain);
} else {
  module.exports = { updateMetadataUrls };
}
