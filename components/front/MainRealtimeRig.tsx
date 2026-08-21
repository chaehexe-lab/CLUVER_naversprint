"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const SOURCE_ASPECT = 1664 / 936;

type PendulumState = {
  angle: number;
  velocity: number;
  depth: number;
  depthVelocity: number;
};

type OrnamentRig = {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  material: THREE.ShaderMaterial;
  state: PendulumState;
  phase: number;
  stiffness: number;
  damping: number;
};

type MistRig = {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  origin: THREE.Vector2;
  drift: THREE.Vector2;
  pointerFactor: THREE.Vector2;
  phase: number;
  speed: number;
};

function createTextureMaterial(texture: THREE.Texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: texture },
      opacity: { value: 1 },
      bend: { value: 0 },
      depthBend: { value: 0 },
      uvOffset: { value: new THREE.Vector2(0, 0) },
      uvScale: { value: new THREE.Vector2(1, 1) }
    },
    vertexShader: `
      uniform float bend;
      uniform float depthBend;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vec3 point = position;
        float fromAnchor = 1.0 - uv.y;
        float delayedMotion = sin(fromAnchor * 3.14159265) * bend;
        point.x += fromAnchor * bend + delayedMotion * 0.34;
        point.z += sin(fromAnchor * 3.14159265) * depthBend;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(point, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform float opacity;
      uniform vec2 uvOffset;
      uniform vec2 uvScale;
      varying vec2 vUv;

      void main() {
        vec2 sampleUv = uvOffset + vUv * uvScale;
        vec4 color = texture2D(map, sampleUv);
        if (color.a < 0.015) discard;
        gl_FragColor = vec4(color.rgb, color.a * opacity);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide
  });
}

function createWaterMaterial(texture: THREE.Texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: texture },
      time: { value: 0 },
      pointer: { value: new THREE.Vector2(0, 0) },
      opacity: { value: 0.72 }
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
      uniform vec2 pointer;
      uniform float opacity;
      varying vec2 vUv;

      void main() {
        vec2 rippleUv = vUv;
        float lowerMask = smoothstep(0.34, 0.82, 1.0 - vUv.y);
        rippleUv.x += sin(vUv.y * 118.0 + time * 1.45) * 0.0018 * lowerMask;
        rippleUv.x += sin(vUv.y * 53.0 - time * 0.82) * 0.0011 * lowerMask;
        rippleUv.y += sin(vUv.x * 72.0 + time * 1.08) * 0.0013 * lowerMask;
        rippleUv += pointer * 0.0012 * lowerMask;
        vec4 color = texture2D(map, rippleUv);
        float pulse = 0.82 + sin(time * 2.2 + vUv.x * 18.0) * 0.12;
        gl_FragColor = vec4(color.rgb * pulse, color.a * opacity * lowerMask);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
}

function createSchoolWindowMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      pointer: { value: new THREE.Vector2(0, 0) }
    },
    vertexShader: `
      uniform vec2 pointer;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vec3 point = position;
        point.x += (uv.y - 0.5) * -0.004 + pointer.x * 0.0008;
        point.y += pointer.y * 0.0005;
        point.z += (uv.x - 0.5) * 0.008;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(point, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      void main() {
        vec2 p = vUv - vec2(0.5, 0.0);
        float lowerPane = (1.0 - step(0.39, abs(p.x))) * (1.0 - step(0.73, vUv.y));
        float pointedWidth = mix(0.39, 0.015, smoothstep(0.71, 1.0, vUv.y));
        float upperPane = (1.0 - step(pointedWidth, abs(p.x))) * step(0.7, vUv.y);
        float windowMask = max(lowerPane, upperPane);

        float verticalBar = 1.0 - smoothstep(0.035, 0.075, abs(p.x));
        float crossBar = 1.0 - smoothstep(0.018, 0.045, abs(vUv.y - 0.48));
        float frameMask = 1.0 - clamp(max(verticalBar, crossBar), 0.0, 1.0) * 0.9;

        vec2 portalP = vec2((vUv.x - 0.5) * 1.55, (vUv.y - 0.48) * 0.86);
        portalP.x += sin(portalP.y * 8.0 - time * 0.34) * 0.035;
        float radius = length(portalP);
        float angle = atan(portalP.y, portalP.x);
        float spiralA = sin(angle * 4.0 - time * 0.42 + radius * 18.0) * 0.5 + 0.5;
        float spiralB = sin(angle * -3.0 + time * 0.27 + radius * 27.0) * 0.5 + 0.5;
        float depth = smoothstep(0.74, 0.05, radius);
        float current = smoothstep(0.66, 0.2, abs(sin(angle * 2.0 + radius * 13.0 - time * 0.31))) * depth;

        vec2 starCell = floor((portalP + vec2(time * 0.008, -time * 0.004)) * 42.0);
        vec2 starUv = fract((portalP + vec2(time * 0.008, -time * 0.004)) * 42.0) - 0.5;
        float starSeed = hash21(starCell);
        float stars = step(0.94, starSeed) * (1.0 - smoothstep(0.025, 0.12, length(starUv))) * depth;

        float sideEdge = 1.0 - smoothstep(0.025, 0.095, abs(abs(p.x) - 0.36));
        float upperEdge = 1.0 - smoothstep(0.018, 0.07, abs(abs(p.x) - pointedWidth));
        upperEdge *= step(0.68, vUv.y);
        float lowerEdge = sideEdge * (1.0 - step(0.72, vUv.y));
        float rim = max(lowerEdge, upperEdge) * (0.72 + sin(time * 1.1 + vUv.y * 13.0) * 0.18);

        vec3 voidBlack = vec3(0.005, 0.004, 0.014);
        vec3 deepViolet = vec3(0.105, 0.025, 0.19);
        vec3 coldTeal = vec3(0.09, 0.27, 0.3);
        vec3 color = mix(voidBlack, deepViolet, spiralA * 0.62 + spiralB * 0.18);
        color = mix(color, coldTeal, current * 0.22);
        color += vec3(0.48, 0.32, 0.72) * stars;
        color += vec3(0.35, 0.16, 0.53) * rim * 0.55;
        float alpha = windowMask * frameMask * (0.58 + depth * 0.22 + rim * 0.18);
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    blending: THREE.NormalBlending,
    depthWrite: false
  });
}

