const tls = require('tls');

const socket = tls.connect(443, 'mythicalguardians.xyz', { servername: 'mythicalguardians.xyz' }, () => {
  console.log('Connected! Cert valid for:', socket.getPeerCertificate().subject);
  console.log('Alt names:', socket.getPeerCertificate().subjectaltname);
  socket.end();
});

socket.on('error', (err) => {
  console.log('TLS Error:', err.message);
});
