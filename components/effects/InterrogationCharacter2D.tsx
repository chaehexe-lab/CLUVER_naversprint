"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Face = { left: [number, number]; right: [number, number]; width: number };
type Pose = { image: string; closed: string; face: Face };
type Character = { normal: Pose; sleeve: Pose; x: number; y: number; scale: number };

const CHARACTERS: Record<string, Character> = {
  dolsoe: {
    normal: { image: "/samunmong/assets/interactions/interrogation-characters/dolsoe-normal-v2-clean-v4.png", closed: "/samunmong/assets/interactions/interrogation-characters/dolsoe-normal-eyes-closed-v1.png", face: { left: [.472, .168], right: [.513, .168], width: .016 } },
    sleeve: { image: "/samunmong/assets/interactions/interrogation-characters/dolsoe-sleeve-v1-clean-v3.png", closed: "/samunmong/assets/interactions/interrogation-characters/dolsoe-sleeve-eyes-closed-v1.png", face: { left: [.487, .166], right: [.529, .166], width: .016 } },
    x: -.355, y: -.082, scale: .84
  },
  chunwol: {
    normal: { image: "/samunmong/assets/interactions/interrogation-characters/chunwol-normal-v1-clean-v3.png", closed: "/samunmong/assets/interactions/interrogation-characters/chunwol-normal-eyes-closed-v1.png", face: { left: [.424, .215], right: [.466, .215], width: .017 } },
    sleeve: { image: "/samunmong/assets/interactions/interrogation-characters/chunwol-sleeve-v2-clean-v3.png", closed: "/samunmong/assets/interactions/interrogation-characters/chunwol-sleeve-eyes-closed-v1.png", face: { left: [.477, .226], right: [.519, .226], width: .017 } },
    x: -.355, y: -.084, scale: .82
  },
  yoomunseok: {
    normal: { image: "/samunmong/assets/interactions/interrogation-characters/yoomunseok-normal-v1-clean-v3.png", closed: "/samunmong/assets/interactions/interrogation-characters/yoomunseok-normal-eyes-closed-v1.png", face: { left: [.468, .193], right: [.510, .193], width: .016 } },
    sleeve: { image: "/samunmong/assets/interactions/interrogation-characters/yoomunseok-sleeve-v2-clean-v3.png", closed: "/samunmong/assets/interactions/interrogation-characters/yoomunseok-sleeve-eyes-closed-v1.png", face: { left: [.478, .211], right: [.520, .211], width: .016 } },
    x: -.355, y: -.084, scale: .83
  },
  mudeok: {
    normal: { image: "/samunmong/assets/interactions/interrogation-characters/mudeok-normal-v1-clean-v3.png", closed: "/samunmong/assets/interactions/interrogation-characters/mudeok-normal-eyes-closed-v1.png", face: { left: [.449, .184], right: [.494, .184], width: .017 } },
    sleeve: { image: "/samunmong/assets/interactions/interrogation-characters/mudeok-sleeve-v2-clean-v3.png", closed: "/samunmong/assets/interactions/interrogation-characters/mudeok-sleeve-eyes-closed-v1.png", face: { left: [.475, .185], right: [.516, .185], width: .016 } },
    x: -.355, y: -.084, scale: .83
  }
};

type Emotion = { turn: number; lean: number; recoil: number; tension: number; expression: number };
const EMOTIONS: Record<string, Emotion> = {
  calm: { turn: 0, lean: 0, recoil: 0, tension: .08, expression: 0 },
  thinking: { turn: -.004, lean: .003, recoil: 0, tension: .18, expression: 0 },
  attentive: { turn: .004, lean: .005, recoil: 0, tension: .14, expression: 0 },
  nervous: { turn: .008, lean: -.003, recoil: .006, tension: .58, expression: 1 },
  shocked: { turn: .014, lean: -.012, recoil: .022, tension: .9, expression: 1 },
  avoid: { turn: -.012, lean: -.006, recoil: .004, tension: .38, expression: 2 },
  silent: { turn: -.007, lean: -.008, recoil: .008, tension: .48, expression: 2 }
};
const EXPRESSIONS: Record<string, number> = { neutral: 0, startled: 1, defensive: 2, angry: 3 };
const CLEAN_ROOM = "/samunmong/assets/interactions/interrogation-candle/interrogation-room-common-clean-v2.png";

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function faceAt(character: Character, sleeve: number) {
  const a = character.normal.face;
  const b = character.sleeve.face;
  return {
    left: new THREE.Vector2(lerp(a.left[0], b.left[0], sleeve), 1 - lerp(a.left[1], b.left[1], sleeve)),
    right: new THREE.Vector2(lerp(a.right[0], b.right[0], sleeve), 1 - lerp(a.right[1], b.right[1], sleeve)),
    width: lerp(a.width, b.width, sleeve)
  };
}

