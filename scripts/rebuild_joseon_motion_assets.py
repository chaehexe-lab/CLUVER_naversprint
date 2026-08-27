from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SCENES = ROOT / "public" / "samunmong" / "assets" / "scenes-integrated"
MOTION = ROOT / "public" / "samunmong" / "assets" / "scene-motion"


def soft_shapes(size, boxes, blur=5):
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    for box in boxes:
        draw.ellipse(box, fill=255)
    return mask.filter(ImageFilter.GaussianBlur(blur))


def patch_original(source_name, clean_name, output_name, boxes):
    source = Image.open(SCENES / source_name).convert("RGB")
    clean = Image.open(MOTION / clean_name).convert("RGB")
    if source.size != clean.size:
        clean = clean.resize(source.size, Image.Resampling.LANCZOS)
    mask = soft_shapes(source.size, boxes)
    Image.composite(clean, source, mask).save(MOTION / output_name, quality=96)


def patch_state_set(reference_clean_name, boxes, states):
    reference = Image.open(MOTION / reference_clean_name).convert("RGB")
    for source_name, output_name in states:
        source = Image.open(SCENES / source_name).convert("RGB")
        clean = reference if reference.size == source.size else reference.resize(source.size, Image.Resampling.LANCZOS)
        mask = soft_shapes(source.size, boxes)
        Image.composite(clean, source, mask).save(MOTION / output_name, quality=96)


def rebuild_mudeok():
    source = Image.open(SCENES / "scene-mudeok-servant-room-all-evidence-v4.png").convert("RGB")
    clean = Image.open(MOTION / "mudeok-servant-room-all-evidence-motion-clean-v1.png").convert("RGB")
    flame_clean = Image.open(
        ROOT
        / "public"
        / "samunmong"
        / "assets"
        / "interactions"
        / "mudeok-servant-room"
        / "mudeok-servant-room-layered-clean-v1.png"
    ).convert("RGB")
    if source.size != clean.size:
        clean = clean.resize(source.size, Image.Resampling.LANCZOS)
    if source.size != flame_clean.size:
        flame_clean = flame_clean.resize(source.size, Image.Resampling.LANCZOS)

    # Compare only low-frequency luminance so branches, roof edges and the
    # doorway frame do not become part of the moving cloud silhouette.
    source_luma = source.convert("L").filter(ImageFilter.GaussianBlur(5))
    clean_luma = clean.convert("L").filter(ImageFilter.GaussianBlur(5))
    cloud_signal = ImageChops.subtract(source_luma, clean_luma).point(
        lambda value: max(0, min(255, (value - 2) * 13))
    )

    sky_window = Image.new("L", source.size, 0)
    sky_draw = ImageDraw.Draw(sky_window)
    sky_draw.polygon(
        [(1217, 0), (1392, 0), (1392, 105), (1368, 112), (1340, 126), (1307, 124), (1273, 137), (1238, 130), (1217, 111)],
        fill=255,
    )
    sky_window = sky_window.filter(ImageFilter.GaussianBlur(4))
    cloud_alpha = ImageChops.multiply(cloud_signal, sky_window).filter(ImageFilter.GaussianBlur(2.5))
    cloud_alpha = cloud_alpha.point(
        lambda value: 0 if value < 55 else min(255, int((value - 55) * 1.45))
    ).filter(ImageFilter.GaussianBlur(1.2))

    # The moon is a fixed landmark and must never travel with the cloud layer.
    alpha_draw = ImageDraw.Draw(cloud_alpha)
    alpha_draw.ellipse((1317, 33, 1355, 76), fill=0)

    cloud_layer = source.convert("RGBA")
    cloud_layer.putalpha(cloud_alpha)
    cloud_layer.save(MOTION / "mudeok-servant-room-original-cloud-layer-v1.png")

    cloud_repair = cloud_alpha.filter(ImageFilter.MaxFilter(15)).filter(ImageFilter.GaussianBlur(4))
    flame_repair = soft_shapes(source.size, [(560, 635, 594, 696)], blur=3)
    cloud_repaired = Image.composite(clean, source, cloud_repair)
    Image.composite(flame_clean, cloud_repaired, flame_repair).save(
        MOTION / "mudeok-servant-room-all-evidence-motion-clean-v2.png",
        quality=96,
    )

    for source_name, output_name in [
        ("scene-mudeok-diary-shoes-v4.png", "mudeok-diary-shoes-motion-clean-v1.png"),
        ("scene-mudeok-diary-tie-v4.png", "mudeok-diary-tie-motion-clean-v1.png"),
        ("scene-mudeok-shoes-tie-v4.png", "mudeok-shoes-tie-motion-clean-v1.png"),
        ("scene-mudeok-diary-only-v4.png", "mudeok-diary-only-motion-clean-v1.png"),
        ("scene-mudeok-shoes-only-v4.png", "mudeok-shoes-only-motion-clean-v1.png"),
        ("scene-mudeok-tie-only-v4.png", "mudeok-tie-only-motion-clean-v1.png"),
        ("scene-mudeok-servant-room-clean-v3.png", "mudeok-none-motion-clean-v1.png"),
    ]:
        state = Image.open(SCENES / source_name).convert("RGB")
        state_cloud_clean = clean if clean.size == state.size else clean.resize(state.size, Image.Resampling.LANCZOS)
        state_flame_clean = flame_clean if flame_clean.size == state.size else flame_clean.resize(state.size, Image.Resampling.LANCZOS)
        state_cloud_mask = cloud_repair if cloud_repair.size == state.size else cloud_repair.resize(state.size, Image.Resampling.LANCZOS)
        state_flame_mask = flame_repair if flame_repair.size == state.size else flame_repair.resize(state.size, Image.Resampling.LANCZOS)
        cloud_repaired_state = Image.composite(state_cloud_clean, state, state_cloud_mask)
        Image.composite(state_flame_clean, cloud_repaired_state, state_flame_mask).save(
            MOTION / output_name,
            quality=96,
        )


