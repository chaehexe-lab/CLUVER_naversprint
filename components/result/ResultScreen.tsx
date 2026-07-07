"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const suspects = [
  {
    id: "dolsoe",
    name: "돌쇠",
    image: "/samunmong/assets/suspects/dolsoe-seated.png",
    slot: { left: "13.22%", top: "36.56%", width: "13.94%", height: "31.24%" },
    nameLeft: "20.16%",
    offsetX: "0%"
  },
  {
    id: "chunwol",
    name: "최춘월",
    image: "/samunmong/assets/suspects/chunwol-seated.png",
    slot: { left: "32.78%", top: "36.56%", width: "13.82%", height: "31.24%" },
    nameLeft: "39.65%",
    offsetX: "12%"
  },
  {
    id: "yoomunseok",
    name: "유문석",
    image: "/samunmong/assets/suspects/yoomunseok-seated.png",
    slot: { left: "52.57%", top: "36.56%", width: "13.88%", height: "31.24%" },
    nameLeft: "59.51%",
    offsetX: "0%"
  },
  {
    id: "mudeok",
    name: "무덕",
    image: "/samunmong/assets/suspects/mudeok-seated.png",
    slot: { left: "72.01%", top: "36.56%", width: "13.64%", height: "31.24%" },
    nameLeft: "78.83%",
    offsetX: "6.5%"
  }
] as const;

const requiredEvidence = [
  "호패 조각",
  "돌쇠의 그림",
  "긁힌 팔 흔적",
  "작은 발자국",
  "찢어진 문서 조각"
] as const;

function readCollectedEvidence() {
  if (typeof window === "undefined") return [] as string[];

  try {
    const parsed = JSON.parse(window.localStorage.getItem("samunmong-collected-evidence") || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export default function ResultScreen() {
  const searchParams = useSearchParams();
  const initialSuspectId = searchParams.get("suspectId");
  const [selectedSuspectId, setSelectedSuspectId] = useState(
    suspects.some((suspect) => suspect.id === initialSuspectId) ? initialSuspectId : suspects[0].id
  );
  const [showWarning, setShowWarning] = useState(false);

  const selectedSuspect = suspects.find((suspect) => suspect.id === selectedSuspectId) ?? suspects[0];
  const selectedIndex = suspects.findIndex((suspect) => suspect.id === selectedSuspect.id);
  const missingEvidence = useMemo(() => {
    const collected = new Set(readCollectedEvidence());
    return requiredEvidence.filter((name) => !collected.has(name));
  }, [showWarning]);

  function confirmAccusation(force = false) {
    if (!force && missingEvidence.length > 0) {
      setShowWarning(true);
      return;
    }

    const params = new URLSearchParams({
      suspect: selectedSuspect.name
    });
    window.location.href = `/result?${params.toString()}&accused=1`;
  }

  if (searchParams.get("accused") === "1") {
    return (
      <main className="result-screen result-verdict">
        <img className="result-full-bg" src="/samunmong/assets/final-accusation-bg.png" alt="" />
        <section className="result-complete" aria-labelledby="resultTitle">
          <h1 id="resultTitle">지목 완료</h1>
          <p>{searchParams.get("suspect") || "선택한 용의자"}</p>
          <Link className="wood-result-button" href="/interrogation">
            취조실로 돌아가기
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="result-screen accusation-screen">
      <section className="accusation-stage" aria-labelledby="resultTitle">
        <img className="accusation-bg" src="/samunmong/assets/final-accusation-bg.png" alt="" />
        <h1 id="resultTitle" className="accusation-title">
          최종 범인 지목
        </h1>

        {suspects.map((suspect) => (
          <button
            className={`accusation-suspect ${selectedSuspectId === suspect.id ? "selected" : ""}`}
            type="button"
            key={suspect.id}
            onClick={() => setSelectedSuspectId(suspect.id)}
            aria-label={`${suspect.name} 지목`}
            aria-pressed={selectedSuspectId === suspect.id}
            style={{
              left: suspect.slot.left,
              top: suspect.slot.top,
              width: suspect.slot.width,
              height: suspect.slot.height,
              ["--portrait-x" as string]: suspect.offsetX
            }}
          >
            <img src={suspect.image} alt="" />
          </button>
        ))}

        {suspects.map((suspect) => (
          <span className="accusation-name" key={`${suspect.id}-name`} style={{ left: suspect.nameLeft }}>
            {suspect.name}
          </span>
        ))}

        <div
          className="accusation-stamp"
          aria-hidden="true"
          style={{ left: `${24.25 + selectedIndex * 19.45}%` }}
        >
          지목
        </div>

        <div className="accusation-actions">
          <button className="wood-result-button primary" type="button" onClick={() => confirmAccusation()}>
            이 자를 지목한다
          </button>
          <Link className="wood-result-button" href="/interrogation">
            취조실로 돌아가기
          </Link>
        </div>
      </section>

      {showWarning ? (
        <div className="accusation-dialog-backdrop" role="presentation">
          <section className="accusation-dialog" role="alertdialog" aria-modal="true" aria-labelledby="warningTitle">
            <h2 id="warningTitle">사또님...</h2>
            <p>아직 거둬들이지 못한 주요 단서가 남아 있는 듯합니다. 이대로 지목하시겠습니까?</p>
            <div className="accusation-dialog-actions">
              <button className="wood-result-button primary" type="button" onClick={() => confirmAccusation(true)}>
                그래도 지목한다
              </button>
              <button className="wood-result-button" type="button" onClick={() => setShowWarning(false)}>
                더 조사한다
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
