import { sfsBaseTextures } from "../consts/sfs_base_textures";
import * as SFSTypes from "../types/sfs";

const truthyOfTwo = (a: string | null | undefined, b: string | null | undefined): string | null | undefined => {
    return a || b;
};

const identifyTextures: (bp: SFSTypes.BlueprintJSON) => SFSTypes.UniqueTextures = (bp: SFSTypes.BlueprintJSON) => {
    const uniqueColorTexSet = new Set<string>();
    const uniqueShapeTexSet = new Set<string>();

    const baseColorTexLookup = sfsBaseTextures.colorTex;
    const baseShapeTexLookup = sfsBaseTextures.shapeTex;

    bp.parts.forEach((part) => {
        const texture = part.T;
        if (!texture) return;

        const { color_tex, shade_tex, shape_tex } = texture;

        if (color_tex && !uniqueColorTexSet.has(color_tex) && !((baseColorTexLookup)[color_tex])) {
            uniqueColorTexSet.add(color_tex);
        }

        const currentShapeOrShadeTex = truthyOfTwo(shade_tex, shape_tex);

        if (currentShapeOrShadeTex && !uniqueShapeTexSet.has(currentShapeOrShadeTex) && !((baseShapeTexLookup)[currentShapeOrShadeTex])) {
            uniqueShapeTexSet.add(currentShapeOrShadeTex);
        }
    });

    return {
        colorTex: Array.from(uniqueColorTexSet),
        shapeTex: Array.from(uniqueShapeTexSet)
    };
};

export default identifyTextures;