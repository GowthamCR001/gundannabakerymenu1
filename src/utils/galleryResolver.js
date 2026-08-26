// Dynamic Gallery Resolver utilizing Vite eager globbing
// Automatically discovers all current and future images added to src/assets/Items_image/Gallery_images/

const galleryGlob = import.meta.glob('/src/assets/Items_image/Gallery_images/*', { eager: true, import: 'default' });

/**
 * Dynamically loads and parses all images from src/assets/Items_image/Gallery_images.
 * Any new image added to that folder is automatically detected without code changes.
 * Items are sorted in natural numerical serial order (1, 2, 3... 76).
 */
export function getGalleryImages() {
  const entries = Object.entries(galleryGlob);

  // Sort entries in natural numerical serial order by filename
  entries.sort(([pathA], [pathB]) => {
    return pathA.localeCompare(pathB, undefined, { numeric: true, sensitivity: 'base' });
  });

  return entries.map(([filepath, url], index) => {
    const filename = filepath.split('/').pop();
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

    // Extract numerical ID from filename (e.g., 'gallery_image 15' -> 15)
    const matchNumber = nameWithoutExt.match(/\d+/);
    const serialNumber = matchNumber ? parseInt(matchNumber[0], 10) : index + 1;

    // Format human readable title
    let title = nameWithoutExt;
    if (/^gallery[_-]?image\s*\d+$/i.test(nameWithoutExt)) {
      title = `Custom Birthday Cake #${serialNumber}`;
    } else {
      title = `${nameWithoutExt.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} (#${serialNumber})`;
    }

    return {
      id: `gallery-${serialNumber}-${filename}`,
      serialNumber,
      filename,
      title,
      category: 'Custom Birthday Cake',
      url
    };
  });
}
