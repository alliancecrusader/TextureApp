import type {Vector2, Vector3, PropType, DirentPath} from './common';

export type PartJSON = {
  n: string; // Name of the part type
  p: Vector2; // Position in 2D space
  o: Vector3; // Scale (x, y) and rotation (z)
  t: number | string; // Temperature
  T?: {[key: string]: string}; // Texture properties
  N?: {[key: string]: number}; // Number variables
  B?: {[key: string]: boolean}; // Toggle variables
  burns?: {
    angle: number;
    intensity: number;
    x: number;
    top: string;
    bottom: string;
  };
  [key: string]: PropType; // Additional properties can be added
};

export type FairingJSON = {
  n: 'Fairing' | 'Fairing Cone';
  p: {
    x: number;
    y: number;
  };
  o: {
    x: number;
    y: number;
    z: number;
  };
  t: string | number;
  N: {
    width_original: number;
    width: number;
    height: number;
    force_percent: number;
  };
  B: {
    detach_edge: boolean;
    adapt_to_tank: boolean;
  };
  T: {
    fragment: 'left' | 'right' | '';
    color_tex: string;
    shape_tex: string;
  };
  burns?: PartJSON['burns'];
};

export type FuelTankJSON = {
  n: 'Fuel Tank';
  p: {
    x: number;
    y: number;
  };
  o: {
    x: number;
    y: number;
    z: number;
  };
  t: string | number;
  N: {
    width_original: number;
    width_a: number;
    width_b: number;
    height: number;
    fuel_percent: number;
  };
  T: {
    color_tex: string;
    shape_tex: string;
  };
  burns?: PartJSON['burns'];
};

type Stage = {
  stageId: number;
  partIndexes: number[];
};

export type StageInfo = Stage[];

export type BlueprintJSON = {
  center: number; // x-coordinate of y-axis, the thick centre-line on the BP grid BG
  parts: PartJSON[];
  stages: StageInfo;
  rotation: number; // rotation of the grid
  offset: Vector2; // Offset of all parts
  interiorView: boolean;
};

type Segment = {
  height: number;
  texture: string;
};

type PerValueTexture = {
  texture: DirentPath;
  ideal: number;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HIDE_FLAGS_MODES = [
  {name: 'None', value: 0},
  {name: 'HideInHierarchy', value: 1},
  {name: 'HideInInspector', value: 2},
  {name: 'DontSaveInEditor', value: 4},
  {name: 'NotEditable', value: 8},
  {name: 'DontSaveInBuild', value: 0x10},
  {name: 'DontUnloadUnusedAsset', value: 0x20},
  {name: 'DontSave', value: 0x34},
  {name: 'HideAndDontSave', value: 0x30},
] as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CENTER_MODES = [
  {name: 'Stretch', value: 0},
  {name: 'Logo', value: 1},
  {name: 'Tile', value: 2},
] as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const VERTICAL_SIZE_MODES = [
  {name: 'Aspect', value: 0},
  {name: 'Fixed', value: 1},
] as const;

type CenterModeValue = (typeof CENTER_MODES)[number]['value'];
// type CenterModeName = typeof CENTER_MODES[number]['name'];
type VerticalSizeModeValue = (typeof VERTICAL_SIZE_MODES)[number]['value'];
// type VerticalSizeModeName = typeof VERTICAL_SIZE_MODES[number]['name'];
type HideFlagsValue = (typeof HIDE_FLAGS_MODES)[number]['value'];
// type HideFlagsName = typeof HIDE_FLAGS_MODES[number]['name'];

type CenterData = {
  mode: CenterModeValue;
  sizeMode: VerticalSizeModeValue;
  size: number;
  logoHeightPercent: number; // 0 <= logoHeightPercent <= 1
  scaleLogoToFit: boolean;
};

type BorderData = {
  uvSize: number;
  sizeMode: VerticalSizeModeValue;
  size: number;
};

type PartTexture = {
  textures: PerValueTexture[];
  border_Bottom: BorderData;
  border_Top: BorderData;
  center: CenterData;
  fixedWidth: boolean;
  fixedWidthValue: number;
  flipToLight_X: boolean;
  flipToLight_Y: boolean;
  metalTexture: boolean;
  icon: string | null | undefined;
};

type TextureAssetBase = {
  multiple: boolean;
  segments: Segment[];
  name: string;
  hideFlags: HideFlagsValue;
};

export type ColorTexture = TextureAssetBase & {
  colorTex: PartTexture;

  tags: string[];
  pack_Redstone_Atlas: boolean;
};

export type ShadowTexture = TextureAssetBase & {
  texture: PartTexture;
};

export type ShapeTexture = TextureAssetBase & {
  shapeTex: PartTexture;
  shadowTex: string;

  tags: string[];
  pack_Redstone_Atlas: boolean;
};

export type PackInfo = {
  DisplayName: string;
  Version: string;
  Description: string;
  Author: string;
  ShowIcon: boolean;
  Icon: string | null;
  name: string;
  hideFlags: HideFlagsValue;
};
