import { pathToFileURL } from "node:url";

const [
  sharpModulePath,
  sourcePath,
  cleanBackgroundPath,
  flameTexturePath
] = process.argv.slice(2);

const sharpModule = await import(pathToFileURL(sharpModulePath).href);
const sharp = sharpModule.default;

const sceneWidth = 1672;
const sceneHeight = 941;

// Only the painted flame pixels are borrowed from the edited reference. The
// untouched source remains the plate for every candle body and room detail.
const flameRemovalMask = Buffer.from(`
  <svg width="${sceneWidth}" height="${sceneHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="feather"><feGaussianBlur stdDeviation="0.8" /></filter>
    </defs>
    <g fill="white" filter="url(#feather)">
      <path d="M279 637 C274 627 273 619 276 610 C278 602 282 596 282 588 C287 599 288 610 284 620 C286 628 284 634 279 637 Z" />
      <path d="M1506 409 C1501 401 1501 394 1504 387 C1506 380 1508 375 1507 369 C1512 380 1513 390 1510 398 C1512 403 1510 407 1506 409 Z" />
      <path d="M1565 365 C1560 357 1560 349 1563 342 C1565 335 1567 329 1566 322 C1571 333 1572 344 1569 352 C1571 358 1569 363 1565 365 Z" />
      <path d="M1227 367 C1223 361 1223 355 1225 350 C1227 345 1228 341 1228 337 C1232 345 1232 354 1230 359 C1231 363 1230 366 1227 367 Z" />
      <path d="M1280 309 C1277 304 1277 300 1279 296 C1280 292 1281 289 1281 286 C1284 292 1284 299 1282 303 C1283 306 1282 308 1280 309 Z" />
      <path d="M1299 299 C1296 295 1296 291 1298 287 C1299 284 1300 281 1300 278 C1303 284 1303 290 1301 294 C1302 297 1301 299 1299 299 Z" />
    </g>
  </svg>
`);

const source = await sharp(sourcePath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const repairPixels = Buffer.from(source.data);
const repairRegions = [
  { centerX: 279, top: 586, bottom: 638, halfWidth: 11 },
  { centerX: 1506, top: 367, bottom: 410, halfWidth: 10 },
  { centerX: 1565, top: 320, bottom: 366, halfWidth: 10 },
  { centerX: 1227, top: 335, bottom: 368, halfWidth: 7 },
  { centerX: 1280, top: 284, bottom: 310, halfWidth: 6 },
  { centerX: 1299, top: 276, bottom: 300, halfWidth: 6 }
];

for (const region of repairRegions) {
  const sampleOffset = region.halfWidth + 5;
  const leftSampleX = region.centerX - sampleOffset;
  const rightSampleX = region.centerX + sampleOffset;
  for (let y = region.top; y <= region.bottom; y += 1) {
    for (let x = region.centerX - region.halfWidth; x <= region.centerX + region.halfWidth; x += 1) {
      const blend = (x - (region.centerX - region.halfWidth)) / (region.halfWidth * 2);
      const targetPixel = (y * sceneWidth + x) * 4;
      const leftPixel = (y * sceneWidth + leftSampleX) * 4;
      const rightPixel = (y * sceneWidth + rightSampleX) * 4;
      for (let channel = 0; channel < 3; channel += 1) {
        repairPixels[targetPixel + channel] = Math.round(
          source.data[leftPixel + channel] * (1 - blend) + source.data[rightPixel + channel] * blend
        );
      }
      repairPixels[targetPixel + 3] = 255;
    }
  }
}

const repairedFlames = await sharp(repairPixels, {
  raw: { width: sceneWidth, height: sceneHeight, channels: 4 }
})
  .composite([{ input: flameRemovalMask, blend: "dest-in" }])
  .png()
  .toBuffer();

await sharp(sourcePath)
  .composite([{ input: repairedFlames, blend: "over" }])
  .webp({ quality: 98, effort: 6 })
  .toFile(cleanBackgroundPath);

const flameSource = await sharp(sourcePath)
  .extract({ left: 258, top: 584, width: 42, height: 56 })
  .resize(210, 280, { kernel: "lanczos3" })
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const flamePixels = flameSource.data;
const flameAlpha = Buffer.alloc(flameSource.info.width * flameSource.info.height);

for (let y = 0; y < flameSource.info.height; y += 1) {
  for (let x = 0; x < flameSource.info.width; x += 1) {
    const pixel = (y * flameSource.info.width + x) * 3;
    const red = flamePixels[pixel];
    const green = flamePixels[pixel + 1];
    const blue = flamePixels[pixel + 2];
    const warmLight = Math.max(0, red - blue * 0.34) + Math.max(0, green - blue * 0.5) * 0.32;
    const normalizedX = Math.abs(x / flameSource.info.width - 0.5) / 0.5;
    const normalizedY = y / flameSource.info.height;
    const horizontalEnvelope = Math.max(0, 1 - Math.pow(normalizedX / 0.68, 4));
    const verticalEnvelope = Math.min(1, Math.max(0, (normalizedY - 0.02) / 0.12))
      * Math.min(1, Math.max(0, (1 - normalizedY) / 0.13));
    const keyed = Math.min(1, Math.max(0, (warmLight - 72) / 185));
    flameAlpha[y * flameSource.info.width + x] = Math.round(255 * keyed * horizontalEnvelope * verticalEnvelope);
  }
}

await sharp(flamePixels, {
  raw: {
    width: flameSource.info.width,
    height: flameSource.info.height,
    channels: 3
  }
})
  .joinChannel(flameAlpha, {
    raw: {
      width: flameSource.info.width,
      height: flameSource.info.height,
      channels: 1
    }
  })
  .webp({ quality: 98, alphaQuality: 100, effort: 6 })
  .toFile(flameTexturePath);

console.log(JSON.stringify({ cleanBackgroundPath, flameTexturePath }));
