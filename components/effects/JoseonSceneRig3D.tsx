"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import FieldOneDynamicRig3D from "@/components/effects/FieldOneDynamicRig3D";

const FLAME_SPRITE = "/samunmong/assets/interactions/interrogation-candle/candle-flame-idle-12.png";

type FlameSpec = {
  wick: readonly [x: number, y: number];
  halo: readonly [radiusX: number, radiusY: number];
  width: number;
  height: number;
  phase: number;
  speed: number;
};

type AmbientZone = {
  center: readonly [x: number, y: number];
  radius: readonly [x: number, y: number];
  strength: number;
  speed: number;
  phase: number;
};

type SceneInteraction = {
  id: string;
  label: string;
  message: string;
  x: string;
  y: string;
  width: string;
  height: string;
  clipPath: string;
};

type SceneSpec = {
  width: number;
  height: number;
  flames: readonly FlameSpec[];
  lightStrength?: number;
  midground?: string;
  midgroundOffsetY?: number;
  foreground?: string;
  foregroundMask?: string;
  foregroundOpacity?: number;
  foregroundColor?: number;
  cloudLayer?: {
    src: string;
    mask: string;
    offset: number;
    drift: number;
    speed: number;
    opacity: number;
    colorLift: number;
  };
  repairPlate?: string;
  repairRegions?: readonly {
    center: readonly [x: number, y: number];
    radius: readonly [x: number, y: number];
  }[];
  skyRepair?: {
    src: string;
    mask: string;
  };
  trees?: readonly AmbientZone[];
  clouds?: readonly AmbientZone[];
  interactions: readonly SceneInteraction[];
};

