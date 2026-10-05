const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = path.join(__dirname, '../public');
const files = fs.readdirSync(dir);

async function run() {
  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    if (!/\.(jpe?g|png)$/i.test(file)) continue;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    const beforeKb = Math.round(stat.size / 1024);
    if (beforeKb < 80) continue; // Skip already small files

    totalBefore += beforeKb;

    try {
      const buffer = fs.readFileSync(filePath);
      const isPng = /\.png$/i.test(file);
      let pipeline = sharp(buffer).rotate();

      // Get metadata to avoid enlarging
      const meta = await pipeline.metadata();
      const maxDim = 1400;
      if (meta.width > maxDim || meta.height > maxDim) {
        pipeline = pipeline.resize({
          width: meta.width > meta.height ? maxDim : undefined,
          height: meta.height >= meta.width ? maxDim : undefined,
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      let outBuffer;
      if (isPng) {
        outBuffer = await pipeline.png({ quality: 85, compressionLevel: 9 }).toBuffer();
      } else {
        outBuffer = await pipeline.jpeg({ quality: 80, progressive: true, mozjpeg: true }).toBuffer();
      }

      if (outBuffer.length < stat.size) {
        fs.writeFileSync(filePath, outBuffer);
        const afterKb = Math.round(outBuffer.length / 1024);
        totalAfter += afterKb;
        console.log(`✓ ${file}: ${beforeKb} KB -> ${afterKb} KB (-${Math.round((1 - afterKb/beforeKb)*100)}%)`);
      } else {
        totalAfter += beforeKb;
        console.log(`- ${file}: already optimal (${beforeKb} KB)`);
      }
    } catch (e) {
      totalAfter += beforeKb;
      console.error(`Failed ${file}:`, e.message);
    }
  }

  console.log(`\n🎉 TOTAL: ${Math.round(totalBefore/1024 * 10) / 10} MB -> ${Math.round(totalAfter/1024 * 10) / 10} MB (Saved ${Math.round((1 - totalAfter/totalBefore)*100)}%)`);
}

run();
