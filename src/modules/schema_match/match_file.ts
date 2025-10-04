import {FileSchema, ScanResultFile} from './types';
import * as fs from 'fs';
import * as path from 'path';

const fsp = fs.promises;

export const matchFile = async (
  schema: FileSchema,
  dirPath: string,
  name: string,
) => {
  const result: ScanResultFile = {
    success: true,
    msg: '',
    missingExtensions: [],
    fsAccessErrors: [],
    typeMismatches: [],
    whitelist: new Set<string>(),
  };

  const namesToSearch: string[] = schema.extensions.map(
    ext => `${name}.${ext}`,
  );

  for await (const ext of namesToSearch) {
    const filePath = path.join(dirPath, ext);

    let stats: fs.Stats | undefined;

    try {
      stats = await fsp.stat(filePath);
    } catch (err) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        err.code === 'ENOENT'
      ) {
        if (schema.mode == 'all') result.missingExtensions.push(ext);
      } else {
        result.fsAccessErrors.push({
          path: filePath,
          msg: `Error accessing ${filePath}: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    }

    if (stats?.isFile()) {
      if (schema.mode === 'any') {
        result.whitelist.add(ext);
        result.missingExtensions = []; // Clear missing extensions, as one valid extension is enough
        break;
      }
    } else if (stats?.isDirectory()) {
      result.success = false;
      result.missingExtensions.push(ext); // Treat as missing file
      result.typeMismatches.push({
        path: filePath,
        expected: 'file',
        found: 'directory',
      });
      continue;
    }

    if (stats?.isFile()) {
      result.whitelist.add(ext);
    }
  }

  if (result.missingExtensions.length > 0) {
    result.success = false;
  }

  // if (schema.mode == 'any_strict' && namesToSearch.length === 1) {
  //   // Special case: only one valid extension must exist
  //   result.success = !result.missingExtensions.length;
  //   // If it equals 0 then there are no extra extensions, so false
  //   // so success is true (opposite of false), as any-extra only wants exactly one
  //   // however, if it is greater than 1 then the expression is true, so success is false
  //   result.missingExtensions = []; // Clear missing extensions, as they are irrelevant in this case
  // }

  // Cancelled the above as extra extensions are now checked for in matchDirectory.
  // i.e. if any of the other valid extensions exist, then it isn't added to whitelist and therefore can be caught as an extra file.

  if (!result.success) {
    if (schema.mode === 'any') {
      result.msg = `Missing file: '${name}' with any valid extension: ${schema.extensions.join(
        ', ',
      )}`;
    } else {
      result.msg = `Missing file: '${name}' with missing extensions: ${result.missingExtensions.join(
        ', ',
      )}`;
    }
  }

  return result;
};
