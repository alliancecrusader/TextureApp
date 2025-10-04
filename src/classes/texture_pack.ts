import {
  ColorTexture,
  PackInfo,
  ShadowTexture,
  ShapeTexture,
} from '../types/sfs';
import {ITexturePack} from '../types/textureapp';
import {matchDirectorySchema} from '../modules/schema_match/match_directory';
import {DirectoryEntry} from '../modules/schema_match/types';
import * as fs from 'fs';
import {DirentPath} from '../types/common';
import * as path from 'path';

class TexturePack implements ITexturePack {
  public static createPackInfo(
    displayName: string = 'New Texture Pack',
    version: string = '1.0.0',
    description: string = '',
    author: string = '',
    showIcon: boolean = false,
    icon: string | null = null,
  ): PackInfo {
    return {
      DisplayName: displayName,
      Version: version,
      Description: description,
      Author: author,
      ShowIcon: showIcon,
      Icon: icon,
      name: '',
      hideFlags: 0,
    };
  }

  constructor(
    public packInfo: PackInfo,
    public colorTextures: ColorTexture[],
    public shadowTextures: ShadowTexture[],
    public shapeTextures: ShapeTexture[],
  ) {}
}

const TexturePackDirSchema: DirectoryEntry = {
  name: 'Texture Pack',
  entries: [
    {
      name: 'pack_info',
      validExtensions: ['txt', 'json'],
      mode: 'any',
    },
    {
      name: 'Color Textures',
      entries: [],
    },
    {
      name: 'Shadow Textures',
      entries: [],
    },
    {
      name: 'Shape Textures',
      entries: [],
    },
  ],
};

export const TexturePackExportSchema = {
  path: '',
  contents: {
    pack_info: '',
    'Color Textures': {
      contents: {},
    },
    'Shadow Textures': {
      contents: {},
    },
    'Shape Textures': {
      contents: {},
    },
  },
};

export class TexturePackFactory {
  public async createFromPath(dirPath: DirentPath) {
    try {
      const matchResult = await matchDirectorySchema(
        TexturePackDirSchema,
        dirPath,
      );

      if (!matchResult.success) {
        throw new Error(
          `Failed to match directory schema: ${matchResult.message}`,
        );
      }

      const colorTextures: ColorTexture[] = [];
      const shadowTextures: ShadowTexture[] = [];
      const shapeTextures: ShapeTexture[] = [];

      try {
        const packInfoPath = path.join(dirPath, 'pack_info.txt');
        const packInfoContent = await fs.promises.readFile(
          packInfoPath,
          'utf-8',
        );
        const packInfo = JSON.parse(packInfoContent);
        TexturePack.createPackInfo(
          packInfo.DisplayName,
          packInfo.Version,
          packInfo.Description,
          packInfo.Author,
          packInfo.ShowIcon,
          packInfo.Icon,
        );
      } catch (error) {
        console.error('Error reading pack_info:', error);
        throw new Error('Invalid pack_info file');
      }

      return new TexturePack(
        TexturePack.createPackInfo(),
        colorTextures,
        shadowTextures,
        shapeTextures,
      );
    } catch (error) {
      console.error(
        'Error creating TexturePack from existing directory:',
        error,
      );
      throw error;
    }
  }
}
