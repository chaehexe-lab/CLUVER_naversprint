"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

type PieceId = "a" | "b" | "c";
type Point = readonly [number, number];

type PieceDefinition = {
  id: PieceId;
  texture: string;
  width: number;
  height: number;
  contour: readonly Point[];
  start: readonly [number, number];
  target: readonly [number, number];
  startRotation: number;
};

type PieceRig = {
  group: THREE.Group;
  definition: PieceDefinition;
  goalPosition: THREE.Vector3;
  goalRotation: number;
  goalScale: number;
  placed: boolean;
};

type RigControls = {
  zoomBy: (amount: number) => void;
  flip: () => void;
  resetView: () => void;
};

const PIECES: readonly PieceDefinition[] = [
  {
    id: "a",
    texture: "/samunmong/assets/interactions/document-puzzle/drag-pieces/fragment-a-letter-v4.png",
    width: 2.5,
    height: 4.75,
    contour: [
      [.07, .04], [.31, .015], [.67, .025], [.84, .075], [.87, .17], [.91, .27],
      [.88, .39], [.94, .51], [.9, .63], [.93, .75], [.88, .87], [.91, .96],
      [.73, .985], [.39, .98], [.09, .955], [.035, .82], [.05, .63], [.025, .45], [.045, .25]
    ],
    start: [-3.55, -1.32],
    target: [-2.02, .38],
    startRotation: -Math.PI / 4
  },
  {
    id: "b",
    texture: "/samunmong/assets/interactions/document-puzzle/drag-pieces/fragment-b-letter-v4.png",
    width: 3,
    height: 4.75,
    contour: [
      [.25, .025], [.46, .01], [.68, .03], [.74, .11], [.79, .22], [.75, .34],
      [.8, .48], [.75, .61], [.79, .73], [.75, .86], [.69, .975], [.48, .99],
      [.27, .975], [.22, .88], [.18, .75], [.22, .62], [.17, .49], [.21, .36], [.17, .21]
    ],
    start: [0, -1.5],
    target: [0, .38],
    startRotation: Math.PI / 4
  },
  {
    id: "c",
    texture: "/samunmong/assets/interactions/document-puzzle/drag-pieces/fragment-c-letter-v4.png",
    width: 2.35,
    height: 4.75,
    contour: [
      [.33, .035], [.57, .015], [.9, .04], [.96, .17], [.945, .34], [.97, .53],
      [.94, .71], [.965, .87], [.88, .975], [.61, .99], [.42, .965], [.38, .84],
      [.34, .71], [.37, .58], [.31, .45], [.35, .31], [.29, .18]
    ],
    start: [3.55, -1.28],
    target: [1.92, .38],
    startRotation: Math.PI / 2
  }
] as const;

const OPEN_EVENT = "samunmong:letter-3d-open";
const PROGRESS_EVENT = "samunmong:letter-3d-progress";
const COMPLETE_EVENT = "samunmong:letter-3d-complete";
const REJECT_EVENT = "samunmong:letter-3d-reject";

function shapeFromContour(definition: PieceDefinition) {
  const coordinates = definition.contour.map(([u, v]) => new THREE.Vector2(
    (u - .5) * definition.width,
    (.5 - v) * definition.height
  ));
  const shape = new THREE.Shape();
  shape.moveTo(coordinates[0].x, coordinates[0].y);
  coordinates.slice(1).forEach((point) => shape.lineTo(point.x, point.y));
  shape.closePath();
  return { shape, coordinates };
}

