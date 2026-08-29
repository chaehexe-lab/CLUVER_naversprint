"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const FLAME_TEXTURE = "/samunmong/assets/magic-school/intro/atmosphere/candle-flame-source-v2.webp";

type FlameSpec = {
  id: string;
  x: number;
  wickY: number;
  height: number;
  phase: number;
  speed: number;
  bend: number;
  brightness: number;
};

type LanternSpec = {
  x: number;
  y: number;
  width: number;
  height: number;
  phase: number;
};

// Every flame is anchored to a visible wick on the locked 1672 x 941 plate.
const FLAMES: readonly FlameSpec[] = [
  { id: "left-foreground", x: 0.167, wickY: 0.677, height: 0.049, phase: 3.7, speed: 1.03, bend: 0.28, brightness: 1.08 },
  { id: "right-short", x: 0.9007, wickY: 0.434, height: 0.047, phase: 2.8, speed: 0.96, bend: 0.25, brightness: 1.02 },
  { id: "right-tall", x: 0.936, wickY: 0.387, height: 0.046, phase: 0.9, speed: 0.91, bend: 0.22, brightness: 1.04 },
  { id: "rear-desk", x: 0.734, wickY: 0.389, height: 0.029, phase: 1.2, speed: 1.14, bend: 0.2, brightness: 0.88 },
  { id: "rear-shelf-short", x: 0.766, wickY: 0.327, height: 0.021, phase: 5.2, speed: 1.09, bend: 0.17, brightness: 0.78 },
  { id: "rear-shelf-tall", x: 0.777, wickY: 0.316, height: 0.022, phase: 4.15, speed: 1.01, bend: 0.18, brightness: 0.8 }
];

// These are real lantern cages in the painted background. Their glow stays inside the glass.
const LANTERNS: readonly LanternSpec[] = [
  { x: 0.145, y: 0.198, width: 0.017, height: 0.032, phase: 0.4 },
  { x: 0.375, y: 0.176, width: 0.018, height: 0.035, phase: 2.4 },
  { x: 0.642, y: 0.182, width: 0.018, height: 0.035, phase: 4.7 }
];

type FlameRig = {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  material: THREE.ShaderMaterial;
  spec: FlameSpec;
};

type LanternRig = {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  material: THREE.ShaderMaterial;
  spec: LanternSpec;
  phase: number;
};

