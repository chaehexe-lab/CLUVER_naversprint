"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type OrbSpec = {
  center: readonly [number, number];
  radius: number;
  evidenceName: string;
  color: number;
};

type Rect = readonly [number, number, number, number];

type LightningSpec = {
  bounds: Rect;
  panes: readonly Rect[];
  interval: readonly [number, number];
  mask: string;
};

type ResidueSpec = {
  center: readonly [number, number];
  size: readonly [number, number];
  evidenceName?: string;
  opacity: number;
  rotation?: number;
  phase?: number;
};

type MagicSceneSpec = {
  orb?: OrbSpec;
  lightning?: LightningSpec;
  residues?: readonly ResidueSpec[];
  motes: readonly {
    center: readonly [number, number];
    spread: readonly [number, number];
    count: number;
    color: number;
  }[];
  wisps: readonly {
    center: readonly [number, number];
    spread: readonly [number, number];
    count: number;
    color: number;
    rise: number;
    opacity: number;
    size: number;
    evidenceName?: string;
  }[];
};

const SCENES: Record<string, MagicSceneSpec> = {
  magicAlchemyLab: {
    orb: { center: [0.758, 0.774], radius: 0.34, evidenceName: "기록의 수정구", color: 0xb06cff },
    lightning: {
      bounds: [0.102, 0.012, 0.345, 0.39],
      interval: [3.4, 7.4],
      mask: "/samunmong/assets/magic-school/effects/alchemy-lab-window-glass-mask-v2.png",
      panes: [
        [0.112, 0.032, 0.044, 0.105], [0.164, 0.032, 0.046, 0.105],
        [0.112, 0.151, 0.044, 0.108], [0.164, 0.151, 0.046, 0.108],
        [0.112, 0.273, 0.044, 0.105], [0.164, 0.273, 0.046, 0.105],
        [0.302, 0.031, 0.052, 0.106], [0.363, 0.031, 0.057, 0.106],
        [0.302, 0.151, 0.052, 0.108], [0.363, 0.151, 0.057, 0.108],
        [0.302, 0.273, 0.052, 0.104], [0.363, 0.273, 0.057, 0.104]
      ]
    },
    residues: [
      { center: [0.285, 0.672], size: [0.225, 0.12], evidenceName: "화염 감지 룬스톤", opacity: 0.17, phase: 0.4 },
      { center: [0.568, 0.795], size: [0.145, 0.062], evidenceName: "부러진 지팡이", opacity: 0.12, rotation: -0.16, phase: 1.7 },
      { center: [0.758, 0.78], size: [0.135, 0.073], evidenceName: "기록의 수정구", opacity: 0.13, phase: 2.8 }
    ],
    motes: [
      { center: [0.55, 0.58], spread: [0.44, 0.42], count: 34, color: 0xf09a5b },
      { center: [0.75, 0.76], spread: [0.14, 0.12], count: 24, color: 0xa66cff }
    ],
    wisps: [
      { center: [0.49, 0.48], spread: [0.16, 0.12], count: 34, color: 0x6c75a0, rise: 0.62, opacity: 0.13, size: 34 },
      { center: [0.77, 0.47], spread: [0.1, 0.08], count: 22, color: 0x8356b4, rise: 0.42, opacity: 0.1, size: 24 }
    ]
  },
  magicCleaningCloset: {
    residues: [],
    motes: [],
    wisps: []
  },
  magicLibrary: {
    lightning: {
      bounds: [0.58, 0.015, 0.385, 0.5],
      interval: [4.1, 8.6],
      mask: "/samunmong/assets/magic-school/effects/library-window-glass-mask-v2.png",
      panes: [
        [0.596, 0.06, 0.031, 0.17], [0.638, 0.06, 0.031, 0.17], [0.596, 0.244, 0.031, 0.242], [0.638, 0.244, 0.031, 0.242],
        [0.716, 0.052, 0.035, 0.18], [0.762, 0.052, 0.034, 0.18], [0.716, 0.246, 0.035, 0.238], [0.762, 0.246, 0.034, 0.238],
        [0.842, 0.054, 0.041, 0.18], [0.895, 0.054, 0.042, 0.18], [0.842, 0.248, 0.041, 0.234], [0.895, 0.248, 0.042, 0.234]
      ]
    },
    residues: [
      { center: [0.61, 0.756], size: [0.235, 0.105], evidenceName: "빙결 흔적이 남은 반납 도서", opacity: 0.13, rotation: -0.08, phase: 0.8 },
      { center: [0.245, 0.765], size: [0.34, 0.12], evidenceName: "도서관 대출 기록부", opacity: 0.075, phase: 2.2 }
    ],
    motes: [
      { center: [0.26, 0.58], spread: [0.36, 0.32], count: 32, color: 0x70b9ff },
      { center: [0.62, 0.5], spread: [0.3, 0.32], count: 22, color: 0xb58bff }
    ],
    wisps: [
      { center: [0.595, 0.73], spread: [0.14, 0.035], count: 38, color: 0x5f9fca, rise: 0.36, opacity: 0.12, size: 22 }
    ]
  },
  magicRecordCrystalRoom: {
    orb: { center: [0.507, 0.352], radius: 1.5, evidenceName: "조작된 기록 수정구", color: 0xb05cff },
    lightning: {
      bounds: [0.055, 0.035, 0.89, 0.43],
      interval: [4.5, 9.2],
      mask: "/samunmong/assets/magic-school/effects/record-crystal-room-window-glass-mask-v2.png",
      panes: [
        [0.074, 0.106, 0.041, 0.26], [0.124, 0.106, 0.041, 0.26],
        [0.202, 0.076, 0.042, 0.29], [0.253, 0.076, 0.042, 0.29],
        [0.335, 0.064, 0.04, 0.29], [0.383, 0.064, 0.04, 0.29],
        [0.584, 0.064, 0.04, 0.29], [0.632, 0.064, 0.04, 0.29],
        [0.708, 0.076, 0.042, 0.29], [0.759, 0.076, 0.042, 0.29],
        [0.836, 0.106, 0.041, 0.26], [0.886, 0.106, 0.041, 0.26]
      ]
    },
    residues: [],
    motes: [
      { center: [0.5, 0.43], spread: [0.42, 0.48], count: 70, color: 0xba70ff },
      { center: [0.5, 0.68], spread: [0.42, 0.16], count: 30, color: 0x7d5cff }
    ],
    wisps: [
      { center: [0.505, 0.47], spread: [0.22, 0.12], count: 64, color: 0x9d62d1, rise: 0.55, opacity: 0.11, size: 30 }
    ]
  },
  magicDormHallway: {
    lightning: {
      bounds: [0.0, 0.012, 0.115, 0.45],
      interval: [3.8, 8.1],
      mask: "/samunmong/assets/magic-school/effects/dorm-hallway-window-glass-mask-v2.png",
      panes: [
        [0.008, 0.046, 0.021, 0.098], [0.036, 0.046, 0.021, 0.098], [0.064, 0.046, 0.021, 0.098],
        [0.008, 0.162, 0.021, 0.105], [0.036, 0.162, 0.021, 0.105], [0.064, 0.162, 0.021, 0.105],
        [0.008, 0.286, 0.021, 0.13], [0.036, 0.286, 0.021, 0.13], [0.064, 0.286, 0.021, 0.13]
      ]
    },
    residues: [
      { center: [0.588, 0.812], size: [0.16, 0.066], evidenceName: "버려진 지팡이 조각", opacity: 0.13, rotation: -0.08, phase: 1.1 }
    ],
    motes: [{ center: [0.58, 0.78], spread: [0.18, 0.12], count: 24, color: 0xb14c63 }],
    wisps: [
      { center: [0.595, 0.79], spread: [0.075, 0.025], count: 34, color: 0x8f3f58, rise: 0.42, opacity: 0.12, size: 20, evidenceName: "버려진 지팡이 조각" }
    ]
  }
};

