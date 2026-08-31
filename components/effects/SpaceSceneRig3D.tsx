"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type LightSpec = {
  center: readonly [number, number];
  size: readonly [number, number];
  color: number;
  phase: number;
  intensity?: number;
};

type SparkSpec = {
  center: readonly [number, number];
  color: number;
  phase: number;
  period: number;
  direction: readonly [number, number];
};

type SteamSpec = {
  center: readonly [number, number];
  direction: readonly [number, number];
  count: number;
  color: number;
  opacity: number;
  speed: number;
  size: number;
  distance: number;
};

type ScenePoint = readonly [number, number];
type SceneQuad = readonly [ScenePoint, ScenePoint, ScenePoint, ScenePoint];

type HologramSpec = {
  corners: SceneQuad;
  color: number;
  phase: number;
};

type TexturedHologramSpec = {
  center: readonly [number, number];
  size: readonly [number, number];
  texture: string;
  phase: number;
  glitchInterval?: number;
  glitchVariance?: number;
};

type ServerRackSpec = {
  corners: SceneQuad;
  rows: number;
  columns: number;
  phase: number;
};

const LIGHTS: Partial<Record<string, readonly LightSpec[]>> = {
  spaceOxygenGenerator: [
    { center: [0.18, 0.52], size: [0.055, 0.06], color: 0x42bfff, phase: 0.7, intensity: 0.12 },
    { center: [0.65, 0.48], size: [0.035, 0.05], color: 0x46c8d9, phase: 1.9, intensity: 0.1 },
    { center: [0.86, 0.38], size: [0.05, 0.1], color: 0xf0a34f, phase: 2.8, intensity: 0.09 }
  ],
  spaceScienceLab: [
    { center: [0.52, 0.33], size: [0.25, 0.12], color: 0x55bfff, phase: 0.6, intensity: 0.08 },
    { center: [0.61, 0.56], size: [0.07, 0.18], color: 0xbbeaff, phase: 1.9, intensity: 0.1 },
    { center: [0.92, 0.32], size: [0.1, 0.16], color: 0x7ac8ff, phase: 2.7, intensity: 0.075 }
  ]
};

const STEAM: Partial<Record<string, readonly SteamSpec[]>> = {
  spaceOxygenGenerator: [
    { center: [0.472, 0.583], direction: [-0.72, -0.34], count: 58, color: 0xd7e2e7, opacity: 0.105, speed: 0.52, size: 48, distance: 1.52 },
    { center: [0.758, 0.588], direction: [0.55, -0.42], count: 48, color: 0xcbd9df, opacity: 0.095, speed: 0.46, size: 44, distance: 1.34 },
    { center: [0.702, 0.205], direction: [-0.42, -0.18], count: 34, color: 0xd2dde2, opacity: 0.078, speed: 0.39, size: 38, distance: 0.86 }
  ]
};

const SPARKS: Partial<Record<string, readonly SparkSpec[]>> = {
  spaceOxygenGenerator: [
    { center: [0.455, 0.555], color: 0xffb164, phase: 2.2, period: 7.8, direction: [-0.45, 0.7] },
    { center: [0.646, 0.465], color: 0x75dfff, phase: 5.6, period: 10.2, direction: [0.65, 0.4] }
  ],
  spaceScienceLab: [
    { center: [0.575, 0.52], color: 0xa6e7ff, phase: 3.5, period: 12.6, direction: [0.55, 0.6] }
  ]
};

const HOLOGRAMS: Partial<Record<string, readonly HologramSpec[]>> = {
  spaceScienceLab: [
    { corners: [[0.437, 0.202], [0.518, 0.21], [0.518, 0.31], [0.438, 0.301]], color: 0x79cfff, phase: 0.4 },
    { corners: [[0.397, 0.297], [0.462, 0.302], [0.462, 0.402], [0.396, 0.395]], color: 0x82dcff, phase: 4.7 },
    { corners: [[0.622, 0.242], [0.69, 0.243], [0.688, 0.4], [0.623, 0.395]], color: 0x6ec8ff, phase: 2.1 },
    { corners: [[0.695, 0.219], [0.797, 0.217], [0.798, 0.403], [0.693, 0.397]], color: 0x72ceff, phase: 3.6 }
  ]
};

const DATA_HOLOGRAM_ROOT = "/assets/space-station/effects/data-core-holograms";
const MEDICAL_HOLOGRAM_ROOT = "/assets/space-station/effects/medical-bay-holograms";

const TEXTURED_HOLOGRAMS: Partial<Record<string, readonly TexturedHologramSpec[]>> = {
  spaceMedicalBay: [
    { center: [0.435108, 0.453241], size: [0.047249, 0.071201], texture: `${MEDICAL_HOLOGRAM_ROOT}/medical-hologram-m1-v1.png`, phase: 0.9, glitchInterval: 2.9, glitchVariance: 0.8 },
    { center: [0.479964, 0.452179], size: [0.035287, 0.071201], texture: `${MEDICAL_HOLOGRAM_ROOT}/medical-hologram-m2-v1.png`, phase: 2.8, glitchInterval: 2.9, glitchVariance: 0.8 },
    { center: [0.512859, 0.451647], size: [0.034091, 0.072264], texture: `${MEDICAL_HOLOGRAM_ROOT}/medical-hologram-m3-v1.png`, phase: 5.1, glitchInterval: 2.9, glitchVariance: 0.8 }
  ],
  spaceDataCore: [
    { center: [0.440789, 0.227949], size: [0.068182, 0.079702], texture: `${DATA_HOLOGRAM_ROOT}/data-hologram-d1-v1.png`, phase: 0.3, glitchInterval: 2.9, glitchVariance: 0.8 },
    { center: [0.517644, 0.252391], size: [0.04366, 0.06695], texture: `${DATA_HOLOGRAM_ROOT}/data-hologram-d2-v1.png`, phase: 1.4, glitchInterval: 2.9, glitchVariance: 0.8 },
    { center: [0.615431, 0.225824], size: [0.078947, 0.075452], texture: `${DATA_HOLOGRAM_ROOT}/data-hologram-d3-v1.png`, phase: 2.7, glitchInterval: 2.9, glitchVariance: 0.8 },
    { center: [0.427333, 0.350159], size: [0.086722, 0.105207], texture: `${DATA_HOLOGRAM_ROOT}/data-hologram-d4-v1.png`, phase: 3.8, glitchInterval: 2.9, glitchVariance: 0.8 },
    { center: [0.538876, 0.321467], size: [0.07177, 0.109458], texture: `${DATA_HOLOGRAM_ROOT}/data-hologram-d5-v1.png`, phase: 5.1, glitchInterval: 2.9, glitchVariance: 0.8 },
    { center: [0.658493, 0.316684], size: [0.087321, 0.121148], texture: `${DATA_HOLOGRAM_ROOT}/data-hologram-d6-v1.png`, phase: 6.3, glitchInterval: 2.9, glitchVariance: 0.8 },
    { center: [0.419856, 0.465994], size: [0.045455, 0.079702], texture: `${DATA_HOLOGRAM_ROOT}/data-hologram-d7-v1.png`, phase: 7.4, glitchInterval: 2.9, glitchVariance: 0.8 },
    { center: [0.680024, 0.420829], size: [0.063397, 0.085016], texture: `${DATA_HOLOGRAM_ROOT}/data-hologram-d10-v1.png`, phase: 11.3, glitchInterval: 2.9, glitchVariance: 0.8 }
  ]
};