export default function MagicSchoolIntroFire3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const screen = canvas?.closest<HTMLElement>("#briefingScreen");
    if (!canvas || !screen) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -5, 5);
    camera.position.z = 2;
    const resources: Array<{ dispose: () => void }> = [];
    const flames: FlameRig[] = [];
    const lanterns: LanternRig[] = [];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let active = false;
    let disposed = false;

    const aspect = 1672 / 941;
    const flameTexture = new THREE.TextureLoader().load(FLAME_TEXTURE);
    flameTexture.colorSpace = THREE.SRGBColorSpace;
    flameTexture.minFilter = THREE.LinearFilter;
    flameTexture.magFilter = THREE.LinearFilter;
    resources.push(flameTexture);

    FLAMES.forEach((spec) => {
      const width = spec.height * 0.62 / aspect;
      const geometry = new THREE.PlaneGeometry(width, spec.height, 10, 24);
      geometry.translate(0, spec.height / 2, 0);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          map: { value: flameTexture },
          bend: { value: 0 },
          flutter: { value: 0 },
          brightness: { value: spec.brightness }
        },
        vertexShader: `
          uniform float bend;
          uniform float flutter;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 point = position;
            float fromWick = uv.y;
            point.x += bend * fromWick * fromWick;
            point.x += sin(fromWick * 3.14159265) * flutter;
            point.z += abs(flutter) * sin(fromWick * 3.14159265) * 1.4;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(point, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D map;
          uniform float brightness;
          varying vec2 vUv;
          void main() {
            vec4 sampled = texture2D(map, vUv);
            if (sampled.a < .012) discard;
            vec3 color = sampled.rgb * vec3(1.04, .98, .9) * brightness;
            gl_FragColor = vec4(color, sampled.a);
          }
        `,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide,
        blending: THREE.NormalBlending
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(spec.x, 1 - spec.wickY, 0);
      mesh.renderOrder = 3;
      scene.add(mesh);
      flames.push({ mesh, material, spec });
      resources.push(geometry, material);
    });

    LANTERNS.forEach((spec) => {
      const geometry = new THREE.PlaneGeometry(spec.width, spec.height);
      const material = new THREE.ShaderMaterial({
        uniforms: { strength: { value: 0.1 } },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float strength;
          varying vec2 vUv;
          void main() {
            vec2 p = vec2((vUv.x - .5) * 1.32, (vUv.y - .5) * .82);
            float glass = 1.0 - smoothstep(.12, .5, length(p));
            float center = 1.0 - smoothstep(.0, .25, length(p));
            vec3 color = mix(vec3(1.0, .42, .08), vec3(1.0, .78, .34), center);
            gl_FragColor = vec4(color, glass * strength);
          }
        `,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(spec.x, 1 - spec.y, -0.1);
      mesh.renderOrder = 1;
      scene.add(mesh);
      lanterns.push({ mesh, material, spec, phase: spec.phase });
      resources.push(geometry, material);
    });

    const resize = () => {
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      const viewportAspect = width / height;
      const scaleX = viewportAspect < aspect ? aspect / viewportAspect : 1;
      const scaleY = viewportAspect > aspect ? viewportAspect / aspect : 1;
      const offsetX = -(scaleX - 1) / 2;
      const offsetY = -(scaleY - 1) / 2;

      renderer.setSize(width, height, false);
      flames.forEach(({ mesh, spec }) => {
        mesh.position.set(
          spec.x * scaleX + offsetX,
          1 - (spec.wickY * scaleY + offsetY),
          0
        );
        mesh.scale.set(scaleX, scaleY, 1);
      });
      lanterns.forEach(({ mesh, spec }) => {
        mesh.position.set(
          spec.x * scaleX + offsetX,
          1 - (spec.y * scaleY + offsetY),
          -0.1
        );
        mesh.scale.set(scaleX, scaleY, 1);
      });
    };

    const updateActive = () => {
      active = screen.classList.contains("active") && (
        screen.classList.contains("awaiting-memory-orb") ||
        screen.classList.contains("memory-restoring")
      );
    };

    const animate = (now: number) => {
      if (disposed) return;
      frame = requestAnimationFrame(animate);
      if (!active) return;
      const elapsed = now / 1000;
      const motion = reducedMotion.matches ? 0.22 : 1;

      flames.forEach(({ mesh, material, spec }) => {
        const gust = Math.sin(elapsed * 1.23 * spec.speed + spec.phase) * .56
          + Math.sin(elapsed * 3.47 * spec.speed + spec.phase * 1.8) * .24;
        material.uniforms.bend.value = gust * spec.bend * spec.height * motion;
        material.uniforms.flutter.value = Math.sin(elapsed * 4.3 + spec.phase) * spec.height * .032 * motion;
        material.uniforms.brightness.value = spec.brightness * (.95 + Math.sin(elapsed * 2.4 + spec.phase) * .045);
        mesh.scale.y = .975 + Math.sin(elapsed * 2.7 * spec.speed + spec.phase) * .028 * motion;
      });

      lanterns.forEach(({ material, phase }, index) => {
        const slow = Math.sin(elapsed * (.72 + index * .11) + phase) * .5 + .5;
        const detail = Math.sin(elapsed * 2.1 + phase * 1.7) * .5 + .5;
        material.uniforms.strength.value = .055 + slow * .035 + detail * .012;
      });

      renderer.render(scene, camera);
      canvas.dataset.engine = "three.js procedural candle flame rig";
      canvas.dataset.flames = String(flames.length);
      canvas.dataset.lanterns = String(lanterns.length);
      canvas.dataset.frame = String(Number(canvas.dataset.frame || "0") + 1);
    };

    resize();
    updateActive();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const classObserver = new MutationObserver(updateActive);
    classObserver.observe(screen, { attributes: true, attributeFilter: ["class"] });
    frame = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      classObserver.disconnect();
      scene.clear();
      resources.forEach((resource) => resource.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div className="magic-intro-fire-rig" aria-hidden="true">
      <canvas ref={canvasRef} className="magic-intro-fire-3d" />
    </div>
  );
}