function uvToWorld(point: readonly [number, number], z = 0.2) {
  return new THREE.Vector3((point[0] - 0.5) * 16, (0.5 - point[1]) * 9, z);
}

function makeMaskedSceneGeometry() {
  const positions: number[] = [];
  const sceneUvs: number[] = [];
  const indices: number[] = [];
  positions.push(-8, -4.5, 0, 8, -4.5, 0, 8, 4.5, 0, -8, 4.5, 0);
  sceneUvs.push(0, 1, 1, 1, 1, 0, 0, 0);
  indices.push(0, 1, 2, 0, 2, 3);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("sceneUv", new THREE.Float32BufferAttribute(sceneUvs, 2));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

function makeWindowLightning(spec: LightningSpec, renderer: THREE.WebGLRenderer) {
  const loader = new THREE.TextureLoader();
  const textures = [
    loader.load("/samunmong/assets/magic-school/effects/lightning-bolt-a-v1.webp"),
    loader.load("/samunmong/assets/magic-school/effects/lightning-bolt-b-v1.webp")
  ];
  textures.forEach((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
  });
  const maskTexture = loader.load(spec.mask);
  maskTexture.colorSpace = THREE.NoColorSpace;
  maskTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  maskTexture.minFilter = THREE.LinearMipmapLinearFilter;
  maskTexture.magFilter = THREE.LinearFilter;

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      map: { value: textures[0] },
      maskMap: { value: maskTexture },
      bounds: { value: new THREE.Vector4(...spec.bounds) },
      intensity: { value: 0 },
      transform: { value: new THREE.Vector4(1, 1, 0, 0) },
      tint: { value: new THREE.Color(0x8c74d6) }
    },
    vertexShader: `
      attribute vec2 sceneUv;
      varying vec2 vSceneUv;
      void main() {
        vSceneUv = sceneUv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform sampler2D maskMap;
      uniform vec4 bounds;
      uniform vec4 transform;
      uniform float intensity;
      uniform vec3 tint;
      varying vec2 vSceneUv;
      void main() {
        vec2 localUv = (vSceneUv - bounds.xy) / bounds.zw;
        vec2 sampleUv = vec2(localUv.x, 1.0 - localUv.y);
        sampleUv = (sampleUv - .5) * transform.xy + .5 + transform.zw;
        float inside = step(0.0, sampleUv.x) * step(sampleUv.x, 1.0) * step(0.0, sampleUv.y) * step(sampleUv.y, 1.0);
        vec4 bolt = texture2D(map, clamp(sampleUv, 0.0, 1.0));
        float glassMask = texture2D(maskMap, vec2(vSceneUv.x, 1.0 - vSceneUv.y)).r;
        float paneTransmission = smoothstep(.38, .78, glassMask);
        float boltAlpha = bolt.a * inside * intensity * paneTransmission;
        float glassLift = intensity * .075 * paneTransmission;
        vec3 boltColor = mix(tint, bolt.rgb, .78) * (1.0 + intensity * .2);
        gl_FragColor = vec4(boltColor + tint * glassLift, min(1.0, boltAlpha * .92 + glassLift));
      }
    `
  });
  // The color-separated glass mask is the single source of truth. A full-scene
  // quad avoids hard-coded pane rectangles clipping or leaking at frame edges.
  const mesh = new THREE.Mesh(makeMaskedSceneGeometry(), material);
  mesh.position.z = 0.05;
  mesh.userData.material = material;
  mesh.userData.textures = [...textures, maskTexture];
  mesh.userData.spec = spec;
  return mesh;
}