export default function InterrogationCharacter2D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const screen = canvas?.closest<HTMLElement>("#interrogationScreen");
    const suspectStage = screen?.querySelector<HTMLElement>("#suspectStage");
    const plate = screen?.querySelector<HTMLImageElement>("#interrogationPlate");
    if (!canvas || !screen || !suspectStage || !plate) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1.778, 1.778, 1, -1, -5, 5);
    camera.position.z = 3;
    const loader = new THREE.TextureLoader();
    const textures = new Map<string, THREE.Texture>();
    const resources: Array<{ dispose: () => void }> = [];
    let disposed = false;
    let animationFrame = 0;
    let lastTime = performance.now();
    let current = suspectStage.dataset.suspect || "dolsoe";
    let previous = current;
    let transition = 1;
    let sleeve = screen.dataset.characterScene?.includes("sleeve") ? 1 : 0;
    let previousSleeve = sleeve;
    let turn = 0;
    let lean = 0;
    let recoil = 0;
    let expression = 0;
    let blink = 0;
    let blinkStarted = -1;
    let nextBlink = performance.now() + 1900 + Math.random() * 2600;

    const uniforms = {
      previousNormal: { value: null as THREE.Texture | null },
      previousSleeve: { value: null as THREE.Texture | null },
      currentNormal: { value: null as THREE.Texture | null },
      currentSleeve: { value: null as THREE.Texture | null },
      currentNormalClosed: { value: null as THREE.Texture | null },
      currentSleeveClosed: { value: null as THREE.Texture | null },
      previousSleeveMix: { value: previousSleeve },
      sleeveMix: { value: sleeve },
      transition: { value: transition },
      time: { value: 0 },
      turn: { value: 0 },
      lean: { value: 0 },
      recoil: { value: 0 },
      tension: { value: 0 },
      expression: { value: 0 },
      blink: { value: 0 },
      speech: { value: 0 },
      leftEye: { value: new THREE.Vector2() },
      rightEye: { value: new THREE.Vector2() },
      eyeWidth: { value: .016 },
      texel: { value: new THREE.Vector2(4 / 1536, 4 / 864) },
      colorGrade: { value: new THREE.Vector3(.84, 1.04, 1.1) }
    };

    const geometry = new THREE.PlaneGeometry(3.2, 1.8, 96, 64);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        uniform float time, turn, lean, recoil, tension;
        uniform vec2 leftEye, rightEye;
        uniform vec2 texel;
        varying vec2 vUv;
        float oval(vec2 p, vec2 c, vec2 r) {
          vec2 d = (p - c) / r;
          return 1.0 - smoothstep(.45, 1.0, dot(d, d));
        }
        void main() {
          vUv = uv;
          vec3 p = position;
          vec2 eyes = (leftEye + rightEye) * .5;
          vec2 headCenter = eyes + vec2(0.0, .052);
          vec2 neckCenter = eyes - vec2(0.0, .145);
          float head = oval(uv, headCenter, vec2(.105, .19));
          float hair = oval(uv, headCenter + vec2(0.0, .085), vec2(.14, .17));
          float neck = oval(uv, neckCenter, vec2(.07, .105));
          float torso = smoothstep(.14, .36, uv.y) * (1.0 - smoothstep(.72, .82, uv.y))
            * (1.0 - smoothstep(.2, .39, abs(uv.x - eyes.x)));
          float shoulders = oval(uv, neckCenter - vec2(0.0, .11), vec2(.245, .15));
          float breath = sin(time * (1.08 + tension * .42)) * .0015 * (1.0 + tension * .5);
          float sway = sin(time * .67 + .35) * .00125;
          float nod = sin(time * .43 + 1.2) * .00085;
          p.y += breath * shoulders + breath * .45 * neck;
          p.x += lean * torso * (.3 + uv.y * .7);
          p.y -= recoil * torso;
          p.x += (turn + sway) * head * 1.3;
          p.y += nod * head;
          p.x += (turn * 1.08 + sway * 1.45) * hair * .32;
          p.y += nod * hair * .28;
          p.x += (turn * .62 + sway * .4) * neck * .48;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D previousNormal, previousSleeve, currentNormal, currentSleeve, currentNormalClosed, currentSleeveClosed;
        uniform float previousSleeveMix, sleeveMix, transition, time, expression, blink, speech;
        uniform vec2 leftEye, rightEye;
        uniform vec2 texel;
        uniform vec3 colorGrade;
        uniform float eyeWidth;
        varying vec2 vUv;
        vec4 alphaMix(vec4 a, vec4 b, float t) {
          float aw = a.a * (1.0 - t), bw = b.a * t, alpha = aw + bw;
          return vec4((a.rgb * aw + b.rgb * bw) / max(alpha, .0001), alpha);
        }
        vec4 cleanSample(sampler2D map, vec2 uv) {
          vec4 color = texture2D(map, uv);
          float neighborAlpha = min(
            min(texture2D(map, uv + vec2(texel.x, 0.0)).a, texture2D(map, uv - vec2(texel.x, 0.0)).a),
            min(texture2D(map, uv + vec2(0.0, texel.y)).a, texture2D(map, uv - vec2(0.0, texel.y)).a)
          );
          float fringeLight = smoothstep(.58, .86, dot(color.rgb, vec3(.299, .587, .114)));
          float brightFringe = (1.0 - smoothstep(.18, .9, neighborAlpha)) * fringeLight;
          color.a *= smoothstep(.06, .62, neighborAlpha);
          color.a *= 1.0 - brightFringe;
          return color;
        }
        float oval(vec2 p, vec2 c, vec2 r) {
          vec2 d = (p - c) / r;
          return 1.0 - smoothstep(.5, 1.0, dot(d, d));
        }
        void main() {
          vec2 sampleUv = vUv;
          vec2 eyeCenter = (leftEye + rightEye) * .5;
          vec2 nose = eyeCenter - vec2(0.0, .044);
          vec2 mouth = eyeCenter - vec2(0.0, .087);
          float startled = 1.0 - smoothstep(.0, .78, abs(expression - 1.0));
          float defensive = 1.0 - smoothstep(.0, .78, abs(expression - 2.0));
          float angry = 1.0 - smoothstep(.0, .78, abs(expression - 3.0));
          float brows = oval(vUv, leftEye + vec2(0.0, .024), vec2(eyeWidth * 1.5, eyeWidth * .42))
            + oval(vUv, rightEye + vec2(0.0, .024), vec2(eyeWidth * 1.5, eyeWidth * .42));
          float side = sign(vUv.x - eyeCenter.x);
          sampleUv.y -= brows * (startled * .0024 - defensive * .0014 + angry * .0022);
          sampleUv.y += brows * side * angry * .0016;
          float noseMask = oval(vUv, nose, vec2(eyeWidth * 1.2, eyeWidth * 1.55));
          sampleUv.x += noseMask * sin(time * .71) * .00045;
          float mouthMask = oval(vUv, mouth, vec2(eyeWidth * 2.0, eyeWidth * .62));
          sampleUv.y += mouthMask * (sin(time * 5.2) * speech * .00065 + defensive * .0012 - angry * .0017);
          sampleUv.x += mouthMask * sign(vUv.x - mouth.x) * angry * .001;
          vec4 oldPose = alphaMix(cleanSample(previousNormal, sampleUv), cleanSample(previousSleeve, sampleUv), smoothstep(.08, .92, previousSleeveMix));
          vec4 newPose = alphaMix(cleanSample(currentNormal, sampleUv), cleanSample(currentSleeve, sampleUv), smoothstep(.08, .92, sleeveMix));
          vec4 closedPose = alphaMix(cleanSample(currentNormalClosed, sampleUv), cleanSample(currentSleeveClosed, sampleUv), smoothstep(.08, .92, sleeveMix));
          float eyeLayer = max(oval(vUv, leftEye, vec2(eyeWidth * 1.34, eyeWidth * .72)), oval(vUv, rightEye, vec2(eyeWidth * 1.34, eyeWidth * .72)));
          newPose = alphaMix(newPose, closedPose, eyeLayer * blink);
          vec4 color = alphaMix(oldPose, newPose, smoothstep(.05, .95, transition));
          if (color.a < .025) discard;
          color.a = smoothstep(.025, .16, color.a);
          float luminance = dot(color.rgb, vec3(.299, .587, .114));
          color.rgb = mix(vec3(luminance), color.rgb, .94) * colorGrade;
          gl_FragColor = color;
        }
      `,
      transparent: true,
      depthWrite: false,
      toneMapped: false
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    resources.push(geometry, material);

    const texture = (suspect: string, pose: "normal" | "sleeve", closed = false) => {
      const selected = (CHARACTERS[suspect] || CHARACTERS.dolsoe)[pose];
      return textures.get(closed ? selected.closed : selected.image)!;
    };
    const applyPose = (suspect: string) => {
      const pose = CHARACTERS[suspect] || CHARACTERS.dolsoe;
      mesh.position.set(pose.x, pose.y, 0);
      mesh.scale.setScalar(pose.scale);
    };
    const resize = () => {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(Math.max(1, screen.clientWidth), Math.max(1, screen.clientHeight), false);
    };

    const load = async () => {
      const urls = [...new Set(Object.values(CHARACTERS).flatMap((c) => [c.normal.image, c.normal.closed, c.sleeve.image, c.sleeve.closed]))];
      await Promise.all(urls.map(async (url) => {
        const value = await loader.loadAsync(url);
        value.colorSpace = THREE.SRGBColorSpace;
        value.anisotropy = renderer.capabilities.getMaxAnisotropy();
        textures.set(url, value);
        resources.push(value);
      }));
      if (disposed) return;
      uniforms.previousNormal.value = texture(current, "normal");
      uniforms.previousSleeve.value = texture(current, "sleeve");
      uniforms.currentNormal.value = texture(current, "normal");
      uniforms.currentSleeve.value = texture(current, "sleeve");
      uniforms.currentNormalClosed.value = texture(current, "normal", true);
      uniforms.currentSleeveClosed.value = texture(current, "sleeve", true);
      applyPose(current);
    };

    const updateSuspect = () => {
      const next = suspectStage.dataset.suspect || "dolsoe";
      if (next === current || textures.size === 0) return;
      previous = current;
      previousSleeve = sleeve;
      current = next;
      uniforms.previousNormal.value = texture(previous, "normal");
      uniforms.previousSleeve.value = texture(previous, "sleeve");
      uniforms.currentNormal.value = texture(current, "normal");
      uniforms.currentSleeve.value = texture(current, "sleeve");
      uniforms.currentNormalClosed.value = texture(current, "normal", true);
      uniforms.currentSleeveClosed.value = texture(current, "sleeve", true);
      transition = 0;
      blinkStarted = -1;
      nextBlink = performance.now() + 1000 + Math.random() * 1200;
      applyPose(current);
    };
    const screenObserver = new MutationObserver(updateSuspect);
    const suspectObserver = new MutationObserver(updateSuspect);
    const enforceCleanRoom = () => {
      const path = new URL(plate.getAttribute("src") || "", window.location.href).pathname;
      if (path !== CLEAN_ROOM) plate.src = CLEAN_ROOM;
    };
    const plateObserver = new MutationObserver(enforceCleanRoom);

    const render = (now: number) => {
      if (disposed) return;
      const dt = Math.min(.033, Math.max(.001, (now - lastTime) / 1000));
      lastTime = now;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const motion = reduced ? 0 : 1;
      const reaction = screen.dataset.interrogationReaction || "calm";
      const emotion = EMOTIONS[reaction] || EMOTIONS.calm;
      const expressionName = screen.dataset.interrogationExpression || "neutral";
      const targetExpression = screen.dataset.interrogationExpression ? (EXPRESSIONS[expressionName] ?? emotion.expression) : emotion.expression;
      const ease = 1 - Math.exp(-dt * (reaction === "shocked" ? 10 : 4.8));
      turn += (emotion.turn * motion - turn) * ease;
      lean += (emotion.lean * motion - lean) * ease;
      recoil += (emotion.recoil * motion - recoil) * ease;
      expression += (targetExpression - expression) * (1 - Math.exp(-dt * 6));
      transition += (1 - transition) * (1 - Math.exp(-dt * 6.5));
      const sleeveTarget = screen.dataset.characterScene?.includes("sleeve") ? 1 : 0;
      sleeve += (sleeveTarget - sleeve) * (1 - Math.exp(-dt * 4.3));
      if (!reduced && blinkStarted < 0 && now >= nextBlink) blinkStarted = now;
      if (blinkStarted >= 0) {
        const progress = Math.min(1, (now - blinkStarted) / 220);
        if (progress < .32) blink = Math.pow(progress / .32, .72);
        else if (progress < .62) blink = 1;
        else blink = Math.pow((1 - progress) / .38, .78);
        if (progress >= 1) { blinkStarted = -1; nextBlink = now + 2600 + Math.random() * 3800; }
      } else blink = 0;

      const face = faceAt(CHARACTERS[current] || CHARACTERS.dolsoe, sleeve);
      uniforms.colorGrade.value.set(current === "dolsoe" ? .84 : .97, current === "dolsoe" ? 1.04 : 1.005, current === "dolsoe" ? 1.1 : 1.02);
      uniforms.time.value = now / 1000;
      uniforms.turn.value = turn;
      uniforms.lean.value = lean;
      uniforms.recoil.value = recoil;
      uniforms.tension.value = emotion.tension * motion;
      uniforms.expression.value = expression;
      uniforms.blink.value = blink * motion;
      uniforms.speech.value = reaction === "attentive" || reaction === "thinking" ? motion * .55 : 0;
      uniforms.transition.value = transition;
      uniforms.previousSleeveMix.value = previousSleeve;
      uniforms.sleeveMix.value = sleeve;
      uniforms.leftEye.value.copy(face.left);
      uniforms.rightEye.value.copy(face.right);
      uniforms.eyeWidth.value = face.width;
      if (screen.classList.contains("active") && uniforms.currentNormal.value) renderer.render(scene, camera);
      canvas.dataset.engine = "webgl illustrated character rig";
      canvas.dataset.suspect = current;
      canvas.dataset.reaction = reaction;
      canvas.dataset.expression = expressionName;
      canvas.dataset.sleeve = sleeve > .98 ? "raised" : sleeve > .02 ? "transition" : "covered";
      canvas.dataset.blink = blink > .72 ? "closed" : blink > .04 ? "moving" : "open";
      animationFrame = requestAnimationFrame(render);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(screen);
    screenObserver.observe(screen, { attributes: true, attributeFilter: ["data-character-scene", "data-interrogation-reaction", "data-interrogation-expression"] });
    suspectObserver.observe(suspectStage, { attributes: true, attributeFilter: ["data-suspect"] });
    plateObserver.observe(plate, { attributes: true, attributeFilter: ["src"] });
    enforceCleanRoom();
    void load();
    animationFrame = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      screenObserver.disconnect();
      suspectObserver.disconnect();
      plateObserver.disconnect();
      resizeObserver.disconnect();
      scene.clear();
      resources.forEach((resource) => resource.dispose());
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="interrogation-character-rig interrogation-character-2d" aria-hidden="true" />;
}
