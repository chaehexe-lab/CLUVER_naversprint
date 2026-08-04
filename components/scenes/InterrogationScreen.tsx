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
  { screen: "fieldOne", text: "유문석 집 앞", x: "29%", y: "24%", rot: "-4deg" },
  { screen: "chunwolRoom", text: "춘월의 방", x: "67%", y: "17%", rot: "4deg" },
  { screen: "mudeokServantRoom", text: "무덕의 하인방", x: "63%", y: "36%", rot: "-4deg" },
  { screen: "yoomunseokSarangbang", text: "유문석 사랑방", x: "50%", y: "25%", rot: "4deg" },
  { screen: "dolsoeQuarters", text: "돌쇠 처소", x: "24%", y: "60%", rot: "-6deg" },
  { screen: "backGateCourtyard", text: "뒷문 마당", x: "48%", y: "78%", rot: "3deg" },
  { screen: "interrogationScreen", text: "취조실", x: "73%", y: "70%", rot: "-3deg" }
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

export default function InterrogationScreen({ initialTheme }: { initialTheme?: "magicSchool" }) {
  const isMagicTheme = initialTheme === "magicSchool";
  const initialPlate = isMagicTheme
    ? "/samunmong/assets/magic-school/interrogation/office-empty.png"
    : "/samunmong/assets/main-screen-v2.png";
  const initialSuspect = isMagicTheme ? "gandalf" : "";
  const initialSprite = isMagicTheme ? "/samunmong/assets/magic-school/interrogation/gandalf-sprite.png" : "";
  const initialName = isMagicTheme ? "건달프" : "";

  return (
    <>
      <section className="screen use-text-ui" id="interrogationScreen">
        <img
          className="plate"
          id="interrogationPlate"
          src={initialPlate}
          alt="취조실"
        />
        <div className="shade" />

        <div className="suspect-stage" id="suspectStage" data-suspect={initialSuspect} aria-hidden="true">
          <img
            className="suspect-sprite"
            id="suspectSprite"
            src={initialSprite}
            alt=""
          />
        </div>
        <div className="interrogation-desk-foreground" aria-hidden="true" />

        <div className="hud suspect-name" id="suspectName">
          {initialName}
        </div>
        <div className="suspect-switch">
          <button className="arrow" type="button" id="prevSuspect">
            ←
          </button>
          <button className="arrow" type="button" id="nextSuspect">
            →
          </button>
        </div>

        <nav className="hud scene-dock interrogation-tools" aria-label="취조실 도구">
          <button className="scene-chip map-chip" id="openMapFromInterrogation" type="button" aria-label="마을 지도 열기">
            <img src="/samunmong/assets/labels/transparent/tool-village-map.png" alt="" />
            <span className="sr-only">마을 지도</span>
          </button>
          <button className="scene-chip note-chip" id="openNoteProp" type="button" aria-label="기록장 보기">
            <img src="/samunmong/assets/labels/transparent/tool-note-short.png" alt="" />
            <span className="sr-only">기록장</span>
          </button>
          <button className="scene-chip journal-chip" data-go="briefingScreen" type="button" aria-label="사건 일지 다시 보기">
            <img src="/samunmong/assets/ui-generated/tool-case-journal.png" alt="" />
            <span className="sr-only">사건 일지</span>
          </button>
          <button
            className="scene-chip bag-chip"
            id="toggleEvidenceBag"
            type="button"
            aria-expanded="false"
            aria-label="보따리 열기"
          >
            <img src="/samunmong/assets/labels/transparent/tool-bag-short.png" alt="" />
            <span className="sr-only">보따리</span>
          </button>
          <button className="scene-chip tool-chip open-tool-panel" type="button" aria-label="수사 도구 열기">
            <img src="/samunmong/assets/labels/transparent/tool-investigation-tools.png" alt="" />
            <span className="sr-only">도구</span>
          </button>
          <button className="tool-prop hint-prop" id="interrogationHint" type="button" aria-label="심문 힌트">
            <img src="/samunmong/assets/ui-generated/tool-hint.png" alt="" />
            <span className="sr-only">힌트</span>
          </button>
          <AccuseSuspect>
            <button className="tool-prop accuse-prop" id="accuseButton" type="button" aria-label="범인 지목">
              <img src="/samunmong/assets/labels/transparent/tool-accuse-short.png" alt="" />
              <span className="sr-only">지목</span>
            </button>
          </AccuseSuspect>
        </nav>

        <section className="hud inquiry-bar">
          <div className="prompt-lines" aria-label="추천 질문">
            {promptLines.map((line) => (
              <button className="prompt-line" type="button" key={line}>
                {line}
              </button>
            ))}
          </div>
          <div className="question-box">
            <div className="question-meta">
              <span className="presented-mini">
                제시할 증거: <strong id="presentedEvidence">없음</strong>
              </span>
              <span className="question-limit-mini" id="questionLimitStatus" aria-live="polite">
                남은 질문: 50회
              </span>
            </div>
            <input id="questionInput" type="text" placeholder="용의자에게 질문을 입력하세요. 필요하면 증거를 함께 제시할 수 있습니다." />
            <button className="ask" id="askButton" type="button">
              질문
            </button>
          </div>
        </section>

        <div className="hud suspect-reply" id="suspectReply" aria-live="polite" hidden>
          <button className="suspect-reply-close" id="closeSuspectReply" type="button" aria-label="답변 닫기">
            ×
          </button>
          <span id="aiModeBadge">AI 대기</span>
          <p id="suspectReplyText">질문을 보내면 용의자가 답합니다.</p>
        </div>

        <div className="overlay" id="overlay" />

        {/* 사이드 서랍형 기록장 패널 */}
        <InvestigationNote>
          <aside className="note-drawer investigation-note-panel conversation-note" id="noteDrawer" aria-hidden="true">
            <button className="close-button note-close" id="closeNote" type="button" aria-label="기록장 닫기">
              ×
            </button>
            <p className="note-kicker">대화 기록</p>
            <h2>기록장</h2>
            <p className="note-lead">등장인물별로 나눈 질문과 답변을 대화처럼 확인합니다.</p>
            <div className="note-suspect-tabs" data-note-tabs aria-label="기록할 등장인물 선택">
              <button className="note-suspect-tab active" type="button" data-suspect-id="dolsoe">돌쇠</button>
              <button className="note-suspect-tab" type="button" data-suspect-id="chunwol">최춘월</button>
              <button className="note-suspect-tab" type="button" data-suspect-id="yoomunseok">유문석</button>
              <button className="note-suspect-tab" type="button" data-suspect-id="mudeok">무덕</button>
            </div>
            <p className="note-conversation-meta">
              현재 기록: <span className="note-current-suspect" id="noteSuspect">돌쇠</span>
            </p>
            <div className="conversation-log" id="interrogationSummary" data-note-log aria-live="polite">
              <p className="conversation-empty">아직 이 인물과 나눈 대화가 없습니다.</p>
            </div>
          </aside>
        </InvestigationNote>
      </section>

      <div className="hud tool-status" id="toolStatus">
        분석 대상: <span>없음</span>
      </div>

      <aside className="hud inspect-pop" id="genericEvidenceInspect" aria-live="polite">
        <button className="inspect-close" id="closeGenericEvidenceInspect" type="button" aria-label="단서 팝업 닫기">
          ×
        </button>
        <img id="genericEvidenceImage" src="/samunmong/assets/evidence-wooden-tag.png" alt="" />
        <div>
          <strong id="genericEvidenceTitle">단서 발견</strong>
          <p id="genericEvidenceText">단서를 확인했습니다.</p>
        </div>
      </aside>

      <div className="global-overlay" id="globalOverlay" />

      {/* 현장과 취조실이 함께 사용하는 보따리 팝업 */}
      <EvidenceInventory>
        <aside className="hud evidence-bag-pop" id="evidenceBagPop" aria-hidden="true">
          <div className="dimensional-pouch-aura" aria-hidden="true">
            <span className="pouch-ring pouch-ring-outer" />
            <span className="pouch-ring pouch-ring-middle" />
            <span className="pouch-ring pouch-ring-core" />
          </div>
          <div className="bag-pop-head">
            <strong>보따리</strong>
            <button className="close-button mini-close" id="closeEvidenceBag" type="button" aria-label="보따리 닫기">
              ×
            </button>
          </div>
          <div className="evidence-location-tabs" id="evidenceLocationTabs" aria-label="증거 장소 선택" />
          <div className="evidence-list evidence-grid" id="evidenceList">
            <div className="evidence-empty" id="emptyInterrogationEvidence">
              보따리에 담긴 증거가 없습니다.
            </div>
          </div>
        </aside>
      </EvidenceInventory>

      <aside className="global-panel tool-panel" id="toolPanel" aria-hidden="true">
        <div className="arcane-panel-aura" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="global-panel-head">
          <div>
            <p className="tool-panel-kicker">증거 분석</p>
            <h2>수사 도구</h2>
          </div>
          <button className="close-button global-close" type="button" aria-label="수사 도구 닫기">
            닫기
          </button>
        </div>
        <p>도구를 먼저 고른 뒤 증거를 선택하면 추가 단서를 확인할 수 있습니다.</p>
        <div className="tool-workbench">
          <div className="tool-evidence-list" id="toolEvidenceList">
            <div className="evidence-empty">아직 분석할 증거가 없습니다.</div>
          </div>
          <section className="tool-preview" aria-live="polite">
            <div className="tool-preview-image">
              <img id="toolPreviewImage" src="/samunmong/assets/evidence-wooden-tag.png" alt="" draggable={false} />
            </div>
            <div className="tool-preview-copy">
              <span className="tool-panel-kicker">선택한 증거</span>
              <h3 id="toolPreviewTitle">증거를 선택하세요</h3>
              <p id="toolPreviewNote">왼쪽 목록에서 분석할 증거를 고르면 이곳에 크게 표시됩니다.</p>
              <div className="analysis-target">
                분석 대상: <strong id="analysisTarget">선택 안 됨</strong>
              </div>
            </div>
          </section>
        </div>
        <div className="tool-grid" id="toolGrid" />
      </aside>

      <aside className="global-panel tool-result-panel" id="toolResultPopup" aria-hidden="true" aria-live="polite">
        <div className="arcane-result-sigil" aria-hidden="true" />
        <p className="tool-panel-kicker" id="toolResultKicker">도구 분석</p>
        <h2 id="toolResultTitle">증거 분석 결과</h2>
        <p id="toolResultText">새로운 정보가 드러났습니다.</p>
        <button className="button primary" id="closeToolResult" type="button">
          확인
        </button>
      </aside>

      <InvestigationNote>
        <aside className="global-panel investigation-note-panel conversation-note" id="fieldNotePanel" aria-hidden="true">
          <div className="global-panel-head">
            <div>
              <p className="note-kicker">대화 기록</p>
              <h2>기록장</h2>
            </div>
            <button className="close-button note-close global-close" type="button" aria-label="기록장 닫기">
              ×
            </button>
          </div>
          <p className="note-lead">등장인물별로 나눈 질문과 답변을 대화처럼 확인합니다.</p>
          <div className="note-suspect-tabs" data-note-tabs aria-label="기록할 등장인물 선택">
            <button className="note-suspect-tab active" type="button" data-suspect-id="dolsoe">돌쇠</button>
            <button className="note-suspect-tab" type="button" data-suspect-id="chunwol">최춘월</button>
            <button className="note-suspect-tab" type="button" data-suspect-id="yoomunseok">유문석</button>
            <button className="note-suspect-tab" type="button" data-suspect-id="mudeok">무덕</button>
          </div>
          <p className="note-conversation-meta">
            현재 기록: <span className="note-current-suspect">돌쇠</span>
          </p>
          <div className="conversation-log" data-note-log aria-live="polite">
            <p className="conversation-empty">아직 이 인물과 나눈 대화가 없습니다.</p>
          </div>
        </aside>
      </InvestigationNote>

      <aside className="global-panel map-panel" id="mapPanel" aria-hidden="true">
        <button className="close-button global-close map-floating-close" type="button" aria-label="마을 지도 닫기">
          닫기
        </button>
        <div className="map-board">
          <img src="/samunmong/assets/joseon-village-map-seven-locations-v2.png" alt="조사 장소가 붉은 인장으로 표시된 조선시대 수사 지도" />
          {mapLabels.map((label) => (
            <span className="map-label" data-location-screen={label.screen} style={mapPositionStyle(label)} key={label.text}>
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