const SCENES: Record<string, SceneSpec> = {
  fieldOne: {
    width: 1672,
    height: 941,
    flames: [
      { wick: [0.112, 0.382], halo: [0.035, 0.075], width: 7, height: 17, phase: 0.2, speed: 6.8 },
      { wick: [0.633, 0.236], halo: [0.05, 0.11], width: 8, height: 19, phase: 1.4, speed: 7.5 },
      { wick: [0.896, 0.119], halo: [0.065, 0.13], width: 8, height: 20, phase: 2.7, speed: 7.1 }
    ],
    trees: [
      { center: [0.1, 0.13], radius: [0.18, 0.17], strength: 0.00085, speed: 0.62, phase: 0.3 },
      { center: [0.37, 0.18], radius: [0.15, 0.13], strength: 0.00048, speed: 0.48, phase: 2.1 }
    ],
    clouds: [
      { center: [0.29, 0.23], radius: [0.27, 0.18], strength: 0.00145, speed: 0.085, phase: 0.7 },
      { center: [0.2, 0.43], radius: [0.18, 0.17], strength: 0.00105, speed: 0.12, phase: 2.8 }
    ],
    interactions: [
      {
        id: "front-gate",
        label: "관아 대문",
        message: "관아로 이어지는 문이다. 밤새 드나든 흔적은 뚜렷하지 않다.",
        x: "50.5%", y: "5%", width: "30%", height: "53%",
        clipPath: "polygon(18% 2%, 96% 1%, 98% 91%, 54% 100%, 5% 81%)"
      },
      {
        id: "gate-lantern",
        label: "대문의 등불",
        message: "기름이 아직 남아 있다. 밤에도 불을 밝혔던 듯하다.",
        x: "56.7%", y: "18.5%", width: "5.8%", height: "17%",
        clipPath: "polygon(34% 2%, 70% 2%, 91% 32%, 79% 96%, 20% 96%, 8% 31%)"
      },
      {
        id: "wet-road",
        label: "젖은 돌길",
        message: "비에 젖은 돌길이다. 여러 발자국이 겹쳐 방향을 알아보기 어렵다.",
        x: "7%", y: "49%", width: "39%", height: "41%",
        clipPath: "polygon(28% 1%, 75% 5%, 100% 100%, 0 100%)"
      },
      {
        id: "fallen-jeomsun",
        label: "쓰러진 점순",
        message: "차가운 돌길 위에 점순이 쓰러져 있다. 미동조차 느껴지지 않는다.",
        x: "43%", y: "57%", width: "31%", height: "29%",
        clipPath: "polygon(2% 32%, 18% 13%, 50% 4%, 72% 17%, 89% 42%, 99% 75%, 88% 96%, 49% 87%, 27% 70%, 5% 67%)"
      }
    ]
  },
  chunwolRoom: {
    width: 1672,
    height: 941,
    flames: [{ wick: [0.275, 0.579], halo: [0.065, 0.13], width: 18, height: 46, phase: 0.5, speed: 7.2 }],
    lightStrength: 0,
    interactions: [
      {
        id: "writing-desk",
        label: "춘월의 서안",
        message: "먹이 아직 마르지 않았다. 조금 전까지 글을 쓴 듯하다.",
        x: "9%", y: "57%", width: "40%", height: "31%",
        clipPath: "polygon(13% 10%, 91% 1%, 100% 55%, 87% 100%, 4% 91%)"
      },
      {
        id: "silk-bedding",
        label: "비단 이불",
        message: "비단 이불이 흐트러져 있다. 편히 잠든 흔적은 보이지 않는다.",
        x: "61%", y: "62%", width: "28%", height: "34%",
        clipPath: "polygon(23% 4%, 96% 17%, 100% 100%, 1% 100%, 8% 35%)"
      },
      {
        id: "lacquer-cabinet",
        label: "자개 장식장",
        message: "장식장의 서랍은 모두 단단히 닫혀 있다.",
        x: "37%", y: "17%", width: "15%", height: "41%",
        clipPath: "polygon(9% 1%, 91% 1%, 100% 95%, 1% 100%)"
      }
    ]
  },
  mudeokServantRoom: {
    width: 1672,
    height: 941,
    flames: [{ wick: [0.345, 0.721], halo: [0.001, 0.001], width: 11, height: 36, phase: 0.35, speed: 7.1 }],
    lightStrength: 0,
    cloudLayer: {
      src: "/samunmong/assets/scene-motion/mudeok-servant-room-original-cloud-layer-v1.png",
      mask: "/samunmong/assets/interactions/mudeok-servant-room/mudeok-servant-room-sky-mask-v1.png",
      offset: 0,
      drift: 0.012,
      speed: 0.24,
      opacity: 1,
      colorLift: 0
    },
    trees: [
      { center: [0.79, 0.1], radius: [0.09, 0.1], strength: 0.00055, speed: 0.57, phase: 1.9 }
    ],
    clouds: [
      { center: [0.795, 0.075], radius: [0.12, 0.095], strength: 0.00155, speed: 0.085, phase: 0.8 },
      { center: [0.78, 0.135], radius: [0.11, 0.1], strength: 0.0012, speed: 0.055, phase: 2.65 }
    ],
    interactions: [
      {
        id: "servant-bed",
        label: "무덕의 잠자리",
        message: "얇고 낡은 잠자리다. 오래 뒤척인 흔적이 남아 있다.",
        x: "7%", y: "49%", width: "45%", height: "29%",
        clipPath: "polygon(12% 14%, 76% 1%, 100% 35%, 84% 98%, 4% 100%)"
      },
      {
        id: "wooden-shelf",
        label: "낡은 선반",
        message: "생활에 필요한 물건만 남아 있다. 값나가는 물건은 보이지 않는다.",
        x: "37%", y: "15%", width: "16%", height: "40%",
        clipPath: "polygon(4% 1%, 96% 1%, 100% 98%, 1% 98%)"
      },
      {
        id: "open-door",
        label: "열린 방문",
        message: "문이 열려 있다. 축축한 밤바람이 방 안으로 들어온다.",
        x: "59%", y: "0%", width: "24%", height: "58%",
        clipPath: "polygon(4% 1%, 96% 1%, 91% 100%, 1% 93%)"
      }
    ]
  },
  yoomunseokSarangbang: {
    width: 1672,
    height: 941,
    flames: [
        { wick: [0.369, 0.538], halo: [0.065, 0.13], width: 18, height: 45, phase: 0.5, speed: 7.2 }
    ],
    lightStrength: 0,
    interactions: [
      {
        id: "document-shelf",
        label: "문서 책장",
        message: "문서가 지나치게 가지런하다. 누군가 급히 뒤진 흔적은 없다.",
        x: "15%", y: "0%", width: "25%", height: "58%",
        clipPath: "polygon(2% 1%, 98% 1%, 100% 100%, 1% 99%)"
      },
      {
        id: "landscape-screen",
        label: "산수 병풍",
        message: "먹으로 그린 산수화다. 병풍 뒤에는 아무것도 없다.",
        x: "40%", y: "7%", width: "31%", height: "44%",
        clipPath: "polygon(1% 1%, 99% 1%, 96% 100%, 3% 100%)"
      },
      {
        id: "inkstone",
        label: "사랑방 벼루",
        message: "벼루의 먹이 굳어 있다. 오늘 사용한 것은 아닌 듯하다.",
        x: "67%", y: "66%", width: "15%", height: "13%",
        clipPath: "ellipse(49% 43% at 50% 51%)"
      }
    ]
  },
  dolsoeQuarters: {
    width: 1670,
    height: 942,
    flames: [
      { wick: [0.0725, 0.468], halo: [0.052, 0.1], width: 17, height: 41, phase: 0.35, speed: 7.1 },
      { wick: [0.554, 0.342], halo: [0.055, 0.105], width: 18, height: 43, phase: 1.7, speed: 7.7 }
    ],
    lightStrength: 0,
    interactions: [
      {
        id: "axe",
        label: "장작 도끼",
        message: "돌쇠가 나무를 팰 때 주로 사용하는 도끼다. 손잡이가 오래 닳아 있다.",
        x: "71.8%", y: "66.2%", width: "17.5%", height: "31.5%",
        clipPath: "polygon(38% 1%, 76% 3%, 86% 31%, 65% 49%, 60% 100%, 47% 100%, 50% 51%, 17% 36%)"
      },
      {
        id: "tools",
        label: "벽의 농기구",
        message: "낫과 농기구가 가지런히 걸려 있다. 모두 오래 손에 익은 물건들이다.",
        x: "82.5%", y: "20.5%", width: "16.8%", height: "49.5%",
        clipPath: "polygon(9% 4%, 91% 1%, 98% 94%, 4% 100%)"
      },
      {
        id: "firewood",
        label: "쌓아 둔 장작",
        message: "며칠은 버틸 만큼 장작을 가지런히 쌓아 두었다.",
        x: "59.7%", y: "27.3%", width: "13.8%", height: "39%",
        clipPath: "polygon(19% 1%, 81% 2%, 98% 90%, 5% 99%)"
      },
      {
        id: "bed",
        label: "돌쇠의 잠자리",
        message: "자리를 급히 정리한 흔적이 보인다. 제대로 잠든 것 같지는 않다.",
        x: "7.2%", y: "47.5%", width: "34.5%", height: "20.5%",
        clipPath: "polygon(3% 27%, 55% 3%, 98% 22%, 96% 89%, 9% 99%)"
      }
    ]
  },
  backGateCourtyard: {
    width: 1672,
    height: 941,
    flames: [{ wick: [0.701, 0.303], halo: [0.055, 0.11], width: 9, height: 23, phase: 1.5, speed: 7.4 }],
    foreground: "/samunmong/assets/interactions/back-gate-courtyard/back-gate-courtyard-tree-foreground-v1.png",
    foregroundMask: "/samunmong/assets/interactions/back-gate-courtyard/back-gate-courtyard-sky-mask-v1.png",
    cloudLayer: {
      src: "/samunmong/assets/interactions/back-gate-courtyard/back-gate-courtyard-cloud-layer-v1.png",
      mask: "/samunmong/assets/interactions/back-gate-courtyard/back-gate-courtyard-sky-mask-v1.png",
      offset: 0,
      drift: 0.04,
      speed: 0.12,
      opacity: 0.42,
      colorLift: 0.45
    },
    clouds: [
      { center: [0.25, 0.09], radius: [0.24, 0.13], strength: 0.00155, speed: 0.075, phase: 0.6 },
      { center: [0.48, 0.14], radius: [0.2, 0.12], strength: 0.00115, speed: 0.048, phase: 2.9 }
    ],
    interactions: [
      {
        id: "storage-jars",
        label: "마당의 장독",
        message: "평범한 장독들이다. 뚜껑은 모두 단단히 닫혀 있다.",
        x: "0%", y: "48%", width: "27%", height: "29%",
        clipPath: "polygon(4% 32%, 18% 4%, 73% 1%, 99% 42%, 91% 100%, 1% 98%)"
      },
      {
        id: "back-gate",
        label: "열린 뒷문",
        message: "빗장이 풀려 있다. 문은 안쪽으로 열린 채 멈춰 있다.",
        x: "41%", y: "22%", width: "28%", height: "39%",
        clipPath: "polygon(4% 2%, 99% 1%, 93% 100%, 1% 96%)"
      },
      {
        id: "yard-broom",
        label: "마당 빗자루",
        message: "최근 사용한 빗자루다. 끝에 젖은 흙이 묻어 있다.",
        x: "83%", y: "40%", width: "14%", height: "44%",
        clipPath: "polygon(28% 1%, 66% 1%, 98% 98%, 2% 99%)"
      }
    ]
  }
};

