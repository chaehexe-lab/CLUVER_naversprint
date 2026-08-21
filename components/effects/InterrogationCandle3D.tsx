"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const CANDLE_TEXTURE = "/samunmong/assets/interactions/interrogation-candle/candle-brass-calm.png";
const FLAME_TEXTURE = "/samunmong/assets/interactions/interrogation-candle/candle-flame-idle-12.png";

const REACTION_MOTION: Record<string, { amplitude: number; speed: number; brightness: number; lean: number }> = {
  calm: { amplitude: 0.035, speed: 1.1, brightness: 0.9, lean: 0 },
  thinking: { amplitude: 0.09, speed: 2.5, brightness: 0.94, lean: -0.03 },
  attentive: { amplitude: 0.05, speed: 1.55, brightness: 1.04, lean: 0.018 },
  avoid: { amplitude: 0.075, speed: 1.2, brightness: 0.72, lean: -0.12 },
  nervous: { amplitude: 0.15, speed: 3.4, brightness: 1.08, lean: 0.02 },
  shocked: { amplitude: 0.24, speed: 4.6, brightness: 1.18, lean: 0.08 },
  silent: { amplitude: 0.018, speed: 0.55, brightness: 0.42, lean: -0.02 }
};

export default function InterrogationCandle3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = canvas?.closest<HTMLElement>("#interrogationCandle");
    const screen = canvas?.closest<HTMLElement>("#interrogationScreen");
    if (!canvas || !root || !screen) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-0.72, 0.72, 2, -2, -5, 5);
    camera.position.z = 3;
    const loader = new THREE.TextureLoader();
    let frame = 0;
    let disposed = false;
    let lastTime = performance.now();
    let angle = 0;
    let velocity = 0;
    let depthAngle = 0;
    let flameMaterial: THREE.ShaderMaterial | undefined;
    let flameMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> | undefined;
    const resources: Array<{ dispose: () => void }> = [];

    const resize = () => {
      const width = Math.max(1, root.clientWidth);
      const height = Math.max(1, root.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
      renderer.setSize(width, height, false);
    };

    const build = async () => {
      const [bodyTexture, flameTexture] = await Promise.all([
        loader.loadAsync(CANDLE_TEXTURE),
        loader.loadAsync(FLAME_TEXTURE)
      ]);
      if (disposed) return;
      bodyTexture.colorSpace = THREE.SRGBColorSpace;
      flameTexture.colorSpace = THREE.SRGBColorSpace;
      resources.push(bodyTexture, flameTexture);

      const bodyGeometry = new THREE.PlaneGeometry(1.16, 3.28, 1, 1);
      const bodyMaterial = new THREE.ShaderMaterial({
        uniforms: { map: { value: bodyTexture }, brightness: { value: 0.72 } },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D map;
          uniform float brightness;
          varying vec2 vUv;
          void main() {
            if (vUv.y > 0.835) discard;
            vec4 color = texture2D(map, vUv);
            if (color.a < 0.02) discard;
            gl_FragColor = vec4(color.rgb * brightness, color.a);
          }
        `,
        transparent: true,
        depthWrite: false
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.set(0, -0.18, 0);
      body.renderOrder = 1;
      scene.add(body);
      resources.push(bodyGeometry, bodyMaterial);

      const flameGeometry = new THREE.PlaneGeometry(0.36, 0.72, 8, 18);
      flameGeometry.translate(0, 0.36, 0);
      flameMaterial = new THREE.ShaderMaterial({
        uniforms: {
          map: { value: flameTexture },
          frame: { value: 0 },
          bend: { value: 0 },
          depthBend: { value: 0 },
          brightness: { value: 1 }
        },
        vertexShader: `
          uniform float bend;
          uniform float depthBend;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 point = position;
            float fromWick = uv.y;
            point.x += bend * fromWick * fromWick;
            point.z += sin(fromWick * 3.14159265) * depthBend;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(point, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D map;
          uniform float frame;
          uniform float brightness;
          varying vec2 vUv;
          void main() {
            vec2 spriteUv = vec2((vUv.x + frame) / 12.0, vUv.y);
            vec4 color = texture2D(map, spriteUv);
            if (color.a < 0.025) discard;
            gl_FragColor = vec4(color.rgb * brightness, color.a);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      flameMesh = new THREE.Mesh(flameGeometry, flameMaterial);
      flameMesh.position.set(0, 1.08, 0.08);
      flameMesh.renderOrder = 3;
      scene.add(flameMesh);
      resources.push(flameGeometry, flameMaterial);
    };

    const render = (now: number) => {
      if (disposed) return;
      const dt = Math.min(0.033, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      const elapsed = now / 1000;
      const active = screen.classList.contains("active");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const state = root.dataset.state || "calm";
      const motion = REACTION_MOTION[state] || REACTION_MOTION.calm;
      const scale = reduced ? 0 : 1;
      const wind = (Math.sin(elapsed * motion.speed * 2.1) + Math.sin(elapsed * motion.speed * 3.7) * 0.38) * motion.amplitude;
      const target = (motion.lean + wind) * scale;
      velocity += (target - angle) * (state === "shocked" ? 18 : 10) * dt;
      velocity *= Math.exp(-(state === "nervous" ? 4.2 : 6.1) * dt);
      angle += velocity * dt;
      depthAngle += ((Math.sin(elapsed * motion.speed * 1.3) * motion.amplitude * 0.32 * scale) - depthAngle) * dt * 4.5;

      if (flameMaterial && flameMesh) {
        flameMaterial.uniforms.frame.value = Math.floor(elapsed * (state === "nervous" ? 14 : 8)) % 12;
        flameMaterial.uniforms.bend.value = angle * 0.72;
        flameMaterial.uniforms.depthBend.value = depthAngle;
        flameMaterial.uniforms.brightness.value = motion.brightness;
        flameMesh.rotation.z = angle * 0.22;
        flameMesh.rotation.y = depthAngle * 1.8;
      }
      if (active) renderer.render(scene, camera);
      canvas.dataset.engine = "three.js candle rig";
      canvas.dataset.reaction = state;
      frame = requestAnimationFrame(render);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);
    void build();
    frame = requestAnimationFrame(render);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      scene.clear();
      resources.forEach((resource) => resource.dispose());
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="interrogation-candle-3d" aria-hidden="true" />;
}