const SERVER_LED_RACKS: Partial<Record<string, readonly ServerRackSpec[]>> = {
  spaceDataCore: [
    { corners: [[0.002, 0.205], [0.029, 0.208], [0.028, 0.525], [0.002, 0.522]], rows: 10, columns: 2, phase: 0.4 },
    { corners: [[0.048, 0.205], [0.105, 0.208], [0.101, 0.534], [0.046, 0.528]], rows: 12, columns: 3, phase: 1.3 },
    { corners: [[0.116, 0.205], [0.169, 0.208], [0.165, 0.53], [0.112, 0.528]], rows: 12, columns: 3, phase: 2.2 },
    { corners: [[0.742, 0.242], [0.784, 0.241], [0.781, 0.526], [0.743, 0.527]], rows: 11, columns: 3, phase: 5.2 },
    { corners: [[0.948, 0.237], [0.997, 0.239], [0.994, 0.52], [0.948, 0.519]], rows: 11, columns: 3, phase: 6.4 }
  ]
};

function uvToWorld(point: readonly [number, number], z = 0.24) {
  return new THREE.Vector3((point[0] - 0.5) * 16, (0.5 - point[1]) * 9, z);
}

function makeSteam(specs: readonly SteamSpec[]) {
  const group = new THREE.Group();
  specs.forEach((spec, zoneIndex) => {
    const positions = new Float32Array(spec.count * 3);
    const seeds = new Float32Array(spec.count);
    for (let index = 0; index < spec.count; index += 1) {
      const wave = Math.sin((index + 1) * 78.233 + zoneIndex * 19.17) * 43758.5453;
      const seed = wave - Math.floor(wave);
      positions[index * 3] = (spec.center[0] - 0.5) * 16 + (seed - 0.5) * 0.018;
      positions[index * 3 + 1] = (0.5 - spec.center[1]) * 9 + Math.sin(seed * 41) * 0.009;
      positions[index * 3 + 2] = 0.34 + seed * 0.11;
      seeds[index] = seed;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("seed", new THREE.BufferAttribute(seeds, 1));
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(spec.color) },
        alpha: { value: spec.opacity },
        speed: { value: spec.speed },
        pointSize: { value: spec.size },
        direction: { value: new THREE.Vector2(spec.direction[0], -spec.direction[1]).normalize() },
        distance: { value: spec.distance }
      },
      vertexShader: `
        attribute float seed;
        uniform float time;
        uniform float speed;
        uniform float pointSize;
        uniform float distance;
        uniform vec2 direction;
        varying float vLife;
        varying float vSeed;
        void main() {
          float life = fract(seed + time * speed * .18);
          vec2 normal = vec2(-direction.y, direction.x);
          float turbulence = sin(life * 11.0 + seed * 47.0 + time * .31) * (.018 + life * .13);
          vec3 p = position;
          p.xy += direction * life * distance;
          p.xy += normal * turbulence;
          p.y += sin(life * 5.0 + seed * 31.0) * life * .045;
          p.z += sin(seed * 29.0 + life * 5.0) * .026;
          vLife = life;
          vSeed = seed;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = pointSize * (.34 + life * 1.28) * (.74 + seed * .52);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float alpha;
        varying float vLife;
        varying float vSeed;
        void main() {
          vec2 p = gl_PointCoord - .5;
          p.x += sin(p.y * 8.0 + vSeed * 29.0) * .052;
          vec2 p2 = p + vec2(sin(vSeed * 31.0) * .12, cos(vSeed * 19.0) * .09);
          vec2 p3 = p - vec2(cos(vSeed * 23.0) * .1, sin(vSeed * 37.0) * .1);
          float body = smoothstep(.48, .07, length(p));
          body = max(body * .72, smoothstep(.35, .055, length(p2)) * .5);
          body = max(body, smoothstep(.31, .05, length(p3)) * .42);
          float pores = .78 + .22 * sin((p.x * 17.0 + p.y * 23.0) + vSeed * 53.0);
          float jet = smoothstep(0.0, .07, vLife) * (1.0 - smoothstep(.7, 1.0, vLife));
          float pulse = .7 + .3 * sin(vSeed * 41.0 + vLife * 15.0);
          gl_FragColor = vec4(color, body * pores * jet * pulse * alpha);
        }
      `
    });
    const points = new THREE.Points(geometry, material);
    points.userData.material = material;
    group.add(points);
  });
  return group;
}

