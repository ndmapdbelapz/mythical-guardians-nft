fetch('https://opensea.io/C7F9B4', { headers: { 'User-Agent': 'Mozilla/5.0' } })
  .then(res => res.text())
  .then(html => {
    console.log('Contains user address:', html.toLowerCase().includes('0xc7f9b41e07a1cc37b551a3d0814e1ba15f2b6b07'));
    const re = /"address":"(0x[a-fA-F0-9]{40})"/g;
    let m;
    while ((m = re.exec(html)) !== null) {
      console.log('Account address in payload:', m[1]);
    }
    const userMatches = html.match(/"publicUsername":"([^"]+)"/g);
    console.log('User matches:', userMatches);
  })
  .catch(console.error);
