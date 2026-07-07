import AccuseSuspect from "@/components/AccuseSuspect";
import EvidenceInventory from "@/components/EvidenceInventory";
import InvestigationNote from "@/components/InvestigationNote";
import type { CSSProperties } from "react";

type PinStyle = CSSProperties & {
  "--x": string;
  "--y": string;
  "--w"?: string;
  "--h"?: string;
  "--rot"?: string;
};

const promptLines = [
  "이 증거를 본 적 있나?",
  "사건 직전 어디에 있었지?",
  "이 물건이 왜 여기 있지?",
  "숨긴 말이 더 있나?"
] as const;

const mapLabels = [
  { text: "유문석 집 앞", x: "29%", y: "24%", rot: "-4deg" },
  { text: "춘월의 방", x: "67%", y: "17%", rot: "4deg" },
  { text: "무덕의 하인방", x: "63%", y: "36%", rot: "-4deg" },
  { text: "유문석 사랑방", x: "50%", y: "25%", rot: "4deg" },
  { text: "돌쇠 처소", x: "24%", y: "60%", rot: "-6deg" },
  { text: "뒷문 마당", x: "48%", y: "78%", rot: "3deg" },
  { text: "취조실", x: "73%", y: "70%", rot: "-3deg" }
] as const;

const mapPins = [
  { goTo: "fieldOne", label: "유문석 집 앞 현장으로 이동", x: "29%", y: "32%" },
  { goTo: "chunwolRoom", label: "춘월의 방으로 이동", x: "67%", y: "25%" },
  { goTo: "mudeokServantRoom", label: "무덕의 하인방으로 이동", x: "63%", y: "44%" },
  { goTo: "yoomunseokSarangbang", label: "유문석 사랑방으로 이동", x: "50%", y: "33%" },
  { goTo: "dolsoeQuarters", label: "돌쇠 처소로 이동", x: "24%", y: "68%" },
  { goTo: "backGateCourtyard", label: "뒷문 마당으로 이동", x: "48%", y: "86%" },
  { goTo: "interrogationScreen", label: "취조실로 이동", x: "73%", y: "78%" }
] as const;

function mapPositionStyle(item: { x: string; y: string; rot?: string }): PinStyle {
  return {
    "--x": item.x,
    "--y": item.y,
    "--rot": item.rot
  };
}

function mapPinStyle(item: { x: string; y: string }): PinStyle {
  return {
    "--x": item.x,
    "--y": item.y,
    "--w": "8%",
    "--h": "11%"
  };
}

