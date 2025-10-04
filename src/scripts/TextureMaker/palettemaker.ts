import {createCanvas, loadImage, ImageData} from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import { Vector4 } from '../../classes/Vector4';
import { diff } from 'util';

interface ColorFrequencies {
  [key: string]: number;
}

/**
 * Calculate the Euclidean distance between two RGBA colors.
 */
function colorDifference(color1: Vector4, color2: Vector4): number {
  return color1.subtract(color2).magnitude();
}

/**
 * Calculate similarity scores for each color compared to all others.
 */
function calculateColorSimilarities(colors: Vector4[]): Map<string, number> {
  const similarities = new Map<string, number>();
  const cache = new Map<string, number>();

  const rgbaToString = (color: Vector4): string => `${color.x},${color.y},${color.z},${color.w}`;
  
  for (let i = 0; i < colors.length; i++) {
    const color1 = colors[i];
    let totalDifference = 0;
    
    for (let j = 0; j < colors.length; j++) {
      if (i !== j) {
        const color2 = colors[j];

        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        let cachedDifference: number | undefined = cache.get(key);

        if (cachedDifference === undefined) {
          cachedDifference = colorDifference(color1, color2);
          cache.set(key, cachedDifference);
        }

        totalDifference += cachedDifference;
      }
    }

    const avgDifference = colors.length > 1 ? totalDifference / (colors.length - 1) : Infinity;
    const colorKey = rgbaToString(color1);
    similarities.set(colorKey, avgDifference);
  }
  
  return similarities;
}

/**
 * Reduce colors to target count by removing most similar colors.
 */
function reduceColors(
  colors: RGBA[],
  percentages: Map<string, number>,
  targetCount: number
): RGBA[] {
  const colorsCopy = [...colors];
  
  while (colorsCopy.length > targetCount) {
    const similarities = calculateColorSimilarities(colorsCopy);
    
    let mostSimilarColor: RGBA | null = null;
    let minSimilarity = Infinity;
    
    for (const color of colorsCopy) {
      const colorKey = `${color.r},${color.g},${color.b},${color.a}`;
      const similarity = similarities.get(colorKey) || Infinity;
      
      if (similarity < minSimilarity) {
        minSimilarity = similarity;
        mostSimilarColor = color;
      }
    }
    
    if (mostSimilarColor) {
      const colorKey = `${mostSimilarColor.r},${mostSimilarColor.g},${mostSimilarColor.b},${mostSimilarColor.a}`;
      const removedPercentage = percentages.get(colorKey) || 0;
      console.log(`Removed color RGBA(${mostSimilarColor.r},${mostSimilarColor.g},${mostSimilarColor.b},${mostSimilarColor.a}) (${removedPercentage.toFixed(2)}% of non-ignored pixels)`);
      
      const index = colorsCopy.findIndex(c => 
        c.r === mostSimilarColor!.r && 
        c.g === mostSimilarColor!.g && 
        c.b === mostSimilarColor!.b && 
        c.a === mostSimilarColor!.a
      );
      
      if (index !== -1) {
        colorsCopy.splice(index, 1);
        percentages.delete(colorKey);
      }
    }
  }
  
  return colorsCopy;
}

/**
 * Check if a color should be ignored based on the ignore list.
 */
function shouldIgnoreColor(color: RGBA, ignoreList: RGBA[], threshold: number): boolean {
  return ignoreList.some(ignoredColor => colorDifference(color, ignoredColor) <= threshold);
}

/**
 * Get color frequencies from image data.
 */
function getColorFrequencies(
  imageData: ImageData,
  width: number,
  height: number,
  ignoreColors: RGBA[],
  avgDifferenceThreshold: number,
  scanMode: 'row' | 'full'
): {colorPercentages: Map<string, number>; totalCountedPixels: number} {
  const colorCount = new Map<string, number>();
  let totalCountedPixels = 0;
  
  let coordinates: Array<{x: number; y: number}> = [];
  
  if (scanMode === 'row') {
    if (height > width) {
      // Scan top to bottom (x=0, y in range)
      coordinates = Array.from({length: height}, (_, y) => ({x: 0, y}));
    } else if (width > height) {
      // Scan left to right (y=0, x in range)
      coordinates = Array.from({length: width}, (_, x) => ({x, y: 0}));
    } else {
      // Square: default to X direction
      coordinates = Array.from({length: width}, (_, x) => ({x, y: 0}));
    }
  } else {
    // Full image scan
    coordinates = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        coordinates.push({x, y});
      }
    }
  }
  
  for (const {x, y} of coordinates) {
    const index = (y * width + x) * 4;
    const pixel: RGBA = {
      r: imageData.data[index],
      g: imageData.data[index + 1],
      b: imageData.data[index + 2],
      a: imageData.data[index + 3]
    };
    
    if (!shouldIgnoreColor(pixel, ignoreColors, avgDifferenceThreshold)) {
      const colorKey = `${pixel.r},${pixel.g},${pixel.b},${pixel.a}`;
      colorCount.set(colorKey, (colorCount.get(colorKey) || 0) + 1);
      totalCountedPixels++;
    }
  }
  
  if (totalCountedPixels === 0) {
    console.log('Warning: All pixels matched ignore list!');
    return {colorPercentages: new Map(), totalCountedPixels: 0};
  }
  
  const colorPercentages = new Map<string, number>();
  for (const [colorKey, count] of colorCount.entries()) {
    colorPercentages.set(colorKey, (count / totalCountedPixels) * 100);
  }
  
  return {colorPercentages, totalCountedPixels};
}