function makeArcaneResidues(specs: readonly ResidueSpec[], renderer: THREE.WebGLRenderer) {
  const group = new THREE.Group();
  if (specs.length === 0) return group;
  const texture = new THREE.TextureLoader().load("/samunmong/assets/magic-school/effects/arcane-residue-ring-v1.webp");
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;

  specs.forEach((spec, index) => {
    const geometry = new THREE.PlaneGeometry(spec.size[0] * 16, spec.size[1] * 9, 18, 8);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        map: { value: texture },
        time: { value: 0 },
        phase: { value: spec.phase ?? index * 1.37 },
        opacity: { value: spec.opacity },
        focus: { value: 0 }
      },
      vertexShader: `
        uniform float time;
        uniform float phase;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          float edge = smoothstep(.16, .92, distance(uv, vec2(.5)) * 1.6);
          p.z += sin(time * .42 + uv.x * 8.0 + phase) * .018 * edge;
          p.y += cos(time * .31 + uv.x * 5.0 + phase) * .008 * edge;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform float time;
        uniform float phase;
        uniform float opacity;
        uniform float focus;
        varying vec2 vUv;
        void main() {
          vec2 uv = vUv;
          uv.x += sin(time * .18 + uv.y * 8.0 + phase) * .003;
          vec4 residue = texture2D(map, uv);
          float pulse = .72 + .18 * sin(time * .7 + phase) + .1 * sin(time * 1.83 + phase * 2.0);
          float focusLift = 1.0 + focus * (1.25 + .18 * sin(time * 3.2 + phase));
          gl_FragColor = vec4(residue.rgb, residue.a * opacity * pulse * focusLift);
        }
      `
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(uvToWorld(spec.center, 0.24 + index * 0.003));
    mesh.rotation.z = spec.rotation ?? 0;
    mesh.userData.material = material;
    mesh.userData.evidenceName = spec.evidenceName;
    group.add(mesh);
  });
  group.userData.texture = texture;
  return group;
}

