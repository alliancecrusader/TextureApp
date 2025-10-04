export type FileSchema = {
  extensions: string[];
  mode: 'any' | 'all';
};

export type DirSchema = {
  subdirs: Record<string, DirSchema>;
  files: Record<string, FileSchema>;
  strict: boolean; // If true, no extra files or directories allowed
};

export type TypeMismatch = {
  path: string;
  expected: 'file' | 'directory';
  found: 'file' | 'directory';
};

// For either missing or extra entries
export type ErrorDirent = {
  path: string;
  msg: string;
  type: 'file' | 'directory';
  files?: number; // Number of files inside (if directory)
  subdirs?: number; // Number of subdirectories inside (if directory)
};

export type FSAccessError = {
  path: string;
  msg: string;
};

export type ScanResultFile = {
  success: boolean;
  msg: string;
  missingExtensions: string[];
  fsAccessErrors: FSAccessError[];
  typeMismatches: TypeMismatch[];
  whitelist: Set<string>; // The list of files that should be there, with extensions.
  // Makes it easier to check for extra files in strict mode
};

export type ScanResultDirectory = {
  success: boolean;
  msg: string;
  missingFiles: ErrorDirent[];
  missingDirs: ErrorDirent[];
  extraFiles: ErrorDirent[];
  extraDirs: ErrorDirent[];
  fsAccessErrors: FSAccessError[];
  typeMismatches: TypeMismatch[];
  nestedResults: Record<string, ScanResultDirectory>;
};