function makeSparks(specs: readonly SparkSpec[]) {
  const group = new THREE.Group();
  specs.forEach((spec, zoneIndex) => {
    const count = 22 + zoneIndex * 4;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let index = 0; index < count; index += 1) {
      const seed = ((index * 37 + zoneIndex * 19) % count) / count;
      positions[index * 3] = (seed - 0.5) * 0.035;
      positions[index * 3 + 1] = Math.sin(seed * 31) * 0.025;
      seeds[index] = seed;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("seed", new THREE.BufferAttribute(seeds, 1));
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(spec.color) },
        phase: { value: spec.phase },
        period: { value: spec.period },
        direction: { value: new THREE.Vector2(spec.direction[0], -spec.direction[1]) }
      },
      vertexShader: `
        attribute float seed;
        uniform float time;
        uniform float phase;
        uniform float period;
        uniform vec2 direction;
        varying float vAlpha;
        void main() {
          float cycle = mod(time + phase + seed * .08, period);
          float burst = 1.0 - step(.52, cycle);
          float life = clamp(cycle / .52, 0.0, 1.0);
          float distance = (.08 + seed * .38) * life;
          vec3 p = position;
          p.xy += normalize(direction + vec2((seed - .5) * .7, sin(seed * 43.) * .25)) * distance;
          p.y -= life * life * .19;
          vAlpha = burst * sin(life * 3.14159) * (.45 + seed * .55);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = burst * (2.2 + seed * 2.8) * (1.0 - life * .48);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float vAlpha;
        void main() {
          float dotShape = smoothstep(.5, .05, length(gl_PointCoord - .5));
          gl_FragColor = vec4(color, dotShape * vAlpha);
        }
      `
    });
    const points = new THREE.Points(geometry, material);
    points.position.copy(uvToWorld(spec.center, 0.5));
    points.userData.material = material;
    group.add(points);
  });
  return group;
}

function makeHolograms(specs: readonly HologramSpec[]) {
  const group = new THREE.Group();
  specs.forEach((spec) => {
    const [topLeft, topRight, bottomRight, bottomLeft] = spec.corners;
    const rows = 18;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let row = 0; row <= rows; row += 1) {
      const progress = row / rows;
      const left = uvToWorld([
        THREE.MathUtils.lerp(topLeft[0], bottomLeft[0], progress),
        THREE.MathUtils.lerp(topLeft[1], bottomLeft[1], progress)
      ], 0.42);
      const right = uvToWorld([
        THREE.MathUtils.lerp(topRight[0], bottomRight[0], progress),
        THREE.MathUtils.lerp(topRight[1], bottomRight[1], progress)
      ], 0.42);

      positions.push(left.x, left.y, left.z, right.x, right.y, right.z);
      uvs.push(0, 1 - progress, 1, 1 - progress);

      if (row < rows) {
        const offset = row * 2;
        indices.push(offset, offset + 2, offset + 1, offset + 2, offset + 3, offset + 1);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        time: { value: 0 },
        phase: { value: spec.phase },
        color: { value: new THREE.Color(spec.color) }
      },
      vertexShader: `
        uniform float time;
        uniform float phase;
        varying vec2 vUv;
        varying float vSlice;
        float hash(float n) { return fract(sin(n) * 43758.5453123); }
        void main() {
          vUv = uv;
          vec3 p = position;
          float row = floor(uv.y * 18.0);
          float burst = 1.0 - step(.16, mod(time * .37 + phase, 5.9));
          float slice = (hash(row + floor(time * 11.0) + phase * 17.0) - .5) * .08 * burst;
          vSlice = abs(slice);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float phase;
        uniform vec3 color;
        varying vec2 vUv;
        varying float vSlice;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        void main() {
          float scanline = pow(max(0.0, sin((vUv.y + time * .045) * 260.0)), 13.0);
          float burst = 1.0 - step(.2, mod(time * .37 + phase, 5.9));
          float noise = hash(vec2(floor(vUv.x * 90.0), floor(vUv.y * 54.0) + floor(time * 15.0)));
          float tear = burst * step(.74, noise) * (.35 + vSlice * 8.0);
          float edge = smoothstep(0.0, .08, vUv.x) * smoothstep(0.0, .08, 1.0 - vUv.x) * smoothstep(0.0, .08, vUv.y) * smoothstep(0.0, .08, 1.0 - vUv.y);
          float refresh = pow(max(0.0, 1.0 - abs(fract(vUv.y - time * .12 - phase * .07) - .5) * 12.0), 3.0);
          float carrier = .014 + .009 * sin(time * .83 + phase * 3.0);
          float alpha = edge * (carrier + scanline * .055 + refresh * .085 + tear * .2);
          gl_FragColor = vec4(color, alpha);
        }
      `
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.material = material;
    group.add(mesh);
  });
  return group;
}