/**
 * Convert color key string back to RGBA object.
 */
function parseColorKey(colorKey: string): RGBA {
  const [r, g, b, a] = colorKey.split(',').map(Number);
  return {r, g, b, a};
}

/**
 * Extract unique colors from an image with smart reduction to meet maximum color limit.
 */
async function getUniqueColors(
  imagePath: string,
  avgDifferenceThreshold: number = 0,
  maxColors: number = Infinity,
  minPixelPercentage: number = 1.0,
  ignoreColors: RGBA[] = [],
  scanMode: 'row' | 'full' = 'full'
): Promise<RGBA[]> {
  const image = await loadImage(imagePath);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  
  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, image.width, image.height);
  
  const {colorPercentages, totalCountedPixels} = getColorFrequencies(
    imageData,
    image.width,
    image.height,
    ignoreColors,
    avgDifferenceThreshold,
    scanMode
  );
  
  const totalPixels = scanMode === 'row' ? 
    (image.height > image.width ? image.height : image.width) :
    image.width * image.height;
  const ignoredPixels = totalPixels - totalCountedPixels;
  
  console.log('\nPixel Analysis:');
  console.log(`- Total pixels: ${totalPixels}`);
  console.log(`- Ignored pixels: ${ignoredPixels} (${((ignoredPixels / totalPixels) * 100).toFixed(1)}% of image)`);
  console.log(`- Considered pixels: ${totalCountedPixels} (${((totalCountedPixels / totalPixels) * 100).toFixed(1)}% of image)`);
  
  const validColorKeys = Array.from(colorPercentages.entries())
    .filter(([_, percentage]) => percentage >= minPixelPercentage)
    .map(([colorKey, _]) => colorKey);
  
  let colors = validColorKeys.map(parseColorKey);
  
  if (colors.length > maxColors) {
    console.log(`\nReducing from ${colors.length} colors to ${maxColors} colors:`);
    colors = reduceColors(colors, colorPercentages, maxColors);
  }
  
  for (const color of colors) {
    const colorKey = `${color.r},${color.g},${color.b},${color.a}`;
    const percentage = colorPercentages.get(colorKey) || 0;
    console.log(`Color RGBA(${color.r},${color.g},${color.b},${color.a}) (${percentage.toFixed(2)}% of non-ignored pixels)`);
  }
  
  return colors;
}

/**
 * Create a solid color image for each color in the list.
 */
function createColorImages(colors: RGBA[], size: {width: number; height: number} = {width: 32, height: 32}): Buffer[] {
  return colors.map(color => {
    const canvas = createCanvas(size.width, size.height);
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`;
    ctx.fillRect(0, 0, size.width, size.height);
    
    return canvas.toBuffer('image/png');
  });
}

/**
 * Save all images to the specified directory.
 */
async function outputImages(images: Buffer[], colors: RGBA[], outputPath: string): Promise<void> {
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, {recursive: true});
  }
  
  for (let i = 0; i < images.length; i++) {
    const imagePath = path.join(outputPath, `${i}.png`);
    fs.writeFileSync(imagePath, images[i]);
    const color = colors[i];
    console.log(`Saved color ${i}: RGBA(${color.r},${color.g},${color.b},${color.a})`);
  }
}

/**
 * Process a palette image and save unique colors as images.
 */
export async function processPalette(options: {
  palettePath: string;
  outputPath: string;
  avgDifferenceThreshold?: number;
  maxColors?: number;
  minPixelPercentage?: number;
  ignoreColors?: RGBA[];
  imageSize?: {width: number; height: number};
  scanMode?: 'row' | 'full';
}): Promise<void> {
  const {
    palettePath,
    outputPath,
    avgDifferenceThreshold = 0,
    maxColors = Infinity,
    minPixelPercentage = 1.0,
    ignoreColors = [],
    imageSize = {width: 32, height: 32},
    scanMode = 'full'
  } = options;
  
  try {
    const uniqueColors = await getUniqueColors(
      palettePath,
      avgDifferenceThreshold,
      maxColors,
      minPixelPercentage,
      ignoreColors,
      scanMode
    );
    
    const colorImages = createColorImages(uniqueColors, imageSize);
    await outputImages(colorImages, uniqueColors, outputPath);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        console.log(`Error: Could not find palette file at ${palettePath}`);
      } else {
        console.log(`An error occurred: ${error.message}`);
      }
    } else {
      console.log(`An unknown error occurred: ${error}`);
    }
  }
}

// Example usage for direct execution
/*

if () {
  processPalette({
    palettePath: 'path_to_palette.png',
    outputPath: 'output_directory',
    avgDifferenceThreshold: 0,
    maxColors: 10,
    minPixelPercentage: 1.0,
    ignoreColors: [
      {r: 0, g: 0, b: 0, a: 0},
      {r: 0, g: 0, b: 0, a: 255},
      {r: 255, g: 255, b: 255, a: 255}
    ],
    imageSize: {width: 32, height: 32},
    scanMode: 'row' // Change to "full" to scan the entire image
  });
}

/*