function makeLightSpell(renderer: THREE.WebGLRenderer) {
  const texture = new THREE.TextureLoader().load("/samunmong/assets/magic-school/effects/arcane-residue-ring-v1.webp");
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const geometry = new THREE.PlaneGeometry(10.6, 3.25, 28, 12);
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { map: { value: texture }, time: { value: 0 }, strength: { value: 0 } },
    vertexShader: `
      uniform float time;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 p = position;
        p.z += sin(uv.x * 9.0 + time * .72) * .045 * sin(uv.y * 3.14159);
        p.y += sin(uv.x * 6.0 + time * .35) * .018;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform float time;
      uniform float strength;
      varying vec2 vUv;
      void main() {
        vec2 uv = vUv;
        uv.x += sin(time * .24 + uv.y * 9.0) * .004;
        vec4 magic = texture2D(map, uv);
        float shimmer = .76 + .24 * sin(time * 1.1 + uv.x * 11.0);
        gl_FragColor = vec4(magic.rgb, magic.a * strength * shimmer);
      }
    `
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(uvToWorld([0.5, 0.49], 0.42));
  mesh.rotation.z = -0.045;
  mesh.userData.material = material;
  mesh.userData.texture = texture;
  return mesh;
}

function makeWisps(spec: MagicSceneSpec["wisps"]) {
  const group = new THREE.Group();
  spec.forEach((zone, zoneIndex) => {
    const positions = new Float32Array(zone.count * 3);
    const seeds = new Float32Array(zone.count);
    for (let index = 0; index < zone.count; index += 1) {
      const seed = (index + 1) * 19.73 + zoneIndex * 47.11;
      const radial = Math.sqrt(((index * 37) % zone.count) / Math.max(1, zone.count - 1));
      positions[index * 3] = (zone.center[0] - 0.5) * 16 + Math.sin(seed * 1.37) * zone.spread[0] * 8 * radial;
      positions[index * 3 + 1] = (0.5 - zone.center[1]) * 9 + Math.cos(seed * 1.11) * zone.spread[1] * 4.5 * radial;
      positions[index * 3 + 2] = 0.08 + Math.sin(seed * 0.73) * 0.16;
      seeds[index] = ((index * 43) % zone.count) / zone.count + (seed % 1) * 0.01;
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
        color: { value: new THREE.Color(zone.color) },
        rise: { value: zone.rise },
        alpha: { value: zone.opacity },
        pointSize: { value: zone.size }
      },
      vertexShader: `
        attribute float seed;
        uniform float time;
        uniform float rise;
        uniform float pointSize;
        varying float vLife;
        varying float vSeed;
        void main() {
          float life = fract(seed + time * (.045 + rise * .025));
          vec3 p = position;
          float curl = sin(life * 9.0 + seed * 31.0 + time * .31);
          p.y += life * rise;
          p.x += curl * (.025 + life * .13) + sin(time * .17 + seed * 17.0) * .025;
          p.z += cos(life * 7.0 + seed * 13.0) * .035;
          vLife = life;
          vSeed = seed;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = pointSize * (.42 + life * .9) * (1.0 + .18 * sin(seed * 43.0));
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float alpha;
        varying float vLife;
        varying float vSeed;
        void main() {
          vec2 p = gl_PointCoord - .5;
          p.x += sin(p.y * 7.0 + vSeed * 19.0) * .045;
          float body = smoothstep(.5, .08, length(p));
          float grain = .82 + .18 * sin((p.x + p.y) * 31.0 + vSeed * 53.0);
          float fade = smoothstep(0.0, .13, vLife) * (1.0 - smoothstep(.62, 1.0, vLife));
          gl_FragColor = vec4(color, body * grain * fade * alpha);
        }
      `
    });
    const points = new THREE.Points(geometry, material);
    points.userData.material = material;
    points.userData.evidenceName = zone.evidenceName;
    group.add(points);
  });
  return group;
}