function getZone(zone: AmbientZone | undefined) {
  if (!zone) return {
    area: new THREE.Vector4(0, 0, 0.001, 0.001),
    motion: new THREE.Vector3(0, 0, 0)
  };
  return {
    area: new THREE.Vector4(zone.center[0], 1 - zone.center[1], zone.radius[0], zone.radius[1]),
    motion: new THREE.Vector3(zone.strength, zone.speed, zone.phase)
  };
}

function makeAtmosphereMaterial(texture: THREE.Texture, spec: SceneSpec) {
  const cloudA = getZone(spec.clouds?.[0]);
  const cloudB = getZone(spec.clouds?.[1]);
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: texture },
      time: { value: 0 },
      motion: { value: 1 },
      cloudA: { value: cloudA.area },
      cloudB: { value: cloudB.area },
      cloudMotionA: { value: cloudA.motion },
      cloudMotionB: { value: cloudB.motion }
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
      uniform float motion;
      uniform vec4 cloudA;
      uniform vec4 cloudB;
      uniform vec3 cloudMotionA;
      uniform vec3 cloudMotionB;
      varying vec2 vUv;

      float zoneMask(vec2 uv, vec4 zone) {
        vec2 point = (uv - zone.xy) / max(zone.zw, vec2(0.001));
        return 1.0 - smoothstep(0.72, 1.0, length(point));
      }

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.56;
        for (int i = 0; i < 4; i++) {
          value += noise(p) * amplitude;
          p = p * 2.07 + vec2(13.4, 7.8);
          amplitude *= 0.48;
        }
        return value;
      }

      float cloudLayer(vec4 zone, vec3 config, float direction) {
        float exists = step(0.00001, config.x);
        float drift = time * config.y * direction * motion;
        float shape = fbm(vUv * vec2(5.0, 8.0) + vec2(drift, config.z));
        float wisps = smoothstep(0.43, 0.66, shape);
        float density = clamp(config.x * 460.0, 0.0, 0.76);
        return wisps * zoneMask(vUv, zone) * exists * density;
      }

      void main() {
        vec3 source = texture2D(map, vUv).rgb;
        float luminance = dot(source, vec3(0.2126, 0.7152, 0.0722));
        float coolSky = source.b - source.r;
        float blueSky = smoothstep(0.003, 0.055, luminance) * smoothstep(0.002, 0.035, coolSky);
        float moon = smoothstep(0.38, 0.72, luminance);
        float skyMask = max(blueSky, moon);
        float cloud = cloudLayer(cloudA, cloudMotionA, 1.0);
        cloud += cloudLayer(cloudB, cloudMotionB, -1.0) * 0.72;
        float alpha = min(cloud, 0.82) * skyMask;
        gl_FragColor = vec4(vec3(0.16, 0.21, 0.3), alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    toneMapped: false
  });
}

