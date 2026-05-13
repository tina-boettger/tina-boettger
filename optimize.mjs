import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const dir = './public';
const files = fs.readdirSync(dir);

for (const file of files) {
  if (file.match(/\.(png|jpe?g)$/i)) {
    const filePath = path.join(dir, file);
    const parsed = path.parse(filePath);
    const outPath = path.join(dir, parsed.name + '.webp');
    
    try {
      await sharp(filePath)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outPath);
        
      console.log(`Optimized ${file} -> ${parsed.name}.webp`);
    } catch (e) {
      console.error(`Failed to optimize ${file}:`, e);
    }
  }
}