export default function InterrogationScreen() {
  return (
    <>
      <section className="screen use-text-ui" id="interrogationScreen">
        <img
          className="plate"
          id="interrogationPlate"
          src="/samunmong/assets/scene-interrogation-dolsoe.png?v=scene-20260707"
          alt="붉은 빛이 깔린 조선시대 취조실"
        />
        <div className="shade" />

        <div className="suspect-stage" id="suspectStage" data-suspect="dolsoe" aria-hidden="true">
          <img
            className="suspect-sprite"
            id="suspectSprite"
            src="/samunmong/assets/suspects/dolsoe-seated.png?v=uniform-20260706"
            alt=""
          />
        </div>

        <div className="hud suspect-name" id="suspectName">
          돌쇠
        </div>
        <div className="suspect-switch">
          <button className="arrow" type="button" id="prevSuspect">
            ←
          </button>
          <button className="arrow" type="button" id="nextSuspect">
            →
          </button>
        </div>

        <nav className="interrogation-tools" aria-label="취조실 도구">
          <button className="tool-prop map-prop" id="openMapFromInterrogation" type="button" aria-label="마을지도 열기">
            <img src="/samunmong/assets/labels/transparent/tool-map-short.png" alt="" />
            <span className="sr-only">마을지도</span>
          </button>
          <button className="tool-prop room-prop current-room-prop" type="button" aria-current="page" aria-label="현재 위치: 취조실">
            <img src="/samunmong/assets/labels/transparent/tool-interrogation-room.png" alt="" />
            <span className="sr-only">취조실</span>
          </button>
          <button className="tool-prop note-prop" id="openNoteProp" type="button" aria-label="수사노트 보기">
            <img src="/samunmong/assets/labels/transparent/tool-note-short.png" alt="" />
            <span className="sr-only">노트</span>
          </button>
          <button
            className="tool-prop bag-prop"
            id="toggleEvidenceBag"
            type="button"
            aria-expanded="false"
            aria-label="증거 가방 열기"
          >
            <img src="/samunmong/assets/labels/transparent/tool-bag-short.png" alt="" />
            <span className="sr-only">가방</span>
          </button>
          <button className="tool-prop hint-prop" id="interrogationHint" type="button" aria-label="심문 힌트">
            힌트
          </button>
          <AccuseSuspect>
          <button className="tool-prop accuse-prop" id="accuseButton" type="button" aria-label="범인 지목">
            <img src="/samunmong/assets/labels/transparent/tool-accuse-short.png" alt="" />
            <span className="sr-only">지목</span>
          </button>
          </AccuseSuspect>
        </nav>
        <EvidenceInventory>

        <aside className="hud evidence-bag-pop" id="evidenceBagPop" aria-hidden="true">
          <div className="bag-pop-head">
            <strong>증거 가방</strong>
            <button className="mini-close" id="closeEvidenceBag" type="button" aria-label="증거 가방 닫기">
              ×
            </button>
          </div>
          <div className="evidence-list evidence-grid" id="evidenceList">
            <div className="evidence-empty" id="emptyInterrogationEvidence">
              현장에서 수집한 증거가 없습니다.
            </div>
          </div>
        </aside>
        </EvidenceInventory>

        <section className="hud inquiry-bar">
          <div className="prompt-lines" aria-label="추천 질문">
            {promptLines.map((line) => (
              <button className="prompt-line" type="button" key={line}>
                {line}
              </button>
            ))}
          </div>
          <div className="question-box">
            <span className="presented-mini">
              증거: <strong id="presentedEvidence">아직 없음</strong>
            </span>
            <input id="questionInput" type="text" placeholder="자유롭게 심문 내용을 입력하세요" />
            <button className="ask" id="askButton" type="button">
              질문
            </button>
          </div>
        </section>

        <div className="hud suspect-reply" id="suspectReply" aria-live="polite" hidden>
          <span id="aiModeBadge">AI 대기</span>
          <p id="suspectReplyText">질문을 보내면 용의자가 답합니다.</p>
        </div>

        <div className="overlay" id="overlay" />
        <InvestigationNote>
        <aside className="note-drawer" id="noteDrawer" aria-hidden="true">
          <button className="button primary" id="closeNote" type="button">
            닫기
          </button>
          <h2>수사노트</h2>
          <p>심문 중 확인한 내용과 증거를 정리합니다.</p>
          <div className="note-section">
            <h3>현재 사건</h3>
            <ul>
              <li>사건명: 조선시대 살인사건</li>
              <li>목표: 점순이 쓰러진 이유와 호패 조각의 주인 확인</li>
              <li>
                현재 심문 대상: <span id="noteSuspect">돌쇠</span>
              </li>
            </ul>
          </div>
          <div className="note-section">
            <h3>수집한 증거</h3>
            <ul id="collectedEvidenceNote">
              <li id="emptyEvidenceNote">아직 수집한 증거가 없습니다.</li>
            </ul>
          </div>
          <div className="note-section">
            <h3>심문 요약</h3>
            <ul id="interrogationSummary">
              <li id="emptyInterrogationSummary">아직 기록한 심문 내용이 없습니다.</li>
            </ul>
          </div>
        </aside>
        </InvestigationNote>
      </section>

      <div className="hud tool-status" id="toolStatus">
        분석 대상: <span>없음</span>
      </div>

      <aside className="hud inspect-pop" id="genericEvidenceInspect" aria-live="polite">
        <img id="genericEvidenceImage" src="/samunmong/assets/evidence-wooden-tag.png" alt="" />
        <div>
          <strong id="genericEvidenceTitle">단서 발견</strong>
          <p id="genericEvidenceText">단서를 확인했습니다.</p>
        </div>
        <button className="button primary" id="collectGenericEvidence" type="button">
          도구로 분석
        </button>
      </aside>

      <div className="global-overlay" id="globalOverlay" />
      <aside className="global-panel bag-panel" id="bagPanel" aria-hidden="true">
        <div className="global-panel-head">
          <h2>수사 가방</h2>
          <button className="button primary global-close" type="button">
            닫기
          </button>
        </div>
        <p>현장에서 발견한 증거가 이곳에 보관됩니다. 취조실에서는 증거를 꺼내 용의자에게 제시할 수 있습니다.</p>
        <div className="bag-panel-grid" id="bagPanelList">
          <div className="bag-item empty">아직 새로 수집한 증거가 없습니다.</div>
        </div>
        <div className="analysis-target">
          분석할 증거: <strong id="analysisTarget">선택 안 됨</strong>
        </div>
        <p>수집한 증거를 가방에서 선택하고 도구를 사용해 추가 분석합니다.</p>
        <div className="tool-grid" id="toolGrid" />
      </aside>
      <InvestigationNote>

      <aside className="global-panel" id="fieldNotePanel" aria-hidden="true">
        <div className="global-panel-head">
          <h2>수사노트</h2>
          <button className="button primary global-close" type="button">
            닫기
          </button>
        </div>
        <p>현장에서 확인한 단서와 사실 지점을 정리합니다.</p>
        <ul id="fieldNoteList">
          <li id="emptyFieldNote">아직 기록한 단서가 없습니다.</li>
        </ul>
      </aside>
      </InvestigationNote>

      <aside className="global-panel map-panel" id="mapPanel" aria-hidden="true">
        <button className="button primary global-close map-floating-close" type="button">
          닫기
        </button>
        <div className="map-board">
          <img src="/samunmong/assets/joseon-village-map-seven-locations-v2.png" alt="조사 장소가 붉은 인장으로 표시된 조선시대 수사 지도" />
          {mapLabels.map((label) => (
            <span className="map-label" style={mapPositionStyle(label)} key={label.text}>
              {label.text}
            </span>
          ))}
          {mapPins.map((pin) => (
            <button
              className="map-pin-button"
              type="button"
              data-map-go={pin.goTo}
              style={mapPinStyle(pin)}
              aria-label={pin.label}
              key={pin.goTo}
            />
          ))}
        </div>
      </aside>

      <div className="toast" id="toast" role="status" aria-live="polite" />
      <div className="fade" id="fade">
        이동 중...
      </div>
    </>
  );
}