function makeCloudLayerMaterial(
  cloudTexture: THREE.Texture,
  maskTexture: THREE.Texture,
  layer: NonNullable<SceneSpec["cloudLayer"]>
) {
  return new THREE.ShaderMaterial({
    uniforms: {
      cloudMap: { value: cloudTexture },
      maskMap: { value: maskTexture },
      time: { value: 0 },
      motion: { value: 1 },
      offset: { value: layer.offset },
      drift: { value: layer.drift },
      speed: { value: layer.speed },
      opacity: { value: layer.opacity },
      colorLift: { value: layer.colorLift }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D cloudMap;
      uniform sampler2D maskMap;
      uniform float time;
      uniform float motion;
      uniform float offset;
      uniform float drift;
      uniform float speed;
      uniform float opacity;
      uniform float colorLift;
      varying vec2 vUv;

      void main() {
        float travel = time * speed * drift * motion;
        vec2 cloudUv = vUv - vec2(offset + travel, 0.0);
        if (cloudUv.x <= 0.0 || cloudUv.x >= 1.0 || cloudUv.y <= 0.0 || cloudUv.y >= 1.0) discard;

        vec4 cloud = texture2D(cloudMap, cloudUv);
        float skyMask = texture2D(maskMap, vUv).a;
        float alpha = cloud.a * skyMask * opacity;
        if (alpha < 0.012) discard;
        vec3 cloudColor = mix(cloud.rgb, vec3(0.07, 0.1, 0.16), colorLift);
        gl_FragColor = vec4(cloudColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    toneMapped: false
  });
}

function makeRepairMaterial(
  texture: THREE.Texture,
  regions: NonNullable<SceneSpec["repairRegions"]>
) {
  const masks = Array.from({ length: 3 }, (_, index) => {
    const region = regions[index];
    return region
      ? new THREE.Vector4(region.center[0], region.center[1], region.radius[0], region.radius[1])
      : new THREE.Vector4(0, 0, 0.001, 0.001);
  });

  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: texture },
      regionCount: { value: regions.length },
      regions: { value: masks }
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
      uniform int regionCount;
      uniform vec4 regions[3];
      varying vec2 vUv;

      void main() {
        vec2 screenUv = vec2(vUv.x, 1.0 - vUv.y);
        float mask = 0.0;
        for (int i = 0; i < 3; i++) {
          if (i >= regionCount) continue;
          vec2 point = (screenUv - regions[i].xy) / regions[i].zw;
          float ellipse = 1.0 - smoothstep(0.72, 1.0, length(point));
          mask = max(mask, ellipse);
        }
        if (mask < 0.002) discard;
        vec4 activeRegion = regions[0];
        for (int i = 0; i < 3; i++) {
          if (i >= regionCount) continue;
          vec2 point = (screenUv - regions[i].xy) / regions[i].zw;
          if (length(point) < 1.0) activeRegion = regions[i];
        }
        float sampleOffset = activeRegion.z * 1.65;
        vec3 leftPixel = texture2D(map, vUv - vec2(sampleOffset, 0.0)).rgb;
        vec3 rightPixel = texture2D(map, vUv + vec2(sampleOffset, 0.0)).rgb;
        float sideMix = smoothstep(-0.55, 0.55, (screenUv.x - activeRegion.x) / activeRegion.z);
        vec3 repaired = mix(leftPixel, rightPixel, sideMix);
        gl_FragColor = vec4(repaired, mask);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    toneMapped: false
  });
}

function makeMaskedPlateMaterial(texture: THREE.Texture, maskTexture: THREE.Texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: texture },
      maskMap: { value: maskTexture }
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
      uniform sampler2D maskMap;
      varying vec2 vUv;
      void main() {
        float mask = texture2D(maskMap, vUv).a;
        if (mask < 0.002) discard;
        gl_FragColor = vec4(texture2D(map, vUv).rgb, mask);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    toneMapped: false
  });
}

