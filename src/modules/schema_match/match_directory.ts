import * as fs from 'fs';
import * as path from 'path';
import {DirSchema, ScanResultDirectory} from './types';
import {matchFile} from './match_file';

const fsp = fs.promises;

// new cleaner plan:
/*
1. Validate schema with Zod
2. For each entry in schema:
  a. If file entry:
    i. Check for all valid extensions
      i. If the path exists and is a file, mark as found
      ii. If the path exists but is a directory, mark as error and not found
      e.g. "Expected file but found directory: 'texture.png'"
    ii. If mode is 'any', succeed on first match
    iii. If mode is 'all', collect missing extensions
  b. If directory entry:
    i. Recursively call matchDirectorySchema
3. Identify missing entries
  a. If a file entry is not found, add to missing files
    i. If mode is 'all', list all missing extensions
      e.g. "Missing file: 'texture' with missing extensions: png, jpg"
    ii. If mode is 'any', simply note that the file is missing
      e.g. "Missing file: 'config' with any valid extension: json, yml, xml"
  b. If a directory entry is not found, add to missing directories
    i. Do not recurse into missing directories, simply note that the highest one is missing.
    ii. No need to mention that sub-entries are missing if the parent directory is missing.
    iii. Mention number of files and subdirectories in the missing directory
      i. Do not recurse the inside, just count files and subdirs
    e.g. "Missing directory: 'assets' with 5 files and 1 subdirectory"
4. Identify extra files/directories not in schema
  a. With the results, simply display that it is extra and give num files and subdirs, 
    i. Do not recurse into extras, just count files and subdirs
    i.e. "Extra directory: 'extras' with 3 files and 2 subdirectories"
5. Compile results and return
*/

export const matchDirectory = async (schema: DirSchema, dirPath: string) => {
  const result: ScanResultDirectory = {
    success: true,
    msg: '',
    missingFiles: [],
    missingDirs: [],
    extraFiles: [],
    extraDirs: [],
    nestedResults: {},
    fsAccessErrors: [],
    typeMismatches: [],
  };

  let dirEntries: fs.Dirent[] = [];
  const fileWhiteList = new Set<string>();

  try {
    dirEntries = await fsp.readdir(dirPath, {withFileTypes: true});
  } catch (err) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      err.code === 'ENOENT'
    ) {
      // Directory does not exist
      result.success = false;
      result.msg = `Missing directory: '${path.basename(dirPath)}'`;
      result.fsAccessErrors.push({
        path: dirPath,
        msg: `Root target directory does not exist: '${path.basename(dirPath)}'`,
      });
      return result;
    } else {
      console.error(err);
      throw err; // Some other error, rethrow
    }
  }

  const entriesSet = new Set(dirEntries.map(entry => entry.name));

  for (const [fileName, fileSchema] of Object.entries(schema.files)) {
    if (!entriesSet.has(fileName)) {
      result.success = false;

      result.missingFiles.push({
        path: fileName,
        msg: `Missing file: '${fileName}'`,
        type: 'file' as const,
      });

      continue;
    }

    const fileCheckResult = await matchFile(fileSchema, dirPath, fileName);

    result.success = fileCheckResult.success;
    // If any file check fails, the whole directory check fails

    result.fsAccessErrors.push(...fileCheckResult.fsAccessErrors);
    result.typeMismatches.push(...fileCheckResult.typeMismatches);
    fileCheckResult.missingExtensions.forEach(ext => {
      result.missingFiles.push({
        path: `${fileName}.${ext}`,
        msg: `Missing file: '${fileName}.${ext}'`,
        type: 'file' as const,
      });
    });
  }

  for (const [subdirName, subdirSchema] of Object.entries(schema.subdirs)) {
    if (!entriesSet.has(subdirName)) {
      // Subdirectory does not exist
      result.success = false;
      result.missingDirs.push({
        path: subdirName,
        msg: `Missing directory: '${subdirName}'`,
        type: 'directory' as const,
      });
      continue; // No need to recurse into missing directory
    }

    const subdirCheckResult = await matchDirectory(
      subdirSchema,
      path.join(dirPath, subdirName),
    );
    result.success = subdirCheckResult.success;
    result.nestedResults[subdirName] = subdirCheckResult;
  }

  if (schema.strict) {
    // Identify extra files and directories
    for (const entry of dirEntries) {
      if (entry.isFile() && !fileWhiteList.has(entry.name)) {
        result.extraFiles.push({
          path: entry.name,
          msg: `Extra file: '${entry.name}'`,
          type: 'file' as const,
        });
        result.success = false;
      } else if (entry.isDirectory()) {
        if (!schema.subdirs[entry.name]) {
          result.extraDirs.push({
            path: entry.name,
            msg: `Extra directory: '${entry.name}'`,
            type: 'directory' as const,
          });
          result.success = false;
        }
      }
    }
  }

  const msg_parts = [
    ...result.missingFiles.map(f => f.msg),
    ...result.missingDirs.map(d => d.msg),
    ...result.extraFiles.map(f => f.msg),
    ...result.extraDirs.map(d => d.msg),
    ...result.fsAccessErrors.map(
      e => `FS Access Error at '${e.path}': ${e.msg}`,
    ),
    ...result.typeMismatches.map(
      t =>
        `Type Mismatch at '${t.path}': expected ${t.expected} but found ${t.found}`,
    ),
  ];

  result.msg = msg_parts.join(';\n');

  return result;
};
