from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ORIGINAL = ROOT / "public/assets/space-station/backgrounds/medical-bay-evidence-v2.webp"
LAYER_DIR = ROOT / "public/assets/space-station/effects/medical-bay-holograms"

# The top console lamps and outer metal bezel remain part of the original plate.
# These polygons contain only the three active diagnostic display surfaces.
PANELS = {
    "m1": [(692, 397), (762, 398), (761, 454), (692, 455)],
    "m2": [(777, 397), (827, 396), (827, 454), (777, 454)],
    "m3": [(834, 396), (881, 395), (881, 454), (833, 454)],
}


def diagnostic_signal_alpha(layer: Image.Image, polygon_alpha: Image.Image) -> Image.Image:
    signal = Image.new("L", layer.size, 0)
    values: list[int] = []

    for red, green, blue, _ in layer.getdata():
        brightness = max(red, green, blue)
        medical_color = max(green - red, blue - red)
        light_weight = max(0.0, min(1.0, (brightness - 30.0) / 118.0))
        strength = medical_color * light_weight
        normalized = max(0.0, min(1.0, (strength - 6.0) / 48.0))
        values.append(round((normalized ** 1.16) * 220))

    signal.putdata(values)
    signal = signal.filter(ImageFilter.GaussianBlur(0.42))
    return Image.composite(signal, Image.new("L", signal.size, 0), polygon_alpha)


def main() -> None:
    original = Image.open(ORIGINAL).convert("RGBA")
    width, height = original.size
    LAYER_DIR.mkdir(parents=True, exist_ok=True)

    for panel_id, polygon in PANELS.items():
        xs = [point[0] for point in polygon]
        ys = [point[1] for point in polygon]
        padding = 4
        left = max(0, min(xs) - padding)
        top = max(0, min(ys) - padding)
        right = min(width, max(xs) + padding + 1)
        bottom = min(height, max(ys) + padding + 1)

        local_polygon = [(x - left, y - top) for x, y in polygon]
        polygon_alpha = Image.new("L", (right - left, bottom - top), 0)
        ImageDraw.Draw(polygon_alpha).polygon(local_polygon, fill=255)
        polygon_alpha = polygon_alpha.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.65))

        layer = original.crop((left, top, right, bottom))
        layer.putalpha(diagnostic_signal_alpha(layer, polygon_alpha))
        layer.save(LAYER_DIR / f"medical-hologram-{panel_id}-v1.png", optimize=True)

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
