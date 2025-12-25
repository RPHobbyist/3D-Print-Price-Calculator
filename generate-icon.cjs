const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const toIco = require('to-ico');

const inputPath = path.join(__dirname, 'public', 'logo.png');
const outputPath = path.join(__dirname, 'public', 'logo.ico');

async function generateIco() {
    try {
        // Create multiple sizes for ICO (16, 32, 48, 256)
        const sizes = [16, 32, 48, 256];
        const pngBuffers = [];

        for (const size of sizes) {
            const buffer = await sharp(inputPath)
                .resize(size, size)
                .png()
                .toBuffer();
            pngBuffers.push(buffer);
        }

        // Encode to ICO using to-ico
        const icoBuffer = await toIco(pngBuffers);
        fs.writeFileSync(outputPath, icoBuffer);

        console.log('Successfully created', outputPath);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

generateIco();
