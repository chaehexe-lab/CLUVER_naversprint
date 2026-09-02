from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SCENES = ROOT / "public" / "samunmong" / "assets" / "magic-school" / "scenes"

WINDOW_BOUNDS = {
    "alchemy-lab": (0.090, 0.000, 0.435, 0.470),
    "library": (0.565, 0.000, 0.995, 0.560),
    "record-crystal-room": (0.000, 0.000, 1.000, 0.490),
    "dorm-hallway": (0.000, 0.000, 0.125, 0.550),
}


def changed_window_mask(
    source: Image.Image,
    repaired: Image.Image,
    bounds: tuple[float, float, float, float],
) -> Image.Image:
    width, height = source.size
    difference = ImageChops.difference(source, repaired)
    difference = ImageChops.lighter(
        ImageChops.lighter(difference.getchannel("R"), difference.getchannel("G")),
        difference.getchannel("B"),
    )
    changed = difference.point(lambda value: 255 if value >= 7 else 0)
    changed = changed.filter(ImageFilter.MaxFilter(17)).filter(ImageFilter.GaussianBlur(5.0))

    region = Image.new("L", source.size, 0)
    draw = ImageDraw.Draw(region)
    left, top, right, bottom = bounds
    draw.rectangle(
        (round(left * width), round(top * height), round(right * width), round(bottom * height)),
        fill=255,
    )
    return ImageChops.multiply(changed, region)


def smoke_and_ash_mask(size: tuple[int, int]) -> Image.Image:
    width, height = size
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0.447 * width, 0.34 * height, 0.557 * width, 0.63 * height), fill=255)
    draw.ellipse((0.426 * width, 0.545 * height, 0.603 * width, 0.692 * height), fill=255)
    return mask.filter(ImageFilter.GaussianBlur(15))


def composite_scene(name: str, mask_builder) -> None:
    source = Image.open(SCENES / f"{name}.webp").convert("RGB")
    repaired = Image.open(SCENES / f"{name}-motion-base-v1.png").convert("RGB")
    if repaired.size != source.size:
        repaired = repaired.resize(source.size, Image.Resampling.LANCZOS)
    mask = mask_builder(source, repaired)
    output = Image.composite(repaired, source, mask)
    output.save(
        SCENES / f"{name}-motion-base-v2.webp",
        "WEBP",
        lossless=True,
        quality=100,
        method=6,
    )


def main() -> None:
    for name, bounds in WINDOW_BOUNDS.items():
        composite_scene(name, lambda source, repaired, bounds=bounds: changed_window_mask(source, repaired, bounds))

    composite_scene("cleaning-closet", lambda source, _repaired: smoke_and_ash_mask(source.size))


if __name__ == "__main__":
    main()
