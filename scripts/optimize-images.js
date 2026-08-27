import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function processDirectory(dirPath, options = {}) {
  const { maxWidth = 600, maxHeight = 600, quality = 82, removeOriginal = true } = options;
  if (!fs.existsSync(dirPath)) {
    console.log(`Directory does not exist: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath);
  console.log(`Processing ${files.length} files in ${dirPath}...`);

  let count = 0;
  let totalOriginalSize = 0;
  let totalNewSize = 0;

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) continue;

    const ext = path.extname(file).toLowerCase();
    if (!['.png', '.jpg', '.jpeg'].includes(ext)) continue;

    const baseName = path.basename(file, ext);
    const webpPath = path.join(dirPath, `${baseName}.webp`);

    totalOriginalSize += stat.sizeBytes || stat.size;

    try {
      await sharp(filePath)
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality })
        .toFile(webpPath);

      const newStat = fs.statSync(webpPath);
      totalNewSize += newStat.size;
      count++;

      // Remove original PNG/JPG if requested and different from webp
      if (removeOriginal && (ext === '.png' || ext === '.jpg' || ext === '.jpeg')) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message);
    }
  }

  const mbOrig = (totalOriginalSize / (1024 * 1024)).toFixed(2);
  const mbNew = (totalNewSize / (1024 * 1024)).toFixed(2);
  console.log(`Finished ${dirPath}: Processed ${count} images. Reduced from ${mbOrig} MB to ${mbNew} MB.`);
}

async function main() {
  console.log('--- Starting Gundanna Bakery Image Optimization ---');

  // 1. Process Menu Item Images (src/assets/Items_image)
  const itemsDir = path.join(projectRoot, 'src', 'assets', 'Items_image');
  await processDirectory(itemsDir, { maxWidth: 600, maxHeight: 600, quality: 82, removeOriginal: true });

  // 2. Process Gallery Images (src/assets/Items_image/Gallery_images)
  const galleryDir = path.join(projectRoot, 'src', 'assets', 'Items_image', 'Gallery_images');
  await processDirectory(galleryDir, { maxWidth: 900, maxHeight: 900, quality: 82, removeOriginal: true });

  // 3. Process Public / Brand Images (public/images)
  const publicDir = path.join(projectRoot, 'public', 'images');
  await processDirectory(publicDir, { maxWidth: 800, maxHeight: 800, quality: 85, removeOriginal: false });

  // 4. Process src/assets/images
  const assetsImagesDir = path.join(projectRoot, 'src', 'assets', 'images');
  await processDirectory(assetsImagesDir, { maxWidth: 800, maxHeight: 800, quality: 85, removeOriginal: true });

  console.log('--- Image Optimization Complete ---');
}

main().catch(err => {
  console.error('Fatal error in image optimization:', err);
  process.exit(1);
});
