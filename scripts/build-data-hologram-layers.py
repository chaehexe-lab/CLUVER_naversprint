from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ORIGINAL = ROOT / "public/assets/space-station/backgrounds/data-core-evidence-v2.webp"
GENERATED_CLEAN = ROOT / "outputs/generated-clean-plates/data-core-clean-ai-v1.png"
CLEAN_PLATE = ROOT / "outputs/generated-clean-plates/data-core-hologram-clean-v1.png"
LAYER_DIR = ROOT / "public/assets/space-station/effects/data-core-holograms"

# The wider areas are used only to restore the wall behind the holograms.
REMOVAL_AREAS = {
    "d1": [(678, 175), (791, 176), (788, 257), (677, 252)],
    "d2": [(830, 207), (900, 208), (899, 270), (831, 266)],
    "d3": [(965, 176), (1095, 165), (1097, 259), (966, 272)],
    "d4": [(640, 279), (789, 283), (788, 375), (640, 368)],
    "d5": [(842, 253), (958, 257), (957, 355), (842, 350)],
    "d6": [(1028, 246), (1174, 244), (1176, 398), (1029, 407)],
    "d7": [(657, 394), (740, 400), (739, 473), (657, 470)],
    "d10": [(1086, 348), (1195, 350), (1193, 438), (1087, 433)],
}

# Tighter bounds keep ceiling lights, racks, and articulated lamp parts out of
# the animated textures. Transparent hologram pixels are retained by the shader.
PANELS = {
    "d1": [(685, 182), (788, 183), (785, 246), (688, 240)],
    "d2": [(834, 211), (896, 212), (895, 263), (835, 257)],
    "d3": [(968, 190), (1088, 182), (1089, 235), (969, 242)],
    "d4": [(647, 285), (781, 289), (781, 373), (647, 363)],
    "d5": [(846, 256), (955, 260), (954, 348), (846, 343)],
    "d6": [(1033, 259), (1167, 246), (1168, 338), (1034, 349)],
    "d7": [(669, 406), (734, 411), (733, 470), (669, 467)],
    "d10": [(1089, 361), (1184, 364), (1183, 430), (1090, 424)],
}


def expanded_soft_mask(size: tuple[int, int], polygons: list[list[tuple[int, int]]]) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    for polygon in polygons:
        draw.polygon(polygon, fill=255)
    return mask.filter(ImageFilter.MaxFilter(17)).filter(ImageFilter.GaussianBlur(3.2))


def hologram_signal_alpha(layer: Image.Image, polygon_alpha: Image.Image) -> Image.Image:
    """Extract only the luminous cyan signal; the original room stays underneath."""
    signal = Image.new("L", layer.size, 0)
    values: list[int] = []

    for red, green, blue, _ in layer.getdata():
        brightness = max(red, green, blue)
        coolness = max(blue - red, min(green, blue) - red)
        light_weight = max(0.0, min(1.0, (brightness - 28.0) / 116.0))
        strength = coolness * light_weight
        normalized = max(0.0, min(1.0, (strength - 7.0) / 52.0))
        values.append(round((normalized ** 1.18) * 225))

    signal.putdata(values)
    signal = signal.filter(ImageFilter.GaussianBlur(0.45))
    return Image.composite(signal, Image.new("L", signal.size, 0), polygon_alpha)


def main() -> None:
    original = Image.open(ORIGINAL).convert("RGBA")
    generated = Image.open(GENERATED_CLEAN).convert("RGBA")
    if generated.size != original.size:
        generated = generated.resize(original.size, Image.Resampling.LANCZOS)

    clean_mask = expanded_soft_mask(original.size, list(REMOVAL_AREAS.values()))
    clean_plate = Image.composite(generated, original, clean_mask)
    clean_plate.save(CLEAN_PLATE, optimize=True)

    LAYER_DIR.mkdir(parents=True, exist_ok=True)
    width, height = original.size
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

        layer = original.crop((left, top, right, bottom))
        layer.putalpha(hologram_signal_alpha(layer, alpha))
        layer.save(LAYER_DIR / f"data-hologram-{panel_id}-v1.png", optimize=True)

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
