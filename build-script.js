// Custom build script to inject environment variables
const fs = require('fs');
const path = require('path');

// Get environment variables
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || process.env.REACT_APP_VAPID_PUBLIC_KEY || '';

console.log('Running post-build script to inject environment variables...');

// Read the env-config.js template
try {
  const envConfigPath = path.join(__dirname, 'build', 'env-config.js');
  let envConfigContent = fs.readFileSync(envConfigPath, 'utf8');
  
  // Replace placeholders with actual values
  envConfigContent = envConfigContent.replace('%VAPID_PUBLIC_KEY%', vapidPublicKey);
  
  // Write the updated file
  fs.writeFileSync(envConfigPath, envConfigContent);
  console.log('Environment variables successfully injected into env-config.js');
} catch (error) {
  console.error('Error injecting environment variables:', error);
}