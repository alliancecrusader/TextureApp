import palettemaker
import texturemaker
import paletteblueprintmaker
import os
import json
import math

# Path to the game directory
GAME_PATH = "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Spaceflight Simulator\\Spaceflight Simulator Game"
TEXTURES_PATH = GAME_PATH + "\\Mods\\Custom Assets\\Texture Packs"
BP_PATH = GAME_PATH + "\\Saving\\Blueprints"

# Texture pack name ---------------------------------------------------------------------------------------

TEXTURE_PACK_NAME = "Kuromi X"
MAKE_BP = True
IN_BP_PATH_OR_SAVING = True # false will output to the texture pack folder, true will output to the Saving/Blueprints folder
PROJECTS_PATH = "E:\\SFS\\SFS Projects\\Creation Projects"
PALETTE_PATH = os.path.join(PROJECTS_PATH, TEXTURE_PACK_NAME, "palette.png")

# ---------------------------------------------------------------------------------------------------------

TEXTURE_PACK_PATH = TEXTURES_PATH + "\\" + TEXTURE_PACK_NAME


folders = [
    "Color Textures",
    "Shadow Textures",
    "Shape Textures",
    "Textures"
]

default_author = ""
default_version = ""
default_description = ""

default_pack_info = {
  "DisplayName": "",
  "Version": "",
  "Description": "",
  "Author": "",
  "ShowIcon": False,
  "Icon": None,
  "name": "",
  "hideFlags": 0
}


def get_pack_info(display_name, version=default_version, description=default_description, author=default_author):
    pack_info = default_pack_info
    pack_info["DisplayName"] = display_name
    pack_info["Version"] = version
    pack_info["Description"] = description
    pack_info["Author"] = author
    return pack_info

def make_texture_pack(name, path, pack_info):
    for folder in folders:
        os.makedirs(os.path.join(path, folder), exist_ok=True)
        print(f"Created directory at {os.path.join(path, folder)}")
    
    with open(os.path.join(path, "pack_info.json"), "w") as f:
        f.write(json.dumps(pack_info, indent=4))
        print(f"Pack info written to {os.path.join(path, 'pack.mcmeta')}")

    print(f"Texture pack created at {path}")

DEFAULT_IGNORE_COLORS = [
    (0, 0, 0, 255),
    (255, 255, 255, 255),
    (0, 0, 0, 0)
]

def add_texture_pack_name_fn_prefix(texture_name):
    return TEXTURE_PACK_NAME + "-" + str(texturemaker.remove_extension(texture_name))

def main():    
    pack_info = get_pack_info(TEXTURE_PACK_NAME)
    make_texture_pack(TEXTURE_PACK_NAME, TEXTURE_PACK_PATH, pack_info)
    
    palettemaker.process_palette(
        palette_path=PALETTE_PATH,
        output_path=TEXTURE_PACK_PATH + "\\Textures",
        avg_difference_threshold=0,
        max_colors=math.inf,
        min_pixel_percentage=1.0,
        ignore_colors=DEFAULT_IGNORE_COLORS,
        image_size=(1, 1),
        scan_mode="row"
    )
    print(f"Palette processed at {PALETTE_PATH}")
    
    texturemaker.process_textures(
        input_folder=TEXTURE_PACK_PATH + "\\Textures",
        output_folder=TEXTURE_PACK_PATH + "\\Color Textures",
        texture_name_function=add_texture_pack_name_fn_prefix
    )
    print(f"Textures processed at {TEXTURE_PACK_PATH + '\\Textures'}")
    
    bp = paletteblueprintmaker.create_palette_blueprint(
        input_texture_path=TEXTURE_PACK_PATH + "\\Color Textures"
    )

    if not MAKE_BP:
        return

    if IN_BP_PATH_OR_SAVING:
        bp_path = os.path.join(BP_PATH, TEXTURE_PACK_NAME + " Palette")
    else:
        bp_path = os.path.join(TEXTURE_PACK_PATH, "Palette")

    if not os.path.exists(bp_path):
        os.makedirs(bp_path)
    else:
        raise FileExistsError(f"Blueprint with this name ({bp_path}) already exists, not overwriting, at the path {bp_path}")
    
    with open(os.path.join(bp_path, "Blueprint.txt"), 'w') as f:
        f.write(json.dumps(bp, indent=4))

    with open(os.path.join(bp_path, "Version.txt"), 'w') as f:
        f.write("1.5.10.2")

    print(f"Blueprint created at {BP_PATH}")
    
if __name__ == "__main__":
    main()