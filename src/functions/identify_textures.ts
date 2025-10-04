import {sfsBaseTextures} from '../consts/sfs_base_textures';
import * as SFSTypes from '../types/sfs';
import * as Types from '../types/textureapp';

const identifyTextures: (
  bp: SFSTypes.BlueprintJSON,
) => Types.UniqueBPTextures = (bp: SFSTypes.BlueprintJSON) => {
  const uniqueColorTexSet = new Set<string>();
  const uniqueShapeTexSet = new Set<string>();

  const baseColorTexLookup = sfsBaseTextures.colorTex;
  const baseShapeTexLookup = sfsBaseTextures.shapeTex;

  bp.parts.forEach(part => {
    const texture = part.T;
    if (!texture) return;

    const {color_tex, shape_tex} = texture;

    if (
      color_tex &&
      !uniqueColorTexSet.has(color_tex) &&
      !baseColorTexLookup[color_tex]
    ) {
      uniqueColorTexSet.add(color_tex);
    }

    if (
      shape_tex &&
      !uniqueShapeTexSet.has(shape_tex) &&
      !baseShapeTexLookup[shape_tex]
    ) {
      uniqueShapeTexSet.add(shape_tex);
    }
  });

  return {
    colorTex: Array.from(uniqueColorTexSet),
    shapeTex: Array.from(uniqueShapeTexSet),
  };
};

export default identifyTextures;