def main():
    MOTION.mkdir(parents=True, exist_ok=True)
    patch_original(
        "scene-chunwol-room-all-evidence-v4.png",
        "chunwol-room-all-evidence-flame-clean-v1.png",
        "chunwol-room-all-evidence-flame-clean-v2.png",
        [(434, 454, 486, 556)],
    )
    patch_state_set(
        "chunwol-room-all-evidence-flame-clean-v1.png",
        [(434, 454, 486, 556)],
        [
            ("scene-chunwol-room-norigae-jeogori-only-v5.png", "chunwol-norigae-only-motion-clean-v1.png"),
            ("scene-chunwol-room-portrait-only-v4.png", "chunwol-portrait-only-motion-clean-v1.png"),
            ("scene-chunwol-room-clean-v3.png", "chunwol-none-motion-clean-v1.png"),
        ],
    )
    patch_original(
        "scene-yoomunseok-sarangbang-all-evidence-v4.png",
        "yoomunseok-sarangbang-all-evidence-flame-clean-v1.png",
        "yoomunseok-sarangbang-all-evidence-flame-clean-v2.png",
        [(588, 430, 642, 513), (1575, 184, 1618, 266)],
    )
    patch_state_set(
        "yoomunseok-sarangbang-all-evidence-flame-clean-v1.png",
        [(588, 430, 642, 513), (1575, 184, 1618, 266)],
        [
            ("scene-yoomunseok-holder-ledger-v7.png", "yoomunseok-holder-ledger-motion-clean-v1.png"),
            ("scene-yoomunseok-holder-marriage-v5.png", "yoomunseok-holder-marriage-motion-clean-v1.png"),
            ("scene-yoomunseok-ledger-marriage-v6.png", "yoomunseok-ledger-marriage-motion-clean-v1.png"),
            ("scene-yoomunseok-holder-only-v5.png", "yoomunseok-holder-only-motion-clean-v1.png"),
            ("scene-yoomunseok-ledger-only-v6.png", "yoomunseok-ledger-only-motion-clean-v1.png"),
            ("scene-yoomunseok-marriage-only-v6.png", "yoomunseok-marriage-only-motion-clean-v1.png"),
            ("scene-yoomunseok-none-v6.png", "yoomunseok-none-motion-clean-v1.png"),
        ],
    )
    patch_original(
        "scene-dolsoe-quarters-all-evidence-v4.png",
        "dolsoe-quarters-all-evidence-flame-clean-v1.png",
        "dolsoe-quarters-all-evidence-flame-clean-v2.png",
        [(98, 380, 146, 452), (900, 270, 952, 337)],
    )
    patch_state_set(
        "dolsoe-quarters-all-evidence-flame-clean-v1.png",
        [(98, 380, 146, 452), (900, 270, 952, 337)],
        [
            ("scene-dolsoe-quarters-bandage-only-v4.png", "dolsoe-bandage-only-motion-clean-v1.png"),
            ("scene-dolsoe-quarters-bundle-only-v4.png", "dolsoe-bundle-only-motion-clean-v1.png"),
            ("scene-dolsoe-quarters-clean-v3.png", "dolsoe-none-motion-clean-v1.png"),
        ],
    )
    rebuild_mudeok()


if __name__ == "__main__":
    main()