function normalizeCapUvs(geometry: THREE.BufferGeometry, definition: PieceDefinition) {
  const positions = geometry.getAttribute("position");
  const uvs = new Float32Array(positions.count * 2);
  for (let index = 0; index < positions.count; index += 1) {
    uvs[index * 2] = THREE.MathUtils.clamp(positions.getX(index) / definition.width + .5, 0, 1);
    uvs[index * 2 + 1] = THREE.MathUtils.clamp(positions.getY(index) / definition.height + .5, 0, 1);
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
}

function makePiece(
  definition: PieceDefinition,
  renderer: THREE.WebGLRenderer,
  textureLoader: THREE.TextureLoader,
  edgeMaterial: THREE.MeshStandardMaterial
) {
  const { shape, coordinates } = shapeFromContour(definition);
  const texture = textureLoader.load(definition.texture);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(12, renderer.capabilities.getMaxAnisotropy());
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const faceMaterial = new THREE.MeshPhysicalMaterial({
    map: texture,
    bumpMap: texture,
    bumpScale: .016,
    transparent: true,
    alphaTest: .075,
    roughness: .86,
    metalness: 0,
    clearcoat: .025,
    clearcoatRoughness: .92,
    side: THREE.FrontSide
  });
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: .075,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: .025,
    bevelThickness: .018,
    curveSegments: 2
  });
  geometry.translate(0, 0, -.0375);
  normalizeCapUvs(geometry, definition);
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(geometry, [faceMaterial, edgeMaterial]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.pieceId = definition.id;
  mesh.renderOrder = 4;

  const group = new THREE.Group();
  group.name = `letter-piece-${definition.id}`;
  group.add(mesh);
  group.position.set(definition.start[0], definition.start[1], .18);
  group.rotation.z = definition.startRotation;
  group.scale.setScalar(.67);
  group.userData.texture = texture;
  group.userData.faceMaterial = faceMaterial;

  const outlineGeometry = new THREE.BufferGeometry().setFromPoints([
    ...coordinates,
    coordinates[0]
  ].map((point) => new THREE.Vector3(point.x, point.y, .012)));
  const outline = new THREE.Line(
    outlineGeometry,
    new THREE.LineBasicMaterial({ color: 0xb99154, transparent: true, opacity: .25 })
  );
  outline.position.set(definition.target[0], definition.target[1], -.12);
  outline.scale.setScalar(.88);
  outline.renderOrder = 2;

  return {
    group,
    outline,
    rig: {
      group,
      definition,
      goalPosition: group.position.clone(),
      goalRotation: definition.startRotation,
      goalScale: .67,
      placed: false
    } satisfies PieceRig
  };
}

function shortestAngleDelta(from: number, to: number) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

