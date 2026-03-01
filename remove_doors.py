"""Remove doors from pixel-art image by replacing door pixels with background."""
from pathlib import Path

try:
    from PIL import Image
    import numpy as np
except ImportError:
    print("Installing PIL and numpy...")
    import subprocess
    subprocess.check_call(["pip", "install", "Pillow", "numpy"])
    from PIL import Image
    import numpy as np

def remove_doors(input_path: str, output_path: str) -> None:
    """Replace door regions with background color to remove them."""
    img = Image.open(input_path)
    img = img.convert("RGBA")
    pixels = np.array(img)
    h, w = pixels.shape[:2]

    # Sample background color from top-left corner (likely wall)
    bg_samples = []
    for y in range(min(5, h)):
        for x in range(min(10, w)):
            bg_samples.append(tuple(pixels[y, x]))
    bg_color = tuple(np.median([p[:3] for p in bg_samples], axis=0).astype(int))

    # Door colors: light tan/brown door body, grey frame, dark window, handle
    # Create mask: pixels that are door (light tan) or door frame (grey) or window (dark grey)
    mask = np.zeros((h, w), dtype=bool)
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[y, x]
            # Light brown/tan door body (warm, light)
            is_door = (r > 140 and g > 110 and b < 190 and r - b > 10)
            # Grey frame - broad range for light grey to near-white
            is_frame = (r > 130 and g > 130 and b > 120 and 
                       abs(r - g) < 60 and abs(g - b) < 60)
            # Dark grey window (#808080 or darker)
            is_window = (r < 140 and g < 140 and b < 140)
            # Dark brown handle
            is_handle = (80 < r < 170 and 70 < g < 140 and 50 < b < 130)
            if is_door or is_frame or is_window or is_handle:
                mask[y, x] = True

    # Fill masked pixels with background
    for y in range(h):
        for x in range(w):
            if mask[y, x]:
                pixels[y, x] = (*bg_color, 255)

    result = Image.fromarray(pixels)
    result.save(output_path)
    print(f"Saved: {output_path}")

if __name__ == "__main__":
    script_dir = Path(__file__).parent
    # Try Cursor project assets path first
    cursor_assets = Path(r"C:\Users\Torres\.cursor\projects\e-VibedCode-Compare-2d-edutech\assets")
    input_name = "c__Users_Torres_AppData_Roaming_Cursor_User_workspaceStorage_2333fadfc5cccce310b80b430dfe006e_images_image-6274982f-a527-4b16-8333-ba8234f1b9fa.png"
    input_path = cursor_assets / input_name if (cursor_assets / input_name).exists() else script_dir / "assets" / input_name
    output_path = script_dir / "wall_no_doors.png"
    remove_doors(str(input_path), str(output_path))