function makeSceneLightMaterial(spec: SceneSpec) {
  const lights = Array.from({ length: 3 }, (_, index) => {
    const flame = spec.flames[index];
    return flame
      ? new THREE.Vector4(flame.wick[0], 1 - flame.wick[1], flame.halo[0], flame.halo[1])
      : new THREE.Vector4(0, 0, 0.001, 0.001);
  });

  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      motion: { value: 1 },
      lightCount: { value: spec.flames.length },
      lightStrength: { value: spec.lightStrength ?? 1 },
      lights: { value: lights }
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
      uniform float motion;
      uniform int lightCount;
      uniform float lightStrength;
      uniform vec4 lights[3];
      varying vec2 vUv;

      float ellipse(vec2 uv, vec4 shape) {
        vec2 point = (uv - shape.xy) / shape.zw;
        return exp(-dot(point, point) * 2.35);
      }

      void main() {
        float halo = 0.0;
        float reflection = 0.0;
        for (int i = 0; i < 3; i++) {
          if (i >= lightCount) continue;
          float phase = float(i) * 2.17;
          float calm = sin(time * (1.35 + float(i) * 0.13) + phase) * 0.075;
          float draft = sin(time * 4.3 + phase * 1.6) * 0.035;
          float flicker = 0.9 + (calm + draft) * motion;
          halo += ellipse(vUv, lights[i]) * flicker;
          vec4 reflected = vec4(
            lights[i].x,
            lights[i].y - lights[i].w * 1.28,
            lights[i].z * 1.45,
            lights[i].w * 1.7
          );
          reflection += ellipse(vUv, reflected) * flicker;
        }
        float intensity = min(halo * 0.22 + reflection * 0.045, 0.34) * lightStrength;
        vec3 warmth = mix(vec3(1.0, 0.36, 0.08), vec3(1.0, 0.73, 0.37), min(halo, 1.0));
        gl_FragColor = vec4(warmth, intensity);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false
  });
}

