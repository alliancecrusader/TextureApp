from PIL import Image
import os
import math
from collections import Counter, defaultdict

def color_difference(color1, color2):
    """Calculate the Euclidean distance between two RGBA colors."""
    r1, g1, b1, a1 = color1
    r2, g2, b2, a2 = color2
    return math.sqrt((r2 - r1) ** 2 + (g2 - g1) ** 2 + (b2 - b1) ** 2 + (2 * (a2 - a1)) ** 2)

def calculate_color_similarities(colors):
    """Calculate similarity scores for each color compared to all others."""
    similarities = defaultdict(float)
    for i, color1 in enumerate(colors):
        total_difference = 0
        for j, color2 in enumerate(colors):
            if i != j:
                difference = color_difference(color1, color2)
                total_difference += difference
        similarities[color1] = total_difference / (len(colors) - 1) if len(colors) > 1 else float('inf')
    return similarities

def reduce_colors(colors, percentages, target_count):
    """Reduce colors to target count by removing most similar colors."""
    while len(colors) > target_count:
        similarities = calculate_color_similarities(colors)
        most_similar_color = min(similarities.items(), key=lambda x: x[1])[0]
        removed_percentage = percentages[most_similar_color]
        print(f"Removed color RGBA{most_similar_color} ({removed_percentage:.2f}% of non-ignored pixels)")
        colors.remove(most_similar_color)
        del percentages[most_similar_color]
    return colors

def should_ignore_color(color, ignore_list, threshold):
    """Check if a color should be ignored based on the ignore list."""
    return any(color_difference(color, ignored_color) <= threshold for ignored_color in ignore_list)

def get_color_frequencies(image, ignore_colors, avg_difference_threshold, scan_mode):
    if image.mode != 'RGBA':
        image = image.convert('RGBA')

    color_count = Counter()
    total_counted_pixels = 0

    if scan_mode == "row":
        if image.height > image.width:
            # Scan top to bottom (x=0, y in range)
            coordinates = [(0, y) for y in range(image.height)]
        elif image.width > image.height:
            # Scan left to right (y=0, x in range)
            coordinates = [(x, 0) for x in range(image.width)]
        else:
            # Square: ask user
            orientation = input("Enter 'X' or 'Y': ")
            if orientation.upper() == 'X':
                coordinates = [(x, 0) for x in range(image.width)]
            else:
                coordinates = [(0, y) for y in range(image.height)]
    else:
        # Full image scan
        coordinates = [(x, y) for y in range(image.height) for x in range(image.width)]

    for (x, y) in coordinates:
        pixel = image.getpixel((x, y))
        if not should_ignore_color(pixel, ignore_colors, avg_difference_threshold):
            color_count[pixel] += 1
            total_counted_pixels += 1

    if total_counted_pixels == 0:
        print("Warning: All pixels matched ignore list!")
        return {}, 0

    color_percentages = {
        color: (count / total_counted_pixels) * 100
        for color, count in color_count.items()
    }

    return color_percentages, total_counted_pixels

def get_unique_colors(image, avg_difference_threshold=0, max_colors=math.inf, min_pixel_percentage=1.0, ignore_colors=None, scan_mode="full"):
    """Extract unique colors from an image with smart reduction to meet maximum color limit."""
    if image.mode != 'RGBA':
        image = image.convert('RGBA')

    if ignore_colors is None:
        ignore_colors = []

    color_percentages, total_counted_pixels = get_color_frequencies(image, ignore_colors, avg_difference_threshold, scan_mode)
    total_pixels = image.width * (1 if scan_mode == "row" else image.height)
    ignored_pixels = total_pixels - total_counted_pixels

    print(f"\nPixel Analysis:")
    print(f"- Total pixels: {total_pixels}")
    print(f"- Ignored pixels: {ignored_pixels} ({(ignored_pixels/total_pixels)*100:.1f}% of image)")
    print(f"- Considered pixels: {total_counted_pixels} ({(total_counted_pixels/total_pixels)*100:.1f}% of image)")

    valid_colors = {
        color: percentage 
        for color, percentage in color_percentages.items() 
        if percentage >= min_pixel_percentage
    }

    colors = list(valid_colors.keys())

    if len(colors) > max_colors:
        print(f"\nReducing from {len(colors)} colors to {max_colors} colors:")
        colors = reduce_colors(colors, valid_colors, max_colors)

    for color in colors:
        print(f"Color RGBA{color} ({color_percentages[color]:.2f}% of non-ignored pixels)")

    return colors

def create_color_images(colors, size=(32, 32)):
    """Create a solid color image for each color in the list."""
    return [Image.new('RGBA', size, color) for color in colors]

def output_images(images, output_path):
    """Save all images to the specified directory."""
    os.makedirs(output_path, exist_ok=True)
    for i, image in enumerate(images):
        image.save(os.path.join(output_path, f"{i}.png"))
        print(f"Saved color {i}: RGBA{image.getpixel((0, 0))}")

# Main function for direct execution
def process_palette(
    palette_path,
    output_path,
    avg_difference_threshold=0,
    max_colors=math.inf,
    min_pixel_percentage=1.0,
    ignore_colors=None,
    image_size=(32, 32),
    scan_mode="full"
):
    """Process a palette image and save unique colors as images."""
    try:
        palette_image = Image.open(palette_path)
        unique_colors = get_unique_colors(
            palette_image,
            avg_difference_threshold,
            max_colors,
            min_pixel_percentage,
            ignore_colors,
            scan_mode
        )
        color_images = create_color_images(unique_colors, size=image_size)
        output_images(color_images, output_path)
    except FileNotFoundError:
        print(f"Error: Could not find palette file at {palette_path}")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

# Example usage for direct execution
if __name__ == "__main__":
    process_palette(
        palette_path="path_to_palette.png",
        output_path="output_directory",
        avg_difference_threshold=0,
        max_colors=10,
        min_pixel_percentage=1.0,
        ignore_colors=[(0, 0, 0, 0), (0, 0, 0, 255), (255, 255, 255, 255)],
        image_size=(32, 32),
        scan_mode="row"  # Change to "full" to scan the entire image
    )
