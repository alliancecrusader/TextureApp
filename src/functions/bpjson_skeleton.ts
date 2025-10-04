import {BlueprintJSON} from '../types/sfs';

export const createBlueprintJSONSkeleton = (): BlueprintJSON => {
  return {
    parts: [],
    center: 0,
    stages: [],
    rotation: 0,
    offset: {
      x: 0,
      y: 0,
    },
    interiorView: false,
  };
};
