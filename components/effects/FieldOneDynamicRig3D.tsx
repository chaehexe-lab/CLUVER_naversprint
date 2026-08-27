"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type RecognizedObject = {
  id: string;
  label: string;
  depth: number;
  role: "sky" | "architecture" | "light" | "ground" | "character" | "evidence";
};

const RECOGNIZED_OBJECTS: readonly RecognizedObject[] = [
  { id: "storm-sky", label: "흐린 밤하늘", depth: -1.2, role: "sky" },
  { id: "cloud-bank", label: "골목 안개와 구름", depth: -1.05, role: "sky" },
  { id: "distant-houses", label: "먼 골목의 가옥", depth: -0.65, role: "architecture" },
  { id: "stone-walls", label: "골목 돌담", depth: -0.35, role: "architecture" },
  { id: "main-gate", label: "유문석 집 대문", depth: -0.12, role: "architecture" },
  { id: "distant-lantern", label: "먼 골목 등불", depth: -0.42, role: "light" },
  { id: "gate-lantern", label: "대문 안쪽 등불", depth: -0.08, role: "light" },
  { id: "front-lantern", label: "대문 앞 등불", depth: 0.08, role: "light" },
  { id: "wet-stone-road", label: "젖은 돌길", depth: 0.05, role: "ground" },
  { id: "jeomsun", label: "쓰러진 점순", depth: 0.22, role: "character" },
  { id: "scattered-evidence", label: "흩어진 편지와 호패", depth: 0.3, role: "evidence" }
];

const LANTERNS = [
  new THREE.Vector4(0.186, 1 - 0.397, 0.033, 0.071),
  new THREE.Vector4(0.596, 1 - 0.279, 0.055, 0.12),
  new THREE.Vector4(0.800, 1 - 0.198, 0.075, 0.15)
];

const REFLECTIONS = [
  new THREE.Vector4(0.19, 1 - 0.49, 0.072, 0.145),
  new THREE.Vector4(0.61, 1 - 0.53, 0.12, 0.31),
  new THREE.Vector4(0.79, 1 - 0.69, 0.16, 0.36)
];

function makeCloudMaterial(texture: THREE.Texture, phase: number, speed: number, opacity: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: texture },
      time: { value: 0 },
      motion: { value: 1 },
      layerPhase: { value: phase },
      layerSpeed: { value: speed },
      layerOpacity: { value: opacity }
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
      uniform float motion;
      uniform float layerPhase;
      uniform float layerSpeed;
      uniform float layerOpacity;
      varying vec2 vUv;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.54;
        for (int i = 0; i < 5; i++) {
          value += noise(p) * amplitude;
          p = p * 2.03 + vec2(17.2, 9.1);
          amplitude *= 0.49;
        }
        return value;
      }

      void main() {
        vec2 screenUv = vec2(vUv.x, 1.0 - vUv.y);
        vec4 source = texture2D(map, vUv);
        float luminance = dot(source.rgb, vec3(0.2126, 0.7152, 0.0722));
        float coolSky = source.b - source.r;
        float openSky = smoothstep(0.018, 0.075, luminance);
        openSky *= smoothstep(0.006, 0.032, coolSky);
        openSky *= 1.0 - smoothstep(0.31, 0.43, screenUv.y);
        openSky *= 1.0 - smoothstep(0.50, 0.61, screenUv.x);

        float direction = sin(layerPhase * 1.73) < 0.0 ? -1.0 : 1.0;
        float drift = time * 0.17 * layerSpeed * motion * direction;
        vec2 phaseOffset = vec2(layerPhase, layerPhase * 0.37);
        float rise = sin(time * 0.11 + layerPhase) * 0.028 * motion;
        float largeCloud = fbm(screenUv * vec2(3.7, 6.1) + phaseOffset + vec2(drift, rise - drift * 0.12));
        float fineCloud = fbm(screenUv * vec2(8.6, 10.8) - phaseOffset * 0.41 + vec2(-drift * 0.39, rise + drift * 0.09));
        float density = largeCloud * 0.8 + fineCloud * 0.2;
        float cloud = smoothstep(0.49, 0.64, density);
        float cloudCore = smoothstep(0.6, 0.75, density);
        float breathing = 0.86 + sin(time * (0.17 + layerSpeed * 0.035) + layerPhase) * 0.1;
        float alpha = (cloud * 0.72 + cloudCore * 0.28) * openSky * layerOpacity * breathing;
        vec3 cloudColor = mix(vec3(0.1, 0.15, 0.23), vec3(0.72, 0.77, 0.84), fineCloud * 0.7);
        gl_FragColor = vec4(cloudColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    toneMapped: false
  });
}

function makeLanternLightMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      motion: { value: 1 },
      lanterns: { value: LANTERNS },
      reflections: { value: REFLECTIONS }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float motion;
      uniform vec4 lanterns[3];
      uniform vec4 reflections[3];
      varying vec2 vUv;

      float ellipse(vec2 uv, vec4 shape) {
        vec2 p = (uv - shape.xy) / shape.zw;
        return exp(-dot(p, p) * 2.25);
      }

      void main() {
        float core = 0.0;
        float halo = 0.0;
        float reflected = 0.0;
        for (int i = 0; i < 3; i++) {
          float phase = float(i) * 2.31;
          float calm = sin(time * (1.31 + float(i) * 0.15) + phase) * 0.105;
          float draft = sin(time * 4.17 + phase * 1.8) * 0.052;
          float irregular = sin(time * 7.3 + sin(time * 0.61 + phase) * 2.2) * 0.026;
          float flicker = 0.9 + (calm + draft + irregular) * motion;
          vec4 coreShape = vec4(lanterns[i].xy, lanterns[i].zw * vec2(0.16, 0.2));
          core += ellipse(vUv, coreShape) * flicker;
          halo += ellipse(vUv, lanterns[i]) * flicker;
          reflected += ellipse(vUv, reflections[i]) * flicker;
        }

        float intensity = min(core * 0.46 + halo * 0.28 + reflected * 0.11, 0.52);
        vec3 warmLight = mix(vec3(1.0, 0.34, 0.07), vec3(1.0, 0.72, 0.34), min(halo, 1.0));
        gl_FragColor = vec4(warmLight, intensity);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false
  });
}

