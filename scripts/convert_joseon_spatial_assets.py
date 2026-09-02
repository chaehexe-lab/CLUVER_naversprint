from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SPATIAL_ROOT = ROOT / "public" / "samunmong" / "assets" / "interactions" / "spatial-search"
SCENE_ROOT = ROOT / "public" / "samunmong" / "assets" / "scenes-integrated"
SCENE_NAMES = (
    "scene-field-one-clean-v3.png",
    "scene-chunwol-room-separate-chest-v2.png",
    "scene-mudeok-servant-room-clean-v3.png",
    "scene-yoomunseok-sarangbang-clean-v3.png",
    "scene-dolsoe-quarters-clean-v3.png",
    "scene-back-gate-courtyard-clean-v3.png",
)


def main() -> None:
    converted = 0
    source_bytes = 0
    output_bytes = 0

    sources = [*sorted(SPATIAL_ROOT.rglob("*.png")), *(SCENE_ROOT / name for name in SCENE_NAMES)]
    for source in sources:
        target = source.with_suffix(".webp")
        with Image.open(source) as image:
            image.convert("RGB").save(
                target,
                "WEBP",
                quality=93,
                method=6,
                exact=True,
            )
        source_bytes += source.stat().st_size
        output_bytes += target.stat().st_size
        converted += 1

    print(
        f"converted={converted} "
        f"png_mb={source_bytes / 1024 / 1024:.2f} "
        f"webp_mb={output_bytes / 1024 / 1024:.2f}"
    )


if __name__ == "__main__":
    main()
