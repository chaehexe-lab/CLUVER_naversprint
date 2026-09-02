"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

type PieceId = "a" | "b" | "c" | "d" | "e";
type Point = readonly [number, number];

type PieceDefinition = {
  id: PieceId;
  polygon: readonly Point[];
  origin: Point;
  start: Point;
  bounds: readonly [number, number, number, number];
};

type PieceRig = {
  group: THREE.Group;
  definition: PieceDefinition;
  goalPosition: THREE.Vector3;
  goalTiltX: number;
  goalTiltY: number;
  revealMaterial: THREE.MeshPhysicalMaterial;
  clusterId: PieceId;
};

const SHEET_WIDTH = 6.6;
const SHEET_HEIGHT = 3.9;
const PIECE_SCALE = .86;
const SNAP_DISTANCE = .46;
const REST_Z = -.068;
const LIFT_Z = .13;
const SPLIT_INDEX = 11;
const PIECE_IDS: readonly PieceId[] = ["a", "b", "c", "d", "e"];

const tearLeft: readonly Point[] = [
  [-1.34, 1.9], [-1.42, 1.73], [-1.38, 1.59], [-1.45, 1.43],
  [-1.39, 1.28], [-1.28, 1.11], [-1.34, .95], [-1.3, .8],
  [-1.41, .64], [-1.36, .46], [-1.46, .29], [-1.39, .11],
  [-1.32, -.07], [-1.37, -.25], [-1.29, -.42], [-1.35, -.58],
  [-1.44, -.76], [-1.38, -.93], [-1.31, -1.09], [-1.36, -1.28],
  [-1.28, -1.48], [-1.4, -1.67], [-1.27, -1.9]
];
const tearRight: readonly Point[] = [
  [1.05, 1.9], [1.12, 1.72], [1.08, 1.57], [.98, 1.41],
  [1.04, 1.25], [.96, 1.09], [1.02, .92], [1.11, .77],
  [1.05, .61], [1.14, .44], [1.08, .27], [.99, .1],
  [1.05, -.08], [.97, -.24], [1.03, -.41], [1.12, -.58],
  [1.06, -.75], [.98, -.93], [1.04, -1.09], [.95, -1.29],
  [1.02, -1.48], [1.1, -1.68], [1.01, -1.9]
];
const tearMiddle: readonly Point[] = [
  tearLeft[SPLIT_INDEX], [-1.21, .06], [-1.04, .16], [-.83, .12], [-.65, .22],
  [-.44, .14], [-.27, .18], [-.05, .08], [.15, .12], [.35, .03],
  [.53, .1], [.73, .16], [.88, .08], tearRight[SPLIT_INDEX]
];
const tearFarRight: readonly Point[] = [
  tearRight[SPLIT_INDEX], [1.25, .04], [1.43, .14], [1.62, .09], [1.8, .19],
  [2.01, .12], [2.2, .17], [2.39, .07], [2.6, .11], [2.79, .03], [2.98, .12], [3.27, .03]
];

const topLeft: readonly Point[] = [
  [-3.27, 1.84], [-2.88, 1.94], [-2.47, 1.87], [-2.06, 1.96], [-1.65, 1.86], tearLeft[0]
];
const topMiddle: readonly Point[] = [
  tearLeft[0], [-.93, 1.95], [-.53, 1.87], [-.1, 1.96], [.31, 1.88], [.72, 1.95], tearRight[0]
];
const topRight: readonly Point[] = [
  tearRight[0], [1.43, 1.88], [1.88, 1.96], [2.33, 1.86], [2.79, 1.94], [3.27, 1.84]
];
const bottomLeft: readonly Point[] = [
  [-3.27, -1.84], [-2.89, -1.94], [-2.48, -1.87], [-2.07, -1.96], [-1.65, -1.86], tearLeft[tearLeft.length - 1]
];
const bottomMiddle: readonly Point[] = [
  tearLeft[tearLeft.length - 1], [-.91, -1.95], [-.51, -1.87], [-.09, -1.96], [.32, -1.88], [.72, -1.95], tearRight[tearRight.length - 1]
];
const bottomRight: readonly Point[] = [
  tearRight[tearRight.length - 1], [1.43, -1.87], [1.88, -1.96], [2.34, -1.86], [2.79, -1.94], [3.27, -1.84]
];
const leftEdge: readonly Point[] = [
  topLeft[0], [-3.34, 1.44], [-3.25, 1.04], [-3.35, .64], [-3.26, .24],
  [-3.34, -.17], [-3.25, -.58], [-3.35, -.99], [-3.26, -1.42], bottomLeft[0]
];
const rightEdgeTop: readonly Point[] = [
  topRight[topRight.length - 1], [3.34, 1.43], [3.25, 1.02], [3.35, .61], [3.27, .03]
];
const rightEdgeBottom: readonly Point[] = [
  tearFarRight[tearFarRight.length - 1], [3.34, -.36], [3.25, -.75], [3.35, -1.13], [3.27, -1.84]
];

