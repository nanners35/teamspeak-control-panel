// Check what the library actually exports
const ts3lib = require('ts3-nodejs-library');

console.log('Library exports:', typeof ts3lib);
console.log('Library contents:', Object.keys(ts3lib));

// Try different import methods
try {
  const { TS3Query } = require('ts3-nodejs-library');
  console.log('TS3Query imported successfully:', typeof TS3Query);
} catch (error) {
  console.log('Failed to import TS3Query:', error.message);
}

try {
  const TS3Query = require('ts3-nodejs-library').TS3Query;
  console.log('Direct TS3Query import:', typeof TS3Query);
} catch (error) {
  console.log('Direct import failed:', error.message);
}
