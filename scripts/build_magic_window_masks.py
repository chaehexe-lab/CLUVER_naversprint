from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SCENES = ROOT / "public" / "samunmong" / "assets" / "magic-school" / "scenes"
EFFECTS = ROOT / "public" / "samunmong" / "assets" / "magic-school" / "effects"
PREVIEWS = ROOT / "artifacts" / "magic-window-masks"


SCENE_WINDOWS = {
    "alchemy-lab": {
        "image": "alchemy-lab-motion-base-v2.webp",
        "panes": [
            (.112, .032, .044, .105), (.164, .032, .046, .105),
            (.112, .151, .044, .108), (.164, .151, .046, .108),
            (.112, .273, .044, .105), (.164, .273, .046, .105),
            (.302, .031, .052, .106), (.363, .031, .057, .106),
            (.302, .151, .052, .108), (.363, .151, .057, .108),
            (.302, .273, .052, .104), (.363, .273, .057, .104),
        ],
    },
    "library": {
        "image": "library-motion-base-v3.webp",
        "panes": [
            (.596, .060, .031, .170), (.638, .060, .031, .170),
            (.596, .244, .031, .242), (.638, .244, .031, .242),
            (.716, .052, .035, .180), (.762, .052, .034, .180),
            (.716, .246, .035, .238), (.762, .246, .034, .238),
            (.842, .054, .041, .180), (.895, .054, .042, .180),
            (.842, .248, .041, .234), (.895, .248, .042, .234),
        ],
    },
    "record-crystal-room": {
        "image": "record-crystal-room-motion-base-v2.webp",
        "panes": [
            (.074, .106, .041, .260), (.124, .106, .041, .260),
            (.202, .076, .042, .290), (.253, .076, .042, .290),
            (.335, .064, .040, .290), (.383, .064, .040, .290),
            (.584, .064, .040, .290), (.632, .064, .040, .290),
            (.708, .076, .042, .290), (.759, .076, .042, .290),
            (.836, .106, .041, .260), (.886, .106, .041, .260),
        ],
    },
    "dorm-hallway": {
        "image": "dorm-hallway-motion-base-v2.webp",
        "panes": [
            (.008, .046, .021, .098), (.036, .046, .021, .098), (.064, .046, .021, .098),
            (.008, .162, .021, .105), (.036, .162, .021, .105), (.064, .162, .021, .105),
            (.008, .286, .021, .130), (.036, .286, .021, .130), (.064, .286, .021, .130),
        ],
    },
}


def smoothstep(edge0: float, edge1: float, value: np.ndarray) -> np.ndarray:
    scaled = np.clip((value - edge0) / (edge1 - edge0), 0.0, 1.0)
    return scaled * scaled * (3.0 - 2.0 * scaled)


def pane_region(
    size: tuple[int, int],
    panes: list[tuple[float, float, float, float]],
    inset_px: int = 3,
) -> Image.Image:
    width, height = size
    region = Image.new("L", size, 0)
    draw = ImageDraw.Draw(region)
    for x, y, pane_width, pane_height in panes:
        draw.rectangle(
            (
                round(x * width) + inset_px,
                round(y * height) + inset_px,
                round((x + pane_width) * width) - inset_px,
                round((y + pane_height) * height) - inset_px,
            ),
            fill=255,
        )
    return region


def build_glass_mask(image: Image.Image, panes: list[tuple[float, float, float, float]]) -> Image.Image:
    rgb = np.asarray(image.convert("RGB"), dtype=np.float32) / 255.0
    red, green, blue = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    brightness = np.maximum.reduce((red, green, blue))

    # Purple-blue night glass is cooler than the brown/black wooden or stone frame.
    cool_contrast = blue - np.maximum(red * 0.58, green * 0.76)
    cool_gate = smoothstep(0.018, 0.082, cool_contrast)
    light_gate = smoothstep(0.026, 0.155, brightness)
    saturation_gate = smoothstep(0.018, 0.09, blue - np.minimum(red, green))
    alpha = np.maximum(cool_gate * light_gate, saturation_gate * light_gate * 0.82)

    hard_region = pane_region(image.size, panes)
    region = np.asarray(hard_region, dtype=np.float32) / 255.0
    hard_reject = ((cool_contrast > 0.006) & (brightness > 0.022)).astype(np.float32)
    alpha = np.clip(alpha * region * hard_reject, 0.0, 1.0)

    # Turn the color segmentation into a strict glass-only silhouette. MinFilter
    # erodes a one-pixel fringe so bright stone and wooden frame pixels cannot
    # receive the additive flash, while the final blur only antialiases inward.
    binary = Image.fromarray(np.uint8(alpha >= 0.39) * 255, "L")
    eroded = binary.filter(ImageFilter.MinFilter(3))
    mask = eroded.filter(ImageFilter.GaussianBlur(0.55))
    return Image.fromarray(
        np.minimum(np.asarray(mask, dtype=np.uint8), np.asarray(hard_region, dtype=np.uint8)),
        "L",
    )


def make_preview(image: Image.Image, mask: Image.Image) -> Image.Image:
    overlay = Image.new("RGBA", image.size, (75, 224, 255, 0))
    overlay.putalpha(mask.point(lambda value: round(value * 0.62)))
    preview = Image.alpha_composite(image.convert("RGBA"), overlay)
    return preview


def main() -> None:
    EFFECTS.mkdir(parents=True, exist_ok=True)
    PREVIEWS.mkdir(parents=True, exist_ok=True)
    preview_tiles = []

    for name, config in SCENE_WINDOWS.items():
        source = Image.open(SCENES / config["image"]).convert("RGB")
        mask = build_glass_mask(source, config["panes"])
        mask.save(EFFECTS / f"{name}-window-glass-mask-v2.png", optimize=True)
        preview = make_preview(source, mask)
        preview.thumbnail((836, 471), Image.Resampling.LANCZOS)
        preview.save(PREVIEWS / f"{name}-window-mask-preview.png", optimize=True)
        preview_tiles.append((name, preview.copy()))

    contact = Image.new("RGB", (1672, 1060), (9, 10, 14))
    draw = ImageDraw.Draw(contact)
    for index, (name, preview) in enumerate(preview_tiles):
        x = (index % 2) * 836
        y = (index // 2) * 530
        contact.paste(preview.convert("RGB"), (x, y + 36))
        draw.text((x + 18, y + 10), name, fill=(226, 240, 246))
    contact.save(PREVIEWS / "window-mask-contact-sheet.jpg", quality=94, subsampling=0)


if __name__ == "__main__":
    main()
