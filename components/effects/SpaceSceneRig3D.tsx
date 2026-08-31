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

type HologramSpec = {
  center: readonly [number, number];
  size: readonly [number, number];
  color: number;
  phase: number;
};

type ScenePoint = readonly [number, number];
type SceneQuad = readonly [ScenePoint, ScenePoint, ScenePoint, ScenePoint];

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
    { center: [0.472, 0.255], size: [0.105, 0.135], color: 0x79cfff, phase: 0.4 },
    { center: [0.686, 0.255], size: [0.185, 0.145], color: 0x6ec8ff, phase: 2.1 },
    { center: [0.438, 0.372], size: [0.082, 0.098], color: 0x82dcff, phase: 4.7 }
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
    const geometry = new THREE.PlaneGeometry(spec.size[0] * 16, spec.size[1] * 9, 1, 18);
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
          p.x += slice;
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
    mesh.position.copy(uvToWorld(spec.center, 0.42));
    mesh.userData.material = material;
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
  const hasSceneEffects = Boolean(LIGHTS[sceneId]?.length || SERVER_LED_RACKS[sceneId]?.length);

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
