"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const SOURCE_ASPECT = 16 / 9;

type OrbSpec = {
  x: number;
  y: number;
  radius: number;
  interactive?: boolean;
  rings?: boolean;
  hue: "violet" | "amber";
};

type OrbRig = {
  group: THREE.Group;
  shell: THREE.ShaderMaterial;
  core: THREE.ShaderMaterial;
  particles: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
  phase: number;
  pulse: number;
  targetPulse: number;
  interactive: boolean;
  baseY: number;
};

const ORBS_BY_SCENE: Record<string, OrbSpec[]> = {
  magicAlchemyLab: [
    { x: 0.765, y: 0.775, radius: 0.042, interactive: true, hue: "violet" }
  ],
  magicRecordCrystalRoom: [
    { x: 0.512, y: 0.32, radius: 0.315, interactive: true, hue: "violet" }
  ]
};

function createOrbMaterial(color: THREE.Color, core = false) {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      pulse: { value: 0 },
      tint: { value: color }
    },
    vertexShader: `
      varying vec3 vNormalWorld;
      varying vec3 vPosition;
      void main() {
        vNormalWorld = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float pulse;
      uniform vec3 tint;
      varying vec3 vNormalWorld;
      varying vec3 vPosition;

      void main() {
        float fresnel = pow(1.0 - abs(vNormalWorld.z), 2.25);
        float flowA = sin(vPosition.x * 22.0 + time * 0.82 + sin(vPosition.y * 13.0));
        float flowB = sin(vPosition.y * 29.0 - time * 1.08 + vPosition.z * 17.0);
        float flowC = sin((vPosition.x - vPosition.y) * 31.0 + time * 0.44);
        float veins = smoothstep(0.72, 0.97, abs(flowA * 0.48 + flowB * 0.34 + flowC * 0.28));
        float heart = 0.5 + 0.5 * sin(time * 1.7 + length(vPosition.xy) * 16.0);
        vec3 color = tint * (0.16 + fresnel * 0.54 + veins * 0.68 + pulse * 0.5);
        color += vec3(0.58, 0.72, 1.0) * veins * (0.16 + pulse * 0.3);
        color += tint * heart * ${core ? "0.18" : "0.05"};
        float alpha = ${core ? "0.07 + veins * 0.18" : "0.08 + fresnel * 0.32 + veins * 0.08"};
        alpha += pulse * 0.12;
        gl_FragColor = vec4(color, min(alpha, 0.62));
      }
    `,
    transparent: true,
    blending: core ? THREE.AdditiveBlending : THREE.NormalBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  });
}