export default function FieldOneDynamicRig3D({ imageUrl }: { imageUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [maskImageUrl, setMaskImageUrl] = useState(imageUrl);

  useEffect(() => {
    const root = document.getElementById("fieldOne");
    if (!root) return;

    const syncVisibleBackground = () => {
      const visibleBackground = Array.from(root.querySelectorAll<HTMLImageElement>(".scene-state-background"))
        .find((image) => getComputedStyle(image).display !== "none");
      setMaskImageUrl(visibleBackground?.currentSrc || visibleBackground?.src || imageUrl);
    };

    syncVisibleBackground();
    const observer = new MutationObserver(syncVisibleBackground);
    observer.observe(root, { attributes: true, subtree: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [imageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = canvas?.closest<HTMLElement>("#fieldOne");
    if (!canvas || !root) return;

    const aspect = 1672 / 941;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, -2, 2);
    camera.position.z = 1;
    const loader = new THREE.TextureLoader();
    const resources: Array<{ dispose: () => void }> = [];
    const cloudRigs: Array<{ material: THREE.ShaderMaterial; mesh: THREE.Mesh; depth: number }> = [];
    let lightMaterial: THREE.ShaderMaterial | undefined;
    let frame = 0;
    let disposed = false;
    const pointer = new THREE.Vector2();
    const smoothPointer = new THREE.Vector2();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    loader.load(maskImageUrl, (texture) => {
      if (disposed) return texture.dispose();
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      resources.push(texture);

      const cloudLayers = maskImageUrl.includes("field-one-all-evidence-cloud-clean") ? [
        { phase: 0.8, speed: 1.08, opacity: 0.64, depth: -0.56 },
        { phase: 9.2, speed: 1.46, opacity: 0.42, depth: -0.38 }
      ] : [];

      cloudLayers.forEach((layer) => {
        const geometry = new THREE.PlaneGeometry(aspect * 2.02, 2.02, 8, 5);
        const material = makeCloudMaterial(texture, layer.phase, layer.speed, layer.opacity);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.z = layer.depth;
        scene.add(mesh);
        cloudRigs.push({ material, mesh, depth: Math.abs(layer.depth) });
        resources.push(geometry, material);
      });

      const lightGeometry = new THREE.PlaneGeometry(aspect * 2, 2, 1, 1);
      lightMaterial = makeLanternLightMaterial();
      const lightMesh = new THREE.Mesh(lightGeometry, lightMaterial);
      lightMesh.position.z = 0.18;
      scene.add(lightMesh);
      resources.push(lightGeometry, lightMaterial);
    });

    const onPointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      pointer.set(
        THREE.MathUtils.clamp((event.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5),
        THREE.MathUtils.clamp((event.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5)
      );
    };

    const resize = () => {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(Math.max(1, root.clientWidth), Math.max(1, root.clientHeight), false);
    };

    const render = (now: number) => {
      if (disposed) return;
      const time = now / 1000;
      const motion = reducedMotion.matches ? 0.28 : 1;
      smoothPointer.lerp(pointer, 0.025);
      cloudRigs.forEach(({ material, mesh, depth }) => {
        material.uniforms.time.value = time;
        material.uniforms.motion.value = motion;
        mesh.position.x = smoothPointer.x * (0.004 + depth * 0.012) * motion;
        mesh.position.y = -smoothPointer.y * (0.002 + depth * 0.006) * motion;
      });
      if (lightMaterial) {
        lightMaterial.uniforms.time.value = time;
        lightMaterial.uniforms.motion.value = motion;
      }

      renderer.render(scene, camera);
      canvas.dataset.engine = "three.js 2.5d object rig";
      canvas.dataset.recognizedObjects = RECOGNIZED_OBJECTS.map((item) => item.id).join(",");
      canvas.dataset.dynamicObjects = "cloud-bank,distant-lantern,gate-lantern,front-lantern,wet-stone-road";
      canvas.dataset.cloudLayers = String(cloudRigs.length);
      canvas.dataset.motionFrame = String(Math.floor(time * 10));
      canvas.dataset.motionMode = reducedMotion.matches ? "reduced" : "full";
      canvas.dataset.lightCycle = (0.9 + Math.sin(time * 1.31) * 0.105 + Math.sin(time * 4.17) * 0.052).toFixed(3);
      frame = requestAnimationFrame(render);
    };

    resize();
    root.addEventListener("pointermove", onPointerMove);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);
    frame = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      root.removeEventListener("pointermove", onPointerMove);
      resizeObserver.disconnect();
      scene.clear();
      resources.forEach((resource) => resource.dispose());
      renderer.dispose();
    };
  }, [maskImageUrl]);

  return <canvas ref={canvasRef} className="field-one-dynamic-rig-3d" aria-hidden="true" />;
}