function createArcanePortalMaterial(layer: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      layer: { value: layer },
      opacity: { value: layer === 0 ? 0.68 : 0.9 }
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
      uniform float layer;
      uniform float opacity;
      varying vec2 vUv;

      float ring(float radius, float target, float width) {
        return 1.0 - smoothstep(width, width * 2.2, abs(radius - target));
      }

      float angularDash(float angle, float count, float duty) {
        float segment = fract(angle / 6.2831853 * count);
        return 1.0 - smoothstep(duty, duty + 0.09, abs(segment - 0.5));
      }

      void main() {
        vec2 p = (vUv - 0.5) * 2.0;
        float radius = length(p);
        float angle = atan(p.y, p.x);
        float circleMask = 1.0 - smoothstep(0.96, 1.02, radius);
        float pulse = 0.82 + sin(time * 0.72 + layer * 1.7) * 0.11;

        if (layer < 0.5) {
          float swirl = sin(angle * 5.0 - time * 0.46 + radius * 15.0) * 0.5 + 0.5;
          float secondSwirl = sin(angle * -3.0 + time * 0.31 + radius * 22.0) * 0.5 + 0.5;
          float depth = smoothstep(0.94, 0.06, radius);
          float pinprick = pow(max(0.0, sin(angle * 17.0 + radius * 83.0 - time * 0.6)), 28.0);
          float brokenRim = ring(radius, 0.88 + sin(angle * 7.0 - time * 0.38) * 0.012, 0.012);
          vec3 voidColor = mix(vec3(0.006, 0.004, 0.014), vec3(0.13, 0.035, 0.19), swirl * 0.42 + secondSwirl * 0.18);
          voidColor += vec3(0.3, 0.24, 0.48) * pinprick * depth;
          voidColor += vec3(0.42, 0.12, 0.58) * brokenRim * (0.42 + secondSwirl * 0.28);
          float edge = ring(radius, 0.9, 0.028);
          float alpha = circleMask * depth * opacity + edge * 0.42 + brokenRim * 0.38;
          gl_FragColor = vec4(voidColor, alpha);
          return;
        }

        float outer = ring(radius, 0.91, 0.008);
        float inner = ring(radius, 0.72, 0.006);
        float middle = ring(radius, 0.52, 0.005);
        float runeBand = ring(radius, 0.81, 0.007);
        float runeMarks = angularDash(angle + time * 0.035 * layer, 34.0, 0.11);
        float runes = runeBand * runeMarks;
        float spokePhase = abs(fract((angle - time * 0.022 * layer) / 6.2831853 * (layer < 1.5 ? 8.0 : 6.0)) - 0.5);
        float spokes = 1.0 - smoothstep(0.012, 0.032, spokePhase);
        spokes *= smoothstep(0.4, 0.46, radius) * smoothstep(0.76, 0.7, radius);

        vec2 triangleP = abs(p);
        float diagonalA = 1.0 - smoothstep(0.008, 0.024, abs(p.y - p.x * 0.58));
        float diagonalB = 1.0 - smoothstep(0.008, 0.024, abs(p.y + p.x * 0.58));
        float geometry = (diagonalA + diagonalB) * smoothstep(0.66, 0.59, radius) * smoothstep(0.2, 0.28, radius);
        geometry += ring(length(triangleP), 0.29, 0.007);

        float halo = ring(radius, 0.91, 0.035) * 0.13 + ring(radius, 0.72, 0.024) * 0.1;
        float sigil = clamp(outer * 0.78 + inner * 0.68 + middle * 0.54 + runes * 0.74 + spokes * 0.34 + geometry * 0.28 + halo, 0.0, 1.0);
        vec3 violet = vec3(0.42, 0.2, 0.66);
        vec3 antiqueGold = vec3(0.88, 0.59, 0.24);
        vec3 coldCyan = vec3(0.2, 0.64, 0.69);
        vec3 color = layer < 1.5 ? mix(antiqueGold, violet, 0.26) : mix(coldCyan, violet, 0.52);
        float alpha = sigil * circleMask * opacity * pulse * 0.86;
        if (alpha < 0.015) discard;
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    blending: layer === 0 ? THREE.NormalBlending : THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  });
}

function createStarMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
      uniform float time;
      attribute float phase;
      attribute float size;
      varying float vTwinkle;

      void main() {
        vec3 point = position;
        point.x += sin(time * 0.055 + phase) * 0.008;
        point.y += cos(time * 0.041 + phase * 1.7) * 0.004;
        vTwinkle = 0.52 + sin(time * (0.42 + mod(phase, 0.31)) + phase * 2.3) * 0.32;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(point, 1.0);
        gl_PointSize = size;
      }
    `,
    fragmentShader: `
      varying float vTwinkle;
      void main() {
        float radius = distance(gl_PointCoord, vec2(0.5));
        float alpha = smoothstep(0.5, 0.08, radius) * vTwinkle;
        gl_FragColor = vec4(0.72, 0.82, 1.0, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
}

export default function MainRealtimeRig() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const screen = canvas?.closest<HTMLElement>("#mainScreen");
    if (!canvas || !screen) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
      premultipliedAlpha: true
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-SOURCE_ASPECT, SOURCE_ASPECT, 1, -1, -10, 10);
    camera.position.z = 5;

    const loader = new THREE.TextureLoader();
    const textureUrls = {
      branch: "/samunmong/assets/interactions/main-2d/branch.png",
      ornaments: "/samunmong/assets/interactions/main-2d/ornaments.png",
      reflections: "/samunmong/assets/interactions/main-2d/water-reflections.png",
      mist: "/samunmong/assets/interactions/atmosphere/joseon-night-mist.png"
    };

    let disposed = false;
    let frame = 0;
    let renderedFrames = 0;
    let active = screen.classList.contains("active");
    let lastTime = performance.now();
    const pointer = new THREE.Vector2();
    const pointerTarget = new THREE.Vector2();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const resources: Array<{ dispose: () => void }> = [];

    const resize = () => {
      // The game shell owns a 1600x900 coordinate system and is scaled to fit
      // the browser. Measuring its transformed bounds would scale this canvas twice.
      const screenWidth = Math.max(1, screen.clientWidth);
      const screenHeight = Math.max(1, screen.clientHeight);
      const screenAspect = screenWidth / screenHeight;
      const width = screenAspect > SOURCE_ASPECT ? Math.round(screenHeight * SOURCE_ASPECT) : screenWidth;
      const height = screenAspect > SOURCE_ASPECT ? screenHeight : Math.round(screenWidth / SOURCE_ASPECT);
      canvas.style.left = `${Math.round((screenWidth - width) / 2)}px`;
      canvas.style.top = `${Math.round((screenHeight - height) / 2)}px`;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
      renderer.setSize(width, height, false);
      camera.left = -SOURCE_ASPECT;
      camera.right = SOURCE_ASPECT;
      camera.top = 1;
      camera.bottom = -1;
      camera.updateProjectionMatrix();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch" || reducedMotion.matches) return;
      const bounds = screen.getBoundingClientRect();
      pointerTarget.x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
      pointerTarget.y = Math.max(-1, Math.min(1, -((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
    };

    const resetPointer = () => pointerTarget.set(0, 0);
    const resizeObserver = new ResizeObserver(resize);
    const classObserver = new MutationObserver(() => {
      active = screen.classList.contains("active");
      if (active) {
        lastTime = performance.now();
        frame = requestAnimationFrame(render);
      }
    });

    let branchMaterial: THREE.ShaderMaterial | undefined;
    let branchMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> | undefined;
    let waterMaterial: THREE.ShaderMaterial | undefined;
    let waterMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> | undefined;
    let ornaments: OrnamentRig[] = [];
    let mistRigs: MistRig[] = [];
    let starMaterial: THREE.ShaderMaterial | undefined;

    const loadTexture = (url: string) =>
      new Promise<THREE.Texture>((resolve, reject) => {
        loader.load(
          url,
          (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            resources.push(texture);
            resolve(texture);
          },
          undefined,
          reject
        );
      });

    const createOrnament = (
      texture: THREE.Texture,
      crop: { x: number; y: number; width: number; height: number },
      anchor: THREE.Vector3,
      displayScale: number,
      phase: number,
      stiffness: number,
      damping: number
    ) => {
      const worldWidth = crop.width * SOURCE_ASPECT * 2 * displayScale;
      const worldHeight = crop.height * 2 * displayScale;
      const geometry = new THREE.PlaneGeometry(worldWidth, worldHeight, 10, 28);
      geometry.translate(0, -worldHeight / 2, 0);
      const material = createTextureMaterial(texture);
      material.uniforms.uvOffset.value.set(crop.x, crop.y);
      material.uniforms.uvScale.value.set(crop.width, crop.height);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(anchor);
      mesh.renderOrder = 6;
      scene.add(mesh);
      resources.push(geometry, material);
      return {
        mesh,
        material,
        state: { angle: 0, velocity: 0, depth: 0, depthVelocity: 0 },
        phase,
        stiffness,
        damping
      } satisfies OrnamentRig;
    };

    const buildScene = async () => {
      const [branchTexture, ornamentTexture, reflectionTexture, mistTexture] = await Promise.all([
        loadTexture(textureUrls.branch),
        loadTexture(textureUrls.ornaments),
        loadTexture(textureUrls.reflections),
        loadTexture(textureUrls.mist)
      ]);
      if (disposed) return;

      const fullGeometry = new THREE.PlaneGeometry(SOURCE_ASPECT * 2.06, 2.06, 34, 18);
      branchMaterial = createTextureMaterial(branchTexture);
      branchMaterial.uniforms.opacity.value = 0.76;
      branchMesh = new THREE.Mesh(fullGeometry, branchMaterial);
      // Keep the branch anchored to the original upper-right silhouette.
      branchMesh.position.set(0.44, 0.25, 0.42);
      branchMesh.scale.setScalar(0.76);
      branchMesh.renderOrder = 5;
      scene.add(branchMesh);
      resources.push(fullGeometry, branchMaterial);

      ornaments = [
        createOrnament(
          ornamentTexture,
          { x: 0.595, y: 0.1, width: 0.115, height: 0.9 },
          new THREE.Vector3(0.5, 1.02, 0.56),
          0.32,
          0.25,
          8.2,
          4.6
        ),
        createOrnament(
          ornamentTexture,
          { x: 0.755, y: 0.43, width: 0.085, height: 0.57 },
          new THREE.Vector3(1.18, 1.02, 0.6),
          0.44,
          1.7,
          7.2,
          4.1
        )
      ];

      const waterGeometry = new THREE.PlaneGeometry(SOURCE_ASPECT * 2.03, 2.03, 1, 1);
      waterMaterial = createWaterMaterial(reflectionTexture);
      waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
      waterMesh.position.z = 0.18;
      waterMesh.renderOrder = 3;
      scene.add(waterMesh);
      resources.push(waterGeometry, waterMaterial);

      const mistGeometry = new THREE.PlaneGeometry(1.7, 0.54, 1, 1);
      const cloudSpecs = [
        { x: -1.1, y: 0.72, z: 0.05, scale: 1.08, opacity: 0.21, driftX: 0.13, driftY: 0.014, pointerX: 0.006, pointerY: 0.003, phase: 0.2, speed: 0.13 },
        { x: 0.72, y: 0.26, z: 0.09, scale: 1.34, opacity: 0.12, driftX: -0.085, driftY: 0.022, pointerX: -0.009, pointerY: 0.005, phase: 2.1, speed: 0.19 },
        { x: -0.25, y: -0.48, z: 0.14, scale: 1.62, opacity: 0.08, driftX: 0.055, driftY: -0.028, pointerX: 0.014, pointerY: -0.008, phase: 4.4, speed: 0.24 }
      ];
      mistRigs = cloudSpecs.map((spec) => {
        const material = new THREE.MeshBasicMaterial({
          map: mistTexture,
          transparent: true,
          opacity: spec.opacity,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        });
        const mesh = new THREE.Mesh(mistGeometry, material);
        mesh.position.set(spec.x, spec.y, spec.z);
        mesh.scale.setScalar(spec.scale);
        mesh.renderOrder = 2;
        scene.add(mesh);
        resources.push(material);
        return {
          mesh,
          origin: new THREE.Vector2(spec.x, spec.y),
          drift: new THREE.Vector2(spec.driftX, spec.driftY),
          pointerFactor: new THREE.Vector2(spec.pointerX, spec.pointerY),
          phase: spec.phase,
          speed: spec.speed
        };
      });
      resources.push(mistGeometry);

      const starCount = 42;
      const starPositions = new Float32Array(starCount * 3);
      const starPhases = new Float32Array(starCount);
      const starSizes = new Float32Array(starCount);
      let randomSeed = 9473;
      const seededRandom = () => {
        randomSeed = (randomSeed * 16807) % 2147483647;
        return (randomSeed - 1) / 2147483646;
      };
      for (let index = 0; index < starCount; index += 1) {
        const nx = 0.906 + seededRandom() * 0.077;
        const ny = 0.37 + seededRandom() * 0.205;
        starPositions[index * 3] = (nx - 0.5) * SOURCE_ASPECT * 2;
        starPositions[index * 3 + 1] = (0.5 - ny) * 2;
        starPositions[index * 3 + 2] = 0.3;
        starPhases[index] = seededRandom() * Math.PI * 2;
        starSizes[index] = 0.8 + seededRandom() * 1.55;
      }
      const starGeometry = new THREE.BufferGeometry();
      starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
      starGeometry.setAttribute("phase", new THREE.BufferAttribute(starPhases, 1));
      starGeometry.setAttribute("size", new THREE.BufferAttribute(starSizes, 1));
      starMaterial = createStarMaterial();
      const stars = new THREE.Points(starGeometry, starMaterial);
      stars.renderOrder = 4;
      scene.add(stars);
      resources.push(starGeometry, starMaterial);
    };

    const updatePendulum = (rig: OrnamentRig, elapsed: number, dt: number, index: number) => {
      const wind = Math.sin(elapsed * 0.72 + rig.phase) * 0.022 + Math.sin(elapsed * 1.61 + rig.phase * 1.7) * 0.008;
      const target = wind + pointer.x * (index === 0 ? 0.026 : 0.034);
      rig.state.velocity += (target - rig.state.angle) * rig.stiffness * dt;
      rig.state.velocity *= Math.exp(-rig.damping * dt);
      rig.state.angle += rig.state.velocity * dt;

      const depthTarget = pointer.y * 0.055 + Math.sin(elapsed * 0.54 + rig.phase) * 0.016;
      rig.state.depthVelocity += (depthTarget - rig.state.depth) * 5.4 * dt;
      rig.state.depthVelocity *= Math.exp(-3.8 * dt);
      rig.state.depth += rig.state.depthVelocity * dt;

      rig.mesh.rotation.z = rig.state.angle;
      rig.mesh.rotation.y = rig.state.depth;
      rig.mesh.rotation.x = -Math.abs(rig.state.depth) * 0.18;
      rig.material.uniforms.bend.value = rig.state.velocity * 0.13;
      rig.material.uniforms.depthBend.value = rig.state.depth * 0.07;
    };

    const render = (now: number) => {
      if (disposed || !active) return;
      const dt = Math.min(0.033, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      const elapsed = now / 1000;
      const motionScale = reducedMotion.matches ? 0 : 1;

      pointer.lerp(pointerTarget, 1 - Math.exp(-dt * 5.4));
      camera.position.x = 0;
      camera.position.y = 0;

      if (branchMaterial && branchMesh) {
        const breeze = Math.sin(elapsed * 0.63) * 0.012 + Math.sin(elapsed * 1.37) * 0.004;
        branchMaterial.uniforms.bend.value = (breeze + pointer.x * 0.006) * motionScale;
        branchMaterial.uniforms.depthBend.value = (Math.sin(elapsed * 0.48) * 0.009 + pointer.y * 0.004) * motionScale;
        branchMesh.rotation.y = pointer.x * 0.004 * motionScale;
      }

      ornaments.forEach((rig, index) => updatePendulum(rig, elapsed, dt * motionScale, index));

      if (waterMaterial) {
        waterMaterial.uniforms.time.value = elapsed * motionScale;
        waterMaterial.uniforms.pointer.value.copy(pointer);
      }

      if (starMaterial) starMaterial.uniforms.time.value = elapsed * motionScale;
      mistRigs.forEach((rig, index) => {
        const cycle = elapsed * rig.speed + rig.phase;
        rig.mesh.position.x = rig.origin.x + (Math.sin(cycle) * rig.drift.x + pointer.x * rig.pointerFactor.x) * motionScale;
        rig.mesh.position.y = rig.origin.y + (Math.sin(cycle * 0.73 + 0.8) * rig.drift.y + pointer.y * rig.pointerFactor.y) * motionScale;
        rig.mesh.rotation.z = Math.sin(cycle * 0.61 + index) * (0.003 + index * 0.002) * motionScale;
      });

      renderer.render(scene, camera);
      renderedFrames += 1;
      if (renderedFrames % 45 === 0) {
        const gl = renderer.getContext();
        const width = Math.min(96, gl.drawingBufferWidth);
        const height = Math.min(96, gl.drawingBufferHeight);
        const x = Math.max(0, Math.floor(gl.drawingBufferWidth * 0.64 - width / 2));
        const y = Math.max(0, Math.floor(gl.drawingBufferHeight * 0.64 - height / 2));
        const sample = new Uint8Array(width * height * 4);
        gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, sample);
        let visiblePixels = 0;
        let signature = 2166136261;
        for (let index = 0; index < sample.length; index += 4) {
          if (sample[index + 3] > 5) visiblePixels += 1;
          signature ^= sample[index] + sample[index + 1] * 3 + sample[index + 2] * 7 + sample[index + 3] * 11;
          signature = Math.imul(signature, 16777619);
        }
        canvas.dataset.visiblePixels = String(visiblePixels);
        canvas.dataset.frameSignature = String(signature >>> 0);
        canvas.dataset.renderCalls = String(renderer.info.render.calls);
        canvas.dataset.triangles = String(renderer.info.render.triangles);
      }
      frame = requestAnimationFrame(render);
    };

    resize();
    resizeObserver.observe(screen);
    classObserver.observe(screen, { attributes: true, attributeFilter: ["class"] });
    screen.addEventListener("pointermove", handlePointerMove);
    screen.addEventListener("pointerleave", resetPointer);
    buildScene().then(() => {
      if (!disposed && active) frame = requestAnimationFrame(render);
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      classObserver.disconnect();
      screen.removeEventListener("pointermove", handlePointerMove);
      screen.removeEventListener("pointerleave", resetPointer);
      scene.clear();
      resources.forEach((resource) => resource.dispose());
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="main-realtime-rig" aria-hidden="true" />;
}
