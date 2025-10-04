import {DirSchema} from './types';

export const countSubDirentsFromSchema: (
  schema: DirSchema,
  recursive: boolean,
) => {
  files: number;
  subdirs: number;
} = (schema: DirSchema, recursive: boolean = false) => {
  let fileCount = 0;
  let subdirCount = 0;

  for (const subdir of Object.values(schema.subdirs)) {
    subdirCount++;
    if (recursive) {
      const subdirCounts = countSubDirentsFromSchema(subdir, recursive);
      fileCount += subdirCounts.files;
      subdirCount += subdirCounts.subdirs;
    }
  }

  fileCount += Object.keys(schema.files).length;

  return {files: fileCount, subdirs: subdirCount};
};
