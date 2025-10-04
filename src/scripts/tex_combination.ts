import fs from 'fs';
import {sfsBaseTextures} from '../consts/sfs_base_textures';
import {FuelTankJSON, PartJSON} from '../types/sfs';
import {createBlueprintJSONSkeleton} from '../functions/blueprintjson_skeleton';

// Example JSON structure for a Fuel Tank part
const FuelTankExample: FuelTankJSON = {
  n: 'Fuel Tank',
  p: {
    // Position
    x: 0,
    y: 0,
  },
  o: {
    // Orientation (scale and rotation)
    x: 1.0,
    y: 1.0,
    z: 0.0,
  },
  t: '-Infinity', // Part type identifier
  N: {
    // Numerical properties
    width_original: 2.0,
    width_a: 2.0,
    width_b: 2.0,
    height: 2.0,
    fuel_percent: 1.0,
  },
  T: {
    // Texture properties
    color_tex: '_', // Placeholder for actual texture
    shape_tex: 'Flat', // Flat shape texture
  },
  burns: {
    // Burn mark properties
    angle: 90,
    intensity: 0.0, // Initial intensity
    x: 0,
    top: '',
    bottom: '',
  },
};

/**
 * Deep clone function to create independent copies of objects
 */
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }

  return cloned;
}

/**
 * Creates a JSON blueprint string for SFS with all possible combinations
 * of color textures and shape textures in a grid layout.
 *
 * Grid organization:
 * - Rows represent different color textures
 * - Columns represent different shape textures
 *
 * @returns A JSON string representing the SFS blueprint.
 */
export const createAllTextureCombinations = () => {
  const parts: PartJSON[] = [];

  // Get all available texture names
  const colorTextures = Object.keys(sfsBaseTextures.colorTex);
  const shapeTextures = Object.keys(sfsBaseTextures.shapeTex);

  console.log(`Color textures found: ${colorTextures.length}`);
  console.log(`Shape textures found: ${shapeTextures.length}`);
  console.log(
    `Total combinations: ${colorTextures.length * shapeTextures.length}`,
  );

  // Define spacing between parts
  const partWidth = 2.5; // Each part occupies 2.5 units horizontally (slightly more spacing)
  const partHeight = 2.5; // Each part occupies 2.5 units vertically

  // Iterate through each color texture (rows)
  colorTextures.forEach((colorTexture: string, colorIndex: number) => {
    console.log(
      `Processing color texture ${colorIndex + 1}/${colorTextures.length}: ${colorTexture}`,
    );

    // Iterate through each shape texture (columns)
    shapeTextures.forEach((shapeTexture: string, shapeIndex: number) => {
      console.log(
        `  Shape texture ${shapeIndex + 1}/${shapeTextures.length}: ${shapeTexture}`,
      );

      // Create a new fuel tank part for this combination
      const fuelTankPart = deepClone(FuelTankExample);

      // Set the texture combination
      fuelTankPart.T.color_tex = colorTexture;
      fuelTankPart.T.shape_tex = shapeTexture;

      // Position the part in the grid
      // X-position: Column based on shape texture index
      fuelTankPart.p.x = shapeIndex * partWidth;
      // Y-position: Row based on color texture index
      fuelTankPart.p.y = colorIndex * partHeight;

      console.log(`    Position: (${fuelTankPart.p.x}, ${fuelTankPart.p.y})`);

      parts.push(fuelTankPart);
    });
  });

  console.log(`Generated ${parts.length} parts total`);

  // Create the base blueprint JSON structure and add the generated parts
  const blueprintJSON = createBlueprintJSONSkeleton();
  blueprintJSON.parts = parts;

  // Return the stringified JSON with pretty printing
  return JSON.stringify(blueprintJSON, null, 2);
};

/**
 * Alternative version that creates a more compact grid by organizing
 * combinations in a square-like layout instead of a long rectangle
 */
export const createAllTextureCombinationsCompact = () => {
  const parts: PartJSON[] = [];

  // Get all available texture names
  const colorTextures = Object.keys(sfsBaseTextures.colorTex);
  const shapeTextures = Object.keys(sfsBaseTextures.shapeTex);

  const totalCombinations = colorTextures.length * shapeTextures.length;

  // Calculate a more square-like grid layout
  const gridWidth = Math.ceil(Math.sqrt(totalCombinations));
  const gridHeight = Math.ceil(totalCombinations / gridWidth);

  console.log(
    `Creating compact grid: ${gridWidth} x ${gridHeight} (${totalCombinations} combinations)`,
  );

  // Define spacing between parts
  const partWidth = 2.5;
  const partHeight = 2.5;

  let combinationIndex = 0;

  // Iterate through each combination
  colorTextures.forEach((colorTexture: string) => {
    shapeTextures.forEach((shapeTexture: string) => {
      // Calculate grid position for this combination
      const gridX = combinationIndex % gridWidth;
      const gridY = Math.floor(combinationIndex / gridWidth);

      // Create a new fuel tank part for this combination
      const fuelTankPart = deepClone(FuelTankExample);

      // Set the texture combination
      fuelTankPart.T.color_tex = colorTexture;
      fuelTankPart.T.shape_tex = shapeTexture;

      // Position the part in the compact grid
      fuelTankPart.p.x = gridX * partWidth;
      fuelTankPart.p.y = gridY * partHeight;

      parts.push(fuelTankPart);
      combinationIndex++;
    });
  });

  console.log(
    `Generated ${parts.length} parts in compact ${gridWidth}x${gridHeight} grid`,
  );

  // Create the base blueprint JSON structure and add the generated parts
  const blueprintJSON = createBlueprintJSONSkeleton();
  blueprintJSON.parts = parts;

  // Return the stringified JSON with pretty printing
  return JSON.stringify(blueprintJSON, null, 2);
};

// Main function to generate and save the blueprint files
const main = () => {
  // Generate the standard grid layout (rows = colors, columns = shapes)
  console.log('=== Generating standard grid layout ===');
  const standardGrid = createAllTextureCombinations();
  fs.writeFileSync(
    'scripts/output/all_texture_combinations_standard.json',
    standardGrid,
  );
  console.log(
    'Standard grid created: scripts/output/all_texture_combinations_standard.json',
  );

  console.log('\n=== Generating compact grid layout ===');
  // Generate the compact square-like grid layout
  const compactGrid = createAllTextureCombinationsCompact();
  fs.writeFileSync(
    'scripts/output/all_texture_combinations_compact.json',
    compactGrid,
  );
  console.log(
    'Compact grid created: scripts/output/all_texture_combinations_compact.json',
  );

  console.log('\nBoth texture combination grids created successfully!');
};

// Execute the main function when the script runs
main();
