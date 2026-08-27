"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const RESTORED_PLATE = "/samunmong/assets/scene-motion/back-gate-restored-plate-v1.png";
const CLOUD_TEXTURE = "/samunmong/assets/scene-motion/back-gate-clouds-luma-v1.png";
const SKY_MASK = "/samunmong/assets/scene-motion/back-gate-sky-mask-v1.png";

export default function BackGateAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = canvas?.closest<HTMLElement>("#backGateCourtyard");
    if (!canvas || !root) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        restoredMap: { value: null },
        cloudMap: { value: null },
        skyMaskMap: { value: null },
        time: { value: 0 },
        motion: { value: 1 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D restoredMap;
        uniform sampler2D cloudMap;
        uniform sampler2D skyMaskMap;
        uniform float time;
        uniform float motion;
        varying vec2 vUv;

        float cloudAlpha(vec3 color) {
          float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
          return smoothstep(0.001, 0.035, luminance);
        }

        void main() {
          vec4 restored = texture2D(restoredMap, vUv);

          float upperRegion = smoothstep(0.665, 0.705, vUv.y);
          float doorwayRegion = smoothstep(0.535, 0.575, vUv.x)
            * (1.0 - smoothstep(0.725, 0.755, vUv.x))
            * smoothstep(0.585, 0.625, vUv.y)
            * (1.0 - smoothstep(0.755, 0.795, vUv.y));
          float skyRegion = clamp(upperRegion + doorwayRegion, 0.0, 1.0);
          float depthMask = smoothstep(0.38, 0.72, texture2D(skyMaskMap, vUv).r);
          float cloudMask = skyRegion * depthMask;

          float highSpeed = 0.0105 * time * motion;
          float lowSpeed = 0.0058 * time * motion;
          vec2 highUv = vec2(fract(vUv.x - highSpeed), vUv.y + sin(time * 0.11) * 0.0015 * motion);
          vec2 lowUv = vec2(fract(vUv.x - lowSpeed + 0.13), vUv.y * 1.025 - 0.015);
          vec3 highCloud = texture2D(cloudMap, highUv).rgb;
          vec3 lowCloud = texture2D(cloudMap, lowUv).rgb;
          float highBand = smoothstep(0.735, 0.82, vUv.y);
          vec3 cloud = mix(lowCloud, highCloud, highBand);
          float cloudOpacity = cloudAlpha(cloud) * 0.9 * cloudMask;
          vec3 cloudColor = cloud * 3.15;

          vec3 color = restored.rgb;
          color += cloudColor * cloudOpacity * 0.9;

          gl_FragColor = vec4(color, cloudMask);
        }
      `,
      transparent: true,
      depthWrite: false,
      toneMapped: false
    });
    scene.add(new THREE.Mesh(geometry, material));

    const loader = new THREE.TextureLoader();
    let disposed = false;
    const configureTexture = (texture: THREE.Texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.wrapS = THREE.RepeatWrapping;
      return texture;
    };
    const restoredTexture = loader.load(RESTORED_PLATE, (texture) => {
      if (disposed) return texture.dispose();
      material.uniforms.restoredMap.value = configureTexture(texture);
    });
    const cloudTexture = loader.load(CLOUD_TEXTURE, (texture) => {
      if (disposed) return texture.dispose();
      material.uniforms.cloudMap.value = configureTexture(texture);
    });
    const skyMaskTexture = loader.load(SKY_MASK, (texture) => {
      if (disposed) return texture.dispose();
      texture.colorSpace = THREE.NoColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      material.uniforms.skyMaskMap.value = texture;
    });

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => {
      material.uniforms.motion.value = reduceMotion.matches ? 0.18 : 1;
    };
    syncMotion();
    reduceMotion.addEventListener("change", syncMotion);

    const resize = () => {
      const { width, height } = root.getBoundingClientRect();
      renderer.setSize(Math.max(1, width), Math.max(1, height), false);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);

    const clock = new THREE.Clock();
    let frame = 0;
    const render = () => {
      material.uniforms.time.value = clock.getElapsedTime();
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(render);
    };
    frame = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      reduceMotion.removeEventListener("change", syncMotion);
      restoredTexture.dispose();
      cloudTexture.dispose();
      skyMaskTexture.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="backgate-atmosphere" aria-hidden="true" />;
}
