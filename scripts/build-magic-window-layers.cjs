const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const sceneDir = path.join(
  root,
  "public",
  "samunmong",
  "assets",
  "magic-school",
  "scenes",
);
const motionDir = path.join(sceneDir, "motion", "library-windows");
const strikeDir = path.join(motionDir, "strikes");
const sourcePath = path.join(sceneDir, "library.webp");
const cleanPath = path.join(
  sceneDir,
  "motion",
  "prototypes",
  "library-lightning-free-restoration-v1.png",
);
const lightningAtlasPath = path.join(
  sceneDir,
  "motion",
  "prototypes",
  "library-lightning-atlas-v1.png",
);

const WIDTH = 1672;
const HEIGHT = 941;

const windows = [
  { left: 995, right: 1183, top: 23, archY: 121, bottom: 500 },
  { left: 1204, right: 1407, top: -14, archY: 104, bottom: 502 },
  { left: 1414, right: 1625, top: -18, archY: 105, bottom: 506 },
];

const strikeTargets = [
  { x: 968, y: 18, width: 238, height: 500 },
  { x: 1184, y: -8, width: 244, height: 518 },
  { x: 1397, y: -8, width: 246, height: 524 },
];

function isInsideArch(x, y, window, expand = 0) {
  const left = window.left - expand;
  const right = window.right + expand;
  const top = window.top - expand;
  const archY = window.archY + expand * 0.2;
  const bottom = window.bottom + expand;
  if (x < left || x > right || y < top || y > bottom) return false;
  if (y >= archY) return true;

  const centerX = (left + right) / 2;
  const radiusX = (right - left) / 2;
  const radiusY = archY - top;
  const dx = (x - centerX) / radiusX;
  const dy = (y - archY) / radiusY;
  return dx * dx + dy * dy <= 1;
}

function isPurpleGlass(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;
  const purpleTint = b >= g + 4 && r >= g + 2 && b + r >= 63;
  const lightningTint = max >= 145 && b >= g && r >= g * 0.94 && chroma >= 8;
  return purpleTint || lightningTint;
}

function softenMask(mask, width, height) {
  const result = Buffer.from(mask);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      if (mask[index] === 255) continue;
      let neighbors = 0;
      for (let oy = -1; oy <= 1; oy += 1) {
        for (let ox = -1; ox <= 1; ox += 1) {
          if (mask[(y + oy) * width + x + ox] === 255) neighbors += 1;
        }
      }
      if (neighbors >= 6) result[index] = 180;
      else if (neighbors >= 3) result[index] = 72;
    }
  }
  return result;
}

function rgbaFromColorAndMask(mask, r, g, b, alphaScale = 1) {
  const rgba = Buffer.alloc(WIDTH * HEIGHT * 4);
  for (let i = 0; i < mask.length; i += 1) {
    const offset = i * 4;
    rgba[offset] = r;
    rgba[offset + 1] = g;
    rgba[offset + 2] = b;
    rgba[offset + 3] = Math.round(mask[i] * alphaScale);
  }
  return rgba;
}

