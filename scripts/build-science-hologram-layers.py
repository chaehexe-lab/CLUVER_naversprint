from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/assets/space-station/backgrounds/science-lab-motion-base-v2.png"
LAYER_DIR = ROOT / "public/assets/space-station/effects/science-lab-holograms"

# Polygons follow the luminous display glass, excluding the ceiling lamps and
# surrounding wall. A small crop margin prevents the animated layer from being
# clipped when the shader introduces a short horizontal signal tear.
PANELS = {
    "s1": [(731, 190), (873, 190), (875, 277), (731, 277)],
    "s2": [(1040, 205), (1324, 202), (1326, 310), (1043, 308)],
    "s3": [(661, 281), (803, 282), (804, 397), (661, 398)],
}


def hologram_signal_alpha(layer: Image.Image, polygon_alpha: Image.Image) -> Image.Image:
    """Keep the cool luminous signal while leaving the room itself untouched."""
    signal = Image.new("L", layer.size, 0)
    values: list[int] = []

    for red, green, blue, _ in layer.getdata():
        brightness = max(red, green, blue)
        coolness = max(blue - red, min(green, blue) - red)
        light_weight = max(0.0, min(1.0, (brightness - 28.0) / 116.0))
        strength = coolness * light_weight
        normalized = max(0.0, min(1.0, (strength - 7.0) / 52.0))
        values.append(round((normalized**1.18) * 225))

    signal.putdata(values)
    signal = signal.filter(ImageFilter.GaussianBlur(0.45))
    return Image.composite(signal, Image.new("L", signal.size, 0), polygon_alpha)


def main() -> None:
    source = Image.open(SOURCE).convert("RGBA")
    width, height = source.size
    LAYER_DIR.mkdir(parents=True, exist_ok=True)

    for panel_id, polygon in PANELS.items():
        xs = [point[0] for point in polygon]
        ys = [point[1] for point in polygon]
        padding = 5
        left = max(0, min(xs) - padding)
        top = max(0, min(ys) - padding)
        right = min(width, max(xs) + padding + 1)
        bottom = min(height, max(ys) + padding + 1)

        local_polygon = [(x - left, y - top) for x, y in polygon]
        alpha = Image.new("L", (right - left, bottom - top), 0)
        ImageDraw.Draw(alpha).polygon(local_polygon, fill=255)
        alpha = alpha.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.7))

        layer = source.crop((left, top, right, bottom))
        layer.putalpha(hologram_signal_alpha(layer, alpha))
        layer.save(LAYER_DIR / f"science-hologram-{panel_id}-v1.png", optimize=True)

        center_x = (left + right) / 2 / width
        center_y = (top + bottom) / 2 / height
        size_x = (right - left) / width
        size_y = (bottom - top) / height
        print(
            f'{panel_id}: center=[{center_x:.6f}, {center_y:.6f}] '
            f'size=[{size_x:.6f}, {size_y:.6f}]'
        )


if __name__ == "__main__":
    main()
