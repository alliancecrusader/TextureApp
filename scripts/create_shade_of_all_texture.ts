import * as fs from 'fs';
import {sfsBaseTextures} from '../src/consts/sfs_base_textures';
import {FairingJSON, FuelTankJSON, PartJSON} from '../src/types/sfs';
import {createBlueprintJSONSkeleton} from '../src/functions/bpjson_skeleton';
import {deepClone} from '../src/functions/deep_clone';

const FairingExample: FairingJSON = {
  n: 'Fairing',
  p: {
    x: 0,
    y: 0,
  },
  o: {
    x: 1.0,
    y: 1.0,
    z: 0.0,
  },
  t: '-Infinity',
  N: {
    width_original: 1.6,
    width: 1.6,
    height: 2.0,
    force_percent: 0.5,
  },
  B: {
    detach_edge: true,
    adapt_to_tank: true,
  },
  T: {
    fragment: '',
    color_tex: '_',
    shape_tex: 'Flat',
  },
  burns: {
    angle: 0,
    intensity: 0.0,
    x: 0,
    top: '',
    bottom: '',
  },
};

const FuelTankExample: FuelTankJSON = {
  n: 'Fuel Tank',
  p: {
    x: 0,
    y: 0,
  },
  o: {
    x: 1.0,
    y: 1.0,
    z: 0.0,
  },
  t: '-Infinity',
  N: {
    width_original: 2.0,
    width_a: 2.0,
    width_b: 2.0,
    height: 2.0,
    fuel_percent: 1.0,
  },
  T: {
    color_tex: '_',
    shape_tex: 'Flat',
  },
  burns: {
    angle: 0,
    intensity: 0.0,
    x: 0,
    top: '',
    bottom: '',
  },
};

type Settings = {
  mode: 'include' | 'exclude'; // Mode for texture inclusion/exclusion
  modeParams: string[];
  intensityStep: number;
  createFairings: boolean;
  createFuelTanks: boolean;
};

export const createShadeOfAllTexture = (settings: Settings) => {
  const parts: PartJSON[] = [];

  const textureNames = Object.keys(sfsBaseTextures.colorTex);

  const intensityStep = settings.intensityStep || 0.1; // Default step if not provided

  // Calculate the number of shades (columns) based on the max intensity (1.2) and step.
  // We add 1 to include the 0.0 intensity (original texture).
  const numShades = Math.ceil(1.2 / intensityStep) + 1;

  const partWidth = 2.0;
  const partHeight = 2.0;
  const gridGapX = 4.0; // Horizontal gap between the fuel tank grid and the fairing grid
  const createFairings = settings.createFairings; // Flag to create fairing parts
  const createFuelTanks = settings.createFuelTanks; // Flag to create fuel tank parts

  const fairingGridStartX = numShades * partWidth + gridGapX;

  textureNames.forEach((texture: string, textureIndex: number) => {
    console.log(`Processing texture: ${texture}`);

    // Check if the texture should be included or excluded based on the mode
    if (settings.mode === 'include' && !settings.modeParams.includes(texture)) {
      console.log(`  Skipping texture (not included): ${texture}`);
      return;
    }

    if (settings.mode === 'exclude' && settings.modeParams.includes(texture)) {
      console.log(`  Skipping texture (excluded): ${texture}`);
      return;
    }

    for (let shadeIndex = 0; shadeIndex < numShades; shadeIndex++) {
      // Calculate the burn intensity, ensuring it's rounded for precision.
      const intensity = parseFloat((shadeIndex * intensityStep).toFixed(2));

      console.log(`  Shade index: ${shadeIndex}, Intensity: ${intensity}`);

      // --- Create Fuel Tank Part ---
      if (createFuelTanks) {
        const fuelTankPart = deepClone(FuelTankExample);
        fuelTankPart.T.color_tex = texture;

        fuelTankPart.p.x = shadeIndex * partWidth;
        fuelTankPart.p.y = textureIndex * partHeight;

        if (fuelTankPart.burns) {
          fuelTankPart.burns.intensity = intensity;
        }
        parts.push(fuelTankPart);
      }

      if (!createFairings) continue;

      const fairingPart = deepClone(FairingExample);
      fairingPart.T.color_tex = texture;

      fairingPart.p.x = fairingGridStartX + shadeIndex * partWidth - 0.2;
      fairingPart.p.y = textureIndex * partHeight;

      if (fairingPart.burns) {
        fairingPart.burns.intensity = intensity;
      }
      parts.push(fairingPart);
    }
  });

  const blueprintJSON = createBlueprintJSONSkeleton();
  blueprintJSON.parts = parts;

  return JSON.stringify(blueprintJSON, null, 2);
};

const main = () => {
  const shadeOfAllTexture = createShadeOfAllTexture({
    mode: 'include',
    modeParams: ['Color_White', 'Color_Black', 'Color_Gray'],
    intensityStep: 0.2,
    createFairings: false,
    createFuelTanks: true,
  });

  fs.writeFileSync(
    'scripts/output/shade_of_all_texture.json',
    shadeOfAllTexture,
  );
  console.log('Shade of all texture created successfully!');
};

main();
