"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type EvidenceMode =
  | "hopaeMark"
  | "diary"
  | "silk"
  | "bundle"
  | "norigae"
  | "bandage"
  | "portrait"
  | "hopaeThread"
  | "pouch"
  | "ledger"
  | "shoeMud"
  | "footprintTrace";

type EvidenceConfig = {
  mode: EvidenceMode;
  folder: string;
  label: string;
  maskMode: number;
  hotspot: readonly [number, number];
  radius: readonly [number, number];
  direction: readonly [number, number];
  retryGuide: string;
  contentScale?: number;
  contentOffset?: readonly [number, number];
};

const CONFIGS: Record<EvidenceMode, EvidenceConfig> = {
  hopaeMark: {
    mode: "hopaeMark",
    folder: "hopae-mark-puzzle",
    label: "호패를 덮은 한지 탁본을 벗기는 입체 감식대",
    maskMode: 0,
    hotspot: [.57, .69],
    radius: [.15, .2],
    direction: [-.72, -.7],
    retryGuide: "호패 위에서 들린 한지 귀퉁이를 잡아 왼쪽 위로 벗기십시오."
  },
  diary: {
    mode: "diary",
    folder: "diary-timeline-puzzle",
    label: "대나무 잠금핀을 빼 번진 일기를 펼치는 입체 감식대",
    maskMode: 1,
    hotspot: [.77, .43],
    radius: [.17, .13],
    direction: [1, 0],
    retryGuide: "오른쪽으로 튀어나온 대나무 핀을 잡아 오른쪽으로 당기십시오."
  },
  silk: {
    mode: "silk",
    folder: "silk-tension-puzzle",
    label: "찢긴 비단 끝을 잡아 조인 옷고름을 펴는 입체 감식대",
    maskMode: 2,
    hotspot: [.2, .68],
    radius: [.17, .2],
    direction: [-1, 0],
    retryGuide: "매듭 왼쪽으로 길게 빠진 비단 끝을 잡아 왼쪽으로 당기십시오.",
    contentScale: .9,
    contentOffset: [.015, 0]
  },
  bundle: {
    mode: "bundle",
    folder: "bundle-puzzle",
    label: "붉은 매듭끈을 당겨 도망 보따리를 푸는 입체 감식대",
    maskMode: 3,
    hotspot: [.75, .56],
    radius: [.23, .17],
    direction: [1, 0],
    retryGuide: "매듭에서 오른쪽으로 나온 붉은 끈을 잡아 오른쪽으로 당기십시오."
  },
  norigae: {
    mode: "norigae",
    folder: "norigae-puzzle",
    label: "휘어진 노리개 고리에서 남색 옷감을 빼내는 입체 감식대",
    maskMode: 4,
    hotspot: [.78, .27],
    radius: [.17, .18],
    direction: [.72, -.7],
    retryGuide: "고리에 걸린 남색 옷감 끝을 잡아 오른쪽 위로 빼내십시오.",
    contentScale: .86,
    contentOffset: [.01, 0]
  },
  bandage: {
    mode: "bandage",
    folder: "bandage-puzzle",
    label: "들린 붕대 끝을 잡아 피 묻은 붕대를 펼치는 입체 감식대",
    maskMode: 5,
    hotspot: [.88, .43],
    radius: [.15, .2],
    direction: [1, 0],
    retryGuide: "오른쪽에서 들린 붕대 끝을 잡아 오른쪽으로 길게 당기십시오."
  },
  portrait: {
    mode: "portrait",
    folder: "portrait-stroke-puzzle",
    label: "붉은 끈을 풀어 숨겨 둔 돌쇠 초상을 펼치는 입체 감식대",
    maskMode: 6,
    hotspot: [.82, .76],
    radius: [.18, .2],
    direction: [.72, .7],
    retryGuide: "두루마리 오른쪽 아래의 붉은 끈 끝을 잡아 오른쪽 아래로 당기십시오."
  },
  hopaeThread: {
    mode: "hopaeThread",
    folder: "hopae-thread-puzzle",
    label: "끊어진 붉은 끈을 호패 구멍에 맞추는 입체 감식대",
    maskMode: 7,
    hotspot: [.64, .28],
    radius: [.19, .18],
    direction: [-1, 0],
    retryGuide: "호패 위의 끊어진 붉은 끈 끝을 잡아 왼쪽 구멍 쪽으로 맞추십시오."
  },
  pouch: {
    mode: "pouch",
    folder: "pouch-lining-puzzle",
    label: "주머니 안감 아랫단을 당겨 남은 자국을 확인하는 입체 감식대",
    maskMode: 8,
    hotspot: [.5, .78],
    radius: [.18, .15],
    direction: [0, 1],
    retryGuide: "주머니 아래로 나온 베이지색 안감 끝을 잡아 아래로 당기십시오."
  },
  ledger: {
    mode: "ledger",
    folder: "ledger-timeline-puzzle",
    label: "장부틀의 등잔 손잡이를 밀어 덧칠한 기록을 비추는 입체 감식대",
    maskMode: 9,
    hotspot: [.14, .51],
    radius: [.15, .16],
    direction: [1, 0],
    retryGuide: "장부틀 왼쪽의 검은 나무 손잡이를 잡아 오른쪽으로 미십시오."
  },
  shoeMud: {
    mode: "shoeMud",
    folder: "shoe-mud-puzzle",
    label: "뒤꿈치에서 들린 진흙 껍질을 벗기는 입체 감식대",
    maskMode: 10,
    hotspot: [.27, .27],
    radius: [.17, .2],
    direction: [1, 0],
    retryGuide: "뒤꿈치에서 들린 진흙 껍질을 잡아 오른쪽으로 벗기십시오."
  },
  footprintTrace: {
    mode: "footprintTrace",
    folder: "footprint-trace-puzzle",
    label: "대나무 축을 굴려 작은 발자국 윤곽을 뜨는 입체 감식대",
    maskMode: 11,
    hotspot: [.84, .49],
    radius: [.14, .34],
    direction: [-1, 0],
    retryGuide: "오른쪽 대나무 축을 잡아 왼쪽으로 굴리십시오."
  }
};