function reversed(points: readonly Point[]) {
  return [...points].reverse();
}

function localBounds(polygon: readonly Point[], origin: Point) {
  const xs = polygon.map(([x]) => x - origin[0]);
  const ys = polygon.map(([, y]) => y - origin[1]);
  return [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)] as const;
}

function definePiece(id: PieceId, polygon: readonly Point[], origin: Point, start: Point): PieceDefinition {
  return { id, polygon, origin, start, bounds: localBounds(polygon, origin) };
}

const PIECES: readonly PieceDefinition[] = [
  definePiece("a", [...topLeft, ...tearLeft.slice(1), ...reversed(bottomLeft).slice(1), ...reversed(leftEdge).slice(1)], [-2.3, 0], [-3.55, -.08]),
  definePiece("b", [...topMiddle, ...tearRight.slice(1, SPLIT_INDEX + 1), ...reversed(tearMiddle).slice(1), ...reversed(tearLeft.slice(0, SPLIT_INDEX + 1)).slice(1)], [-.1, 1.03], [-1.28, 1.18]),
  definePiece("c", [...tearMiddle, ...tearRight.slice(SPLIT_INDEX + 1), ...reversed(bottomMiddle).slice(1), ...reversed(tearLeft.slice(SPLIT_INDEX)).slice(1)], [-.1, -.88], [-.72, -1.2]),
  definePiece("d", [...topRight, ...rightEdgeTop.slice(1), ...reversed(tearFarRight).slice(1), ...reversed(tearRight.slice(0, SPLIT_INDEX + 1)).slice(1)], [2.16, 1.02], [3.25, 1.14]),
  definePiece("e", [...tearFarRight, ...rightEdgeBottom.slice(1), ...reversed(bottomRight).slice(1), ...reversed(tearRight.slice(SPLIT_INDEX)).slice(1)], [2.16, -.88], [3.34, -1.16])
] as const;

const ADJACENT = new Set(["a:b", "a:c", "b:c", "b:d", "c:e", "d:e"]);
const OPEN_EVENT = "samunmong:letter-3d-open";
const PROGRESS_EVENT = "samunmong:letter-3d-progress";
const COMPLETE_EVENT = "samunmong:letter-3d-complete";
const REJECT_EVENT = "samunmong:letter-3d-reject";

function pairKey(first: PieceId, second: PieceId) {
  return [first, second].sort().join(":");
}

async function loadLetterFont() {
  if (document.fonts.check('48px "NanumCheolpil"')) return;
  try {
    const font = new FontFace("NanumCheolpil", "url(/samunmong/assets/fonts/Nanum-Cheolpil.ttf)");
    await font.load();
    document.fonts.add(font);
  } catch {
    // The generated calligraphy remains legible if the local font cannot load.
  }
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = source;
  });
}

