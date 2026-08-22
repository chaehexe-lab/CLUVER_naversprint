"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const SOURCE_ASPECT = 16 / 9;

type Point = { x: number; y: number };
type FlameSpec = Point & { size?: number };
type DrawerSpec = Point & { width: number; height: number; label: string };
type DoorSpec = Point & { width: number; height: number; label: string };
type TreeSpec = Point & { scale?: number; label: string };
type HangingSpec = Point & { length?: number; label: string };
type SceneSpec = {
  flames?: FlameSpec[];
  mist?: Point[];
  water?: boolean;
  drawers?: DrawerSpec[];
  doors?: DoorSpec[];
  trees?: TreeSpec[];
  hanging?: HangingSpec[];
};

type ActionSpec = { id: string; x: number; y: number; width: number; height: number; label: string; message: string };
type MotionTarget = { value: number; target: number; velocity: number };

const SCENES: Record<string, SceneSpec> = {
  fieldOne: {
    flames: [{ x: 0.11, y: 0.38, size: 0.014 }, { x: 0.622, y: 0.205, size: 0.022 }, { x: 0.887, y: 0.137, size: 0.025 }],
    mist: [{ x: 0.18, y: 0.42 }, { x: 0.7, y: 0.2 }],
    water: true,
    trees: [{ x: 0.075, y: 0.08, scale: 1.08, label: "담장 위 고목" }]
  },
  chunwolRoom: {
    flames: [{ x: 0.22, y: 0.585, size: 0.026 }],
    drawers: [{ x: 0.415, y: 0.405, width: 0.11, height: 0.075, label: "자개 서랍" }]
  },
  mudeokServantRoom: {
    flames: [{ x: 0.31, y: 0.79, size: 0.026 }],
    drawers: [{ x: 0.435, y: 0.405, width: 0.13, height: 0.08, label: "낡은 서랍" }]
  },
  yoomunseokSarangbang: {
    flames: [{ x: 0.34, y: 0.555, size: 0.025 }],
    drawers: [{ x: 0.29, y: 0.455, width: 0.12, height: 0.075, label: "문서 서랍" }]
  },
  dolsoeQuarters: {
    flames: [{ x: 0.58, y: 0.31, size: 0.027 }],
    drawers: [{ x: 0.49, y: 0.61, width: 0.12, height: 0.09, label: "작은 나무궤" }],
    trees: [{ x: 0.8, y: 0.18, scale: 0.68, label: "창밖 나뭇가지" }]
  },
  backGateCourtyard: {
    flames: [{ x: 0.624, y: 0.265, size: 0.031 }],
    mist: [{ x: 0.2, y: 0.28 }, { x: 0.72, y: 0.46 }],
    water: true,
    trees: [{ x: 0.77, y: 0.08, scale: 0.92, label: "달빛 아래 나무" }]
  }
};

function worldPosition(point: Point, z = 0) {
  return new THREE.Vector3((point.x - 0.5) * SOURCE_ASPECT * 2, (0.5 - point.y) * 2, z);
}

function createFlameMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, impulse: { value: 0 } },
    vertexShader: `
      uniform float time;
      uniform float impulse;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 point = position;
        float lift = uv.y;
        point.x += sin(time * 4.2 + uv.y * 7.0) * 0.055 * lift;
        point.x += impulse * 0.12 * lift * lift;
        point.z += sin(time * 3.1 + uv.y * 5.0) * 0.025 * lift;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(point, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float impulse;
      varying vec2 vUv;
      void main() {
        float rise = clamp(vUv.y, 0.0, 1.0);
        float sway = sin(time * 3.6 + rise * 6.5) * 0.055 * rise + impulse * 0.08 * rise;
        float width = mix(0.34, 0.035, pow(rise, 0.72));
        float body = 1.0 - smoothstep(width, width + 0.075, abs(vUv.x - 0.5 - sway));
        float vertical = smoothstep(0.02, 0.13, rise) * (1.0 - smoothstep(0.86, 1.0, rise));
        float alpha = body * vertical;
        float inner = (1.0 - smoothstep(width * 0.28, width * 0.62, abs(vUv.x - 0.5 - sway * 0.35))) * vertical;
        vec3 ember = vec3(1.0, 0.19, 0.025);
        vec3 gold = vec3(1.0, 0.72, 0.17);
        vec3 ivory = vec3(1.0, 0.95, 0.7);
        vec3 color = mix(ember, gold, smoothstep(0.08, 0.62, rise));
        color = mix(color, ivory, inner * (1.0 - rise) * 0.72);
        color *= 0.78 + impulse * 0.34;
        if (alpha < 0.015) discard;
        gl_FragColor = vec4(color, alpha * 0.72);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  });
}

function createMistMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, phase: { value: 0 } },
    vertexShader: `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: `
      uniform float time;
      uniform float phase;
      varying vec2 vUv;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1,0)), f.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
      }
      void main() {
        vec2 p = vUv * vec2(3.6, 2.2);
        p.x += time * (0.035 + phase * 0.004);
        float cloud = noise(p) * 0.62 + noise(p * 2.1 + phase) * 0.28;
        float edge = smoothstep(0.0, 0.22, vUv.x) * smoothstep(0.0, 0.22, 1.0-vUv.x) * smoothstep(0.0, 0.3, vUv.y) * smoothstep(0.0, 0.3, 1.0-vUv.y);
        float alpha = smoothstep(0.46, 0.78, cloud) * edge * 0.2;
        gl_FragColor = vec4(vec3(0.56, 0.64, 0.67), alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending
  });
}

export default function JoseonSceneRig3D({ sceneId, imageUrl }: { sceneId: string; imageUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const actionRef = useRef<(id: string) => void>(() => undefined);
  const [message, setMessage] = useState("");
  const [active, setActive] = useState(false);
  const timeoutRef = useRef<number | undefined>(undefined);
  const spec = SCENES[sceneId];

  useEffect(() => {
    const root = document.getElementById(sceneId);
    if (!root) return;
    const sync = () => setActive(root.classList.contains("active"));
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    sync();
    return () => observer.disconnect();
  }, [sceneId]);

  const actions = useMemo<ActionSpec[]>(() => {
    if (!spec) return [];
    return [
      ...(spec.trees ?? []).map((item, index) => ({ id: `tree-${index}`, x: item.x, y: item.y, width: 0.2, height: 0.24, label: item.label, message: `${item.label}가 바람을 받아 천천히 흔들린다.` })),
      ...(spec.drawers ?? []).map((item, index) => ({ id: `drawer-${index}`, x: item.x, y: item.y, width: item.width * 1.2, height: item.height * 1.45, label: item.label, message: `${item.label}이 낮은 마찰음을 내며 열린다.` })),
      ...(spec.doors ?? []).map((item, index) => ({ id: `door-${index}`, x: item.x, y: item.y, width: item.width * 1.18, height: item.height * 1.12, label: item.label, message: `${item.label}이 경첩을 따라 묵직하게 움직인다.` })),
      ...(spec.hanging ?? []).map((item, index) => ({ id: `hanging-${index}`, x: item.x, y: item.y + (item.length ?? 0.2) * 0.45, width: 0.08, height: item.length ?? 0.2, label: item.label, message: `${item.label}이 손끝을 피하듯 가볍게 흔들린다.` })),
      ...(spec.flames ?? []).map((item, index) => ({ id: `flame-${index}`, x: item.x, y: item.y, width: 0.055, height: 0.1, label: "불꽃", message: "불꽃이 순간 길게 일렁이다 다시 잦아든다." }))
    ];
  }, [spec]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = canvas?.closest<HTMLElement>(`#${sceneId}`);
    if (!active || !canvas || !root || !spec) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.88;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-SOURCE_ASPECT, SOURCE_ASPECT, 1, -1, -5, 5);
    camera.position.z = 3;
    scene.add(new THREE.HemisphereLight(0xa8b4ba, 0x20150e, 1.25));
    const warmLight = new THREE.DirectionalLight(0xffc47b, 1.4);
    warmLight.position.set(-1, 1, 2);
    scene.add(warmLight);

    const resources: Array<{ dispose: () => void }> = [];
    const flameMaterials: THREE.ShaderMaterial[] = [];
    const mistMaterials: THREE.ShaderMaterial[] = [];
    const treeGroups: Array<{ group: THREE.Group; motion: MotionTarget; base: number }> = [];
    const drawerGroups: Array<{ group: THREE.Group; cavity: THREE.MeshBasicMaterial; motion: MotionTarget; baseY: number }> = [];
    const doorGroups: Array<{ pivot: THREE.Group; motion: MotionTarget }> = [];
    const hangingGroups: Array<{ group: THREE.Group; material: THREE.MeshStandardMaterial; motion: MotionTarget; phase: number }> = [];
    let waterMaterial: THREE.ShaderMaterial | undefined;

    (spec.flames ?? []).forEach((item) => {
      const size = item.size ?? 0.03;
      const geometry = new THREE.PlaneGeometry(size * 1.35, size * 2.8, 8, 18);
      geometry.translate(0, size * 1.4, 0);
      const material = createFlameMaterial();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(worldPosition(item, 0.42));
      mesh.renderOrder = 8;
      scene.add(mesh);
      flameMaterials.push(material);
      resources.push(geometry, material);
    });

    (spec.mist ?? []).forEach((item, index) => {
      const geometry = new THREE.PlaneGeometry(1.22, 0.36, 1, 1);
      const material = createMistMaterial();
      material.uniforms.phase.value = index + 0.7;
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(worldPosition(item, 0.08 + index * 0.01));
      mesh.renderOrder = 2;
      scene.add(mesh);
      mistMaterials.push(material);
      resources.push(geometry, material);
    });

    if (spec.water) {
      const geometry = new THREE.PlaneGeometry(SOURCE_ASPECT * 2, 0.72, 1, 1);
      waterMaterial = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader: `
          uniform float time; varying vec2 vUv;
          void main(){
            float a = sin(vUv.x*82.0 + time*1.3 + sin(vUv.y*19.0))*0.5+0.5;
            float b = sin(vUv.x*37.0 - time*0.8 + vUv.y*31.0)*0.5+0.5;
            float ripple = smoothstep(0.82,0.98,a*b) * smoothstep(0.08,0.72,vUv.y);
            gl_FragColor=vec4(vec3(0.42,0.53,0.55),ripple*0.13);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const mesh = new THREE.Mesh(geometry, waterMaterial);
      mesh.position.set(0, -0.65, 0.14);
      mesh.rotation.x = -0.08;
      mesh.renderOrder = 3;
      scene.add(mesh);
      resources.push(geometry, waterMaterial);
    }

    const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x2c1b12, roughness: 0.82, metalness: 0.04 });
    const darkMaterial = new THREE.MeshBasicMaterial({ color: 0x090604, transparent: true, opacity: 0.86 });
    resources.push(woodMaterial, darkMaterial);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(imageUrl, (sourceTexture) => {
      if (disposed) {
        sourceTexture.dispose();
        return;
      }
      sourceTexture.colorSpace = THREE.SRGBColorSpace;
      resources.push(sourceTexture);
      (spec.drawers ?? []).forEach((item) => {
        const width = item.width * SOURCE_ASPECT * 2;
        const height = item.height * 2;
        const cavityGeometry = new THREE.PlaneGeometry(width * 0.94, height * 0.82);
        const cavityMaterial = new THREE.MeshBasicMaterial({ color: 0x070403, transparent: true, opacity: 0 });
        const cavity = new THREE.Mesh(cavityGeometry, cavityMaterial);
        cavity.position.copy(worldPosition(item, 0.25));
        cavity.renderOrder = 5;
        scene.add(cavity);

        const cropTexture = sourceTexture.clone();
        cropTexture.wrapS = THREE.ClampToEdgeWrapping;
        cropTexture.wrapT = THREE.ClampToEdgeWrapping;
        cropTexture.repeat.set(item.width, item.height);
        cropTexture.offset.set(item.x - item.width / 2, 1 - item.y - item.height / 2);
        cropTexture.needsUpdate = true;
        const frontGeometry = new THREE.PlaneGeometry(width, height);
        const frontMaterial = new THREE.MeshBasicMaterial({ map: cropTexture, toneMapped: false });
        const depth = Math.min(0.075, height * 0.48);
        const sideGeometry = new THREE.BoxGeometry(width * 0.96, height * 0.88, depth);
        const group = new THREE.Group();
        group.position.copy(worldPosition(item, 0.33));
        const side = new THREE.Mesh(sideGeometry, woodMaterial);
        side.renderOrder = 6;
        group.add(side);
        const front = new THREE.Mesh(frontGeometry, frontMaterial);
        front.position.z = depth * 0.52;
        front.renderOrder = 8;
        group.add(front);
        const handleGeometry = new THREE.TorusGeometry(Math.min(width, height) * 0.1, 0.006, 8, 24, Math.PI);
        const handleMaterial = new THREE.MeshStandardMaterial({ color: 0x8d6a38, metalness: 0.82, roughness: 0.32 });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(0, -height * 0.04, depth * 0.62);
        handle.rotation.z = Math.PI;
        group.add(handle);
        scene.add(group);
        drawerGroups.push({ group, cavity: cavityMaterial, motion: { value: 0, target: 0, velocity: 0 }, baseY: group.position.y });
        resources.push(cavityGeometry, cavityMaterial, cropTexture, frontGeometry, frontMaterial, sideGeometry, handleGeometry, handleMaterial);
      });
    });

    (spec.doors ?? []).forEach((item) => {
      const width = item.width * SOURCE_ASPECT * 2;
      const height = item.height * 2;
      const holeGeometry = new THREE.PlaneGeometry(width, height);
      const hole = new THREE.Mesh(holeGeometry, darkMaterial);
      hole.position.copy(worldPosition(item, 0.22));
      scene.add(hole);
      const geometry = new THREE.BoxGeometry(width, height, 0.035);
      geometry.translate(width / 2, 0, 0);
      const pivot = new THREE.Group();
      const center = worldPosition(item, 0.34);
      pivot.position.set(center.x - width / 2, center.y, center.z);
      const door = new THREE.Mesh(geometry, woodMaterial);
      door.renderOrder = 7;
      pivot.add(door);
      scene.add(pivot);
      doorGroups.push({ pivot, motion: { value: 0, target: 0, velocity: 0 } });
      resources.push(holeGeometry, geometry);
    });

    const branchMaterial = new THREE.MeshStandardMaterial({ color: 0x17120e, roughness: 0.92, transparent: true, opacity: 0.62 });
    resources.push(branchMaterial);
    (spec.trees ?? []).forEach((item, treeIndex) => {
      const group = new THREE.Group();
      group.position.copy(worldPosition(item, 0.28));
      const scale = item.scale ?? 1;
      const segments = [
        { x: 0, y: 0, length: 0.34 * scale, radius: 0.025 * scale, angle: treeIndex % 2 ? -0.8 : 0.75 },
        { x: -0.1 * scale, y: 0.13 * scale, length: 0.27 * scale, radius: 0.017 * scale, angle: treeIndex % 2 ? -1.15 : 1.1 },
        { x: 0.09 * scale, y: 0.12 * scale, length: 0.22 * scale, radius: 0.013 * scale, angle: treeIndex % 2 ? -0.3 : 0.25 }
      ];
      segments.forEach((segment) => {
        const geometry = new THREE.CylinderGeometry(segment.radius * 0.5, segment.radius, segment.length, 8);
        const branch = new THREE.Mesh(geometry, branchMaterial);
        branch.position.set(segment.x + Math.sin(segment.angle) * segment.length * 0.5, segment.y + Math.cos(segment.angle) * segment.length * 0.5, 0);
        branch.rotation.z = -segment.angle;
        group.add(branch);
        resources.push(geometry);
      });
      scene.add(group);
      treeGroups.push({ group, motion: { value: 0, target: 0, velocity: 0 }, base: treeIndex % 2 ? -0.08 : 0.08 });
    });

    (spec.hanging ?? []).forEach((item, index) => {
      const length = item.length ?? 0.2;
      const group = new THREE.Group();
      group.position.copy(worldPosition(item, 0.38));
      const cordGeometry = new THREE.CylinderGeometry(0.006, 0.007, length * 1.7, 8);
      cordGeometry.translate(0, -length * 0.85, 0);
      const material = new THREE.MeshStandardMaterial({ color: index % 2 ? 0x6f3028 : 0x9a6834, roughness: 0.72, transparent: true, opacity: 0.86 });
      const cord = new THREE.Mesh(cordGeometry, material);
      group.add(cord);
      const weightGeometry = new THREE.OctahedronGeometry(0.035, 1);
      const weight = new THREE.Mesh(weightGeometry, material);
      weight.position.y = -length * 1.72;
      group.add(weight);
      scene.add(group);
      hangingGroups.push({ group, material, motion: { value: 0, target: 0, velocity: 0 }, phase: index * 1.8 });
      resources.push(cordGeometry, weightGeometry, material);
    });

    const trigger = (id: string) => {
      const [kind, rawIndex] = id.split("-");
      const index = Number(rawIndex);
      if (kind === "tree" && treeGroups[index]) treeGroups[index].motion.target = treeGroups[index].motion.target ? 0 : 0.22;
      if (kind === "drawer" && drawerGroups[index]) drawerGroups[index].motion.target = drawerGroups[index].motion.target ? 0 : 1;
      if (kind === "door" && doorGroups[index]) doorGroups[index].motion.target = doorGroups[index].motion.target ? 0 : 1;
      if (kind === "hanging" && hangingGroups[index]) hangingGroups[index].motion.velocity += 1.15;
      if (kind === "flame" && flameMaterials[index]) flameMaterials[index].uniforms.impulse.value = 1;
    };
    actionRef.current = trigger;

    const updateMotion = (motion: MotionTarget, dt: number, stiffness = 16, damping = 7) => {
      motion.velocity += (motion.target - motion.value) * stiffness * dt;
      motion.velocity *= Math.exp(-damping * dt);
      motion.value += motion.velocity * dt;
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let renderedFrames = 0;
    let disposed = false;
    let lastTime = performance.now();
    const resize = () => {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
      renderer.setSize(Math.max(1, root.clientWidth), Math.max(1, root.clientHeight), false);
    };

    const render = (now: number) => {
      if (disposed) return;
      const dt = Math.min(0.033, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      const elapsed = now / 1000;
      const motionScale = reducedMotion.matches ? 0 : 1;

      flameMaterials.forEach((material, index) => {
        material.uniforms.time.value = elapsed + index * 0.53;
        material.uniforms.impulse.value *= Math.exp(-dt * 2.6);
      });
      mistMaterials.forEach((material) => { material.uniforms.time.value = elapsed * motionScale; });
      if (waterMaterial) waterMaterial.uniforms.time.value = elapsed * motionScale;

      treeGroups.forEach((rig, index) => {
        rig.motion.target *= Math.exp(-dt * 1.2);
        updateMotion(rig.motion, dt * motionScale, 13, 4.8);
        rig.group.rotation.z = rig.base + Math.sin(elapsed * (0.42 + index * 0.07)) * 0.018 * motionScale + rig.motion.value;
        rig.group.rotation.y = Math.sin(elapsed * 0.31 + index) * 0.055 * motionScale;
      });
      drawerGroups.forEach((rig) => {
        updateMotion(rig.motion, dt, 19, 8.5);
        rig.group.position.z = 0.33 + rig.motion.value * 0.34;
        rig.group.position.y = rig.baseY - rig.motion.value * 0.048;
        rig.group.rotation.x = -rig.motion.value * 0.34;
        rig.group.scale.setScalar(1 + rig.motion.value * 0.035);
        rig.cavity.opacity = rig.motion.value * 0.78;
      });
      doorGroups.forEach((rig) => {
        updateMotion(rig.motion, dt, 10, 6.5);
        rig.pivot.rotation.y = -rig.motion.value * 1.08;
      });
      hangingGroups.forEach((rig, index) => {
        rig.motion.target = Math.sin(elapsed * (0.75 + index * 0.08) + rig.phase) * 0.045 * motionScale;
        updateMotion(rig.motion, dt, 11, 3.9);
        rig.group.rotation.z = rig.motion.value;
        rig.group.rotation.y = Math.sin(elapsed * 0.51 + rig.phase) * 0.09 * motionScale;
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
      canvas.dataset.engine = "three.js joseon prop rig";
      canvas.dataset.interactions = String(actions.length);
      frame = requestAnimationFrame(render);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);
    frame = requestAnimationFrame(render);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      actionRef.current = () => undefined;
      scene.clear();
      resources.forEach((resource) => resource.dispose());
      renderer.dispose();
    };
  }, [actions.length, active, imageUrl, sceneId, spec]);

  if (!spec) return null;

  const trigger = (action: ActionSpec) => {
    actionRef.current(action.id);
    setMessage(action.message);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setMessage(""), 2300);
  };

  return (
    <div className="joseon-scene-rig" aria-label="상호작용 가능한 장면 오브젝트">
      <canvas ref={canvasRef} className="joseon-scene-rig-canvas" aria-hidden="true" />
      {actions.map((action) => (
        <button
          key={action.id}
          className="joseon-object-hitbox"
          type="button"
          aria-label={`${action.label} 살펴보기`}
          style={{
            left: `${(action.x - action.width / 2) * 100}%`,
            top: `${(action.y - action.height / 2) * 100}%`,
            width: `${action.width * 100}%`,
            height: `${action.height * 100}%`
          }}
          onClick={() => trigger(action)}
        />
      ))}
      <p className={`joseon-object-comment${message ? " show" : ""}`} aria-live="polite">{message}</p>
    </div>
  );
}