function makeTexturedHolograms(specs: readonly TexturedHologramSpec[], renderer: THREE.WebGLRenderer) {
  const group = new THREE.Group();
  const textureLoader = new THREE.TextureLoader();
  const maxAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  specs.forEach((spec) => {
    const texture = textureLoader.load(spec.texture);
    texture.colorSpace = THREE.NoColorSpace;
    texture.anisotropy = maxAnisotropy;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      uniforms: {
        map: { value: texture },
        time: { value: 0 },
        phase: { value: spec.phase },
        glitchInterval: { value: spec.glitchInterval ?? 7.2 },
        glitchVariance: { value: spec.glitchVariance ?? 2.1 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform float time;
        uniform float phase;
        uniform float glitchInterval;
        uniform float glitchVariance;
        varying vec2 vUv;

        float hash(float n) {
          return fract(sin(n) * 43758.5453123);
        }

        void main() {
          float cycle = mod(time + phase * 1.73, glitchInterval + hash(phase) * glitchVariance);
          float burst = 1.0 - smoothstep(0.12, 0.22, cycle);
          float row = floor(vUv.y * 78.0);
          float rowNoise = hash(row * 4.17 + floor(time * 23.0) + phase * 31.0);
          float tearMask = burst * step(0.78, rowNoise);
          float tear = (rowNoise - 0.5) * 0.028 * tearMask;
          vec2 sampleUv = vec2(vUv.x + tear, vUv.y);
          float inside = step(0.0, sampleUv.x) * step(sampleUv.x, 1.0);
          vec4 baseTexel = texture2D(map, vUv);
          vec4 shiftedTexel = texture2D(map, clamp(sampleUv, 0.0, 1.0));
          vec4 texel = mix(baseTexel, shiftedTexel, tearMask);

          float scan = 0.94 + 0.06 * sin((vUv.y * 620.0) - time * 9.0 + phase);
          float refreshPosition = fract(time * 0.085 + phase * 0.137);
          float refresh = 1.0 - smoothstep(0.0, 0.024, abs(vUv.y - refreshPosition));
          float dropout = 1.0 - tearMask * step(0.54, hash(row + phase * 13.0)) * 0.52;
          float signalBreath = 0.98 + 0.02 * sin(time * 0.83 + phase * 2.7);
          float idleSignal = 0.025 + 0.012 * sin(time * 0.83 + phase * 2.7);
          float burstSignal = tearMask * dropout * 0.42;
          float refreshSignal = refresh * 0.12;
          float alpha = texel.a * inside * scan * (idleSignal + burstSignal + refreshSignal) * signalBreath;
          vec3 color = texel.rgb * 1.12 + vec3(0.0, 0.035, 0.075) * refresh;

          gl_FragColor = vec4(color, alpha);
        }
      `
    });

    const geometry = new THREE.PlaneGeometry(spec.size[0] * 16, spec.size[1] * 9);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(uvToWorld(spec.center, 0.44));
    mesh.userData.material = material;
    mesh.userData.texture = texture;
    group.add(mesh);
  });

  return group;
}

function makeServerLeds(specs: readonly ServerRackSpec[], pixelRatio: number) {
  const group = new THREE.Group();

  specs.forEach((spec, rackIndex) => {
    const [topLeft, topRight, bottomRight, bottomLeft] = spec.corners;
    const positions: number[] = [];
    const seeds: number[] = [];
    const phases: number[] = [];
    const sizes: number[] = [];
    const colors: number[] = [];

    for (let row = 0; row < spec.rows; row += 1) {
      for (let column = 0; column < spec.columns; column += 1) {
        const source = Math.sin((rackIndex + 1) * 91.731 + (row + 1) * 37.117 + (column + 1) * 17.913) * 43758.5453;
        const seed = source - Math.floor(source);
        if (seed < 0.38) continue;

        const horizontal = (column + 0.5 + (seed - 0.5) * 0.24) / spec.columns;
        const vertical = (row + 0.5 + (seed - 0.5) * 0.16) / spec.rows;
        const topX = THREE.MathUtils.lerp(topLeft[0], topRight[0], horizontal);
        const topY = THREE.MathUtils.lerp(topLeft[1], topRight[1], horizontal);
        const bottomX = THREE.MathUtils.lerp(bottomLeft[0], bottomRight[0], horizontal);
        const bottomY = THREE.MathUtils.lerp(bottomLeft[1], bottomRight[1], horizontal);
        const point = uvToWorld([
          THREE.MathUtils.lerp(topX, bottomX, vertical),
          THREE.MathUtils.lerp(topY, bottomY, vertical)
        ], 0.49);
        const color = new THREE.Color(seed > 0.87 ? 0xf0a85a : seed > 0.68 ? 0x63dcff : 0x2d8fd5);

        positions.push(point.x, point.y, point.z);
        seeds.push(seed);
        phases.push(spec.phase + row * 0.41 + column * 0.73);
        sizes.push((2.8 + seed * 1.9) * pixelRatio);
        colors.push(color.r, color.g, color.b);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("seed", new THREE.Float32BufferAttribute(seeds, 1));
    geometry.setAttribute("phase", new THREE.Float32BufferAttribute(phases, 1));
    geometry.setAttribute("pointSize", new THREE.Float32BufferAttribute(sizes, 1));
    geometry.setAttribute("ledColor", new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { time: { value: 0 } },
      vertexShader: `
        attribute float seed;
        attribute float phase;
        attribute float pointSize;
        attribute vec3 ledColor;
        uniform float time;
        varying float vAlpha;
        varying vec3 vColor;
        void main() {
          float slow = .5 + .5 * sin(time * (.48 + seed * .72) + phase);
          float packet = smoothstep(.82, .98, .5 + .5 * sin(time * (1.4 + seed * 1.8) + phase * 2.7));
          float gateNoise = fract(sin(floor(time * (.36 + seed * .52)) + phase * 19.17) * 43758.5453);
          float gate = step(.16, gateNoise);
          vAlpha = gate * (.16 + slow * .38 + packet * .38);
          vColor = ledColor;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = pointSize * (.92 + packet * .18);
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        varying vec3 vColor;
        void main() {
          vec2 point = abs(gl_PointCoord - .5);
          float core = (1.0 - smoothstep(.28, .5, point.x)) * (1.0 - smoothstep(.1, .26, point.y));
          float halo = (1.0 - smoothstep(.38, .5, point.x)) * (1.0 - smoothstep(.24, .5, point.y)) * .28;
          gl_FragColor = vec4(vColor, (core + halo) * vAlpha);
        }
      `
    });
    const points = new THREE.Points(geometry, material);
    points.userData.material = material;
    group.add(points);
  });

  return group;
}

function makeCapsuleSpecimen(renderer: THREE.WebGLRenderer) {
  const texture = new THREE.TextureLoader().load("/assets/space-station/effects/science-capsule-specimen-v1.png");
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    color: 0xc6d4dd,
    transparent: true,
    depthWrite: false,
    opacity: 0.9,
    toneMapped: true
  });
  const specimen = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.72), material);
  specimen.position.copy(uvToWorld([0.631, 0.465], 0.46));
  specimen.userData.texture = texture;
  return specimen;
}

function makeCapsuleRefraction() {
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { time: { value: 0 }, color: { value: new THREE.Color(0x9edcff) } },
    vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `
      uniform float time;
      uniform vec3 color;
      varying vec2 vUv;
      void main() {
        vec2 p = vUv - .5;
        float cylinder = smoothstep(.5, .38, abs(p.x)) * smoothstep(.5, .42, abs(p.y));
        float caustic = pow(max(0.0, sin(vUv.y * 42.0 + sin(vUv.x * 17.0 + time * .46) * 2.2 - time * .7)), 14.0);
        float current = .5 + .5 * sin(vUv.y * 13.0 - time * .34 + sin(vUv.x * 8.0));
        float alpha = cylinder * (.012 + caustic * .075 + current * .012);
        gl_FragColor = vec4(color, alpha);
      }
    `
  });
  const liquid = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 2.0), material);
  liquid.position.copy(uvToWorld([0.629, 0.463], 0.435));
  liquid.userData.material = material;
  return liquid;
}

function makeAirlockOriginalComet(renderer: THREE.WebGLRenderer) {
  const group = new THREE.Group();
  const texture = new THREE.TextureLoader().load("/assets/space-station/effects/airlock-comet-black-v2.png");
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const width = 2.02;
  const height = 1.35;
  const pivotUv = new THREE.Vector2(0.073, 0.145);
  const geometry = new THREE.PlaneGeometry(width, height, 128, 72);
  geometry.translate((0.5 - pivotUv.x) * width, (0.5 - pivotUv.y) * height, 0);
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      time: { value: 0 },
      layer: { value: texture }
    },
    vertexShader: `
      uniform float time;
      varying vec2 vUv;
      varying float vTail;
      varying float vAlong;
      void main() {
        vUv = uv;
        vec3 p = position;
        vec2 head = vec2(.073, .145);
        vec2 direction = normalize(vec2(.75, .66));
        vec2 normal = vec2(-direction.y, direction.x);
        float along = max(dot(uv - head, direction), 0.0);
        float tail = smoothstep(.105, .36, along);
        float broadWave = sin(along * 9.0 - time * .5 + uv.y * 2.0);
        float featherWave = sin(along * 23.0 - time * .86 - uv.x * 4.0);
        float depthWave = sin(along * 13.0 - time * .46 + uv.y * 3.0);
        float flex = tail * tail;
        p.xy += normal * flex * (broadWave * .012 + featherWave * .004);
        p.z += flex * depthWave * .05;
        p.xy *= 1.0 + flex * depthWave * .004;
        vTail = tail;
        vAlong = along;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D layer;
      uniform float time;
      varying vec2 vUv;
      varying float vTail;
      varying float vAlong;
      void main() {
        vec2 direction = normalize(vec2(.75, .66));
        float textureWave = sin(vAlong * 15.0 - time * 1.12 + vUv.y * 5.0);
        vec2 flowUv = vUv - direction * vTail * (.0035 + textureWave * .0025);
        vec4 texel = texture2D(layer, flowUv);
        float brightness = max(texel.r, max(texel.g, texel.b));
        float sourceAlpha = smoothstep(.0015, .085, brightness);
        float plasmaFlow = (.5 + .5 * sin(vAlong * 13.0 - time * .9 + vUv.y * 4.0)) * vTail;
        float secondaryFlow = (.5 + .5 * sin(vAlong * 7.0 - time * .54 - vUv.y * 3.0)) * vTail;
        float goldMask = smoothstep(.035, .19, texel.r - texel.b)
          * smoothstep(.02, .16, texel.g - texel.b);
        float goldCurrent = .82 + .18 * sin(vAlong * 9.0 - time * .62);
        vec3 color = texel.rgb * (1.17 + plasmaFlow * .11 + secondaryFlow * .055);
        color *= 1.0 + goldMask * goldCurrent * .11;
        gl_FragColor = vec4(color, sourceAlpha);
      }
    `
  });
  const comet = new THREE.Mesh(geometry, material);
  comet.userData.material = material;
  comet.userData.texture = texture;
  comet.userData.airlockPart = "original-comet-mesh";
  group.add(comet);

  const coreMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { time: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;
      void main(){
        vec2 p=vUv-.5;
        float radius=length(p)*2.0;
        float angle=atan(p.y,p.x);
        float swirl=.5+.5*sin(angle*3.0-radius*17.0+time*.72);
        float inner=1.0-smoothstep(.08,.72,radius);
        float nucleus=1.0-smoothstep(.0,.26,radius);
        float pulse=.985+.015*sin(time*.42);
        vec3 violet=vec3(.47,.12,1.0);
        vec3 cyan=vec3(.35,.82,1.0);
        vec3 color=mix(violet,cyan,swirl*.52+nucleus*.38);
        float alpha=inner*(.26+swirl*.3)*pulse+nucleus*.72;
        gl_FragColor=vec4(color*(1.15+nucleus*.9),alpha);
      }
    `
  });
  const core = new THREE.Mesh(new THREE.PlaneGeometry(0.125, 0.125), coreMaterial);
  core.position.set(0, 0, 0.18);
  core.userData.material = coreMaterial;
  core.userData.airlockPart = "purple-nucleus";
  group.add(core);

  const glowMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { time: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;
      void main(){
        vec2 p=vUv-.5;
        float radial=pow(max(0.0,1.0-length(p)*2.0),2.45);
        float pulse=.985+.015*sin(time*.35);
        vec3 color=mix(vec3(.18,.55,1.0),vec3(.62,.2,1.0),smoothstep(.0,.7,length(p)*2.0));
        gl_FragColor=vec4(color,radial*.24*pulse);
      }
    `
  });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.46), glowMaterial);
  glow.position.z = -0.08;
  glow.userData.material = glowMaterial;
  glow.userData.airlockPart = "comet-light-spill";
  group.add(glow);

  const hazeMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { time: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;
      void main(){
        vec2 p=(vUv-.5)*vec2(1.0,1.6);
        float radius=length(p);
        float ring=1.0-smoothstep(.018,.105,abs(radius-(.26+sin(time*.8)*.018)));
        float flutter=.72+.28*sin(atan(p.y,p.x)*5.0-time*1.7);
        float fade=1.0-smoothstep(.2,.55,radius);
        gl_FragColor=vec4(vec3(.3,.7,1.0),ring*fade*flutter*.065);
      }
    `
  });
  const haze = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.18), hazeMaterial);
  haze.position.set(-0.072, -0.062, 0.13);
  haze.rotation.z = -0.12;
  haze.userData.material = hazeMaterial;
  haze.userData.airlockPart = "head-heat-haze";
  group.add(haze);

  const plumeCount = 220;
  const plumePositions = new Float32Array(plumeCount * 3);
  const plumeProgress = new Float32Array(plumeCount);
  const plumeSeed = new Float32Array(plumeCount);
  const plumeLane = new Float32Array(plumeCount);
  const plumeSize = new Float32Array(plumeCount);
  const random = (value: number) => {
    const result = Math.sin(value * 73.157) * 43758.5453;
    return result - Math.floor(result);
  };

  for (let index = 0; index < plumeCount; index += 1) {
    plumeProgress[index] = (index + random(index + 2.4)) / plumeCount;
    plumeSeed[index] = random(index + 17.2);
    plumeLane[index] = random(index + 41.8) * 2 - 1;
    plumeSize[index] = 18 + random(index + 78.6) * 34;
  }

  const plumeGeometry = new THREE.BufferGeometry();
  plumeGeometry.setAttribute("position", new THREE.BufferAttribute(plumePositions, 3));
  plumeGeometry.setAttribute("progress", new THREE.BufferAttribute(plumeProgress, 1));
  plumeGeometry.setAttribute("seed", new THREE.BufferAttribute(plumeSeed, 1));
  plumeGeometry.setAttribute("lane", new THREE.BufferAttribute(plumeLane, 1));
  plumeGeometry.setAttribute("plumeSize", new THREE.BufferAttribute(plumeSize, 1));

  const plumeMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      time: { value: 0 },
      pixelRatio: { value: renderer.getPixelRatio() }
    },
    vertexShader: `
      attribute float progress;
      attribute float seed;
      attribute float lane;
      attribute float plumeSize;
      uniform float time;
      uniform float pixelRatio;
      varying float vLife;
      varying float vSeed;
      varying float vAge;
      void main() {
        float life = fract(progress + time * (.082 + seed * .026));
        vec2 direction = normalize(vec2(.75, .66));
        vec2 normal = vec2(-direction.y, direction.x);
        float distance = .025 + pow(life, .76) * 1.42;
        float spread = pow(life, .92) * (.035 + seed * .18);
        float curl = sin(life * 11.0 - time * .48 + seed * 12.0) * spread * .42;
        vec3 p = position;
        p.xy += direction * distance + normal * (lane * spread + curl);
        p.z += sin(life * 8.0 + seed * 9.0 - time * .31) * spread * .72;
        float born = smoothstep(.0, .055, life);
        float dispersed = 1.0 - smoothstep(.58, 1.0, life);
        vLife = born * dispersed;
        vSeed = seed;
        vAge = life;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = plumeSize * pixelRatio * (.62 + life * .92);
      }
    `,
    fragmentShader: `
      varying float vLife;
      varying float vSeed;
      varying float vAge;
      void main() {
        vec2 q = gl_PointCoord - .5;
        vec2 r = vec2(q.x * .75 + q.y * .66, -q.x * .66 + q.y * .75);
        float plume = exp(-(r.x * r.x * 14.0 + r.y * r.y * 108.0));
        float fiber = .78 + .22 * sin((r.x + vSeed) * 24.0 - vAge * 8.0);
        vec3 cyan = vec3(.18, .64, 1.0);
        vec3 violet = vec3(.46, .16, .95);
        vec3 color = mix(cyan, violet, smoothstep(.18, .92, vSeed + vAge * .18));
        float alpha = plume * fiber * vLife * (.034 + vSeed * .028);
        gl_FragColor = vec4(color, alpha);
      }
    `
  });
  const plasmaPlume = new THREE.Points(plumeGeometry, plumeMaterial);
  plasmaPlume.position.z = 0.04;
  plasmaPlume.userData.material = plumeMaterial;
  plasmaPlume.userData.airlockPart = "regenerating-plasma-tail";
  group.add(plasmaPlume);

  const ribbonSegments = 56;
  for (let ribbonIndex = 0; ribbonIndex < 10; ribbonIndex += 1) {
    const positions = new Float32Array((ribbonSegments + 1) * 2 * 3);
    const indices: number[] = [];
    for (let segment = 0; segment <= ribbonSegments; segment += 1) {
      const along = segment / ribbonSegments;
      const offset = segment * 6;
      positions[offset] = along;
      positions[offset + 1] = -1;
      positions[offset + 3] = along;
      positions[offset + 4] = 1;
      if (segment < ribbonSegments) {
        const row = segment * 2;
        indices.push(row, row + 1, row + 2, row + 1, row + 3, row + 2);
      }
    }

    const ribbonGeometry = new THREE.BufferGeometry();
    ribbonGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    ribbonGeometry.setIndex(indices);
    const phase = ribbonIndex / 10 + random(ribbonIndex + 112.4) * 0.08;
    const length = 0.82 + random(ribbonIndex + 132.7) * 0.66;
    const width = 0.012 + random(ribbonIndex + 151.3) * 0.026;
    const curve = (random(ribbonIndex + 178.9) * 2 - 1) * 0.2;
    const color = new THREE.Color(ribbonIndex % 3 === 0 ? 0x8c58ff : ribbonIndex % 2 === 0 ? 0x3e8eff : 0x44cfff);
    const ribbonMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        time: { value: 0 },
        phase: { value: phase },
        length: { value: length },
        width: { value: width },
        curve: { value: curve },
        color: { value: color }
      },
      vertexShader: `
        uniform float time;
        uniform float phase;
        uniform float length;
        uniform float width;
        uniform float curve;
        varying float vAlong;
        varying float vSide;
        varying float vReveal;
        varying float vFade;
        void main() {
          float along = position.x;
          float side = position.y;
          float cycle = fract(time * .115 + phase);
          float growth = smoothstep(.0, .34, cycle);
          float fade = 1.0 - smoothstep(.58, 1.0, cycle);
          vec2 direction = normalize(vec2(.75, .66));
          vec2 normal = vec2(-direction.y, direction.x);
          float spread = curve * pow(along, 1.45);
          float turbulence = sin(along * 14.0 - time * .72 + phase * 19.0) * along * .045;
          float taper = mix(.22, 1.0, pow(along, .72));
          vec3 p = vec3(direction * (along * length) + normal * (spread + turbulence + side * width * taper), 0.0);
          p.z = sin(along * 9.0 - time * .43 + phase * 12.0) * along * .09 + side * width * .45;
          vAlong = along;
          vSide = side;
          vReveal = 1.0 - smoothstep(growth - .075, growth + .018, along);
          vFade = fade * smoothstep(.0, .055, cycle);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float phase;
        uniform vec3 color;
        varying float vAlong;
        varying float vSide;
        varying float vReveal;
        varying float vFade;
        void main() {
          float edge = pow(max(0.0, 1.0 - abs(vSide)), 1.65);
          float root = smoothstep(.0, .035, vAlong);
          float tip = 1.0 - smoothstep(.72, 1.0, vAlong);
          float current = .76 + .24 * sin(vAlong * 28.0 - time * 1.3 + phase * 13.0);
          float alpha = edge * root * tip * vReveal * vFade * current * .24;
          gl_FragColor = vec4(color * (1.08 + current * .18), alpha);
        }
      `
    });
    const ribbon = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
    ribbon.position.z = 0.06 + ribbonIndex * 0.002;
    ribbon.userData.material = ribbonMaterial;
    ribbon.userData.airlockPart = "regenerating-tail-ribbon";
    group.add(ribbon);
  }

  group.position.copy(uvToWorld([0.345, 0.345], 0.59));
  group.rotation.set(-0.018, 0.028, 0.01);
  group.userData.airlockPart = "enhanced-original-comet";
  return group;
}