function drawFallbackPaper(context: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#dbc28d");
  gradient.addColorStop(.52, "#ecd7a9");
  gradient.addColorStop(1, "#cbb078");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

function makeLetterCanvas(kind: "coded" | "revealed", paperImage: HTMLImageElement | null) {
  const canvas = document.createElement("canvas");
  canvas.width = 1680;
  canvas.height = 992;
  const context = canvas.getContext("2d");
  if (!context) return canvas;

  if (kind === "revealed") return canvas;

  if (paperImage) context.drawImage(paperImage, 0, 0, canvas.width, canvas.height);
  else drawFallbackPaper(context, canvas.width, canvas.height);
  return canvas;
}

function shapeFromPolygon(definition: PieceDefinition) {
  const points = definition.polygon.map(([x, y]) => new THREE.Vector2(x - definition.origin[0], y - definition.origin[1]));
  const shape = new THREE.Shape();
  shape.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((point) => shape.lineTo(point.x, point.y));
  shape.closePath();
  return shape;
}

function applyContinuousUvs(geometry: THREE.BufferGeometry, definition: PieceDefinition) {
  const positions = geometry.getAttribute("position");
  const uvs = new Float32Array(positions.count * 2);
  for (let index = 0; index < positions.count; index += 1) {
    const globalX = positions.getX(index) + definition.origin[0];
    const globalY = positions.getY(index) + definition.origin[1];
    uvs[index * 2] = THREE.MathUtils.clamp(globalX / SHEET_WIDTH + .5, 0, 1);
    uvs[index * 2 + 1] = THREE.MathUtils.clamp(globalY / SHEET_HEIGHT + .5, 0, 1);
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
}

function makePiece(definition: PieceDefinition, codedTexture: THREE.Texture, revealedTexture: THREE.Texture, edgeMaterial: THREE.MeshStandardMaterial) {
  const shape = shapeFromPolygon(definition);
  const faceMaterial = new THREE.MeshPhysicalMaterial({
    map: codedTexture, bumpMap: codedTexture, bumpScale: .006, roughness: .96,
    metalness: 0, clearcoat: .015, clearcoatRoughness: 1, side: THREE.FrontSide
  });
  const revealMaterial = new THREE.MeshPhysicalMaterial({
    map: revealedTexture, transparent: true, opacity: 0, depthWrite: false,
    roughness: .92, metalness: 0, side: THREE.FrontSide
  });
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: .014, bevelEnabled: true, bevelSegments: 2,
    bevelSize: .004, bevelThickness: .003, curveSegments: 2
  });
  geometry.translate(0, 0, -.007);
  applyContinuousUvs(geometry, definition);
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(geometry, [faceMaterial, edgeMaterial]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.pieceId = definition.id;
  mesh.renderOrder = 4;

  const revealGeometry = new THREE.ShapeGeometry(shape);
  applyContinuousUvs(revealGeometry, definition);
  const revealMesh = new THREE.Mesh(revealGeometry, revealMaterial);
  revealMesh.position.z = .027;
  revealMesh.renderOrder = 6;

  const edgeGeometry = new THREE.EdgesGeometry(geometry, 28);
  const edgeLine = new THREE.LineSegments(edgeGeometry, new THREE.LineBasicMaterial({
    color: 0xe8d09f, transparent: true, opacity: .34, depthWrite: false
  }));
  edgeLine.renderOrder = 5;

  const group = new THREE.Group();
  group.name = `letter-piece-${definition.id}`;
  group.add(mesh, revealMesh, edgeLine);
  group.position.set(definition.start[0], definition.start[1], .34);
  group.scale.setScalar(PIECE_SCALE);

  const rig: PieceRig = {
    group,
    definition,
    goalPosition: new THREE.Vector3(definition.start[0], definition.start[1], REST_Z),
    goalTiltX: 0,
    goalTiltY: 0,
    revealMaterial,
    clusterId: definition.id
  };
  return { group, rig, faceMaterial, revealMaterial };
}

function orientation(a: Point, b: Point, c: Point) {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
}

function segmentsCross(a: Point, b: Point, c: Point, d: Point) {
  const first = orientation(a, b, c);
  const second = orientation(a, b, d);
  const third = orientation(c, d, a);
  const fourth = orientation(c, d, b);
  return first * second < -.0005 && third * fourth < -.0005;
}

function pointInside(point: Point, polygon: readonly Point[]) {
  let inside = false;
  for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current++) {
    const [x1, y1] = polygon[current];
    const [x2, y2] = polygon[previous];
    if ((y1 > point[1]) !== (y2 > point[1]) && point[0] < ((x2 - x1) * (point[1] - y1)) / (y2 - y1) + x1) inside = !inside;
  }
  return inside;
}

function worldPolygon(rig: PieceRig): Point[] {
  return rig.definition.polygon.map(([x, y]) => [
    (x - rig.definition.origin[0]) * PIECE_SCALE + rig.group.position.x,
    (y - rig.definition.origin[1]) * PIECE_SCALE + rig.group.position.y
  ] as const);
}

function polygonsOverlap(first: readonly Point[], second: readonly Point[]) {
  for (let a = 0; a < first.length; a += 1) {
    const aNext = (a + 1) % first.length;
    for (let b = 0; b < second.length; b += 1) {
      if (segmentsCross(first[a], first[aNext], second[b], second[(b + 1) % second.length])) return true;
    }
  }
  return pointInside(first[0], second) || pointInside(second[0], first);
}