async function maskedImage(input, mask) {
  const rgbaMask = rgbaFromColorAndMask(mask, 255, 255, 255);
  return sharp(input)
    .resize(WIDTH, HEIGHT, { fit: "fill" })
    .ensureAlpha()
    .composite([
      {
        input: rgbaMask,
        raw: { width: WIDTH, height: HEIGHT, channels: 4 },
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();
}

async function main() {
  fs.mkdirSync(motionDir, { recursive: true });
  fs.mkdirSync(strikeDir, { recursive: true });

  const { data: source, info } = await sharp(sourcePath)
    .resize(WIDTH, HEIGHT, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const glassMask = Buffer.alloc(WIDTH * HEIGHT);
  const foregroundMask = Buffer.alloc(WIDTH * HEIGHT);

  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const pixelIndex = y * WIDTH + x;
      const sourceIndex = pixelIndex * info.channels;
      const inside = windows.some((window) => isInsideArch(x, y, window));
      const insideExpanded = windows.some((window) => isInsideArch(x, y, window, 13));
      const glass =
        inside &&
        isPurpleGlass(
          source[sourceIndex],
          source[sourceIndex + 1],
          source[sourceIndex + 2],
        );

      glassMask[pixelIndex] = glass ? 255 : 0;
      foregroundMask[pixelIndex] = insideExpanded && !glass ? 255 : 0;
    }
  }

  const softGlassMask = softenMask(glassMask, WIDTH, HEIGHT);
  const maskPng = await sharp(softGlassMask, {
    raw: { width: WIDTH, height: HEIGHT, channels: 1 },
  })
    .png()
    .toBuffer();
  await sharp(maskPng).toFile(path.join(motionDir, "library-window-glass-mask-v1.png"));

  const alphaMask = rgbaFromColorAndMask(softGlassMask, 255, 255, 255);
  await sharp(alphaMask, {
    raw: { width: WIDTH, height: HEIGHT, channels: 4 },
  })
    .png()
    .toFile(path.join(motionDir, "library-window-glass-alpha-v1.png"));

  for (let windowIndex = 0; windowIndex < strikeTargets.length; windowIndex += 1) {
    const target = strikeTargets[windowIndex];
    for (let frameIndex = 0; frameIndex < 6; frameIndex += 1) {
      const sourceLeft = (frameIndex % 3) * 512;
      const sourceTop = Math.floor(frameIndex / 3) * 512;
      let strike = await sharp(lightningAtlasPath)
        .extract({ left: sourceLeft, top: sourceTop, width: 512, height: 512 })
        .resize(target.width, target.height, { fit: "fill" })
        .modulate({ brightness: 1.08, saturation: 1.08 })
        .png()
        .toBuffer();

      let strikeTop = target.y;
      if (strikeTop < 0) {
        strike = await sharp(strike)
          .extract({
            left: 0,
            top: -strikeTop,
            width: target.width,
            height: target.height + strikeTop,
          })
          .png()
          .toBuffer();
        strikeTop = 0;
      }

      const strikeCanvas = await sharp({
        create: {
          width: WIDTH,
          height: HEIGHT,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      })
        .composite([{ input: strike, left: target.x, top: strikeTop }])
        .png()
        .toBuffer();

      await sharp(strikeCanvas)
        .composite([
          {
            input: alphaMask,
            raw: { width: WIDTH, height: HEIGHT, channels: 4 },
            blend: "dest-in",
          },
        ])
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toFile(
          path.join(
            strikeDir,
            `library-window-${windowIndex + 1}-strike-${frameIndex + 1}.png`,
          ),
        );
    }
  }

  const cleanSkyLayer = await maskedImage(cleanPath, softGlassMask);
  await sharp(cleanSkyLayer).toFile(path.join(motionDir, "library-window-clean-sky-v1.png"));

  const foregroundLayer = await maskedImage(sourcePath, foregroundMask);
  await sharp(foregroundLayer).toFile(
    path.join(motionDir, "library-window-frame-foreground-v1.png"),
  );

  const cleanBase = await sharp(sourcePath)
    .resize(WIDTH, HEIGHT, { fit: "fill" })
    .composite([{ input: cleanSkyLayer, blend: "over" }])
    .png()
    .toBuffer();
  await sharp(cleanBase).toFile(path.join(motionDir, "library-window-motion-base-v1.png"));

  const diagnosticTint = rgbaFromColorAndMask(softGlassMask, 38, 236, 255, 0.48);
  await sharp(sourcePath)
    .resize(WIDTH, HEIGHT, { fit: "fill" })
    .composite([
      {
        input: diagnosticTint,
        raw: { width: WIDTH, height: HEIGHT, channels: 4 },
        blend: "over",
      },
    ])
    .png()
    .toFile(path.join(motionDir, "library-window-mask-diagnostic-v1.png"));

  const bolt = await sharp(lightningAtlasPath)
    .extract({ left: 1024, top: 0, width: 512, height: 512 })
    .resize(265, 430, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .linear(0.58)
    .png()
    .toBuffer();
  const boltCanvas = await sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: bolt, left: 1368, top: 28 }])
    .png()
    .toBuffer();
  const clippedBolt = await sharp(boltCanvas)
    .composite([
      {
        input: rgbaFromColorAndMask(softGlassMask, 255, 255, 255),
        raw: { width: WIDTH, height: HEIGHT, channels: 4 },
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  await sharp(cleanBase)
    .composite([
      { input: clippedBolt, blend: "screen" },
      { input: foregroundLayer, blend: "over" },
    ])
    .png()
    .toFile(path.join(motionDir, "library-window-layered-preview-v1.png"));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
