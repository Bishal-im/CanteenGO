const os = require('os');
const fs = require('fs');
const path = require('path');

/**
 * Gets the current local IPv4 address.
 * Prioritizes Ethernet and Wi-Fi over virtual interfaces.
 */
function getLocalIp() {
    const interfaces = os.networkInterfaces();
    const addresses = [];

    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                // Ignore virtual interfaces like WSL or Docker if possible
                if (name.toLowerCase().includes('wsl') || name.toLowerCase().includes('docker') || name.toLowerCase().includes('vbox')) {
                    continue;
                }
                addresses.push(iface.address);
            }
        }
    }

    // Default to the first found address, or localhost if none
    return addresses.length > 0 ? addresses[0] : '127.0.0.1';
}

const envPath = path.join(__dirname, '..', '.env');
const localIp = getLocalIp();

try {
    if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        // Match EXPO_PUBLIC_API_URL=http://<IP_OR_HOST>:<PORT>/api/...
        const apiRegex = /EXPO_PUBLIC_API_URL=http:\/\/([^:/]+)(:?\d*)(\/api.*)/;
        
        const match = envContent.match(apiRegex);
        if (match) {
            const currentIp = match[1];
            const port = match[2] || ':5001'; // Default to :5001 if no port
            const suffix = match[3];

            if (currentIp !== localIp) {
                const newUrl = `EXPO_PUBLIC_API_URL=http://${localIp}${port}${suffix}`;
                const updatedContent = envContent.replace(apiRegex, newUrl);
                
                fs.writeFileSync(envPath, updatedContent);
                console.log(`\x1b[32m[Update IP] Updated EXPO_PUBLIC_API_URL: http://${localIp}${port}${suffix}\x1b[0m`);
            } else {
                console.log(`[Update IP] IP address is already correct: ${localIp}`);
            }
        } else {
            console.warn('\x1b[33m[Update IP] Could not find or parse EXPO_PUBLIC_API_URL in .env\x1b[0m');
        }
    } else {
        console.error('\x1b[31m[Update IP] .env file not found at ' + envPath + '\x1b[0m');
    }
} catch (error) {
    console.error('\x1b[31m[Update IP] Error updating .env:', error.message, '\x1b[0m');
}
