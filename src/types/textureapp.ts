import type {Vector2, Vector3, Hash, PropType} from './common';
import type {
  ColorTexture,
  PackInfo,
  ShadowTexture,
  StageInfo,
  ShapeTexture,
} from './sfs';

type PartTextureProps = {
  colorTex?: string;
  shapeTex?: string;
};

export type UniqueBPTextures = {
  colorTex: string[];
  shapeTex: string[];
};

export type Part = {
  id: string;
  position: Vector2;
  orientation: Vector3;
  temp: number;
  texture?: PartTextureProps;
  [key: string]: PropType;
};

export type MiscInfo = {
  centre: number;
  rotation: number;
  offset: Vector2;
  interiorView: boolean;
  stages: StageInfo;
};

export type DependencyInfo = {
  dependencies: {
    texturePacks: {[key: Hash]: true}; // The Hashes of all custom texture packs used
    partPacks: {[key: Hash]: true}; // The Hashes of all custom part packs used
  };
  customTextures: Hash[]; // All unique custom textures used (by Hash uuid, not just name)
  customParts: Hash[]; // All unique custom parts used (by hash uuid of base properties in BP, i.e. when first taking it out into the grid)
};

export interface IBlueprint {
  parts: Part[];
  miscInfo: MiscInfo;
  dependencyInfo: DependencyInfo;
}

export type PackTextureData = {
  colorTextures: ColorTexture[];
  shadowTextures: ShadowTexture[];
  shapeTextures: ShapeTexture[];
};

export interface ITexturePack extends PackTextureData {
  packInfo: PackInfo;
}