const OPEN_EVENT = "samunmong:evidence-3d-open";
const COMPLETE_EVENT = "samunmong:evidence-3d-complete";
const REJECT_EVENT = "samunmong:evidence-3d-reject";

const vertexShader = `
  uniform float uProgress;
  uniform float uTime;
  uniform float uHint;
  uniform vec2 uCenter;
  uniform vec2 uDirection;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    vec2 delta = uv - uCenter;
    float influence = 1.0 - smoothstep(0.08, 0.38, length(delta));
    float lift = sin(clamp(uProgress, 0.0, 1.0) * 3.14159265);
    transformed.z += influence * lift * 0.1;
    transformed.x += influence * uDirection.x * lift * 0.035;
    transformed.y += influence * -uDirection.y * lift * 0.035;
    transformed.x += influence * uDirection.x * uHint * 0.04;
    transformed.y += influence * -uDirection.y * uHint * 0.04;
    transformed.z += influence * uHint * 0.014;
    transformed.z += influence * sin(uTime * 2.1 + uv.x * 18.0) * 0.0025 * lift;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uBoard;
  uniform sampler2D uState0;
  uniform sampler2D uState1;
  uniform sampler2D uState2;
  uniform sampler2D uState3;
  uniform float uProgress;
  uniform float uTime;
  uniform float uMaskMode;
  uniform vec2 uCenter;
  uniform float uContentScale;
  uniform vec2 uContentOffset;
  varying vec2 vUv;

  float roundedBoxMask(vec2 point, vec2 center, vec2 halfSize, float radius, float feather) {
    vec2 delta = abs(point - center) - halfSize + radius;
    float distanceToEdge = length(max(delta, 0.0)) + min(max(delta.x, delta.y), 0.0) - radius;
    return 1.0 - smoothstep(0.0, feather, distanceToEdge);
  }

  float ellipseMask(vec2 point, vec2 center, vec2 radius, float feather) {
    float distanceToEdge = length((point - center) / radius) - 1.0;
    return 1.0 - smoothstep(0.0, feather, distanceToEdge);
  }

  float capsuleMask(vec2 point, vec2 start, vec2 end, float radius, float feather) {
    vec2 line = end - start;
    float along = clamp(dot(point - start, line) / dot(line, line), 0.0, 1.0);
    float distanceToEdge = length(point - (start + line * along)) - radius;
    return 1.0 - smoothstep(0.0, feather, distanceToEdge);
  }

  float evidenceMask(vec2 point, vec4 evidenceColor, float progress) {
    float phase = smoothstep(0.18, 0.82, progress);
    if (uMaskMode < 0.5) {
      float tag = roundedBoxMask(point, vec2(0.5, 0.52), vec2(0.115, 0.39), 0.035, 0.018);
      float rubbingStart = roundedBoxMask(point, vec2(0.5, 0.61), vec2(0.125, 0.245), 0.025, 0.018);
      float rubbingEnd = roundedBoxMask(point, vec2(0.77, 0.56), vec2(0.145, 0.31), 0.018, 0.018);
      return max(tag, mix(rubbingStart, rubbingEnd, phase));
    }
    if (uMaskMode < 1.5) {
      float bookStart = roundedBoxMask(point, vec2(0.47, 0.52), vec2(0.18, 0.34), 0.035, 0.022);
      float pinStart = roundedBoxMask(point, vec2(0.66, 0.43), vec2(0.19, 0.045), 0.018, 0.025);
      float bookEnd = roundedBoxMask(point, vec2(0.47, 0.52), vec2(0.405, 0.305), 0.025, 0.018);
      float pinEnd = roundedBoxMask(point, vec2(0.91, 0.49), vec2(0.025, 0.315), 0.015, 0.025);
      return mix(max(bookStart, pinStart), max(bookEnd, pinEnd), phase);
    }
    if (uMaskMode < 2.5) {
      float tiedLeft = capsuleMask(point, vec2(0.14, 0.58), vec2(0.43, 0.52), 0.055, 0.014);
      float tiedRight = capsuleMask(point, vec2(0.49, 0.52), vec2(0.87, 0.5), 0.055, 0.014);
      float tiedRing = ellipseMask(point, vec2(0.465, 0.52), vec2(0.075, 0.105), 0.025);
      float openedSilk = roundedBoxMask(point, vec2(0.535, 0.52), vec2(0.365, 0.058), 0.025, 0.014);
      float openedKnot = ellipseMask(point, vec2(0.49, 0.52), vec2(0.09, 0.11), 0.025);
      return mix(max(max(tiedLeft, tiedRight), tiedRing), max(openedSilk, openedKnot), phase);
    }
    if (uMaskMode < 3.5) {
      float bundleStart = max(
        roundedBoxMask(point, vec2(0.39, 0.53), vec2(0.235, 0.3), 0.09, 0.025),
        roundedBoxMask(point, vec2(0.7, 0.51), vec2(0.27, 0.12), 0.06, 0.03)
      );
      float bundleEnd = max(
        roundedBoxMask(point, vec2(0.44, 0.51), vec2(0.34, 0.405), 0.07, 0.022),
        ellipseMask(point, vec2(0.86, 0.56), vec2(0.13, 0.38), 0.12)
      );
      return mix(bundleStart, bundleEnd, phase);
    }
    if (uMaskMode < 4.5) {
      float ornament = capsuleMask(point, vec2(0.1, 0.79), vec2(0.67, 0.36), 0.075, 0.018);
      float hookedCloth = capsuleMask(point, vec2(0.61, 0.36), vec2(0.84, 0.22), 0.065, 0.018);
      float freedCloth = roundedBoxMask(point, vec2(0.76, 0.28), vec2(0.15, 0.08), 0.03, 0.022);
      return max(ornament, mix(hookedCloth, freedCloth, phase));
    }
    if (uMaskMode < 5.5) {
      float rolledBandage = max(
        ellipseMask(point, vec2(0.35, 0.47), vec2(0.12, 0.18), 0.05),
        max(
          capsuleMask(point, vec2(0.38, 0.57), vec2(0.62, 0.63), 0.085, 0.04),
          capsuleMask(point, vec2(0.61, 0.63), vec2(0.87, 0.51), 0.065, 0.025)
        )
      );
      float openedBandage = capsuleMask(point, vec2(0.12, 0.52), vec2(0.92, 0.52), 0.085, 0.035);
      float workingArea = mix(rolledBandage, openedBandage, phase);
      float luminance = dot(evidenceColor.rgb, vec3(0.2126, 0.7152, 0.0722));
      float cloth = smoothstep(0.05, 0.22, luminance);
      return workingArea * mix(0.72, 1.0, cloth);
    }
    if (uMaskMode < 6.5) {
      float closedScroll = roundedBoxMask(point, vec2(0.46, 0.52), vec2(0.095, 0.425), 0.055, 0.028);
      float closedCord = max(
        capsuleMask(point, vec2(0.46, 0.51), vec2(0.82, 0.76), 0.055, 0.09),
        ellipseMask(point, vec2(0.82, 0.79), vec2(0.12, 0.15), 0.13)
      );
      float openScroll = roundedBoxMask(point, vec2(0.48, 0.51), vec2(0.265, 0.43), 0.05, 0.025);
      float looseCord = roundedBoxMask(point, vec2(0.82, 0.74), vec2(0.13, 0.19), 0.075, 0.04);
      return mix(max(closedScroll, closedCord), max(openScroll, looseCord), phase);
    }
    if (uMaskMode < 7.5) {
      return roundedBoxMask(point, vec2(0.53, 0.51), vec2(0.29, 0.39), 0.018, 0.018);
    }
    if (uMaskMode < 8.5) {
      float pouchBody = roundedBoxMask(point, vec2(0.5, 0.5), vec2(0.185, 0.43), 0.055, 0.025);
      float pouchCord = roundedBoxMask(point, vec2(0.5, 0.3), vec2(0.28, 0.18), 0.1, 0.045);
      return max(pouchBody, pouchCord);
    }
    if (uMaskMode < 9.5) {
      float ledgerFrame = roundedBoxMask(point, vec2(0.58, 0.49), vec2(0.34, 0.385), 0.025, 0.025);
      float lampHandle = roundedBoxMask(point, vec2(0.18, 0.51), vec2(0.16, 0.085), 0.04, 0.03);
      return max(ledgerFrame, lampHandle);
    }
    if (uMaskMode < 10.5) {
      float coveredShoe = ellipseMask(point, vec2(0.49, 0.5), vec2(0.34, 0.3), 0.1);
      float upperSole = ellipseMask(point, vec2(0.53, 0.25), vec2(0.28, 0.17), 0.12);
      float lowerShoe = ellipseMask(point, vec2(0.47, 0.64), vec2(0.34, 0.27), 0.1);
      return mix(coveredShoe, max(upperSole, lowerShoe), phase);
    }
    float footprintTray = roundedBoxMask(point, vec2(0.54, 0.53), vec2(0.4, 0.33), 0.035, 0.025);
    float rollerStart = roundedBoxMask(point, vec2(0.84, 0.49), vec2(0.055, 0.41), 0.03, 0.025);
    float rollerEnd = roundedBoxMask(point, vec2(0.18, 0.5), vec2(0.055, 0.41), 0.03, 0.025);
    return max(footprintTray, mix(rollerStart, rollerEnd, phase));
  }

  vec4 sequenceColor(vec2 uv, float progress) {
    float phase = clamp(progress, 0.0, 1.0) * 3.0;
    if (phase < 1.0) {
      return mix(texture2D(uState0, uv), texture2D(uState1, uv), smoothstep(0.36, 0.64, phase));
    }
    if (phase < 2.0) {
      return mix(texture2D(uState1, uv), texture2D(uState2, uv), smoothstep(0.36, 0.64, phase - 1.0));
    }
    return mix(texture2D(uState2, uv), texture2D(uState3, uv), smoothstep(0.36, 0.64, phase - 2.0));
  }

  vec3 gradeInspectionLight(vec3 color) {
    vec3 lifted = pow(max(color, vec3(0.0)), vec3(0.72));
    vec3 warmed = lifted * vec3(1.13, 1.095, 1.045);
    return clamp(warmed + vec3(0.018, 0.013, 0.008), 0.0, 1.0);
  }

  void main() {
    float influence = 1.0 - smoothstep(0.06, 0.4, distance(vUv, uCenter));
    float activeMotion = sin(clamp(uProgress, 0.0, 1.0) * 3.14159265);
    vec2 sampledUv = (vUv - vec2(0.5) - uContentOffset) / uContentScale + vec2(0.5);
    sampledUv.y += sin(vUv.x * 34.0 + uTime * 2.0) * 0.0016 * influence * activeMotion;
    sampledUv.x += sin(vUv.y * 28.0 - uTime * 1.4) * 0.0011 * influence * activeMotion;
    vec4 color = sequenceColor(sampledUv, uProgress);
    vec4 board = texture2D(uBoard, vUv);
    vec2 imagePoint = vec2(sampledUv.x, 1.0 - sampledUv.y);
    float inBounds = step(0.0, sampledUv.x) * step(sampledUv.x, 1.0) * step(0.0, sampledUv.y) * step(sampledUv.y, 1.0);
    float objectAlpha = evidenceMask(imagePoint, color, uProgress) * inBounds;
    float contactLight = influence * activeMotion * 0.035;
    color.rgb += vec3(0.16, 0.1, 0.045) * contactLight;
    board.rgb = gradeInspectionLight(board.rgb);
    color.rgb = gradeInspectionLight(color.rgb);
    gl_FragColor = mix(board, color, clamp(objectAlpha, 0.0, 1.0));
  }
`;

