"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type TrailSpec = {
  color: number;
  radius: number;
  phase: number;
  speed: number;
  opacity: number;
};

const TRAILS: readonly TrailSpec[] = [
  { color: 0x48cfff, radius: 0.82, phase: 0.4, speed: 0.14, opacity: 0.4 },
  { color: 0x9168ff, radius: 0.68, phase: 2.1, speed: -0.115, opacity: 0.33 },
  { color: 0xff963d, radius: 0.58, phase: 4.2, speed: 0.095, opacity: 0.25 }
];

function createEnergyTrail(spec: TrailSpec, index: number) {
  const points = Array.from({ length: 54 }, (_, pointIndex) => {
    const progress = pointIndex / 53;
    const angle = progress * Math.PI * (1.44 + index * 0.09) + spec.phase;
    const ripple = Math.sin(angle * (2 + index) + spec.phase) * 0.055;
    const radius = spec.radius + ripple;
    return new THREE.Vector3(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * (0.68 + index * 0.045),
      Math.sin(angle * 2 + spec.phase) * 0.075
    );
  });
  const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.46);
  const geometry = new THREE.TubeGeometry(curve, 144, 0.017 + index * 0.0025, 7, false);
  const material = new THREE.MeshBasicMaterial({
    color: spec.color,
    transparent: true,
    opacity: spec.opacity,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.set(0.08 - index * 0.045, -0.04 + index * 0.025, 0);
  mesh.renderOrder = 2;
  return { geometry, material, mesh, speed: spec.speed, phase: spec.phase };
}

function createEnergyDust() {
  const count = 156;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const fallSpeeds = new Float32Array(count);
  const palette = [
    new THREE.Color(0x5ad8ff),
    new THREE.Color(0x9a72ff),
    new THREE.Color(0xffa255),
    new THREE.Color(0xe7f8ff)
  ];

  for (let index = 0; index < count; index += 1) {
    const angle = index * 2.399963;
    const radius = 0.08 + Math.sqrt(((index * 37) % count) / count) * 0.77;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = Math.sin(angle) * radius * 0.72;
    positions[index * 3 + 2] = ((index * 17) % 13) / 65;
    const color = palette[index % palette.length];
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
    phases[index] = index * 1.731;
    fallSpeeds[index] = 0.018 + ((index * 29) % 17) / 850;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("phase", new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute("fallSpeed", new THREE.BufferAttribute(fallSpeeds, 1));
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    uniforms: {
      time: { value: 0 },
      agitation: { value: 0 }
    },
    vertexShader: `
      attribute float phase;
      attribute float fallSpeed;
      uniform float time;
      uniform float agitation;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec3 point = position;
        float fall = fract((position.y + .82) / 1.64 - time * fallSpeed * (.72 + agitation * 1.38));
        point.y = fall * 1.64 - .82;
        float current = time * (.36 + agitation * .82) + phase;
        point.x += sin(current + point.y * 4.6) * (.018 + agitation * .052);
        point.z += cos(current * .71) * (.012 + agitation * .022);
        float drift = time * (.028 + agitation * .092) + phase * .004;
        point.xy = mat2(cos(drift), -sin(drift), sin(drift), cos(drift)) * point.xy;
        float orbDistance = length(vec2(point.x / .9, point.y / .75));
        float boundaryFade = 1.0 - smoothstep(.78, 1.02, orbDistance);
        vColor = color;
        vAlpha = boundaryFade * (.34 + pow(.5 + .5 * sin(time * .82 + phase), 5.0) * .5);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(point, 1.0);
        gl_PointSize = (2.0 + mod(phase, 3.4)) * (1.0 + agitation * .16);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float distanceToCenter = length(gl_PointCoord - .5);
        float alpha = 1.0 - smoothstep(.08, .5, distanceToCenter);
        gl_FragColor = vec4(vColor, alpha * vAlpha);
      }
    `
  });
  const points = new THREE.Points(geometry, material);
  points.renderOrder = 3;
  return { geometry, material, points };
}

export default function MemoryOrb3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const trigger = canvas?.closest<HTMLButtonElement>(".memory-orb-trigger");
    const screen = document.getElementById("briefingScreen");
    if (!canvas || !trigger || !screen) return;

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
    renderer.toneMappingExposure = 0.92;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1.1, 1.1, 1.1, -1.1, -4, 4);
    camera.position.z = 2;
    const energy = new THREE.Group();
    scene.add(energy);

    const trails = TRAILS.map((spec, index) => createEnergyTrail(spec, index));
    trails.forEach(({ mesh }) => energy.add(mesh));

    const dust = createEnergyDust();
    energy.add(dust.points);

    const ringMaterials = [
      new THREE.MeshBasicMaterial({
        color: 0x72dcff,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending
      }),
      new THREE.MeshBasicMaterial({
        color: 0xab78ff,
        transparent: true,
        opacity: 0.17,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending
      })
    ];
    const ringGeometries = [
      new THREE.TorusGeometry(0.31, 0.008, 8, 128),
      new THREE.TorusGeometry(0.22, 0.006, 8, 128)
    ];
    const rings = ringGeometries.map((geometry, index) => {
      const ring = new THREE.Mesh(geometry, ringMaterials[index]);
      ring.renderOrder = 4;
      energy.add(ring);
      return ring;
    });

    let animationFrame = 0;
    let active = false;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let targetAgitation = 0;
    let agitation = 0;
    let disposed = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updatePointer = (event: PointerEvent) => {
      const bounds = trigger.getBoundingClientRect();
      targetX = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / Math.max(bounds.width, 1) * 2 - 1));
      targetY = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / Math.max(bounds.height, 1) * 2 - 1));
    };

    const beginAgitation = () => {
      targetAgitation = 1;
    };

    const settleAgitation = () => {
      targetAgitation = 0;
    };

    const resize = () => {
      renderer.setSize(Math.max(1, canvas.clientWidth), Math.max(1, canvas.clientHeight), false);
    };

    const updateActive = () => {
      active = screen.classList.contains("active") && (
        screen.classList.contains("awaiting-memory-orb") ||
        screen.classList.contains("memory-restoring")
      );
    };

    const animate = (now: number) => {
      if (disposed) return;
      animationFrame = requestAnimationFrame(animate);
      if (!active) return;

      const elapsed = now / 1000;
      const motion = reducedMotion.matches ? 0.22 : 1;
      currentX += (targetX - currentX) * 0.025;
      currentY += (targetY - currentY) * 0.025;
      agitation += (targetAgitation - agitation) * 0.035;
      energy.rotation.x = currentY * 0.018 * motion;
      energy.rotation.y = currentX * 0.022 * motion;
      energy.rotation.z = Math.sin(elapsed * 0.21) * 0.018 * motion;
      energy.position.y = Math.sin(elapsed * 0.31) * 0.008 * motion;
      energy.scale.setScalar(1 + Math.sin(elapsed * 0.37) * 0.006 * motion);

      trails.forEach(({ mesh, material, speed, phase }, index) => {
        mesh.rotation.z = phase * 0.08 + elapsed * speed * motion * (1 + agitation * 1.2);
        mesh.scale.setScalar(0.99 + Math.sin(elapsed * (0.32 + index * 0.05) + phase) * 0.012 * motion);
        material.opacity = TRAILS[index].opacity * (
          0.92 + Math.sin(elapsed * (0.44 + index * 0.08) + phase) * 0.08
        );
      });
      dust.material.uniforms.time.value = elapsed * motion;
      dust.material.uniforms.agitation.value = agitation;
      rings[0].rotation.z = elapsed * 0.045 * motion;
      rings[1].rotation.z = -elapsed * 0.058 * motion;
      renderer.render(scene, camera);
      canvas.dataset.engine = "three.js additive orb interior";
      canvas.dataset.frame = String(Number(canvas.dataset.frame || "0") + 1);
    };

    resize();
    updateActive();
    window.addEventListener("pointermove", updatePointer, { passive: true });
    trigger.addEventListener("pointerenter", beginAgitation);
    trigger.addEventListener("pointerleave", settleAgitation);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const classObserver = new MutationObserver(updateActive);
    classObserver.observe(screen, { attributes: true, attributeFilter: ["class"] });
    animationFrame = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("pointermove", updatePointer);
      trigger.removeEventListener("pointerenter", beginAgitation);
      trigger.removeEventListener("pointerleave", settleAgitation);
      resizeObserver.disconnect();
      classObserver.disconnect();
      trails.forEach(({ geometry, material }) => {
        geometry.dispose();
        material.dispose();
      });
      dust.geometry.dispose();
      dust.material.dispose();
      ringGeometries.forEach((geometry) => geometry.dispose());
      ringMaterials.forEach((material) => material.dispose());
      scene.clear();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="memory-orb-3d" aria-hidden="true" />;
}
