"use client";

import { useEffect, useMemo, useState, type DragEvent } from "react";
import {
  joseonAjeonAssets,
  joseonCommandStatusAssets,
  joseonInteractionFeedbackAssets,
  joseonSatoSkillAssets,
  joseonSatoCommandLauncher,
  joseonSatoSkillTokens,
} from "@/lib/joseonSatoSkillAssets";

type SkillId = "search" | "registry" | null;
type SearchStep = "sealed" | "ordered" | "unsealed" | "open";
type RegistrySlot = "hopae" | "ledger";

const evidenceKey = "samunmong-collected-evidence-joseon";
const skillStateKey = "samunmong-sato-skill-state";
const joseonScreens = new Set([
  "fieldOne", "chunwolRoom", "mudeokServantRoom", "yoomunseokSarangbang",
  "dolsoeQuarters", "backGateCourtyard", "interrogationScreen",
]);

function readStoredEvidence() {
  try {
    const value = JSON.parse(window.localStorage.getItem(evidenceKey) || "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function readSkillState() {
  try {
    const value = JSON.parse(window.localStorage.getItem(skillStateKey) || "{}");
    return {
      searchComplete: Boolean(value.searchComplete),
      registryComplete: Boolean(value.registryComplete),
    };
  } catch {
    return { searchComplete: false, registryComplete: false };
  }
}

export default function SatoSkillSystem({ currentScreen }: { currentScreen: string }) {
  const [open, setOpen] = useState(false);
  const [activeSkill, setActiveSkill] = useState<SkillId>(null);
  const [evidence, setEvidence] = useState<string[]>([]);
  const [searchStep, setSearchStep] = useState<SearchStep>("sealed");
  const [registrySlots, setRegistrySlots] = useState<Record<RegistrySlot, boolean>>({ hopae: false, ledger: false });
  const [saved, setSaved] = useState({ searchComplete: false, registryComplete: false });

  useEffect(() => {
    const sync = () => {
      setEvidence(readStoredEvidence());
      setSaved(readSkillState());
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("samunmong:screen-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("samunmong:screen-change", sync);
    };
  }, []);

  useEffect(() => {
    if (!joseonScreens.has(currentScreen)) {
      setOpen(false);
      setActiveSkill(null);
    }
  }, [currentScreen]);

  const hasHopae = evidence.includes("호패 조각") || evidence.includes("끊어진 호패끈");
  const hasLedger = evidence.includes("하인 장부") || evidence.includes("빈 호패 주머니");
  const registryReady = registrySlots.hopae && registrySlots.ledger;
  const searchObject = useMemo(() => {
    if (searchStep === "sealed" || searchStep === "ordered") return joseonSatoSkillAssets.searchWarrant.states[0];
    if (searchStep === "unsealed") return joseonSatoSkillAssets.searchWarrant.states[1];
    return joseonSatoSkillAssets.searchWarrant.states[2];
  }, [searchStep]);

  if (!joseonScreens.has(currentScreen)) return null;

  function persist(next: { searchComplete?: boolean; registryComplete?: boolean }) {
    const merged = { ...saved, ...next };
    setSaved(merged);
    window.localStorage.setItem(skillStateKey, JSON.stringify(merged));
  }

  function openSkill(skill: Exclude<SkillId, null>) {
    setEvidence(readStoredEvidence());
    setActiveSkill(skill);
    setOpen(false);
    if (skill === "search") setSearchStep(saved.searchComplete ? "open" : "sealed");
    if (skill === "registry" && saved.registryComplete) setRegistrySlots({ hopae: true, ledger: true });
  }

  function placeRegistry(slot: RegistrySlot) {
    if (slot === "hopae" && !hasHopae) return;
    if (slot === "ledger" && !hasLedger) return;
    setRegistrySlots((current) => ({ ...current, [slot]: true }));
  }

  function handleDrop(event: DragEvent, slot: RegistrySlot) {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/x-samunmong-evidence") as RegistrySlot;
    if (type === slot) placeRegistry(slot);
  }

  return (
    <div className="sato-skill-system">
      <button className={`sato-skill-toggle${open ? " active" : ""}`} type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <img src={joseonSatoCommandLauncher} alt="" />
        <span className="sato-skill-tooltip">사또의 수사 명령</span>
      </button>

      {open ? (
        <aside className="sato-skill-drawer" aria-label="사또 전용 기술">
          <header>
            <img src={joseonAjeonAssets.portraits.listening} alt="명령을 기다리는 아전" />
            <div><small>아전 보고</small><strong>명을 내려 주십시오, 사또님.</strong></div>
          </header>
          <button type="button" onClick={() => openSkill("search")}>
            <img src={saved.searchComplete ? joseonSatoSkillTokens.completed : joseonSatoSkillTokens.searchBasic} alt="" />
            <span><strong>압수수색패</strong><small>{saved.searchComplete ? "집행 완료" : "봉인된 상자와 방을 조사"}</small></span>
          </button>
          <button type="button" onClick={() => openSkill("registry")}>
            <img src={saved.registryComplete ? joseonSatoSkillTokens.completed : joseonSatoSkillTokens.registryBasic} alt="" />
            <span><strong>호적조회령</strong><small>{saved.registryComplete ? "대조 완료" : "호패와 관아 장부를 대조"}</small></span>
          </button>
          <div className="sato-skill-locked">
            <img src={joseonSatoSkillTokens.sealBasic} alt="" />
            <span><strong>관인 확정</strong><small>범인 지목에서 사용</small></span>
          </div>
        </aside>
      ) : null}

      {activeSkill ? <button className="sato-modal-backdrop" type="button" aria-label="기술 화면 닫기" onClick={() => setActiveSkill(null)} /> : null}

      {activeSkill === "search" ? (
        <section className="sato-ritual-modal search-ritual" role="dialog" aria-modal="true" aria-labelledby="searchRitualTitle">
          <button className="sato-modal-close" type="button" onClick={() => setActiveSkill(null)}>×</button>
          <div className="sato-ritual-heading">
            <img src={searchStep === "open" ? joseonAjeonAssets.portraits.confirmed : joseonAjeonAssets.portraits.officialReport} alt="보고하는 아전" />
            <div><small>사또의 권한 · 압수수색패</small><h2 id="searchRitualTitle">봉인된 물건을 공식 조사한다</h2><p>{searchStep === "sealed" ? "명령패를 내려 봉인을 해제하십시오." : searchStep === "ordered" ? "아전이 명을 받들어 봉인을 살피고 있습니다." : searchStep === "unsealed" ? "봉인이 풀렸습니다. 상자를 여십시오." : "숨겨진 증거 보관칸을 확인했습니다."}</p></div>
          </div>
          <div className="search-ritual-stage">
            <img className="search-target-object" src={searchObject} alt="봉인된 증거 상자" />
            {searchStep === "ordered" ? <img className="status-overlay" src={joseonCommandStatusAssets.sealRemoving} alt="봉인 해제 중" /> : null}
            {searchStep === "open" ? <img className="search-hidden-tray" src={joseonSatoSkillAssets.searchWarrant.states[3]} alt="발견된 숨은 칸" /> : null}
          </div>
          <div className="ritual-actions">
            {searchStep === "sealed" ? <button type="button" onClick={() => { setSearchStep("ordered"); window.setTimeout(() => setSearchStep("unsealed"), 850); }}><img src={joseonSatoSkillAssets.searchWarrant.commandPlaque} alt="" />압수수색패를 내린다</button> : null}
            {searchStep === "unsealed" ? <button type="button" onClick={() => { setSearchStep("open"); persist({ searchComplete: true }); }}><img src={joseonInteractionFeedbackAssets.slotValid} alt="" />상자를 연다</button> : null}
            {searchStep === "open" ? <button type="button" onClick={() => setActiveSkill(null)}>조사를 마친다</button> : null}
          </div>
        </section>
      ) : null}

      {activeSkill === "registry" ? (
        <section className="sato-ritual-modal registry-ritual" role="dialog" aria-modal="true" aria-labelledby="registryRitualTitle">
          <img className="registry-workbench-bg" src={joseonSatoSkillAssets.registryLookup.workbench} alt="" />
          <button className="sato-modal-close" type="button" onClick={() => setActiveSkill(null)}>×</button>
          <div className="registry-heading"><small>사또의 권한 · 호적조회령</small><h2 id="registryRitualTitle">관아 기록과 대조</h2><p>증거를 끌어 양쪽 자리에 놓으십시오.</p></div>
          <div className="registry-source-list">
            <button draggable={hasHopae} disabled={!hasHopae} onDragStart={(event) => event.dataTransfer.setData("application/x-samunmong-evidence", "hopae")} onClick={() => placeRegistry("hopae")}>
              <img src={joseonSatoSkillAssets.registryLookup.objects[2]} alt="" /><span>{hasHopae ? "호패 관련 증거" : "호패 증거가 필요함"}</span>
            </button>
            <button draggable={hasLedger} disabled={!hasLedger} onDragStart={(event) => event.dataTransfer.setData("application/x-samunmong-evidence", "ledger")} onClick={() => placeRegistry("ledger")}>
              <img src={joseonSatoSkillAssets.registryLookup.objects[3]} alt="" /><span>{hasLedger ? "하인 장부" : "장부 증거가 필요함"}</span>
            </button>
          </div>
          <div className="registry-drop-zones">
            {(["hopae", "ledger"] as const).map((slot) => (
              <button key={slot} className={registrySlots[slot] ? "filled" : ""} type="button" onClick={() => placeRegistry(slot)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(event, slot)}>
                <img className="slot-frame" src={registrySlots[slot] ? joseonInteractionFeedbackAssets.slotLocked : joseonInteractionFeedbackAssets.slotEmpty} alt="" />
                {registrySlots[slot] ? <img className="slot-evidence" src={slot === "hopae" ? joseonSatoSkillAssets.registryLookup.objects[2] : joseonSatoSkillAssets.registryLookup.objects[3]} alt="" /> : <span>{slot === "hopae" ? "호패 탁본" : "관아 장부"}</span>}
              </button>
            ))}
          </div>
          {registryReady ? (
            <div className="registry-result">
              <img src={joseonSatoSkillAssets.registryLookup.objects[6]} alt="기록 일치" />
              <strong>두 기록의 봉인과 기재 위치가 맞물립니다.</strong>
              <button type="button" onClick={() => { persist({ registryComplete: true }); setActiveSkill(null); }}>조회 결과를 기록한다</button>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
