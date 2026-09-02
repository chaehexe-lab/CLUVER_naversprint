"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent
} from "react";
import type { SceneHotspot } from "@/lib/gameTypes";
import {
  getMagicEvidenceReviewItems,
  magicEvidenceReviewItems,
  type MagicEvidenceBounds,
  type MagicEvidenceReviewItem,
  type MagicEvidenceReviewId
} from "@/lib/magicEvidenceReview";

type ReviewOverlayProps = {
  sceneId: string;
  hotspots: readonly SceneHotspot[];
  selectedId?: MagicEvidenceReviewId;
  onSelect: (id: MagicEvidenceReviewId) => void;
  onHotspotChange: (evidenceName: string, bounds: MagicEvidenceBounds) => void;
  onHotspotReset: (evidenceName: string) => void;
};

type ResizeMode = "move" | "rotate" | "nw" | "ne" | "sw" | "se";

type ActiveEdit = {
  pointerId: number;
  mode: ResizeMode;
  startX: number;
  startY: number;
  sceneWidth: number;
  sceneHeight: number;
  centerX: number;
  centerY: number;
  startAngle: number;
  startRotation: number;
  evidenceName: string;
  bounds: MagicEvidenceBounds;
};

const reviewScenes = Array.from(
  new Map(magicEvidenceReviewItems.map((item) => [item.sceneId, item.sceneLabel])).entries()
);

function reviewPlacement(bounds: MagicEvidenceReviewItem["visible"]): CSSProperties {
  return {
    left: bounds.x,
    top: bounds.y,
    width: bounds.w,
    height: bounds.h,
    clipPath: bounds.clipPath,
    borderRadius: bounds.radius,
    transform: `translate(-50%, -50%) rotate(${bounds.rot ?? "0deg"})`
  };
}

function reviewEditorPlacement(bounds: MagicEvidenceBounds): CSSProperties {
  return {
    left: bounds.x,
    top: bounds.y,
    width: bounds.w,
    height: bounds.h,
    transform: `translate(-50%, -50%) rotate(${bounds.rot ?? "0deg"})`
  };
}

function numberFromPercent(value: string | undefined, fallback = 0) {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) ? parsed : fallback;
}

