const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, 'build');
const rootDir = path.join(__dirname, '..');

function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        // Skip if destination is the backend or frontend folder to avoid recursion/overwriting source
        if (entry.name === 'backend' || entry.name === 'frontend' || entry.name === '.git') {
            continue;
        }

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

if (fs.existsSync(buildDir)) {
    console.log(`Copying build files from ${buildDir} to ${rootDir}...`);
    try {
        copyDir(buildDir, rootDir);
        console.log('Build files copied to root successfully! 🚀');
    } catch (err) {
        console.error('Error copying files:', err);
        process.exit(1);
    }
} else {
    console.error('Build directory not found. Run npm run build first.');
    process.exit(1);
}
