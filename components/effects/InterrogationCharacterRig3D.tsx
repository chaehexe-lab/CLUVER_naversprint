"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const EMPTY_ROOM = "/samunmong/assets/scene-interrogation-room-empty.png";

const REACTION_TARGETS: Record<string, { turn: number; lean: number; recoil: number; tension: number }> = {
  calm: { turn: 0, lean: 0, recoil: 0, tension: 0.15 },
  lie: { turn: 0, lean: 0, recoil: 0, tension: 0.15 },
  thinking: { turn: -0.012, lean: 0.008, recoil: 0, tension: 0.28 },
  attentive: { turn: 0.01, lean: 0.014, recoil: 0, tension: 0.2 },
  avoid: { turn: -0.045, lean: -0.012, recoil: 0.006, tension: 0.42 },
  nervous: { turn: 0.018, lean: -0.004, recoil: 0.012, tension: 0.76 },
  shocked: { turn: 0.035, lean: -0.026, recoil: 0.055, tension: 1 },
  silent: { turn: -0.022, lean: -0.018, recoil: 0.018, tension: 0.5 }
};

export default function InterrogationCharacterRig3D({ initialTexture }: { initialTexture: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const screen = canvas?.closest<HTMLElement>("#interrogationScreen");
    const plate = screen?.querySelector<HTMLImageElement>("#interrogationPlate");
    if (!canvas || !screen || !plate) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const aspect = 1664 / 936;
    const camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, -5, 5);
    camera.position.z = 3;
    const loader = new THREE.TextureLoader();
    const resources: Array<{ dispose: () => void }> = [];
    let disposed = false;
    let frame = 0;
    let lastTime = performance.now();
    let currentUrl = initialTexture;
    let currentTexture: THREE.Texture | undefined;
    let previousTexture: THREE.Texture | undefined;
    let transition = 1;
    let transitionVelocity = 0;
    let reactionTurn = 0;
    let reactionLean = 0;
    let reactionRecoil = 0;
    let material: THREE.ShaderMaterial | undefined;

    const loadTexture = async (url: string) => {
      const texture = await loader.loadAsync(url);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      resources.push(texture);
      return texture;
    };

    const resize = () => {
      const width = Math.max(1, screen.clientWidth);
      const height = Math.max(1, screen.clientHeight);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height, false);
    };

    const build = async () => {
      const [emptyTexture, characterTexture] = await Promise.all([loadTexture(EMPTY_ROOM), loadTexture(initialTexture)]);
      if (disposed) return;
      currentTexture = characterTexture;
      previousTexture = characterTexture;
      const geometry = new THREE.PlaneGeometry(aspect * 2, 2, 48, 30);
      material = new THREE.ShaderMaterial({
        uniforms: {
          emptyMap: { value: emptyTexture },
          previousMap: { value: previousTexture },
          currentMap: { value: currentTexture },
          transition: { value: 1 },
          time: { value: 0 },
          turn: { value: 0 },
          lean: { value: 0 },
          recoil: { value: 0 },
          tension: { value: 0 }
        },
        vertexShader: `
          uniform float time;
          uniform float turn;
          uniform float lean;
          uniform float recoil;
          uniform float tension;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 point = position;
            float bodyX = smoothstep(0.12, 0.2, uv.x) * smoothstep(0.47, 0.4, uv.x);
            float bodyY = smoothstep(0.08, 0.18, uv.y) * smoothstep(0.88, 0.78, uv.y);
            float body = bodyX * bodyY;
            float head = body * smoothstep(0.58, 0.68, uv.y) * smoothstep(0.89, 0.81, uv.y);
            float shoulders = body * smoothstep(0.38, 0.48, uv.y) * smoothstep(0.7, 0.58, uv.y);
            float breath = sin(time * (1.25 + tension * 1.7)) * 0.0022 * (1.0 + tension * 0.7);
            point.y += breath * shoulders;
            point.x += turn * head + lean * body * (0.35 + uv.y * 0.65);
            point.y -= abs(turn) * head * 0.18 + recoil * body;
            point.z += sin((uv.y - 0.1) * 3.14159265) * body * (0.018 + recoil * 0.35);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(point, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D emptyMap;
          uniform sampler2D previousMap;
          uniform sampler2D currentMap;
          uniform float transition;
          uniform float tension;
          varying vec2 vUv;
          void main() {
            vec4 emptyColor = texture2D(emptyMap, vUv);
            vec4 beforeColor = texture2D(previousMap, vUv);
            vec4 afterColor = texture2D(currentMap, vUv);
            float sleeveWipe = smoothstep(vUv.y - 0.18, vUv.y + 0.2, transition);
            vec4 characterColor = mix(beforeColor, afterColor, sleeveWipe);
            vec3 delta = abs(characterColor.rgb - emptyColor.rgb);
            float difference = max(max(delta.r, delta.g), delta.b);
            float roi = smoothstep(0.12, 0.17, vUv.x) * smoothstep(0.47, 0.42, vUv.x)
              * smoothstep(0.06, 0.12, vUv.y) * smoothstep(0.9, 0.82, vUv.y);
            float matte = smoothstep(0.0025, 0.018, difference);
            float alpha = roi * matte;
            alpha = alpha > 0.035 ? 1.0 : alpha * 8.0;
            if (alpha < 0.012) discard;
            float faceMask = smoothstep(0.14, 0.2, vUv.x) * smoothstep(0.54, 0.47, vUv.x)
              * smoothstep(0.52, 0.62, vUv.y) * smoothstep(0.91, 0.82, vUv.y);
            float eyeBand = smoothstep(0.66, 0.71, vUv.y) * smoothstep(0.8, 0.74, vUv.y);
            float mouthBand = smoothstep(0.55, 0.6, vUv.y) * smoothstep(0.68, 0.63, vUv.y);
            float lieExpression = smoothstep(0.32, 0.7, tension) * faceMask;
            vec3 anxiousTint = vec3(0.88, 0.82, 0.76);
            characterColor.rgb = mix(characterColor.rgb, characterColor.rgb * anxiousTint, lieExpression * 0.2);
            characterColor.rgb = mix(characterColor.rgb, characterColor.rgb * vec3(0.44, 0.38, 0.34), lieExpression * eyeBand * 0.45);
            characterColor.rgb = mix(characterColor.rgb, characterColor.rgb * vec3(0.58, 0.46, 0.42), lieExpression * mouthBand * 0.28);
            gl_FragColor = vec4(characterColor.rgb, alpha);
          }
        `,
        transparent: true,
        depthWrite: false
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.renderOrder = 1;
      scene.add(mesh);
      resources.push(geometry, material);
    };

    const setCharacterTexture = async (url: string) => {
      if (!url || url === currentUrl || !material) return;
      currentUrl = url;
      const nextTexture = await loadTexture(url);
      if (disposed || currentUrl !== url) return;
      previousTexture = currentTexture || nextTexture;
      currentTexture = nextTexture;
      material.uniforms.previousMap.value = previousTexture;
      material.uniforms.currentMap.value = currentTexture;
      transition = 0;
      transitionVelocity = 0;
    };

    const mutationObserver = new MutationObserver(() => {
      const nextUrl = screen.dataset.characterScene;
      if (nextUrl) void setCharacterTexture(nextUrl);
    });
    const enforceEmptyBackground = () => {
      const resolved = new URL(plate.getAttribute("src") || "", window.location.href).pathname;
      if (resolved !== EMPTY_ROOM) plate.src = EMPTY_ROOM;
    };
    const plateObserver = new MutationObserver(enforceEmptyBackground);

    const render = (now: number) => {
      if (disposed) return;
      const dt = Math.min(0.033, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      const state = screen.dataset.interrogationReaction || "calm";
      const target = REACTION_TARGETS[state] || REACTION_TARGETS.calm;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1;
      const ease = 1 - Math.exp(-dt * (state === "shocked" ? 13 : 5.2));
      reactionTurn += (target.turn * reduced - reactionTurn) * ease;
      reactionLean += (target.lean * reduced - reactionLean) * ease;
      reactionRecoil += (target.recoil * reduced - reactionRecoil) * ease;
      if (transition < 1) {
        transitionVelocity += (1 - transition) * 10 * dt;
        transitionVelocity *= Math.exp(-5.4 * dt);
        transition = Math.min(1, transition + transitionVelocity * dt);
      }
      if (material) {
        material.uniforms.time.value = now / 1000;
        material.uniforms.turn.value = reactionTurn;
        material.uniforms.lean.value = reactionLean;
        material.uniforms.recoil.value = reactionRecoil;
        material.uniforms.tension.value = target.tension * reduced;
        material.uniforms.transition.value = transition;
      }
      if (screen.classList.contains("active")) renderer.render(scene, camera);
      canvas.dataset.engine = "three.js character difference rig";
      canvas.dataset.reaction = state;
      canvas.dataset.transition = transition.toFixed(3);
      frame = requestAnimationFrame(render);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(screen);
    mutationObserver.observe(screen, { attributes: true, attributeFilter: ["data-character-scene", "data-interrogation-reaction"] });
    plateObserver.observe(plate, { attributes: true, attributeFilter: ["src"] });
    enforceEmptyBackground();
    screen.dataset.characterScene = initialTexture;
    void build();
    frame = requestAnimationFrame(render);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      plateObserver.disconnect();
      scene.clear();
      resources.forEach((resource) => resource.dispose());
      renderer.dispose();
    };
  }, [initialTexture]);

  return <canvas ref={canvasRef} className="interrogation-character-rig" aria-hidden="true" />;
}