function makeMotes(spec: MagicSceneSpec["motes"]) {
  const group = new THREE.Group();
  spec.forEach((zone, zoneIndex) => {
    const positions = new Float32Array(zone.count * 3);
    const phases = new Float32Array(zone.count);
    for (let index = 0; index < zone.count; index += 1) {
      const seed = index * 17.37 + zoneIndex * 41.2;
      const x = zone.center[0] + (Math.sin(seed * 2.13) * 0.5) * zone.spread[0];
      const y = zone.center[1] + (Math.cos(seed * 1.71) * 0.5) * zone.spread[1];
      positions[index * 3] = (x - 0.5) * 16;
      positions[index * 3 + 1] = (0.5 - y) * 9;
      positions[index * 3 + 2] = -0.1 + Math.sin(seed) * 0.35;
      phases[index] = seed;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("phase", new THREE.BufferAttribute(phases, 1));
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { time: { value: 0 }, color: { value: new THREE.Color(zone.color) } },
      vertexShader: `
        attribute float phase;
        uniform float time;
        varying float vAlpha;
        void main() {
          vec3 p = position;
          p.y += sin(time * .42 + phase) * .065;
          p.x += cos(time * .28 + phase * 1.7) * .035;
          vAlpha = .22 + .3 * (sin(time * .8 + phase) * .5 + .5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = 2.2 + 2.3 * (sin(phase * 2.0) * .5 + .5);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - .5);
          float alpha = smoothstep(.5, .08, d) * vAlpha;
          gl_FragColor = vec4(color, alpha);
        }
      `
    });
    const points = new THREE.Points(geometry, material);
    points.userData.material = material;
    group.add(points);
  });
  return group;
}

function makeTobaccoSmoke(renderer: THREE.WebGLRenderer) {
  const group = new THREE.Group();
  const texture = new THREE.TextureLoader().load("/samunmong/assets/magic-school/effects/tobacco-smoke-v1.webp");
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  const layers = [
    { width: 1.58, height: 3.16, x: 0.505, y: 0.458, phase: 0.0, opacity: 0.61, tint: 0xb5b99d },
    { width: 1.38, height: 2.92, x: 0.512, y: 0.472, phase: 2.7, opacity: 0.34, tint: 0x79866d }
  ];

  layers.forEach((layer, index) => {
    const geometry = new THREE.PlaneGeometry(layer.width, layer.height, 28, 40);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        map: { value: texture },
        time: { value: 0 },
        motion: { value: 1 },
        phase: { value: layer.phase },
        opacity: { value: layer.opacity },
        tint: { value: new THREE.Color(layer.tint) }
      },
      vertexShader: `
        uniform float time;
        uniform float motion;
        uniform float phase;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          float height = smoothstep(.02, 1.0, uv.y);
          float primary = sin(time * 1.02 + uv.y * 7.4 + phase) * .142;
          float secondary = sin(time * .47 + uv.y * 15.0 + phase * 1.7) * .064;
          p.x += (primary + secondary) * height * motion;
          p.y += (sin(time * .5 + uv.x * 4.0 + phase) * .034 + height * .025) * height * motion;
          p.z += cos(time * .43 + uv.y * 9.0 + phase) * .052 * height * motion;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform float time;
        uniform float motion;
        uniform float phase;
        uniform float opacity;
        uniform vec3 tint;
        varying vec2 vUv;
        void main() {
          vec2 uv = vUv;
          float height = uv.y;
          float curl = sin(height * 8.8 - time * 1.08 + phase) * (.016 + height * .048);
          curl += sin(height * 19.0 - time * .46 + phase * 1.8) * height * .019;
          uv.x += curl * motion;
          uv.y += sin(time * .34 + uv.x * 5.0 + phase) * .008 * height * motion;
          vec4 smoke = texture2D(map, clamp(uv, 0.0, 1.0));
          float baseFade = smoothstep(.01, .09, height);
          float topFade = 1.0 - smoothstep(.78, 1.0, height);
          float travelingBreath = .78 + .22 * sin(height * 14.0 - time * 1.45 + phase);
          float fineBreath = .9 + .1 * sin(height * 31.0 - time * .62 + phase * 2.0);
          vec3 smokeColor = mix(smoke.rgb, smoke.rgb * tint, .42);
          float alpha = smoke.a * baseFade * topFade * travelingBreath * fineBreath * opacity;
          gl_FragColor = vec4(smokeColor, alpha);
        }
      `
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set((layer.x - 0.5) * 16, (0.5 - layer.y) * 9, 0.27 + index * 0.004);
    mesh.userData.material = material;
    group.add(mesh);
  });

  group.userData.evidenceName = "금지된 마법 담배 재";
  group.userData.texture = texture;
  return group;
}