function makeAirlockMeteorWake(renderer: THREE.WebGLRenderer) {
  const group = new THREE.Group();
  const makeRibbon = ({
    length,
    width,
    curve,
    phase,
    opacity,
    startColor,
    endColor,
    z,
    additive = false
  }: {
    length: number;
    width: number;
    curve: number;
    phase: number;
    opacity: number;
    startColor: number;
    endColor: number;
    z: number;
    additive?: boolean;
  }) => {
    const segments = 96;
    const positions = new Float32Array((segments + 1) * 2 * 3);
    const indexes: number[] = [];
    for (let index = 0; index <= segments; index += 1) {
      const t = index / segments;
      const offset = index * 6;
      positions[offset] = t;
      positions[offset + 1] = -1;
      positions[offset + 3] = t;
      positions[offset + 4] = 1;
      if (index < segments) {
        const row = index * 2;
        indexes.push(row, row + 1, row + 2, row + 1, row + 3, row + 2);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setIndex(indexes);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: {
        time: { value: 0 },
        length: { value: length },
        width: { value: width },
        curve: { value: curve },
        phase: { value: phase },
        opacity: { value: opacity },
        startColor: { value: new THREE.Color(startColor) },
        endColor: { value: new THREE.Color(endColor) }
      },
      vertexShader: `
        uniform float time;
        uniform float length;
        uniform float width;
        uniform float curve;
        uniform float phase;
        varying float vAlong;
        varying float vSide;
        void main() {
          float t = position.x;
          float side = position.y;
          float arc = curve * pow(t, 1.38);
          float breathing = .84 + sin(t * 13.0 - time * .36 + phase) * .1
            + sin(t * 31.0 - time * .62 - phase) * .035;
          float halfWidth = mix(.012, width, pow(t, .72)) * breathing;
          vec3 p = vec3(
            t * length,
            arc + side * halfWidth + sin(t * 18.0 - time * .24 + phase) * t * .012,
            side * width * .22 + sin(t * 9.0 + phase) * .025
          );
          vAlong = t;
          vSide = side;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float phase;
        uniform float opacity;
        uniform vec3 startColor;
        uniform vec3 endColor;
        varying float vAlong;
        varying float vSide;
        void main() {
          float edge = pow(max(0.0, 1.0 - abs(vSide)), .72);
          float begin = smoothstep(.008, .055, vAlong);
          float end = 1.0 - smoothstep(.7, 1.0, vAlong);
          float filament = .72 + .28 * pow(.5 + .5 * sin(vAlong * 34.0 - time * .7 + phase + vSide * 8.0), 5.0);
          vec3 color = mix(startColor, endColor, smoothstep(.12, .92, vAlong));
          gl_FragColor = vec4(color * (1.0 + filament * .18), edge * begin * end * filament * opacity);
        }
      `
    });
    const ribbon = new THREE.Mesh(geometry, material);
    ribbon.position.z = z;
    ribbon.userData.material = material;
    ribbon.userData.airlockPart = "tail-ribbon";
    return ribbon;
  };

  const makePlasmaParticles = ({
    count,
    length,
    width,
    curve,
    speed,
    phase,
    opacity,
    color
  }: {
    count: number;
    length: number;
    width: number;
    curve: number;
    speed: number;
    phase: number;
    opacity: number;
    color: number;
  }) => {
    const positions = new Float32Array(count * 3);
    const progress = new Float32Array(count);
    const lateral = new Float32Array(count * 2);
    const seeds = new Float32Array(count);
    const sizes = new Float32Array(count);
    const random = (value: number) => {
      const result = Math.sin(value * 78.233 + phase * 19.17) * 43758.5453;
      return result - Math.floor(result);
    };
    for (let index = 0; index < count; index += 1) {
      progress[index] = (index + random(index + 0.3)) / count;
      lateral[index * 2] = random(index + 11.7) * 2 - 1;
      lateral[index * 2 + 1] = random(index + 29.1) * 2 - 1;
      seeds[index] = random(index + 47.6);
      sizes[index] = 1.4 + random(index + 83.4) * 5.2;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("progress", new THREE.BufferAttribute(progress, 1));
    geometry.setAttribute("lateral", new THREE.BufferAttribute(lateral, 2));
    geometry.setAttribute("seed", new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute("pointSize", new THREE.BufferAttribute(sizes, 1));
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        time: { value: 0 },
        length: { value: length },
        width: { value: width },
        curve: { value: curve },
        speed: { value: speed },
        phase: { value: phase },
        opacity: { value: opacity },
        pixelRatio: { value: renderer.getPixelRatio() },
        color: { value: new THREE.Color(color) }
      },
      vertexShader: `
        attribute float progress;
        attribute vec2 lateral;
        attribute float seed;
        attribute float pointSize;
        uniform float time;
        uniform float length;
        uniform float width;
        uniform float curve;
        uniform float speed;
        uniform float phase;
        uniform float pixelRatio;
        varying float vLife;
        void main() {
          float t = fract(progress + time * speed * (.72 + seed * .42));
          float spread = width * pow(t, .74);
          vec3 p = vec3(
            t * length,
            curve * pow(t, 1.4) + lateral.x * spread,
            lateral.y * spread * .62
          );
          p.y += sin(t * 22.0 - time * .42 + seed * 6.283 + phase) * t * .026;
          p.z += cos(t * 17.0 - time * .31 + seed * 8.2) * t * .035;
          vLife = smoothstep(.015, .085, t) * (1.0 - smoothstep(.7, 1.0, t));
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = pointSize * pixelRatio * (.72 + (1.0 - t) * .5);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float opacity;
        varying float vLife;
        void main() {
          vec2 point = gl_PointCoord - .5;
          float radial = smoothstep(.5, .06, length(point));
          gl_FragColor = vec4(color, radial * vLife * opacity);
        }
      `
    });
    const particles = new THREE.Points(geometry, material);
    particles.userData.material = material;
    particles.userData.airlockPart = "tail-particles";
    return particles;
  };

  group.add(makeRibbon({ length: 2.34, width: 0.12, curve: 0.58, phase: 0.4, opacity: 0.82, startColor: 0xe9fbff, endColor: 0x219dff, z: 0.08, additive: true }));
  group.add(makeRibbon({ length: 2.18, width: 0.34, curve: 0.78, phase: 1.8, opacity: 0.28, startColor: 0xa8eaff, endColor: 0x7254d8, z: -0.05 }));
  group.add(makeRibbon({ length: 2.25, width: 0.25, curve: 0.42, phase: 3.1, opacity: 0.24, startColor: 0x85dfff, endColor: 0x4768c9, z: -0.02 }));
  group.add(makeRibbon({ length: 1.86, width: 0.045, curve: 0.31, phase: 5.2, opacity: 0.34, startColor: 0xfff4cb, endColor: 0xd89b48, z: 0.1, additive: true }));
  group.add(makePlasmaParticles({ count: 780, length: 2.28, width: 0.27, curve: 0.6, speed: 0.022, phase: 0.7, opacity: 0.3, color: 0x75cfff }));
  group.add(makePlasmaParticles({ count: 420, length: 2.05, width: 0.38, curve: 0.76, speed: 0.016, phase: 3.4, opacity: 0.2, color: 0xa78cff }));

  const nucleus = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 32, 24),
    new THREE.MeshBasicMaterial({ color: 0xf3fdff })
  );
  nucleus.scale.set(0.82, 1, 0.82);
  nucleus.userData.airlockPart = "nucleus";
  group.add(nucleus);

  const makeComa = (size: number, color: number, opacity: number, z: number) => {
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(color) },
        opacity: { value: opacity }
      },
      vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        uniform float opacity;
        varying vec2 vUv;
        void main(){
          vec2 p=vUv-.5;
          float halo=pow(max(0.0,1.0-length(p)*2.0),2.35);
          float pulse=.96+sin(time*.72)*.04;
          gl_FragColor=vec4(color,halo*opacity*pulse);
        }
      `
    });
    const coma = new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
    coma.position.z = z;
    coma.userData.material = material;
    coma.userData.airlockPart = "coma";
    return coma;
  };
  group.add(makeComa(0.34, 0x94ddff, 0.62, 0.14));
  group.add(makeComa(0.2, 0xf4fdff, 0.88, 0.16));

  group.position.copy(uvToWorld([0.31, 0.39], 0.59));
  group.rotation.z = 0.035;
  group.userData.airlockPart = "comet-model";

  return group;
}

function addSceneLight(scene: THREE.Scene, light: LightSpec) {
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color(light.color) },
      phase: { value: light.phase },
      intensity: { value: light.intensity ?? 0.1 }
    },
    vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `
      uniform float time;
      uniform float phase;
      uniform float intensity;
      uniform vec3 color;
      varying vec2 vUv;
      void main() {
        vec2 p = (vUv - .5) * 2.;
        float edge = smoothstep(1., .08, length(p));
        float pulse = .72 + .18 * sin(time * 1.7 + phase) + .1 * sin(time * 4.1 + phase * 2.3);
        float line = .8 + .2 * smoothstep(.82, 1., sin((vUv.y + time * .026) * 120.));
        gl_FragColor = vec4(color, edge * pulse * line * intensity);
      }
    `
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(light.size[0] * 16, light.size[1] * 9), material);
  mesh.position.copy(uvToWorld(light.center, 0.2));
  mesh.userData.material = material;
  scene.add(mesh);
}

export default function SpaceSceneRig3D({ sceneId }: { sceneId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasSceneEffects = Boolean(
    LIGHTS[sceneId]?.length ||
    STEAM[sceneId]?.length ||
    SPARKS[sceneId]?.length ||
    HOLOGRAMS[sceneId]?.length ||
    TEXTURED_HOLOGRAMS[sceneId]?.length ||
    SERVER_LED_RACKS[sceneId]?.length ||
    sceneId === "spaceScienceLab"
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = document.getElementById(sceneId);
    const lights = LIGHTS[sceneId] || [];
    if (!canvas || !root || !hasSceneEffects) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-8, 8, 4.5, -4.5, 0.1, 20);
    camera.position.z = 8;

    lights.forEach((light) => addSceneLight(scene, light));
    scene.add(makeSteam(STEAM[sceneId] || []));
    scene.add(makeSparks(SPARKS[sceneId] || []));
    scene.add(makeHolograms(HOLOGRAMS[sceneId] || []));
    scene.add(makeTexturedHolograms(TEXTURED_HOLOGRAMS[sceneId] || [], renderer));
    scene.add(makeServerLeds(SERVER_LED_RACKS[sceneId] || [], renderer.getPixelRatio()));

    const specimen = sceneId === "spaceScienceLab" ? makeCapsuleSpecimen(renderer) : null;
    if (specimen) scene.add(specimen);
    const refraction = sceneId === "spaceScienceLab" ? makeCapsuleRefraction() : null;
    if (refraction) scene.add(refraction);

    let active = root.classList.contains("active");
    let frame = 0;
    const resize = () => {
      const rect = root.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      renderer.setSize(rect.width, rect.height, false);
      const aspect = rect.width / rect.height;
      camera.left = -4.5 * aspect;
      camera.right = 4.5 * aspect;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);
    const observer = new MutationObserver(() => {
      active = root.classList.contains("active");
      resize();
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class", "style"] });
    const motionScale = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0.2 : 1;

    const animate = (now: number) => {
      frame = requestAnimationFrame(animate);
      if (!active) return;
      const seconds = now / 1000 * motionScale;
      scene.traverse((object) => {
        const material = object.userData.material as THREE.ShaderMaterial | undefined;
        if (material?.uniforms.time) material.uniforms.time.value = seconds;
      });
      if (specimen) {
        const anchor = uvToWorld([0.631, 0.465], 0.46);
        specimen.position.set(
          anchor.x + Math.sin(seconds * 0.31) * 0.008,
          anchor.y + Math.sin(seconds * 0.72) * 0.075,
          anchor.z
        );
        specimen.rotation.z = Math.sin(seconds * 0.38) * 0.018;
      }
      renderer.render(scene, camera);
      canvas.dataset.frame = String(Number(canvas.dataset.frame || "0") + 1);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      observer.disconnect();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          const texture = object.userData.texture as THREE.Texture | undefined;
          texture?.dispose();
          object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material)) material.forEach((item) => item.dispose());
          else material.dispose();
        }
      });
      renderer.dispose();
    };
  }, [hasSceneEffects, sceneId]);

  if (!hasSceneEffects) return null;

  return <canvas ref={canvasRef} className="space-scene-rig-3d" aria-hidden="true" data-scene-id={sceneId} />;
}