function percent(value: number) {
  return `${Math.round(value * 10) / 10}%`;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export default function MagicEvidenceReviewOverlay({
  sceneId,
  hotspots,
  selectedId,
  onSelect,
  onHotspotChange,
  onHotspotReset
}: ReviewOverlayProps) {
  const items = useMemo(() => getMagicEvidenceReviewItems(sceneId), [sceneId]);
  const [measurement, setMeasurement] = useState({ viewport: "", scene: "" });
  const [copyState, setCopyState] = useState("좌표 복사");
  const activeEdit = useRef<ActiveEdit | null>(null);

  useEffect(() => {
    const root = document.getElementById(sceneId);
    if (!root) return;

    const update = () => {
      const rect = root.getBoundingClientRect();
      setMeasurement({
        viewport: `${window.innerWidth} × ${window.innerHeight}`,
        scene: `${Math.round(rect.width)} × ${Math.round(rect.height)}`
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(root);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [sceneId]);

  const selected = items.find((item) => item.id === selectedId) ?? items[0];
  const selectedHotspot = selected
    ? hotspots.find((candidate) => candidate.evidenceName === selected.evidenceName)
    : undefined;

  const beginEdit = (
    event: ReactPointerEvent<HTMLElement>,
    item: MagicEvidenceReviewItem,
    hotspot: SceneHotspot,
    mode: ResizeMode
  ) => {
    const scene = document.getElementById(sceneId)?.getBoundingClientRect();
    if (!scene || scene.width <= 0 || scene.height <= 0) return;
    event.preventDefault();
    event.stopPropagation();
    onSelect(item.id);
    activeEdit.current = {
      pointerId: event.pointerId,
      mode,
      startX: event.clientX,
      startY: event.clientY,
      sceneWidth: scene.width,
      sceneHeight: scene.height,
      centerX: scene.left + (numberFromPercent(hotspot.x, 50) / 100) * scene.width,
      centerY: scene.top + (numberFromPercent(hotspot.y, 50) / 100) * scene.height,
      startAngle: Math.atan2(
        event.clientY - (scene.top + (numberFromPercent(hotspot.y, 50) / 100) * scene.height),
        event.clientX - (scene.left + (numberFromPercent(hotspot.x, 50) / 100) * scene.width)
      ) * 180 / Math.PI,
      startRotation: numberFromPercent(hotspot.rot, 0),
      evidenceName: item.evidenceName,
      bounds: {
        x: hotspot.x,
        y: hotspot.y,
        w: hotspot.w,
        h: hotspot.h,
        clipPath: hotspot.clipPath,
        radius: hotspot.radius,
        rot: hotspot.rot
      }
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveEdit = (event: ReactPointerEvent<HTMLElement>) => {
    const edit = activeEdit.current;
    if (!edit || edit.pointerId !== event.pointerId) return;
    event.preventDefault();
    const dx = ((event.clientX - edit.startX) / edit.sceneWidth) * 100;
    const dy = ((event.clientY - edit.startY) / edit.sceneHeight) * 100;
    const x = numberFromPercent(edit.bounds.x, 50);
    const y = numberFromPercent(edit.bounds.y, 50);
    const width = numberFromPercent(edit.bounds.w, 8);
    const height = numberFromPercent(edit.bounds.h, 8);

    if (edit.mode === "rotate") {
      const angle = Math.atan2(event.clientY - edit.centerY, event.clientX - edit.centerX) * 180 / Math.PI;
      const unwrapped = edit.startRotation + angle - edit.startAngle;
      const rotation = ((unwrapped + 180) % 360 + 360) % 360 - 180;
      onHotspotChange(edit.evidenceName, { ...edit.bounds, rot: `${Math.round(rotation * 10) / 10}deg` });
      return;
    }

    let left = x - width / 2;
    let right = x + width / 2;
    let top = y - height / 2;
    let bottom = y + height / 2;
    if (edit.mode === "move") {
      const nextX = clamp(x + dx, width / 2, 100 - width / 2);
      const nextY = clamp(y + dy, height / 2, 100 - height / 2);
      onHotspotChange(edit.evidenceName, { ...edit.bounds, x: percent(nextX), y: percent(nextY) });
      return;
    }

    if (edit.mode.includes("w")) left = clamp(left + dx, 0, right - 2);
    if (edit.mode.includes("e")) right = clamp(right + dx, left + 2, 100);
    if (edit.mode.includes("n")) top = clamp(top + dy, 0, bottom - 2);
    if (edit.mode.includes("s")) bottom = clamp(bottom + dy, top + 2, 100);
    onHotspotChange(edit.evidenceName, {
      ...edit.bounds,
      x: percent((left + right) / 2),
      y: percent((top + bottom) / 2),
      w: percent(right - left),
      h: percent(bottom - top)
    });
  };

  const endEdit = (event: ReactPointerEvent<HTMLElement>) => {
    if (activeEdit.current?.pointerId !== event.pointerId) return;
    activeEdit.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const updateSelectedNumber = (field: "x" | "y" | "w" | "h", next: number) => {
    if (!selected || !selectedHotspot || !Number.isFinite(next)) return;
    const minimum = field === "w" || field === "h" ? 2 : 0;
    onHotspotChange(selected.evidenceName, {
      x: selectedHotspot.x,
      y: selectedHotspot.y,
      w: selectedHotspot.w,
      h: selectedHotspot.h,
      clipPath: selectedHotspot.clipPath,
      radius: selectedHotspot.radius,
      rot: selectedHotspot.rot,
      [field]: percent(clamp(next, minimum, 100))
    });
  };

  const updateSelectedRotation = (next: number) => {
    if (!selected || !selectedHotspot || !Number.isFinite(next)) return;
    onHotspotChange(selected.evidenceName, {
      x: selectedHotspot.x,
      y: selectedHotspot.y,
      w: selectedHotspot.w,
      h: selectedHotspot.h,
      clipPath: selectedHotspot.clipPath,
      radius: selectedHotspot.radius,
      rot: `${Math.round(clamp(next, -180, 180) * 10) / 10}deg`
    });
  };

  const coordinateJson = selected && selectedHotspot
    ? JSON.stringify({
        id: selected.id,
        evidenceName: selected.evidenceName,
        x: selectedHotspot.x,
        y: selectedHotspot.y,
        w: selectedHotspot.w,
        h: selectedHotspot.h,
        rot: selectedHotspot.rot ?? "0deg",
        clipPath: selectedHotspot.clipPath
      }, null, 2)
    : "";

  const copyCoordinates = async () => {
    if (!coordinateJson) return;
    try {
      await navigator.clipboard.writeText(coordinateJson);
      setCopyState("복사됨");
    } catch {
      setCopyState("복사 실패");
    }
    window.setTimeout(() => setCopyState("좌표 복사"), 1400);
  };

  return (
    <div className="magic-evidence-review" data-magic-evidence-review={sceneId}>
      <div className="magic-review-scene-tabs" aria-label="마법학교 증거 검수 장면">
        {reviewScenes.map(([id, label]) => (
          <button
            className={id === sceneId ? "active" : ""}
            type="button"
            onClick={() => {
              const params = new URLSearchParams({
                start: id,
                theme: "magicSchool",
                magicReview: "1"
              });
              window.location.assign(`/?${params.toString()}`);
            }}
            key={id}
          >
            {label}
          </button>
        ))}
      </div>

      <aside className="magic-review-panel" aria-label="증거 영역 검수 정보">
        <div className="magic-review-panel-head">
          <span>LOCAL QA</span>
          <strong>마법학교 증거 검수</strong>
        </div>
        <div className="magic-review-measurement">
          <span>화면 {measurement.viewport}</span>
          <span>장면 {measurement.scene}</span>
        </div>
        <div className="magic-review-legend">
          <span><i className="visible" /> 실제 증거 예상 윤곽</span>
          <span><i className="hitbox" /> 현재 hover · click</span>
        </div>
        {selected ? (
          <div className="magic-review-current">
            <img src={selected.cutout} alt="" />
            <div>
              <b>{selected.id} · {selected.evidenceName}</b>
              <span>{selected.category} · {selected.sceneLabel}</span>
              <p>{selected.reviewNote}</p>
            </div>
          </div>
        ) : null}
        {selected && selectedHotspot ? (
          <div className="magic-review-editor">
            <div className="magic-review-fields">
              {(["x", "y", "w", "h"] as const).map((field) => (
                <label key={field}>
                  <span>{field.toUpperCase()}</span>
                  <input
                    type="number"
                    min={field === "w" || field === "h" ? 2 : 0}
                    max="100"
                    step="0.1"
                    value={numberFromPercent(selectedHotspot[field])}
                    onChange={(event) => updateSelectedNumber(field, Number(event.target.value))}
                  />
                  <i>%</i>
                </label>
              ))}
            </div>
            <label className="magic-review-rotation-field">
              <span>R</span>
              <input
                className="magic-review-rotation-range"
                type="range"
                min="-180"
                max="180"
                step="0.5"
                value={numberFromPercent(selectedHotspot.rot)}
                onChange={(event) => updateSelectedRotation(Number(event.target.value))}
              />
              <input
                className="magic-review-rotation-number"
                type="number"
                min="-180"
                max="180"
                step="0.5"
                value={numberFromPercent(selectedHotspot.rot)}
                onChange={(event) => updateSelectedRotation(Number(event.target.value))}
              />
              <i>°</i>
            </label>
            <textarea value={coordinateJson} readOnly aria-label={`${selected.id} 조정 좌표`} />
            <div className="magic-review-actions">
              <button type="button" onClick={copyCoordinates}>{copyState}</button>
              <button type="button" onClick={() => onHotspotReset(selected.evidenceName)}>초기값</button>
            </div>
          </div>
        ) : null}
        <small>영역을 끌어 이동하고, 모서리로 크기를 바꾸거나 위쪽 원형 손잡이로 회전할 수 있습니다.</small>
      </aside>

      {items.map((item) => {
        const hotspot = hotspots.find((candidate) => candidate.evidenceName === item.evidenceName);
        if (!hotspot) return null;
        const active = selected?.id === item.id;
        return (
          <div className={`magic-review-evidence${active ? " active" : ""}`} data-review-id={item.id} key={item.id}>
            <div className="magic-review-visible-outline" style={reviewPlacement(item.visible)}>
              <span>{item.id}</span>
            </div>
            <div
              className="magic-review-hitbox-outline editable"
              style={reviewEditorPlacement(hotspot)}
              onPointerDown={(event) => beginEdit(event, item, hotspot, "move")}
              onPointerMove={moveEdit}
              onPointerUp={endEdit}
              onPointerCancel={endEdit}
            >
              <i
                className="magic-review-hitbox-shape"
                style={{ clipPath: hotspot.clipPath, borderRadius: hotspot.radius }}
              />
              <span>{item.id}</span>
              <button
                className="magic-review-rotate-handle"
                type="button"
                aria-label={`${item.id} 회전 조절`}
                onPointerDown={(event) => beginEdit(event, item, hotspot, "rotate")}
                onPointerMove={moveEdit}
                onPointerUp={endEdit}
                onPointerCancel={endEdit}
              >↻</button>
              {(["nw", "ne", "sw", "se"] as const).map((mode) => (
                <button
                  className={`magic-review-resize-handle ${mode}`}
                  type="button"
                  aria-label={`${item.id} ${mode} 모서리 크기 조절`}
                  onPointerDown={(event) => beginEdit(event, item, hotspot, mode)}
                  onPointerMove={moveEdit}
                  onPointerUp={endEdit}
                  onPointerCancel={endEdit}
                  key={mode}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