export default function JoseonLetterEvidence3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);
  const [assembled, setAssembled] = useState(false);
  const [revealReady, setRevealReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = document.getElementById("documentAssemblyStage");
    const panel = document.getElementById("documentAssemblyPanel");
    if (!canvas || !stage || !panel) return;
    let disposed = false;
    let teardown = () => {};

    const setup = async () => {
      await loadLetterFont();
      const paperImage = await loadImage("/samunmong/assets/interactions/document-puzzle/joseon-promise-letter-albedo-v1.png");
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.06;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, .1, 60);
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -.24);
      const dragPoint = new THREE.Vector3();
      const letterRoot = new THREE.Group();
      scene.add(letterRoot);

      const textureLoader = new THREE.TextureLoader();
      const boardTexture = textureLoader.load("/samunmong/assets/interactions/shared-inspection/joseon-investigation-board-flat-bright-v1.png");
      boardTexture.colorSpace = THREE.SRGBColorSpace;
      boardTexture.anisotropy = Math.min(12, renderer.capabilities.getMaxAnisotropy());
      boardTexture.minFilter = THREE.LinearMipmapLinearFilter;
      boardTexture.magFilter = THREE.LinearFilter;
      const board = new THREE.Mesh(
        new THREE.PlaneGeometry(11.4, 6.4125),
        new THREE.MeshBasicMaterial({ map: boardTexture, toneMapped: false })
      );
      board.position.z = -.12;
      scene.add(board);

      const shadowSurface = new THREE.Mesh(
        new THREE.PlaneGeometry(11.4, 6.4125),
        new THREE.ShadowMaterial({ color: 0x1b1009, opacity: .18 })
      );
      shadowSurface.position.z = -.1;
      shadowSurface.receiveShadow = true;
      scene.add(shadowSurface);

      const codedTexture = new THREE.CanvasTexture(makeLetterCanvas("coded", paperImage));
      const revealedTexture = new THREE.CanvasTexture(makeLetterCanvas("revealed", paperImage));
      [codedTexture, revealedTexture].forEach((texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(12, renderer.capabilities.getMaxAnisotropy());
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
      });

      const edgeMaterial = new THREE.MeshStandardMaterial({ color: 0xb59865, roughness: 1, metalness: 0 });
      const pieceRigs = new Map<PieceId, PieceRig>();
      const clusters = new Map<PieceId, Set<PieceId>>();
      const selectableMeshes: THREE.Object3D[] = [];
      const pieceMaterials: THREE.Material[] = [];
      PIECES.forEach((definition) => {
        const { group, rig, faceMaterial, revealMaterial } = makePiece(definition, codedTexture, revealedTexture, edgeMaterial);
        letterRoot.add(group);
        pieceRigs.set(definition.id, rig);
        clusters.set(definition.id, new Set([definition.id]));
        selectableMeshes.push(group.children[0]);
        pieceMaterials.push(faceMaterial, revealMaterial);
      });

      scene.add(new THREE.HemisphereLight(0xffedcf, 0x3a2a1d, 1.48));
      const keyLight = new THREE.DirectionalLight(0xffd69d, 2.45);
      keyLight.position.set(-4.6, 6.4, 8.5);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(2048, 2048);
      keyLight.shadow.camera.left = -6;
      keyLight.shadow.camera.right = 6;
      keyLight.shadow.camera.top = 4;
      keyLight.shadow.camera.bottom = -4;
      keyLight.shadow.bias = -.0004;
      scene.add(keyLight);
      const fillLight = new THREE.DirectionalLight(0xc7d6db, .52);
      fillLight.position.set(4, 2, 6);
      scene.add(fillLight);

      let isActive = false;
      let isAssembled = false;
      let frame = 0;
      let baseCameraZ = 11;
      let zoom = 1;
      let targetZoom = 1;
      let pointerId = -1;
      let pointerMoved = false;
      let pointerStartX = 0;
      let pointerStartY = 0;
      let lastPointerX = 0;
      let lastPointerY = 0;
      let dragAnchor = new THREE.Vector3();
      let draggingIds: PieceId[] = [];
      let dragStartPositions = new Map<PieceId, THREE.Vector3>();
      let revealAmount = 0;
      let revealReported = false;
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
        revealAmount = 0;
        revealReported = false;
        draggingIds = [];
        clusters.clear();
        setAssembled(false);
        setRevealReady(false);
        zoom = 1;
        targetZoom = 1;
        letterRoot.position.y = 0;
        PIECE_IDS.forEach((id, index) => {
          const rig = pieceRigs.get(id);
          if (!rig) return;
          rig.clusterId = id;
          clusters.set(id, new Set([id]));
          rig.revealMaterial.opacity = 0;
          rig.goalPosition.set(rig.definition.start[0], rig.definition.start[1], REST_Z);
          rig.group.position.set(rig.definition.start[0], rig.definition.start[1], .1 + index * .004);
          rig.group.rotation.set((index % 2 ? 1 : -1) * .018, (index % 3 - 1) * .014, 0);
          rig.goalTiltX = 0;
          rig.goalTiltY = 0;
        });
      };

      const resize = () => {
        const rect = stage.getBoundingClientRect();
        if (rect.width < 2 || rect.height < 2) return;
        renderer.setSize(rect.width, rect.height, false);
        camera.aspect = rect.width / rect.height;
        camera.updateProjectionMatrix();
        const radians = THREE.MathUtils.degToRad(camera.fov);
        const verticalDistance = 6.72 / (2 * Math.tan(radians / 2));
        const horizontalDistance = (11.5 / camera.aspect) / (2 * Math.tan(radians / 2));
        baseCameraZ = Math.max(verticalDistance, horizontalDistance) + .38;
        camera.position.set(0, 0, baseCameraZ / zoom);
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

      const constrainedDelta = (rawX: number, rawY: number) => {
        let minX = -Infinity;
        let maxX = Infinity;
        let minY = -Infinity;
        let maxY = Infinity;
        draggingIds.forEach((id) => {
          const rig = pieceRigs.get(id);
          const start = dragStartPositions.get(id);
          if (!rig || !start) return;
          const [left, right, bottom, top] = rig.definition.bounds;
          minX = Math.max(minX, -5.08 - (start.x + left * PIECE_SCALE));
          maxX = Math.min(maxX, 5.08 - (start.x + right * PIECE_SCALE));
          minY = Math.max(minY, -2.58 - (start.y + bottom * PIECE_SCALE));
          maxY = Math.min(maxY, 2.58 - (start.y + top * PIECE_SCALE));
        });
        return new THREE.Vector2(THREE.MathUtils.clamp(rawX, minX, maxX), THREE.MathUtils.clamp(rawY, minY, maxY));
      };

      const onPointerDown = (event: PointerEvent) => {
        if (!isActive || isAssembled) return;
        updatePointer(event);
        const hit = raycaster.intersectObjects(selectableMeshes, false)[0];
        const pieceId = hit?.object.userData.pieceId as PieceId | undefined;
        const rig = pieceId ? pieceRigs.get(pieceId) : null;
        const point = pointOnDragPlane(event);
        if (!pieceId || !rig || !point) return;

        pointerId = event.pointerId;
        pointerStartX = lastPointerX = event.clientX;
        pointerStartY = lastPointerY = event.clientY;
        pointerMoved = false;
        dragAnchor = point;
        draggingIds = [...(clusters.get(rig.clusterId) || new Set([pieceId]))];
        dragStartPositions = new Map();
        draggingIds.forEach((id, index) => {
          const member = pieceRigs.get(id);
          if (!member) return;
          dragStartPositions.set(id, member.group.position.clone());
          member.group.position.z = LIFT_Z + index * .002;
          member.goalPosition.copy(member.group.position);
        });
        canvas.setPointerCapture?.(event.pointerId);
        canvas.classList.add("is-dragging");
        event.preventDefault();
      };

      const onPointerMove = (event: PointerEvent) => {
        if (event.pointerId !== pointerId || draggingIds.length === 0) {
          if (isActive && !isAssembled && pointerId === -1) {
            updatePointer(event);
            canvas.classList.toggle("has-piece-hover", raycaster.intersectObjects(selectableMeshes, false).length > 0);
          }
          return;
        }
        const point = pointOnDragPlane(event);
        if (!point) return;
        pointerMoved ||= Math.hypot(event.clientX - pointerStartX, event.clientY - pointerStartY) > 5;
        const delta = constrainedDelta(point.x - dragAnchor.x, point.y - dragAnchor.y);
        const velocityX = event.clientX - lastPointerX;
        const velocityY = event.clientY - lastPointerY;
        lastPointerX = event.clientX;
        lastPointerY = event.clientY;
        draggingIds.forEach((id, index) => {
          const rig = pieceRigs.get(id);
          const start = dragStartPositions.get(id);
          if (!rig || !start) return;
          rig.group.position.set(start.x + delta.x, start.y + delta.y, LIFT_Z + index * .002);
          rig.goalPosition.copy(rig.group.position);
          rig.goalTiltX = THREE.MathUtils.clamp(-velocityY * .003, -.055, .055);
          rig.goalTiltY = THREE.MathUtils.clamp(velocityX * .003, -.065, .065);
        });
        event.preventDefault();
      };

      const findSnap = () => {
        let best: { distance: number; correction: THREE.Vector2; clusterId: PieceId } | null = null;
        const moving = new Set(draggingIds);
        for (const movingId of draggingIds) {
          const movingRig = pieceRigs.get(movingId);
          if (!movingRig) continue;
          for (const fixedId of PIECE_IDS) {
            if (moving.has(fixedId) || !ADJACENT.has(pairKey(movingId, fixedId))) continue;
            const fixedRig = pieceRigs.get(fixedId);
            if (!fixedRig) continue;
            const expectedX = (movingRig.definition.origin[0] - fixedRig.definition.origin[0]) * PIECE_SCALE;
            const expectedY = (movingRig.definition.origin[1] - fixedRig.definition.origin[1]) * PIECE_SCALE;
            const correction = new THREE.Vector2(
              fixedRig.group.position.x + expectedX - movingRig.group.position.x,
              fixedRig.group.position.y + expectedY - movingRig.group.position.y
            );
            const distance = correction.length();
            if (distance < SNAP_DISTANCE && (!best || distance < best.distance)) best = { distance, correction, clusterId: fixedRig.clusterId };
          }
        }
        return best;
      };

      const overlapsOtherCluster = () => {
        const moving = new Set(draggingIds);
        return draggingIds.some((movingId) => {
          const movingRig = pieceRigs.get(movingId);
          if (!movingRig) return false;
          const movingPolygon = worldPolygon(movingRig);
          return PIECE_IDS.some((fixedId) => {
            if (moving.has(fixedId)) return false;
            const fixedRig = pieceRigs.get(fixedId);
            return fixedRig ? polygonsOverlap(movingPolygon, worldPolygon(fixedRig)) : false;
          });
        });
      };

      const finishAssembly = () => {
        isAssembled = true;
        setAssembled(true);
        targetZoom = .98;
        PIECE_IDS.forEach((id) => {
          const rig = pieceRigs.get(id);
          if (!rig) return;
          rig.goalPosition.set(rig.definition.origin[0] * PIECE_SCALE, rig.definition.origin[1] * PIECE_SCALE + .03, REST_Z);
          rig.goalTiltX = 0;
          rig.goalTiltY = 0;
        });
      };

      const onPointerUp = (event: PointerEvent) => {
        if (event.pointerId !== pointerId) return;
        canvas.releasePointerCapture?.(event.pointerId);
        canvas.classList.remove("is-dragging", "has-piece-hover");
        pointerId = -1;
        const movedIds = [...draggingIds];
        movedIds.forEach((id) => {
          const rig = pieceRigs.get(id);
          if (rig) {
            rig.goalTiltX = 0;
            rig.goalTiltY = 0;
          }
        });

        if (event.type === "pointercancel" || !pointerMoved) {
          movedIds.forEach((id) => {
            const rig = pieceRigs.get(id);
            const start = dragStartPositions.get(id);
            if (rig && start) rig.goalPosition.set(start.x, start.y, REST_Z);
          });
          draggingIds = [];
          return;
        }

        const snap = findSnap();
        if (snap) {
          movedIds.forEach((id) => {
            const rig = pieceRigs.get(id);
            if (!rig) return;
            rig.group.position.x += snap.correction.x;
            rig.group.position.y += snap.correction.y;
            rig.goalPosition.set(rig.group.position.x, rig.group.position.y, REST_Z);
          });
          const movingClusterId = pieceRigs.get(movedIds[0])?.clusterId;
          const movingCluster = movingClusterId ? clusters.get(movingClusterId) : null;
          const fixedCluster = clusters.get(snap.clusterId);
          if (movingClusterId && movingCluster && fixedCluster) {
            const merged = new Set<PieceId>([...fixedCluster, ...movingCluster]);
            merged.forEach((id) => {
              const rig = pieceRigs.get(id);
              if (rig) rig.clusterId = snap.clusterId;
            });
            clusters.set(snap.clusterId, merged);
            if (movingClusterId !== snap.clusterId) clusters.delete(movingClusterId);
            window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: { count: merged.size, total: PIECES.length, joined: true } }));
            if (merged.size === PIECES.length) finishAssembly();
          }
        } else if (overlapsOtherCluster()) {
          movedIds.forEach((id) => {
            const rig = pieceRigs.get(id);
            const start = dragStartPositions.get(id);
            if (rig && start) rig.goalPosition.set(start.x, start.y, REST_Z);
          });
          window.dispatchEvent(new CustomEvent(REJECT_EVENT, { detail: { overlap: true } }));
        } else {
          movedIds.forEach((id) => {
            const rig = pieceRigs.get(id);
            if (rig) rig.goalPosition.set(rig.group.position.x, rig.group.position.y, REST_Z);
          });
        }
        draggingIds = [];
      };

      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("pointercancel", onPointerUp);
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
        const damping = 1 - Math.exp(-delta * 12);
        zoom = THREE.MathUtils.lerp(zoom, targetZoom, damping);
        camera.position.z = baseCameraZ / zoom;
        if (isAssembled) revealAmount = Math.min(1, revealAmount + delta * 1.1);
        letterRoot.position.y = THREE.MathUtils.lerp(letterRoot.position.y, isAssembled ? .72 : 0, damping);
        const dragging = new Set(draggingIds);
        pieceRigs.forEach((rig, id) => {
          if (!dragging.has(id)) rig.group.position.lerp(rig.goalPosition, damping);
          rig.group.rotation.x = THREE.MathUtils.lerp(rig.group.rotation.x, rig.goalTiltX, damping);
          rig.group.rotation.y = THREE.MathUtils.lerp(rig.group.rotation.y, rig.goalTiltY, damping);
          rig.group.rotation.z = 0;
          rig.revealMaterial.opacity = THREE.MathUtils.smoothstep(revealAmount, .12, .96);
        });
        if (isAssembled && revealAmount > .93 && !revealReported) {
          revealReported = true;
          setRevealReady(true);
          const guide = document.getElementById("documentAssemblyGuide");
          if (guide) guide.textContent = "편지 아래에 드러난 문장을 확인하십시오.";
        }
        keyLight.intensity = 2.43 + Math.sin(elapsed * .42) * .025;
        renderer.render(scene, camera);
        canvas.dataset.frame = String(Number(canvas.dataset.frame || "0") + 1);
      };
      frame = requestAnimationFrame(animate);

      teardown = () => {
        cancelAnimationFrame(frame);
        resizeObserver.disconnect();
        panelObserver.disconnect();
        window.removeEventListener(OPEN_EVENT, onOpen);
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointercancel", onPointerUp);
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) object.geometry.dispose();
          if (object instanceof THREE.LineSegments) object.material.dispose();
        });
        pieceMaterials.forEach((material) => material.dispose());
        edgeMaterial.dispose();
        codedTexture.dispose();
        revealedTexture.dispose();
        boardTexture.dispose();
        renderer.dispose();
      };
    };

    void setup();
    return () => {
      disposed = true;
      teardown();
    };
  }, []);

  const complete = useCallback(() => {
    if (!assembled || !revealReady) return;
    window.dispatchEvent(new CustomEvent(COMPLETE_EVENT));
  }, [assembled, revealReady]);

  return (
    <div className="joseon-letter-evidence-3d" data-active={active ? "true" : "false"} data-assembled={assembled ? "true" : "false"}>
      <canvas ref={canvasRef} data-engine={`three.js r${THREE.REVISION} pbr five-piece letter`} aria-label="입체 찢어진 약속 편지 복원대" />
      <section className="letter-recovered-copy" hidden={!revealReady} aria-live="polite">
        <div>
          <strong>복원된 문장</strong>
          <p>오늘 밤 창고에서 기다리시오. 달이 기울기 전에 함께 떠납시다.<br />이 약속을 누구에게도 말하지 마시오.</p>
        </div>
        <button className="letter-evidence-3d-confirm" type="button" onClick={complete}>내용 확인</button>
      </section>
    </div>
  );
}
