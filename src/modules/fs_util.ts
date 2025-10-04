import * as fs from 'fs';
import {DirentPath} from '../types/common';
import * as path from 'path';

export const getFileExtension = (fileName: string) => {
  const extensionRegex = /\.([^.]+)$/;
  const match = fileName.match(extensionRegex);

  if (match) {
    return match[match.length - 1].toString();
  } else {
    return '';
  }
};

export const removeFileExtension = (
  fileName: string,
  recursive: boolean = true, // Remove all file extensions or just the last
) => {
  const fileNameLen = fileName.length;
  const extensionRegexFull = /(\.([^.]+))+$/;

  if (recursive) {
    const extensionMatch = fileName.match(extensionRegexFull);

    if (extensionMatch) {
      return fileName.slice(undefined, fileNameLen - extensionMatch[0].length);
    } else {
      return fileName;
    }
  } else {
    const extensionLen = getFileExtension(fileName).length;
    return fileName.slice(undefined, fileNameLen - extensionLen);
  }
};

export const findFileWithExtension = async (
  name: string,
  validExtensions: string[],
  dirPath: DirentPath,
) => {
  const namesToSearch = validExtensions.map(ext => `${name}.${ext}`);

  for await (const ext of namesToSearch) {
    const filePath = path.join(dirPath, ext) as DirentPath;

    let stats: fs.Stats | undefined;
    try {
      stats = await fs.promises.stat(filePath);
    } catch (err) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        err.code === 'ENOENT'
      ) {
        continue; // File does not exist, try next extension
      }

      console.error(err);
    }

    if (stats && stats.isFile()) {
      return filePath;
    }
  }

  return null;
};
