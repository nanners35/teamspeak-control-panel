// Simple debug to understand what's happening
console.log('=== DEBUGGING TEAM SPEAK CONNECTION ===');

// Check Node.js version
console.log('Node.js version:', process.version);

// Check if we can require the module
try {
  console.log('Attempting to require ts3-nodejs-library...');
  const ts3lib = require('ts3-nodejs-library');
  console.log('✅ Module loaded successfully');
  console.log('Module type:', typeof ts3lib);
  console.log('Module keys:', Object.keys(ts3lib).slice(0, 10)); // First 10 keys
  
  // Check if TeamSpeak is available
  if (ts3lib.TeamSpeak) {
    console.log('✅ TeamSpeak class available');
    console.log('TeamSpeak type:', typeof ts3lib.TeamSpeak);
  } else {
    console.log('❌ TeamSpeak class NOT available');
  }
  
  // Check if TS3Query is available
  if (ts3lib.TS3Query) {
    console.log('✅ TS3Query class available');
  } else {
    console.log('❌ TS3Query class NOT available');
  }
  
} catch (error) {
  console.log('❌ Error loading module:', error.message);
}

console.log('=== DEBUG COMPLETE ===');
