import os
import json

TEMPLATE =  '{  "colorTex": {    "textures": [      {        "texture": "Body.png",        "ideal": 0.0      }    ],    "border_Bottom": {      "uvSize": 0.0,      "sizeMode": 0,      "size": 0.5    },    "border_Top": {      "uvSize": 0.0,      "sizeMode": 0,      "size": 0.5    },    "center": {      "mode": 1,      "sizeMode": 0,      "size": 0.5,      "logoHeightPercent": 0.5,      "scaleLogoToFit": false    },    "fixedWidth": false,    "fixedWidthValue": 1,    "flipToLight_X": false,    "flipToLight_Y": false,    "metalTexture": false,    "icon": null  },  "tags": [    "fairing"  ],  "pack_Redstone_Atlas": true,  "multiple": false,  "segments": [],  "name": "A10Body",  "hideFlags": 0}'

def generate_texture_json(template, texture_filename, name):
    """Generate a JSON dictionary for a given texture and name."""
    texture_data = json.loads(template)
    texture_data["colorTex"]["textures"][0]["texture"] = texture_filename
    texture_data["name"] = name
    return texture_data

def save_texture_json(output_path, filename, data):
    """Save the texture JSON data to a file."""
    os.makedirs(output_path, exist_ok=True)
    filepath = os.path.join(output_path, filename + ".json")
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=4)
    print(f"Saved: {filepath}")

def remove_extension(filename):
    """Remove the file extension from a filename."""
    return os.path.splitext(filename)[0]

def process_textures(
    input_folder,
    output_folder,
    texture_name_function=lambda x: x,
    template=TEMPLATE
):
    """Process all PNG files in the input folder to create JSON files in the output folder."""
    for filename in os.listdir(input_folder):
        if filename.endswith(".png"):
            base_name = remove_extension(filename)
            texture_name = texture_name_function(filename)
            texture_json = generate_texture_json(template, filename, texture_name)
            save_texture_json(output_folder, base_name, texture_json)

def get_texture_template():
    return TEMPLATE

if __name__ == "__main__":
    # Paths and settings
    TEXTURES_PATH = "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Spaceflight Simulator\\Spaceflight Simulator Game\\Mods\\Custom Assets\\Texture Packs"
    TEXTURE_FOLDER_NAME = "Multipurpose Drop Pod"
    PREFIX = f"{TEXTURE_FOLDER_NAME}-"
    SUFFIX = ""

    INPUT_TEXTURE_PATH = os.path.join(TEXTURES_PATH, TEXTURE_FOLDER_NAME, "Textures")
    OUTPUT_TEXTURE_PATH = os.path.join(TEXTURES_PATH, TEXTURE_FOLDER_NAME, "Color Textures")

    # Template
    texture_template = get_texture_template()

    process_textures(
        input_folder=INPUT_TEXTURE_PATH,
        output_folder=OUTPUT_TEXTURE_PATH,
        texture_name_function=lambda x: PREFIX + x + SUFFIX,
        template=texture_template,
    )