function isEvidenceMode(value: unknown): value is EvidenceMode {
  return typeof value === "string" && value in CONFIGS;
}

function makeFallbackTexture() {
  const data = new Uint8Array([18, 12, 8, 255]);
  const texture = new THREE.DataTexture(data, 1, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export default function JoseonEvidenceInspection3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeMode, setActiveMode] = useState<EvidenceMode | null>(null);
  const [loadStatus, setLoadStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = document.getElementById("specialPuzzleStage");
    const panel = document.getElementById("specialEvidencePuzzlePanel");
    if (!canvas || !stage || !panel) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: false,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090705);
    const camera = new THREE.PerspectiveCamera(32, 16 / 9, .1, 30);
    camera.position.set(0, 0, 10.7);
    const geometry = new THREE.PlaneGeometry(10.67, 6, 52, 30);
    const fallback: THREE.Texture = makeFallbackTexture();
    const uniforms = {
      uBoard: { value: fallback },
      uState0: { value: fallback },
      uState1: { value: fallback },
      uState2: { value: fallback },
      uState3: { value: fallback },
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uHint: { value: 0 },
      uMaskMode: { value: 0 },
      uCenter: { value: new THREE.Vector2(.5, .5) },
      uDirection: { value: new THREE.Vector2(1, 0) },
      uContentScale: { value: 1 },
      uContentOffset: { value: new THREE.Vector2(0, 0) }
    };
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, toneMapped: false });
    const surface = new THREE.Mesh(geometry, material);
    scene.add(surface);

    const textureLoader = new THREE.TextureLoader();
    let boardTexture: THREE.Texture | null = null;
    const boardTexturePromise = textureLoader
      .loadAsync("/samunmong/assets/interactions/shared-inspection/joseon-investigation-board-flat-bright-v1.png")
      .then((texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(12, renderer.capabilities.getMaxAnisotropy());
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        boardTexture = texture;
        return texture;
      });
    let textures: THREE.Texture[] = [];
    let currentConfig: EvidenceConfig | null = null;
    let active = false;
    let ready = false;
    let frame = 0;
    let pointerId = -1;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let progress = 0;
    let targetProgress = 0;
    let dragging = false;
    let completionSent = false;
    let loadVersion = 0;
    let idleTime = 0;
    let interactionStarted = false;
    let rejectImpulse = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const normalizedPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
        rect
      };
    };

    const pointerHitsHandle = (x: number, y: number, tolerance = 1) => {
      if (!currentConfig) return false;
      const scale = currentConfig.contentScale ?? 1;
      const offset = currentConfig.contentOffset ?? [0, 0];
      const hotspotX = .5 + (currentConfig.hotspot[0] - .5) * scale + offset[0];
      const hotspotY = .5 + (currentConfig.hotspot[1] - .5) * scale - offset[1];
      const dx = (x - hotspotX) / (currentConfig.radius[0] * scale * tolerance);
      const dy = (y - hotspotY) / (currentConfig.radius[1] * scale * tolerance);
      return dx * dx + dy * dy <= 1;
    };

    const rejectInteraction = (reason: "miss" | "direction") => {
      rejectImpulse = 1;
      window.dispatchEvent(new CustomEvent(REJECT_EVENT, {
        detail: {
          mode: currentConfig?.mode,
          reason,
          guide: currentConfig?.retryGuide
        }
      }));
    };

    const disposeTextures = () => {
      textures.forEach((texture) => texture.dispose());
      textures = [];
    };

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      const fitHeight = 6;
      const fitWidth = fitHeight * camera.aspect;
      surface.scale.x = Math.max(1, fitWidth / 10.67);
    };

    const loadMode = async (mode: EvidenceMode) => {
      const version = ++loadVersion;
      const config = CONFIGS[mode];
      setLoadStatus("loading");
      ready = false;
      stage.dataset.webglEvidence = "loading";
      canvas.removeAttribute("data-mode");
      canvas.dataset.progress = "0";
      canvas.style.cursor = "default";
      canvas.classList.remove("is-ready", "is-dragging");
      disposeTextures();
      let loaded: THREE.Texture[];
      try {
        const [board, ...stateTextures] = await Promise.all([
          boardTexturePromise,
          ...[1, 2, 3, 4].map((state) =>
            textureLoader.loadAsync(`/samunmong/assets/interactions/${config.folder}/state-${state}.png`)
          )
        ]);
        uniforms.uBoard.value = board;
        loaded = stateTextures;
      } catch {
        if (version === loadVersion) {
          active = false;
          currentConfig = null;
          setLoadStatus("error");
          stage.removeAttribute("data-webgl-evidence");
          canvas.classList.remove("is-ready", "is-dragging");
        }
        return;
      }
      if (version !== loadVersion) {
        loaded.forEach((texture) => texture.dispose());
        return;
      }
      loaded.forEach((texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(12, renderer.capabilities.getMaxAnisotropy());
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
      });
      textures = loaded;
      uniforms.uState0.value = loaded[0];
      uniforms.uState1.value = loaded[1];
      uniforms.uState2.value = loaded[2];
      uniforms.uState3.value = loaded[3];
      currentConfig = config;
      uniforms.uMaskMode.value = config.maskMode;
      const contentScale = config.contentScale ?? 1;
      const contentOffset = config.contentOffset ?? [0, 0];
      uniforms.uContentScale.value = contentScale;
      uniforms.uContentOffset.value.set(contentOffset[0], contentOffset[1]);
      uniforms.uCenter.value.set(
        .5 + (config.hotspot[0] - .5) * contentScale + contentOffset[0],
        .5 + ((1 - config.hotspot[1]) - .5) * contentScale + contentOffset[1]
      );
      uniforms.uDirection.value.set(config.direction[0], -config.direction[1]);
      progress = 0;
      targetProgress = 0;
      completionSent = false;
      interactionStarted = false;
      idleTime = 0;
      rejectImpulse = 0;
      uniforms.uProgress.value = 0;
      uniforms.uHint.value = 0;
      ready = true;
      setLoadStatus("ready");
      stage.dataset.webglEvidence = "ready";
      canvas.dataset.mode = mode;
      canvas.classList.add("is-ready");
      resize();
    };

    const openMode = (event: Event) => {
      const mode = (event as CustomEvent<{ mode?: string }>).detail?.mode;
      if (!isEvidenceMode(mode)) return;
      active = true;
      setActiveMode(mode);
      void loadMode(mode);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!active || !ready || !currentConfig || progress >= .995) return;
      const pointer = normalizedPointer(event);
      const tolerance = event.pointerType === "touch" ? 1.5 : 1.22;
      if (!pointerHitsHandle(pointer.x, pointer.y, tolerance)) {
        rejectInteraction("miss");
        return;
      }
      interactionStarted = true;
      uniforms.uHint.value = 0;
      pointerId = event.pointerId;
      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
      dragging = true;
      canvas.setPointerCapture?.(event.pointerId);
      canvas.classList.add("is-dragging");
      event.preventDefault();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!active || !ready || !currentConfig) return;
      const pointer = normalizedPointer(event);
      if (!dragging) {
        canvas.style.cursor = pointerHitsHandle(pointer.x, pointer.y, 1.22) ? "grab" : "default";
        return;
      }
      if (event.pointerId !== pointerId) return;
      const dx = (event.clientX - pointerStartX) / pointer.rect.width;
      const dy = (event.clientY - pointerStartY) / pointer.rect.height;
      const directedDistance = dx * currentConfig.direction[0] + dy * currentConfig.direction[1];
      progress = THREE.MathUtils.clamp(directedDistance / .23, 0, 1);
      targetProgress = progress;
      uniforms.uProgress.value = progress;
      event.preventDefault();
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!dragging || event.pointerId !== pointerId) return;
      canvas.releasePointerCapture?.(event.pointerId);
      dragging = false;
      pointerId = -1;
      canvas.classList.remove("is-dragging");
      if (progress >= .52) {
        targetProgress = 1;
      } else {
        targetProgress = 0;
        rejectInteraction("direction");
      }
      event.preventDefault();
    };

    const onPointerLeave = () => {
      if (!dragging) canvas.style.cursor = "default";
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!active || !ready || !currentConfig || progress >= .995) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      interactionStarted = true;
      uniforms.uHint.value = 0;
      targetProgress = 1;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_EVENT, openMode);

    const panelObserver = new MutationObserver(() => {
      active = panel.getAttribute("aria-hidden") === "false" && isEvidenceMode(stage.dataset.specialMode);
      if (!active) {
        setActiveMode(null);
        stage.removeAttribute("data-webgl-evidence");
        canvas.removeAttribute("data-mode");
        canvas.removeAttribute("data-progress");
        setLoadStatus("idle");
        canvas.style.cursor = "default";
        canvas.classList.remove("is-ready", "is-dragging");
      }
    });
    panelObserver.observe(panel, { attributes: true, attributeFilter: ["aria-hidden"] });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
    resize();

    const clock = new THREE.Clock();
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), .05);
      if (!active || !ready) return;
      uniforms.uTime.value += delta;
      if (!reduceMotion && !dragging && !interactionStarted && progress < .001) {
        idleTime += delta;
        const hintPhase = idleTime > 1.6 ? (idleTime - 1.6) % 3.4 : -1;
        uniforms.uHint.value = hintPhase >= 0 && hintPhase < .72
          ? Math.sin((hintPhase / .72) * Math.PI) * .72
          : 0;
      } else {
        uniforms.uHint.value = THREE.MathUtils.lerp(uniforms.uHint.value, 0, .22);
      }
      if (!dragging) {
        const damping = 1 - Math.exp(-delta * (targetProgress > progress ? 8.5 : 10.5));
        progress = THREE.MathUtils.lerp(progress, targetProgress, damping);
        if (Math.abs(progress - targetProgress) < .001) progress = targetProgress;
        uniforms.uProgress.value = progress;
      }
      if (progress >= .985 && targetProgress === 1 && !completionSent && currentConfig) {
        completionSent = true;
        window.dispatchEvent(new CustomEvent(COMPLETE_EVENT, { detail: { mode: currentConfig.mode } }));
      }
      rejectImpulse = Math.max(0, rejectImpulse - delta * 3.8);
      const rejectWobble = reduceMotion ? 0 : Math.sin((1 - rejectImpulse) * Math.PI * 5) * rejectImpulse;
      surface.rotation.x = THREE.MathUtils.lerp(surface.rotation.x, dragging ? -.012 : 0, .08);
      surface.rotation.y = THREE.MathUtils.lerp(surface.rotation.y, dragging ? currentConfig!.direction[0] * .008 : 0, .08);
      surface.rotation.z = THREE.MathUtils.lerp(surface.rotation.z, rejectWobble * .004, .3);
      surface.position.x = THREE.MathUtils.lerp(surface.position.x, rejectWobble * .025, .3);
      renderer.render(scene, camera);
      canvas.dataset.progress = progress.toFixed(3);
      canvas.dataset.frame = String(Number(canvas.dataset.frame || "0") + 1);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      ++loadVersion;
      resizeObserver.disconnect();
      panelObserver.disconnect();
      window.removeEventListener(OPEN_EVENT, openMode);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("keydown", onKeyDown);
      disposeTextures();
      boardTexture?.dispose();
      fallback.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      className="joseon-evidence-inspection-3d"
      data-active={activeMode ? "true" : "false"}
      data-mode={activeMode || ""}
    >
      <canvas
        ref={canvasRef}
        data-engine="three.js sequenced evidence inspection"
        aria-label={activeMode ? CONFIGS[activeMode].label : "입체 증거 감식대"}
        aria-describedby="specialPuzzleGuide"
        aria-keyshortcuts="Enter Space"
        tabIndex={activeMode ? 0 : -1}
      />
      {activeMode && loadStatus !== "ready" ? (
        <div className="joseon-evidence-load-state" data-status={loadStatus} role="status" aria-live="polite">
          <span>{loadStatus === "error" ? "감식대를 불러오지 못했습니다." : "증거를 조사판에 올리는 중"}</span>
          {loadStatus === "error" ? (
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { mode: activeMode } }))}
            >
              다시 불러오기
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
