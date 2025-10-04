type Alias<T> = T & {readonly __alias: unique symbol};
export type Hash = Alias<string>;
export type DirentPath = Alias<string>;

export type Vector2 = {
  x: number;
  y: number;
};

export type Vector3 = {
  x: number;
  y: number;
  z: number;
};

export type PropType =
  | string
  | number
  | boolean
  | undefined
  | Array<unknown>
  | {[key: string]: unknown};