function makeFlameMaterial(texture: THREE.Texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: texture },
      frame: { value: 0 },
      bend: { value: 0 },
      brightness: { value: 0.9 }
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
        float energy = max(flame.r, max(flame.g, flame.b));
        float alpha = flame.a * smoothstep(0.08, 0.42, energy);
        if (alpha < 0.025) discard;
        gl_FragColor = vec4(flame.rgb * vec3(1.0, 0.74, 0.38) * brightness, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false
  });
}

export default function JoseonSceneRig3D({ sceneId, imageUrl }: { sceneId: string; imageUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);
  const [motionImageUrl, setMotionImageUrl] = useState(imageUrl);
  const motionPlateReady = /-(?:flame|motion)-clean-v\d+/.test(motionImageUrl);
  const spec = SCENES[sceneId];

  useEffect(() => {
    if (!spec) return;
    const root = document.getElementById(sceneId);
    if (!root) return;
    const sync = () => setActive(root.classList.contains("active") || getComputedStyle(root).display !== "none");
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    const resizeObserver = new ResizeObserver(sync);
    resizeObserver.observe(root);
    const frame = requestAnimationFrame(sync);
    sync();
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      observer.disconnect();
    };
  }, [sceneId, spec]);

  useEffect(() => {
    const root = document.getElementById(sceneId);
    if (!root) return;

    const syncVisibleBackground = () => {
      const visibleBackground = Array.from(root.querySelectorAll<HTMLImageElement>(".scene-state-background"))
        .find((image) => getComputedStyle(image).display !== "none");
      setMotionImageUrl(visibleBackground?.currentSrc || visibleBackground?.src || imageUrl);
    };

    syncVisibleBackground();
    const observer = new MutationObserver(syncVisibleBackground);
    observer.observe(root, { attributes: true, subtree: true, attributeFilter: ["class", "style"] });
    return () => observer.disconnect();
  }, [imageUrl, sceneId]);

  useEffect(() => {
    if (!spec || !active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const root = canvas.closest<HTMLElement>(`#${sceneId}`);
    if (!root) return;

    const aspect = spec.width / spec.height;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, -2, 2);
    camera.position.z = 1;
    const loader = new THREE.TextureLoader();
    const resources: Array<{ dispose: () => void }> = [];
    const flameRigs: Array<{ material: THREE.ShaderMaterial; mesh: THREE.Mesh; spec: FlameSpec }> = [];
    let atmosphereMaterial: THREE.ShaderMaterial | undefined;
    let cloudLayerMaterial: THREE.ShaderMaterial | undefined;
    let disposed = false;
    const animatedFlames: readonly FlameSpec[] = motionPlateReady ? spec.flames : [];
    const animatedCloudLayer = motionPlateReady && sceneId === "mudeokServantRoom" ? spec.cloudLayer : undefined;

    const lightGeometry = new THREE.PlaneGeometry(aspect * 2, 2, 1, 1);
    const lightMaterial = makeSceneLightMaterial(spec);
    const lightMesh = new THREE.Mesh(lightGeometry, lightMaterial);
    lightMesh.position.z = 0.02;
    scene.add(lightMesh);
    resources.push(lightGeometry, lightMaterial);

    loader.load(imageUrl, (texture) => {
      if (disposed) return texture.dispose();
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      resources.push(texture);

      if (animatedCloudLayer) {
        loader.load(animatedCloudLayer.src, (cloudTexture) => {
          if (disposed) return cloudTexture.dispose();
          cloudTexture.colorSpace = THREE.SRGBColorSpace;
          cloudTexture.magFilter = THREE.LinearFilter;
          cloudTexture.minFilter = THREE.LinearMipmapLinearFilter;
          cloudTexture.wrapS = THREE.ClampToEdgeWrapping;
          cloudTexture.wrapT = THREE.ClampToEdgeWrapping;
          loader.load(animatedCloudLayer.mask, (maskTexture) => {
            if (disposed) {
              cloudTexture.dispose();
              return maskTexture.dispose();
            }
            maskTexture.magFilter = THREE.LinearFilter;
            maskTexture.minFilter = THREE.LinearFilter;
            const geometry = new THREE.PlaneGeometry(aspect * 2, 2, 1, 1);
            cloudLayerMaterial = makeCloudLayerMaterial(cloudTexture, maskTexture, animatedCloudLayer);
            const mesh = new THREE.Mesh(geometry, cloudLayerMaterial);
            mesh.position.z = -0.2;
            scene.add(mesh);
            resources.push(cloudTexture, maskTexture, geometry, cloudLayerMaterial);
          });
        });
      } else if (sceneId === "fieldOne") {
        const geometry = new THREE.PlaneGeometry(aspect * 2, 2, 1, 1);
        atmosphereMaterial = makeAtmosphereMaterial(texture, spec);
        const mesh = new THREE.Mesh(geometry, atmosphereMaterial);
        mesh.position.z = -0.22;
        scene.add(mesh);
        resources.push(geometry, atmosphereMaterial);
      }
    });

    if (spec.foreground) {
      loader.load(spec.foreground, (texture) => {
        if (disposed) return texture.dispose();
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        const mountForeground = (alphaMap?: THREE.Texture) => {
          const geometry = new THREE.PlaneGeometry(aspect * 2, 2, 1, 1);
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            alphaMap,
            color: spec.foregroundColor ?? 0xffffff,
            transparent: true,
            opacity: spec.foregroundOpacity ?? 1,
            alphaTest: 0.015,
            depthWrite: false,
            toneMapped: false
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.z = -0.1;
          scene.add(mesh);
          resources.push(texture, geometry, material);
          if (alphaMap) resources.push(alphaMap);
        };

        if (spec.foregroundMask) {
          loader.load(spec.foregroundMask, (maskTexture) => {
            if (disposed) {
              texture.dispose();
              return maskTexture.dispose();
            }
            maskTexture.magFilter = THREE.LinearFilter;
            maskTexture.minFilter = THREE.LinearFilter;
            mountForeground(maskTexture);
          });
        } else {
          mountForeground();
        }
      });
    }

    if (spec.midground) {
      loader.load(spec.midground, (texture) => {
        if (disposed) return texture.dispose();
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        const mountMidground = () => {
          const geometry = new THREE.PlaneGeometry(aspect * 2, 2, 1, 1);
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.012,
            depthWrite: false,
            toneMapped: false
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(0, spec.midgroundOffsetY ?? 0, -0.14);
          scene.add(mesh);
          resources.push(texture, geometry, material);
        };
        mountMidground();
      });
    }

    loader.load(FLAME_SPRITE, (texture) => {
      if (disposed) return texture.dispose();
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      resources.push(texture);
      animatedFlames.forEach((flame) => {
        const worldWidth = (flame.width / spec.width) * aspect * 2;
        const worldHeight = (flame.height / spec.height) * 2;
        const geometry = new THREE.PlaneGeometry(worldWidth, worldHeight, 5, 12);
        geometry.translate(0, worldHeight / 2, 0);
        const material = makeFlameMaterial(texture);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set((flame.wick[0] - 0.5) * aspect * 2, (0.5 - flame.wick[1]) * 2, 0.06);
        scene.add(mesh);
        flameRigs.push({ material, mesh, spec: flame });
        resources.push(geometry, material);
      });
    });

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const resize = () => {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.55));
      renderer.setSize(Math.max(1, root.clientWidth), Math.max(1, root.clientHeight), false);
    };
    const render = (now: number) => {
      if (disposed) return;
      const time = now / 1000;
      const motion = reducedMotion.matches ? 0.25 : 1;
      if (atmosphereMaterial) {
        atmosphereMaterial.uniforms.time.value = time;
        atmosphereMaterial.uniforms.motion.value = motion;
      }
      if (cloudLayerMaterial) {
        cloudLayerMaterial.uniforms.time.value = time;
        cloudLayerMaterial.uniforms.motion.value = motion;
      }
      lightMaterial.uniforms.time.value = time;
      lightMaterial.uniforms.motion.value = motion;
      flameRigs.forEach(({ material, mesh, spec: flame }) => {
        const localTime = time + flame.phase;
        const sway = (
          Math.sin(localTime * 1.65) * 0.0017 +
          Math.sin(localTime * 3.85 + flame.phase) * 0.00075
        ) * motion;
        material.uniforms.frame.value = motion ? Math.floor(localTime * flame.speed) % 12 : 0;
        material.uniforms.bend.value = sway;
        material.uniforms.brightness.value = motion ? 0.9 + Math.sin(localTime * 2.2) * 0.04 : 0.9;
        mesh.rotation.z = sway * 5.4;
      });
      renderer.render(scene, camera);
      canvas.dataset.engine = "three.js joseon ambient rig";
      canvas.dataset.layers = String(1 + animatedFlames.length + (animatedCloudLayer ? 1 : 0) + (spec.midground ? 1 : 0));
      canvas.dataset.clouds = String(animatedCloudLayer ? 1 : 0);
      canvas.dataset.flames = String(animatedFlames.length);
      canvas.dataset.motionFrame = String(Math.floor(time * 10));
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
      scene.clear();
      resources.forEach((resource) => resource.dispose());
      renderer.dispose();
    };
  }, [active, imageUrl, motionPlateReady, sceneId, spec]);

  if (!spec) return null;

  return (
    <div className="joseon-scene-rig" aria-hidden="true">
      {sceneId === "fieldOne"
        ? <FieldOneDynamicRig3D imageUrl={imageUrl} />
        : <canvas ref={canvasRef} className="joseon-scene-rig-canvas" aria-hidden="true" />}
    </div>
  );
}
