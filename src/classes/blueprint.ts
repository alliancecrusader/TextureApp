import type {Hash} from '../types/common';
import type {
  Part,
  IBlueprint,
  DependencyInfo,
  MiscInfo,
} from '../types/textureapp';
import {BlueprintJSON, PartJSON} from '../types/sfs';

import identifyTextures from '../functions/identify_textures';
import {omit} from '../functions/omit';

const processPart: (part: PartJSON) => Part = (part: PartJSON) => {
  const processed: Part = {
    id: part.n,
    position: part.p,
    temp: typeof part.t == 'number' && !isNaN(part.t) ? part.t : 0,
    orientation: part.o,
    ...omit(part, 'n', 'p', 'o', 't'),
  };

  return processed;
};

class Blueprint implements IBlueprint {
  parts: Part[];
  miscInfo: MiscInfo;
  dependencyInfo: DependencyInfo;

  constructor(bp: BlueprintJSON) {
    const customTextures = identifyTextures(bp);

    this.parts = [...bp.parts.map(processPart)];
    this.miscInfo = {
      centre: bp.center,
      rotation: bp.rotation,
      interiorView: bp.interiorView,
      offset: bp.offset,
      stages: bp.stages,
    };
    this.dependencyInfo = {
      dependencies: {
        texturePacks: {},
        partPacks: {},
      },
      customTextures: [
        ...(customTextures.colorTex as Hash[]),
        ...(customTextures.shapeTex as Hash[]),
      ],
      customParts: [],
    };
  }
}

export default Blueprint;
