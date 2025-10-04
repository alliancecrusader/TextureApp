import * as fs from 'fs';
import {getFileExtension, removeFileExtension} from '../modules/fs_util';

const texturesPaths = [
  './src/SFS/Example/Color Textures',
  './src/SFS/Example/Shape Textures',
];
const outputPath = './src/consts/sfs_base_textures.json';

const acceptableExtensions = ['json', 'txt'];

const main = () => {
  const unique: {[key: string]: {[key: string]: boolean}} = {
    color_tex: {},
    shape_tex: {},
  };

  const col_contents = fs.readdirSync(texturesPaths[0], {withFileTypes: true});
  const shape_contents = fs.readdirSync(texturesPaths[1], {
    withFileTypes: true,
  });

  col_contents.forEach((value: fs.Dirent) => {
    const name = value.name;

    if (!value.isFile || !acceptableExtensions.includes(getFileExtension(name)))
      return;
    unique.color_tex[removeFileExtension(name)] = true;
  });

  shape_contents.forEach((value: fs.Dirent) => {
    const name = value.name;

    if (!value.isFile || !acceptableExtensions.includes(getFileExtension(name)))
      return;
    unique.shape_tex[removeFileExtension(name)] = true;
  });

  const json_output = JSON.stringify(unique);
  fs.writeFileSync(outputPath, json_output);
};

main();