function makeOrb(spec: OrbSpec) {
  const group = new THREE.Group();
  group.position.set((spec.center[0] - 0.5) * 16, (0.5 - spec.center[1]) * 9, 0.2);

  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(spec.radius, 64, 48),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { color: { value: new THREE.Color(spec.color) }, time: { value: 0 } },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vPosition = mv.xyz;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec3 viewDir = normalize(-vPosition);
          float rim = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.2);
          float veil = .5 + .5 * sin(vPosition.y * 5.0 + time * .65 + sin(vPosition.x * 3.0));
          float alpha = rim * .28 + veil * .025;
          gl_FragColor = vec4(color, alpha);
        }
      `
    })
  );
  shell.userData.kind = "shell";
  shell.visible = false;
  group.add(shell);

  const core = new THREE.Group();
  const colors = [spec.color, 0x6edcff, 0xff9b5c];
  colors.forEach((color, index) => {
    const curve = new THREE.CatmullRomCurve3(
      Array.from({ length: 12 }, (_, pointIndex) => {
        const angle = (pointIndex / 12) * Math.PI * 2;
        const radius = spec.radius * (0.48 + index * 0.08 + Math.sin(pointIndex * 2.3) * 0.08);
        return new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius * (0.52 + index * 0.08),
          Math.sin(angle * 2 + index) * spec.radius * 0.23
        );
      }),
      true,
      "catmullrom",
      0.45
    );
    const ribbon = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 72, spec.radius * 0.012, 5, true),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: index === 0 ? 0.34 : 0.2,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    ribbon.rotation.set(index * 0.8, index * 0.55, index * 1.1);
    core.add(ribbon);
  });

  const pointCount = spec.radius > 1 ? 170 : 64;
  const positions = new Float32Array(pointCount * 3);
  for (let index = 0; index < pointCount; index += 1) {
    const t = index / pointCount;
    const angle = t * Math.PI * 18;
    const radius = spec.radius * (0.16 + 0.64 * ((index * 37) % pointCount) / pointCount);
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = Math.sin(angle * 0.71) * radius * 0.7;
    positions[index * 3 + 2] = Math.sin(angle) * radius;
  }
  const pointGeometry = new THREE.BufferGeometry();
  pointGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  core.add(new THREE.Points(pointGeometry, new THREE.PointsMaterial({
    color: 0xd9c4ff,
    size: spec.radius * 0.018,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })));
  core.userData.kind = "core";
  group.add(core);
  return group;
}

export default function MagicSceneRig3D({ sceneId }: { sceneId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = document.getElementById(sceneId);
    const spec = SCENES[sceneId];
    if (!canvas || !root || !spec) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-8, 8, 4.5, -4.5, 0.1, 30);
    camera.position.z = 10;

    const motes = makeMotes(spec.motes);
    scene.add(motes);
    const wisps = makeWisps(spec.wisps);
    scene.add(wisps);
    const orb = spec.orb ? makeOrb(spec.orb) : null;
    if (orb) scene.add(orb);
    const tobaccoSmoke = sceneId === "magicCleaningCloset" ? makeTobaccoSmoke(renderer) : null;
    if (tobaccoSmoke) scene.add(tobaccoSmoke);
    const residues = makeArcaneResidues(spec.residues || [], renderer);
    scene.add(residues);
    const lightning = spec.lightning ? makeWindowLightning(spec.lightning, renderer) : null;
    if (lightning) scene.add(lightning);
    const lightSpell = sceneId === "magicAlchemyLab" ? makeLightSpell(renderer) : null;
    if (lightSpell) scene.add(lightSpell);

    let active = root.classList.contains("active");
    let lightActive = root.classList.contains("light-magic-active");
    let frame = 0;
    let last = performance.now();
    let spellStrength = 0;
    let strikeStart = -10;
    let nextStrike = performance.now() / 1000 + 1.4 + Math.random() * 2.4;
    let targetX = 0;
    let targetY = 0;
    let dragging = false;
    let dragged = false;
    let pointerX = 0;
    let pointerY = 0;
    let focusedEvidence = "";

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
    const classObserver = new MutationObserver(() => {
      active = root.classList.contains("active");
      lightActive = root.classList.contains("light-magic-active");
      resize();
    });
    classObserver.observe(root, { attributes: true, attributeFilter: ["class", "style"] });

    const evidenceButton = spec.orb
      ? root.querySelector<HTMLButtonElement>(`[data-evidence-name="${spec.orb.evidenceName}"]`)
      : null;
    const evidenceButtons = Array.from(root.querySelectorAll<HTMLButtonElement>(".hotspot[data-evidence-name]"));
    const focusBindings = evidenceButtons.flatMap((button) => {
      const evidenceName = button.dataset.evidenceName || "";
      const onEnter = () => { focusedEvidence = evidenceName; };
      const onLeave = () => { if (focusedEvidence === evidenceName) focusedEvidence = ""; };
      button.addEventListener("pointerenter", onEnter);
      button.addEventListener("pointerleave", onLeave);
      button.addEventListener("focus", onEnter);
      button.addEventListener("blur", onLeave);
      return [{ button, type: "pointerenter", listener: onEnter }, { button, type: "pointerleave", listener: onLeave }, { button, type: "focus", listener: onEnter }, { button, type: "blur", listener: onLeave }];
    });
    const isEvidenceCollected = (evidenceName: string) => {
      const hotspot = root.querySelector<HTMLElement>(`[data-evidence-name="${evidenceName}"]`);
      return Boolean(hotspot?.classList.contains("collected") || hotspot?.getAttribute("aria-disabled") === "true");
    };
    const syncEvidenceEffects = () => {
      wisps.children.forEach((child) => {
        const evidenceName = child.userData.evidenceName as string | undefined;
        child.visible = !evidenceName || !isEvidenceCollected(evidenceName);
      });
      if (orb && spec.orb) orb.visible = !isEvidenceCollected(spec.orb.evidenceName);
      if (tobaccoSmoke) tobaccoSmoke.visible = !isEvidenceCollected("금지된 마법 담배 재");
      residues.children.forEach((child) => {
        const evidenceName = child.userData.evidenceName as string | undefined;
        child.visible = !evidenceName || !isEvidenceCollected(evidenceName);
      });
    };
    syncEvidenceEffects();
    const evidenceObserver = new MutationObserver(syncEvidenceEffects);
    evidenceObserver.observe(root, { subtree: true, attributes: true, attributeFilter: ["class", "aria-disabled"] });
    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      dragged = false;
      pointerX = event.clientX;
      pointerY = event.clientY;
      evidenceButton?.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - pointerX;
      const dy = event.clientY - pointerY;
      if (Math.abs(dx) + Math.abs(dy) > 2) dragged = true;
      targetY += dx * 0.012;
      targetX += dy * 0.009;
      pointerX = event.clientX;
      pointerY = event.clientY;
    };
    const onPointerUp = (event: PointerEvent) => {
      dragging = false;
      if (evidenceButton?.hasPointerCapture(event.pointerId)) evidenceButton.releasePointerCapture(event.pointerId);
    };
    const suppressDraggedClick = (event: MouseEvent) => {
      if (!dragged) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      dragged = false;
    };
    evidenceButton?.classList.add("magic-orb-drag-target");
    evidenceButton?.addEventListener("pointerdown", onPointerDown);
    evidenceButton?.addEventListener("pointermove", onPointerMove);
    evidenceButton?.addEventListener("pointerup", onPointerUp);
    evidenceButton?.addEventListener("pointercancel", onPointerUp);
    evidenceButton?.addEventListener("click", suppressDraggedClick, true);

    const animate = (now: number) => {
      frame = requestAnimationFrame(animate);
      if (!active) return;
      let lightningFlash = 0;
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;
      motes.children.forEach((child) => {
        const material = child.userData.material as THREE.ShaderMaterial | undefined;
        if (material) material.uniforms.time.value = now / 1000;
      });
      wisps.children.forEach((child) => {
        const material = child.userData.material as THREE.ShaderMaterial | undefined;
        if (material) material.uniforms.time.value = now / 1000;
      });
      if (tobaccoSmoke) {
        const motion = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0.18 : 1;
        tobaccoSmoke.children.forEach((child) => {
          const material = child.userData.material as THREE.ShaderMaterial | undefined;
          if (!material) return;
          material.uniforms.time.value = now / 1000;
          material.uniforms.motion.value = motion;
        });
      }
      residues.children.forEach((child) => {
        const material = child.userData.material as THREE.ShaderMaterial | undefined;
        if (material) {
          material.uniforms.time.value = now / 1000;
          const evidenceName = child.userData.evidenceName as string | undefined;
          const targetFocus = evidenceName && focusedEvidence === evidenceName ? 1 : 0;
          material.uniforms.focus.value += (targetFocus - material.uniforms.focus.value) * Math.min(delta * 8, 1);
        }
      });
      if (lightning && spec.lightning) {
        const seconds = now / 1000;
        const material = lightning.userData.material as THREE.ShaderMaterial;
        const textures = lightning.userData.textures as THREE.Texture[];
        if (seconds >= nextStrike) {
          strikeStart = seconds;
          const [minimum, maximum] = spec.lightning.interval;
          nextStrike = seconds + minimum + Math.random() * (maximum - minimum);
          material.uniforms.map.value = textures[Math.random() > 0.48 ? 1 : 0];
          const horizontalShift = sceneId === "magicDormHallway"
            ? (Math.random() - 0.5) * 0.1
            : (Math.random() > 0.5 ? 1 : -1) * (0.14 + Math.random() * 0.18);
          material.uniforms.transform.value.set(
            0.74 + Math.random() * 0.22,
            0.9 + Math.random() * 0.22,
            horizontalShift,
            (Math.random() - 0.5) * 0.08
          );
        }
        const elapsed = seconds - strikeStart;
        let flash = 0;
        if (elapsed >= 0 && elapsed < 0.055) flash = Math.sin((elapsed / 0.055) * Math.PI) * 0.9;
        else if (elapsed >= 0.085 && elapsed < 0.15) flash = Math.sin(((elapsed - 0.085) / 0.065) * Math.PI) * 0.38;
        else if (elapsed >= 0.19 && elapsed < 0.31) flash = Math.sin(((elapsed - 0.19) / 0.12) * Math.PI) * 0.72;
        lightningFlash = flash;
        material.uniforms.intensity.value = flash;
      }
      if (lightSpell) {
        const material = lightSpell.userData.material as THREE.ShaderMaterial;
        const targetStrength = lightActive ? 0.34 : 0;
        spellStrength += (targetStrength - spellStrength) * Math.min(delta * (lightActive ? 5.2 : 2.6), 1);
        material.uniforms.time.value = now / 1000;
        material.uniforms.strength.value = spellStrength;
        lightSpell.rotation.z = -0.045 + Math.sin(now * 0.00018) * 0.018;
      }
      if (orb) {
        const shell = orb.children.find((child) => child.userData.kind === "shell") as THREE.Mesh | undefined;
        const core = orb.children.find((child) => child.userData.kind === "core") as THREE.Group | undefined;
        const shellMaterial = shell?.material as THREE.ShaderMaterial | undefined;
        if (shellMaterial) shellMaterial.uniforms.time.value = now / 1000;
        if (shell && spec.orb) shell.visible = focusedEvidence === spec.orb.evidenceName || dragging;
        orb.rotation.x += (targetX - orb.rotation.x) * Math.min(delta * 5, 1);
        orb.rotation.y += (targetY - orb.rotation.y) * Math.min(delta * 5, 1);
        if (!dragging) targetY += delta * 0.11;
        if (core) {
          core.rotation.y += delta * 0.18;
          core.rotation.z -= delta * 0.07;
          const pulse = 1 + Math.sin(now * 0.0011) * 0.018;
          core.scale.setScalar(pulse);
        }
      }
      renderer.render(scene, camera);
      canvas.dataset.frame = String(Number(canvas.dataset.frame || "0") + 1);
      canvas.dataset.lightning = lightningFlash.toFixed(3);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      classObserver.disconnect();
      evidenceObserver.disconnect();
      evidenceButton?.classList.remove("magic-orb-drag-target");
      evidenceButton?.removeEventListener("pointerdown", onPointerDown);
      evidenceButton?.removeEventListener("pointermove", onPointerMove);
      evidenceButton?.removeEventListener("pointerup", onPointerUp);
      evidenceButton?.removeEventListener("pointercancel", onPointerUp);
      evidenceButton?.removeEventListener("click", suppressDraggedClick, true);
      focusBindings.forEach(({ button, type, listener }) => button.removeEventListener(type, listener));
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material)) material.forEach((item) => item.dispose());
          else material.dispose();
        }
      });
      (lightning?.userData.textures as THREE.Texture[] | undefined)?.forEach((texture) => texture.dispose());
      (residues.userData.texture as THREE.Texture | undefined)?.dispose();
      (tobaccoSmoke?.userData.texture as THREE.Texture | undefined)?.dispose();
      renderer.dispose();
    };
  }, [sceneId]);

  return (
    <canvas
      ref={canvasRef}
      className="magic-scene-rig-3d"
      aria-hidden="true"
      data-magic-scene-rig
      data-scene-id={sceneId}
      data-has-lightning={SCENES[sceneId]?.lightning ? "true" : "false"}
    />
  );
}