export default function JoseonLetterEvidence3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<RigControls | null>(null);
  const [active, setActive] = useState(false);
  const [assembled, setAssembled] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = document.getElementById("documentAssemblyStage");
    const panel = document.getElementById("documentAssemblyPanel");
    if (!canvas || !stage || !panel) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, .1, 60);
    const textureLoader = new THREE.TextureLoader();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -.24);
    const dragPoint = new THREE.Vector3();
    const letterRoot = new THREE.Group();
    scene.add(letterRoot);

    const boardTexture = textureLoader.load("/samunmong/assets/interactions/evidence-tools/examination-workbench-v1.webp");
    boardTexture.colorSpace = THREE.SRGBColorSpace;
    boardTexture.anisotropy = Math.min(12, renderer.capabilities.getMaxAnisotropy());
    const boardMaterial = new THREE.MeshStandardMaterial({
      map: boardTexture,
      roughness: .82,
      metalness: 0,
      color: 0xe4d2ad
    });
    const board = new THREE.Mesh(new THREE.PlaneGeometry(11.4, 6.75), boardMaterial);
    board.position.z = -.3;
    board.receiveShadow = true;
    scene.add(board);

    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b6436,
      roughness: .94,
      metalness: 0
    });
    const pieceRigs = new Map<PieceId, PieceRig>();
    const selectableMeshes: THREE.Object3D[] = [];
    const targetOutlines = new Map<PieceId, THREE.Object3D>();
    PIECES.forEach((definition) => {
      const { group, outline, rig } = makePiece(definition, renderer, textureLoader, edgeMaterial);
      letterRoot.add(group);
      letterRoot.add(outline);
      pieceRigs.set(definition.id, rig);
      selectableMeshes.push(group.children[0]);
      targetOutlines.set(definition.id, outline);
    });

    scene.add(new THREE.HemisphereLight(0xf0dfbd, 0x20140d, 1.45));
    const keyLight = new THREE.DirectionalLight(0xffd39b, 3.2);
    keyLight.position.set(-4.5, 6.5, 9);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.left = -6;
    keyLight.shadow.camera.right = 6;
    keyLight.shadow.camera.top = 4;
    keyLight.shadow.camera.bottom = -4;
    keyLight.shadow.bias = -.0004;
    scene.add(keyLight);
    const fillLight = new THREE.PointLight(0x6f8da6, 6.5, 18, 2);
    fillLight.position.set(5, 2, 4);
    scene.add(fillLight);

    let isActive = false;
    let isAssembled = false;
    let frame = 0;
    let baseCameraZ = 11;
    let zoom = 1;
    let targetZoom = 1;
    let viewTargetX = 0;
    let viewTargetY = 0;
    let draggingPiece: PieceRig | null = null;
    let draggingView = false;
    let pointerId = -1;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let pointerMoved = false;
    let dragOffset = new THREE.Vector3();
    let elapsed = 0;

    const updatePointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
    };

    const pointOnDragPlane = (event: PointerEvent) => {
      updatePointer(event);
      return raycaster.ray.intersectPlane(dragPlane, dragPoint) ? dragPoint.clone() : null;
    };

    const resetPieces = () => {
      isAssembled = false;
      setAssembled(false);
      letterRoot.rotation.set(0, 0, 0);
      viewTargetX = 0;
      viewTargetY = 0;
      zoom = 1;
      targetZoom = 1;
      targetOutlines.forEach((outline) => { outline.visible = true; });
      pieceRigs.forEach((rig) => {
        rig.placed = false;
        rig.goalPosition.set(rig.definition.start[0], rig.definition.start[1], .18);
        rig.goalRotation = rig.definition.startRotation;
        rig.goalScale = .67;
        rig.group.position.copy(rig.goalPosition);
        rig.group.rotation.set(-.035, rig.definition.id === "b" ? .035 : -.025, rig.goalRotation);
        rig.group.scale.setScalar(rig.goalScale);
      });
    };

    const onOpen = () => {
      isActive = true;
      setActive(true);
      resetPieces();
      resize();
    };

    const panelObserver = new MutationObserver(() => {
      const visible = panel.getAttribute("aria-hidden") === "false" && stage.dataset.documentKind === "letter";
      isActive = visible;
      setActive(visible);
      if (visible) resize();
    });
    panelObserver.observe(panel, { attributes: true, attributeFilter: ["aria-hidden"] });
    window.addEventListener(OPEN_EVENT, onOpen);

    const onPointerDown = (event: PointerEvent) => {
      if (!isActive) return;
      pointerId = event.pointerId;
      pointerStartX = lastPointerX = event.clientX;
      pointerStartY = lastPointerY = event.clientY;
      pointerMoved = false;
      canvas.setPointerCapture?.(event.pointerId);

      if (isAssembled) {
        draggingView = true;
        canvas.classList.add("is-rotating");
        event.preventDefault();
        return;
      }

      updatePointer(event);
      const hit = raycaster.intersectObjects(selectableMeshes, false).find((entry) => {
        const id = entry.object.userData.pieceId as PieceId | undefined;
        return id && !pieceRigs.get(id)?.placed;
      });
      if (!hit) return;
      const pieceId = hit.object.userData.pieceId as PieceId;
      draggingPiece = pieceRigs.get(pieceId) || null;
      const planePoint = pointOnDragPlane(event);
      if (draggingPiece && planePoint) {
        dragOffset = draggingPiece.group.position.clone().sub(planePoint);
        draggingPiece.group.position.z = .48;
        draggingPiece.goalPosition.z = .48;
        canvas.classList.add("is-dragging");
      }
      event.preventDefault();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      const movement = Math.hypot(event.clientX - pointerStartX, event.clientY - pointerStartY);
      pointerMoved ||= movement > 6;

      if (draggingView) {
        viewTargetY += (event.clientX - lastPointerX) * .009;
        viewTargetX = THREE.MathUtils.clamp(viewTargetX + (event.clientY - lastPointerY) * .006, -.55, .55);
        lastPointerX = event.clientX;
        lastPointerY = event.clientY;
        event.preventDefault();
        return;
      }

      if (!draggingPiece) return;
      const point = pointOnDragPlane(event);
      if (!point) return;
      const next = point.add(dragOffset);
      draggingPiece.group.position.x = THREE.MathUtils.clamp(next.x, -4.65, 4.65);
      draggingPiece.group.position.y = THREE.MathUtils.clamp(next.y, -2.35, 2.35);
      draggingPiece.group.position.z = .48;
      draggingPiece.goalPosition.copy(draggingPiece.group.position);
      event.preventDefault();
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      canvas.releasePointerCapture?.(event.pointerId);
      canvas.classList.remove("is-dragging", "is-rotating");
      draggingView = false;
      pointerId = -1;

      const rig = draggingPiece;
      draggingPiece = null;
      if (!rig) return;

      if (!pointerMoved) {
        rig.goalRotation += Math.PI / 4;
        window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: { count: [...pieceRigs.values()].filter((piece) => piece.placed).length, rotated: true } }));
        return;
      }

      const target = new THREE.Vector3(rig.definition.target[0], rig.definition.target[1], .2);
      const distance = rig.group.position.distanceTo(target);
      const rotationDelta = Math.abs(shortestAngleDelta(rig.group.rotation.z, 0));
      if (distance > 1.05 || rotationDelta > .34) {
        rig.goalPosition.z = .18;
        rig.goalRotation += rotationDelta > .34 ? Math.sign(shortestAngleDelta(rig.group.rotation.z, 0)) * .08 : 0;
        window.dispatchEvent(new CustomEvent(REJECT_EVENT, { detail: { rotation: rotationDelta > .34 } }));
        return;
      }

      rig.placed = true;
      rig.goalPosition.copy(target);
      rig.goalRotation = 0;
      rig.goalScale = .88;
      const count = [...pieceRigs.values()].filter((piece) => piece.placed).length;
      const targetOutline = targetOutlines.get(rig.definition.id);
      if (targetOutline) targetOutline.visible = false;
      window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: { count } }));
      if (count === PIECES.length) {
        isAssembled = true;
        setAssembled(true);
        targetZoom = 1.12;
      }
    };

    const onWheel = (event: WheelEvent) => {
      if (!isActive || !isAssembled) return;
      targetZoom = THREE.MathUtils.clamp(targetZoom + (event.deltaY < 0 ? .1 : -.1), .9, 1.42);
      event.preventDefault();
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    controlsRef.current = {
      zoomBy: (amount) => { targetZoom = THREE.MathUtils.clamp(targetZoom + amount, .9, 1.42); },
      flip: () => { viewTargetY += Math.PI; },
      resetView: () => {
        viewTargetX = 0;
        viewTargetY = 0;
        targetZoom = 1.12;
      }
    };

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      const radians = THREE.MathUtils.degToRad(camera.fov);
      const verticalDistance = 7.15 / (2 * Math.tan(radians / 2));
      const horizontalDistance = (11.75 / camera.aspect) / (2 * Math.tan(radians / 2));
      baseCameraZ = Math.max(verticalDistance, horizontalDistance) + .45;
      camera.position.set(0, 0, baseCameraZ / zoom);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
    resize();

    const clock = new THREE.Clock();
    const motionScale = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? .25 : 1;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      if (!isActive) return;
      const delta = Math.min(clock.getDelta(), .05);
      elapsed += delta * motionScale;
      const damping = 1 - Math.exp(-delta * 11);
      zoom = THREE.MathUtils.lerp(zoom, targetZoom, damping);
      camera.position.z = baseCameraZ / zoom;

      pieceRigs.forEach((rig) => {
        if (rig !== draggingPiece) rig.group.position.lerp(rig.goalPosition, damping);
        rig.group.rotation.z += shortestAngleDelta(rig.group.rotation.z, rig.goalRotation) * damping;
        const currentScale = rig.group.scale.x;
        rig.group.scale.setScalar(THREE.MathUtils.lerp(currentScale, rig.goalScale, damping));
        if (rig.placed) {
          rig.group.rotation.x = THREE.MathUtils.lerp(rig.group.rotation.x, -.012, damping);
          rig.group.rotation.y = THREE.MathUtils.lerp(rig.group.rotation.y, .008, damping);
        } else if (rig !== draggingPiece) {
          rig.group.position.z = rig.goalPosition.z + Math.sin(elapsed * .72 + rig.definition.id.charCodeAt(0)) * .012;
        }
      });

      letterRoot.rotation.x = THREE.MathUtils.lerp(letterRoot.rotation.x, isAssembled ? viewTargetX : 0, damping);
      letterRoot.rotation.y += shortestAngleDelta(letterRoot.rotation.y, isAssembled ? viewTargetY : 0) * damping;
      keyLight.intensity = 3.05 + Math.sin(elapsed * .38) * .08;
      renderer.render(scene, camera);
      canvas.dataset.frame = String(Number(canvas.dataset.frame || "0") + 1);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      panelObserver.disconnect();
      window.removeEventListener(OPEN_EVENT, onOpen);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
      const disposedMaterials = new Set<THREE.Material>();
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh || object instanceof THREE.Line)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          if (disposedMaterials.has(material)) return;
          disposedMaterials.add(material);
          material.dispose();
        });
      });
      pieceRigs.forEach((rig) => {
        const texture = rig.group.userData.texture as THREE.Texture | undefined;
        texture?.dispose();
      });
      boardTexture.dispose();
      renderer.dispose();
      controlsRef.current = null;
    };
  }, []);

  const complete = useCallback(() => {
    if (!assembled) return;
    window.dispatchEvent(new CustomEvent(COMPLETE_EVENT));
  }, [assembled]);

  return (
    <div className="joseon-letter-evidence-3d" data-active={active ? "true" : "false"} data-assembled={assembled ? "true" : "false"}>
      <canvas ref={canvasRef} data-engine="three.js pbr torn-letter evidence" aria-label="입체 찢어진 약속 편지 복원대" />
      <div className="letter-evidence-3d-controls" aria-label="편지 관찰 조작">
        <button type="button" title="확대" aria-label="편지 확대" disabled={!assembled} onClick={() => controlsRef.current?.zoomBy(.12)}>+</button>
        <button type="button" title="축소" aria-label="편지 축소" disabled={!assembled} onClick={() => controlsRef.current?.zoomBy(-.12)}>−</button>
        <button type="button" title="뒤집기" aria-label="편지 앞뒤 뒤집기" disabled={!assembled} onClick={() => controlsRef.current?.flip()}>↻</button>
        <button type="button" title="시점 초기화" aria-label="편지 시점 초기화" disabled={!assembled} onClick={() => controlsRef.current?.resetView()}>⌂</button>
      </div>
      <button className="letter-evidence-3d-confirm" type="button" hidden={!assembled} onClick={complete}>복원 확인</button>
    </div>
  );
}
