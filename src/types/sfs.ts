export type Vector2 = {
    x: number;
    y: number;
};

export type Vector3 = {
    x: number;
    y: number;
    z: number;
};

export type Hash = string;

export type TexturePropsJSON = {
    color_tex?: string,
    shape_tex?: string
    shade_tex?: string
};

export type TextureProps = {
    colorTex?: string,
    shapeTex?: string
};

export type UniqueTextures = {
    colorTex: string[],
    shapeTex: string[]
} 

export type PropType = 
    string |
    number |
    boolean |
    undefined |
    Array<any> |
    { [key: string]: any };

export type PartJSON = {
    n: string, // Name of the part
    p: Vector2, // Position in 2D space
    o: Vector3, // Scale (x, y) and rotation (z)
    t: string, // Temperature
    T?: TexturePropsJSON, // Texture properties
    [key: string]: PropType, // Additional properties can be added
};

export type Part = {
    id: string,
    position: Vector2,
    orientation: Vector3,
    temp: string,
    texture?: TextureProps,
    [key: string]: PropType,
};

export type StageInfo = Array<{
    stageId: number,
    partIndexes: Array<number>
}>;

export type BlueprintJSON = {
    center: number, // x-coordinate of y-axis, the thick centre-line on the BP grid BG
    parts: [PartJSON],
    stages: StageInfo,
    rotation: number, 
    offset: Vector2, // Offset of all parts
    interiorView: boolean,
};

export type MiscInfo = {
    centre: number,
    rotation: number,
    offset: Vector2,
    interiorView: boolean,
    stages: StageInfo
};

export type DependencyInfo = {
    dependencies: {
        texturePacks: {[key: Hash]: true} // The Hashes of all custom texture packs used
        partPacks: {[key: Hash]: true} // The Hashes of all custom part packs used
    },
    textures: [string], // All unique custom textures used (by Hash uuid)
    parts: [string] // All unique custom parts used (by Hash uuid)
}

export type Blueprint = {
    parts: Part[],
    miscInfo: MiscInfo,
    dependencyInfo: DependencyInfo
};

export type BaseTexture = {
  colorTex: {
    textures: [
        {
            texture: string,
            ideal: number
        }
    ],
    border_Bottom: {
      uvSize: number,
      sizeMode: number,
      size: number
    },
    border_Top: {
      uvSize: number,
      sizeMode: number,
      size: number
    },
    center: {
      mode: number,
      sizeMode: number,
      size: number,
      logoHeightPercent: number,
      scaleLogoToFit: boolean
    },
    fixedWidth: boolean,
    fixedWidthValue: number,
    flipToLight_X: boolean,
    flipToLight_Y: boolean,
    metalTexture: boolean,
    icon: null
  },
  tags: string[],
  pack_Redstone_Atlas: boolean,
  multiple: boolean,
  segments: [],
  name: string,
  hideFlags: null
}

export type PackInfo = {
  DisplayName: string,
  Version: string,
  Description: string,
  Author: string,
  ShowIcon: boolean,
  Icon: string | null,
  name: string,
  hideFlags: number
}