function createOrb(scene: THREE.Scene, spec: OrbSpec, index: number, resources: Array<{ dispose: () => void }>) {
  const tint = new THREE.Color(spec.hue === "amber" ? 0xffa148 : 0x9b58ff);
  const group = new THREE.Group();
  group.position.set((spec.x - 0.5) * SOURCE_ASPECT * 2, (0.5 - spec.y) * 2, 0.24 + index * 0.01);

  const sphereGeometry = new THREE.SphereGeometry(spec.radius, 48, 32);
  const shell = createOrbMaterial(tint, false);
  const shellMesh = new THREE.Mesh(sphereGeometry, shell);
  shellMesh.scale.set(1, 1.03, 0.72);
  shellMesh.renderOrder = 3;
  group.add(shellMesh);

  const coreGeometry = new THREE.IcosahedronGeometry(spec.radius * 0.79, 4);
  const core = createOrbMaterial(tint.clone().multiplyScalar(1.18), true);
  const coreMesh = new THREE.Mesh(coreGeometry, core);
  coreMesh.scale.z = 0.68;
  coreMesh.renderOrder = 2;
  group.add(coreMesh);

  if (spec.rings) {
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0x8a6938,
      metalness: 0.92,
      roughness: 0.28,
      emissive: 0x28132d,
      emissiveIntensity: 0.45
    });
    const ringGeometry = new THREE.TorusGeometry(spec.radius * 1.08, Math.max(0.003, spec.radius * 0.045), 10, 72);
    const ringA = new THREE.Mesh(ringGeometry, ringMaterial);
    const ringB = new THREE.Mesh(ringGeometry, ringMaterial);
    ringA.rotation.x = 1.15;
    ringA.rotation.z = 0.22;
    ringB.rotation.x = 0.62;
    ringB.rotation.y = 0.4;
    ringB.rotation.z = -0.38;
    ringA.renderOrder = 5;
    ringB.renderOrder = 5;
    group.add(ringA, ringB);
    resources.push(ringMaterial, ringGeometry);
  }

  const count = Math.max(18, Math.round(spec.radius * 260));
  const positions = new Float32Array(count * 3);
  for (let particleIndex = 0; particleIndex < count; particleIndex += 1) {
    const angle = (particleIndex / count) * Math.PI * 2;
    const band = spec.radius * (0.25 + ((particleIndex * 17) % 71) / 100);
    positions[particleIndex * 3] = Math.cos(angle * 2.1) * band;
    positions[particleIndex * 3 + 1] = Math.sin(angle * 1.7) * band;
    positions[particleIndex * 3 + 2] = Math.sin(angle * 3.4) * spec.radius * 0.32;
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particleMaterial = new THREE.PointsMaterial({
    color: tint.clone().lerp(new THREE.Color(0xffffff), 0.55),
    size: Math.max(0.004, spec.radius * 0.035),
    transparent: true,
    opacity: 0.78,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  particles.renderOrder = 4;
  group.add(particles);

  scene.add(group);
  resources.push(sphereGeometry, shell, coreGeometry, core, particleGeometry, particleMaterial);
  return {
    group,
    shell,
    core,
    particles,
    phase: index * 1.73,
    pulse: 0,
    targetPulse: 0,
    interactive: Boolean(spec.interactive),
    baseY: group.position.y
  } satisfies OrbRig;
}

export default function MagicCrystalRig3D({ sceneId }: { sceneId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const root = document.getElementById(sceneId);
    if (!root) return;
    const sync = () => setActive(root.classList.contains("active"));
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    sync();
    return () => observer.disconnect();
  }, [sceneId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = canvas?.closest<HTMLElement>(`#${sceneId}`);
    const specs = ORBS_BY_SCENE[sceneId];
    if (!active || !canvas || !root || !specs?.length) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-SOURCE_ASPECT, SOURCE_ASPECT, 1, -1, -5, 5);
    camera.position.z = 3;
    scene.add(new THREE.AmbientLight(0x9d84c7, 1.2));
    const keyLight = new THREE.PointLight(0xd7b6ff, 5.5, 4.5);
    keyLight.position.set(0.3, 0.65, 1.5);
    scene.add(keyLight);

    const resources: Array<{ dispose: () => void }> = [];
    const rigs = specs.map((spec, index) => createOrb(scene, spec, index, resources));
    const pointer = new THREE.Vector2();
    const pointerTarget = new THREE.Vector2();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let renderedFrames = 0;
    let disposed = false;
    let lastTime = performance.now();

    const resize = () => {
      const width = Math.max(1, root.clientWidth);
      const height = Math.max(1, root.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
      renderer.setSize(width, height, false);
    };

    const handlePointer = (event: PointerEvent) => {
      const bounds = root.getBoundingClientRect();
      pointerTarget.set(
        ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
        -((event.clientY - bounds.top) / bounds.height - 0.5) * 2
      );
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-evidence-name]") : null;
      if (!target?.dataset.evidenceName?.includes("수정구")) return;
      rigs.filter((rig) => rig.interactive).forEach((rig) => {
        rig.targetPulse = 1;
      });
    };

    const render = (now: number) => {
      if (disposed) return;
      const dt = Math.min(0.033, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      const elapsed = now / 1000;
      const motion = reducedMotion.matches ? 0 : 1;
      pointer.lerp(pointerTarget, 1 - Math.exp(-dt * 4.5));

      rigs.forEach((rig, index) => {
        rig.targetPulse *= Math.exp(-dt * 2.4);
        rig.pulse += (rig.targetPulse - rig.pulse) * (1 - Math.exp(-dt * 9));
        rig.group.rotation.y = (elapsed * (0.09 + index * 0.017) + pointer.x * 0.08) * motion;
        rig.group.rotation.x = (Math.sin(elapsed * 0.42 + rig.phase) * 0.035 - pointer.y * 0.045) * motion;
        rig.group.position.y = rig.baseY + Math.sin(elapsed * 0.72 + rig.phase) * 0.0045 * motion;
        const pulseScale = 1 + rig.pulse * 0.075;
        rig.group.scale.setScalar(pulseScale);
        rig.shell.uniforms.time.value = elapsed;
        rig.shell.uniforms.pulse.value = rig.pulse;
        rig.core.uniforms.time.value = elapsed * 1.17;
        rig.core.uniforms.pulse.value = rig.pulse;
        rig.particles.rotation.y = -elapsed * 0.18 * motion;
        rig.particles.rotation.z = elapsed * 0.07 * motion;
      });

      renderer.render(scene, camera);
      renderedFrames += 1;
      if (renderedFrames % 90 === 0) {
        const gl = renderer.getContext();
        const pixel = new Uint8Array(4);
        let visiblePixels = 0;
        for (let gridY = 1; gridY < 12; gridY += 1) {
          for (let gridX = 1; gridX < 20; gridX += 1) {
            gl.readPixels(
              Math.floor(gl.drawingBufferWidth * gridX / 20),
              Math.floor(gl.drawingBufferHeight * gridY / 12),
              1,
              1,
              gl.RGBA,
              gl.UNSIGNED_BYTE,
              pixel
            );
            if (pixel[3] > 2) visiblePixels += 1;
          }
        }
        canvas.dataset.visiblePixels = String(visiblePixels);
      }
      canvas.dataset.engine = "three.js crystal rig";
      canvas.dataset.orbs = String(rigs.length);
      frame = requestAnimationFrame(render);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);
    root.addEventListener("pointermove", handlePointer);
    root.addEventListener("click", handleClick);
    frame = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      root.removeEventListener("pointermove", handlePointer);
      root.removeEventListener("click", handleClick);
      scene.clear();
      resources.forEach((resource) => resource.dispose());
      renderer.dispose();
    };
  }, [active, sceneId]);

  if (!ORBS_BY_SCENE[sceneId]) return null;
  return <canvas ref={canvasRef} className="magic-crystal-rig-3d" aria-hidden="true" />;
}
