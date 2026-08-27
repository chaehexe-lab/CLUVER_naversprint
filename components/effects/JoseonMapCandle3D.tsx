"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const FLAME_SPRITE = "/samunmong/assets/interactions/interrogation-candle/candle-flame-idle-12.png";
const MAP_ASPECT = 1672 / 941;

function makeFlameMaterial(texture: THREE.Texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: texture },
      frame: { value: 0 },
      bend: { value: 0 },
      brightness: { value: 0.78 }
    },
    vertexShader: `
      uniform float bend;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 point = position;
        point.x += bend * uv.y * uv.y;
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
        vec4 flame = texture2D(map, spriteUv);
        if (flame.a < 0.025) discard;
        gl_FragColor = vec4(flame.rgb * vec3(1.0, 0.93, 0.8) * brightness, flame.a);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false
  });
}

export default function JoseonMapCandle3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const board = canvas?.parentElement;
    if (!canvas || !board) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-MAP_ASPECT, MAP_ASPECT, 1, -1, -2, 2);
    camera.position.z = 1;
    const resources: Array<{ dispose: () => void }> = [];

    const wickX = (0.026 - 0.5) * MAP_ASPECT * 2;
    const wickY = (0.5 - 0.247) * 2;
    let flameMaterial: THREE.ShaderMaterial | undefined;
    let flameMesh: THREE.Mesh | undefined;
    let disposed = false;

    const texture = new THREE.TextureLoader().load(FLAME_SPRITE, (loaded) => {
      if (disposed) return loaded.dispose();
      loaded.colorSpace = THREE.SRGBColorSpace;
      loaded.magFilter = THREE.LinearFilter;
      loaded.minFilter = THREE.LinearMipmapLinearFilter;

      const width = (24 / 1672) * MAP_ASPECT * 2;
      const height = (60 / 941) * 2;
      const geometry = new THREE.PlaneGeometry(width, height, 5, 12);
      geometry.translate(0, height / 2, 0);
      flameMaterial = makeFlameMaterial(loaded);
      flameMesh = new THREE.Mesh(geometry, flameMaterial);
      flameMesh.position.set(wickX, wickY, 0.03);
      scene.add(flameMesh);
      resources.push(geometry, flameMaterial);
    });
    resources.push(texture);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const resize = () => {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.55));
      renderer.setSize(Math.max(1, board.clientWidth), Math.max(1, board.clientHeight), false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(board);
    resize();

    let frame = 0;
    const render = (now: number) => {
      if (disposed) return;
      const time = now / 1000;
      const motion = reducedMotion.matches ? 0.25 : 1;
      if (flameMaterial && flameMesh) {
        const sway = (Math.sin(time * 1.55) * 0.003 + Math.sin(time * 4.1) * 0.0012) * motion;
        flameMaterial.uniforms.frame.value = motion ? Math.floor(time * 7.4) % 12 : 0;
        flameMaterial.uniforms.bend.value = sway;
        flameMaterial.uniforms.brightness.value = 0.75 + Math.sin(time * 2.4) * 0.04 * motion;
        flameMesh.rotation.z = sway * 4.8;
      }
      renderer.render(scene, camera);
      canvas.dataset.engine = "three.js joseon map candle";
      canvas.dataset.motionFrame = String(Math.floor(time * 10));
      frame = requestAnimationFrame(render);
    };
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

  return <canvas ref={canvasRef} className="joseon-map-candle-rig-3d" aria-hidden="true" />;
}
