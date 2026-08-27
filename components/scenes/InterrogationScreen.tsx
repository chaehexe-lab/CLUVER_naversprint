"use client";

import AccuseSuspect from "@/components/AccuseSuspect";
import EvidenceInventory from "@/components/EvidenceInventory";
import InvestigationNote from "@/components/InvestigationNote";
import InterrogationCharacter2D from "@/components/effects/InterrogationCharacter2D";
import type { GameTheme } from "@/lib/gameTheme";
import { spaceStationInterrogationCopy, spaceStationMap, spaceStationTheme } from "@/lib/spaceStationTheme";
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

type MapLocation = {
  screen: string;
  goTo?: string;
  text: string;
  label: string;
  x: string;
  y: string;
  labelY?: string;
  rot?: string;
};

const THEME_MAPS: Record<GameTheme, { image: string; alt: string; locations: MapLocation[] }> = {
  joseon: {
    image: "/samunmong/assets/joseon-village-map-seven-locations-v2.webp",
    alt: "조사 장소가 붉은 인장으로 표시된 조선시대 수사 지도",
    locations: [
      { screen: "fieldOne", goTo: "fieldOne", text: "유문석 집 앞", label: "유문석 집 앞 현장으로 이동", x: "29%", y: "32%", labelY: "24%", rot: "-4deg" },
      { screen: "chunwolRoom", goTo: "chunwolRoom", text: "춘월의 방", label: "춘월의 방으로 이동", x: "67%", y: "25%", labelY: "17%", rot: "4deg" },
      { screen: "mudeokServantRoom", goTo: "mudeokServantRoom", text: "무덕의 하인방", label: "무덕의 하인방으로 이동", x: "63%", y: "44%", labelY: "36%", rot: "-4deg" },
      { screen: "yoomunseokSarangbang", goTo: "yoomunseokSarangbang", text: "유문석 사랑방", label: "유문석 사랑방으로 이동", x: "50%", y: "33%", labelY: "25%", rot: "4deg" },
      { screen: "dolsoeQuarters", goTo: "dolsoeQuarters", text: "돌쇠 처소", label: "돌쇠 처소로 이동", x: "24%", y: "68%", labelY: "60%", rot: "-6deg" },
      { screen: "backGateCourtyard", goTo: "backGateCourtyard", text: "뒷문 마당", label: "뒷문 마당으로 이동", x: "48%", y: "86%", labelY: "78%", rot: "3deg" },
      { screen: "interrogationScreen", goTo: "interrogationScreen", text: "취조실", label: "취조실로 이동", x: "73%", y: "78%", labelY: "70%", rot: "-3deg" }
    ]
  },
  magicSchool: {
    image: "/samunmong/assets/magic-school/ui/school-map.webp",
    alt: "마법학교 조사 장소가 표시된 학교 지도",
    locations: [
      { screen: "magicAlchemyLab", goTo: "magicAlchemyLab", text: "제1 연금술 실습실", label: "제1 연금술 실습실로 이동", x: "23.4%", y: "27.6%", labelY: "15.6%" },
      { screen: "magicCleaningCloset", goTo: "magicCleaningCloset", text: "청소도구함", label: "청소도구함으로 이동", x: "44%", y: "27.2%", labelY: "15.2%" },
      { screen: "magicLibrary", goTo: "magicLibrary", text: "도서관", label: "도서관으로 이동", x: "65.7%", y: "23.8%", labelY: "11.8%" },
      { screen: "magicRecordCrystalRoom", goTo: "magicRecordCrystalRoom", text: "기록 수정구실", label: "기록 수정구실로 이동", x: "78.4%", y: "47.4%", labelY: "35.4%" },
      { screen: "magicDormHallway", goTo: "magicDormHallway", text: "학생들 기숙사", label: "학생들 기숙사로 이동", x: "27.3%", y: "61%", labelY: "49%" },
      { screen: "interrogationScreen", goTo: "interrogationScreen", text: "교무 조사실", label: "교무 조사실로 이동", x: "70.3%", y: "73.6%", labelY: "61.6%" }
    ]
  },
  spaceStation: spaceStationMap
};

const THEME_INTERROGATION_COPY: Record<GameTheme, {
  map: string;
  note: string;
  noteKicker: string;
  noteLead: string;
  journal: string;
  bag: string;
  tools: string;
  toolKicker: string;
  toolTitle: string;
  suspects: Array<{ id: string; name: string }>;
}> = {
  joseon: {
    map: "마을 지도",
    note: "기록장",
    noteKicker: "대화 기록",
    noteLead: "등장인물별로 나눈 질문과 답변을 대화처럼 확인합니다.",
    journal: "사건 일지",
    bag: "보따리",
    tools: "수사 도구",
    toolKicker: "사또의 감식상",
    toolTitle: "증거 감식",
    suspects: [
      { id: "dolsoe", name: "돌쇠" },
      { id: "chunwol", name: "최춘월" },
      { id: "yoomunseok", name: "유문석" },
      { id: "mudeok", name: "무덕" }
    ]
  },
  magicSchool: {
    map: "학교 지도",
    note: "수사 일지",
    noteKicker: "마법 진술 기록",
    noteLead: "교직원과 학생별 질문과 답변을 수사 일지에서 확인합니다.",
    journal: "사건 기록",
    bag: "마법 가방",
    tools: "마력 도구",
    toolKicker: "마력 감식대",
    toolTitle: "잔류 마력 분석",
    suspects: [
      { id: "malpoi", name: "말포이" },
      { id: "malposam", name: "말포삼" },
      { id: "malpoil", name: "말포일" }
    ]
  },
  spaceStation: spaceStationInterrogationCopy
};

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

export default function InterrogationScreen({ initialTheme }: { initialTheme: GameTheme }) {
  const isMagicTheme = initialTheme === "magicSchool";
  const isSpaceTheme = initialTheme === "spaceStation";
  const themeMap = THEME_MAPS[initialTheme];
  const copy = THEME_INTERROGATION_COPY[initialTheme];
  const initialPlate = isMagicTheme
    ? "/samunmong/assets/magic-school/interrogation/office-empty.webp"
    : isSpaceTheme
      ? spaceStationTheme.assets.room
    : "/samunmong/assets/interactions/interrogation-candle/interrogation-room-common-clean-v2.png";
  const initialSuspect = isSpaceTheme ? "harry" : isMagicTheme ? "malpoi" : "dolsoe";
  const initialSprite = isSpaceTheme ? spaceStationTheme.suspects[0].sprite : isMagicTheme ? "/samunmong/assets/magic-school/interrogation/malpoi-sprite.webp" : "/samunmong/assets/scene-interrogation-dolsoe.webp?v=scene-20260707";
  const initialName = isSpaceTheme ? spaceStationTheme.suspects[0].name : isMagicTheme ? "말포이" : "돌쇠";
  const mapIcon = isSpaceTheme ? spaceStationTheme.assets.mapIcon : isMagicTheme ? "/samunmong/assets/magic-school/ui/icon-school-map.webp" : "/samunmong/assets/labels/transparent/tool-village-map.webp";
  const noteIcon = isSpaceTheme ? spaceStationTheme.assets.conversationIcon : isMagicTheme ? "/samunmong/assets/magic-school/ui/icon-investigation-journal.webp" : "/samunmong/assets/labels/transparent/tool-note-short.webp";
  const briefingIcon = spaceStationTheme.assets.briefingIcon;
  const journalIcon = isSpaceTheme ? "/assets/space-station/ui-icons-v3/final-report.webp" : isMagicTheme ? "/samunmong/assets/magic-school/ui/icon-investigation-journal.webp" : "/samunmong/assets/ui-generated/tool-case-journal.webp";
  const bagIcon = isSpaceTheme ? "/assets/space-station/ui-icons-v3/evidence-vault.webp" : isMagicTheme ? "/samunmong/assets/magic-school/ui/icon-magic-bag.webp" : "/samunmong/assets/labels/transparent/tool-bag-short.webp";
  const toolIcon = isMagicTheme ? "/samunmong/assets/magic-school/ui/icon-mana-tools.webp" : "/samunmong/assets/labels/transparent/tool-investigation-tools.webp";
  const hintIcon = isSpaceTheme ? "/assets/space-station/ui-icons-v3/hint-beacon.webp" : isMagicTheme ? "/samunmong/assets/magic-school/ui/icon-arcane-hint-compass.png" : "/samunmong/assets/ui-generated/tool-hint.webp";
  const accuseIcon = isSpaceTheme ? "/assets/space-station/ui-icons-v3/accuse-target.webp" : isMagicTheme ? "/samunmong/assets/magic-school/ui/icon-final-accuse.webp" : "/samunmong/assets/labels/transparent/tool-accuse-short.webp";
  const bagPanelStyle = isSpaceTheme
    ? ({ backgroundImage: "url('/assets/space-station/panels/evidence-vault-panel-v2.webp')" } satisfies CSSProperties)
    : undefined;
  const toolPanelStyle = undefined;

  const moveFromMap = (screenId?: string) => {
    if (!screenId) return;
    document.querySelector<HTMLElement>("#mapPanel")?.classList.remove("show", "closing");
    document.querySelector<HTMLElement>("#mapPanel")?.setAttribute("aria-hidden", "true");
    document.querySelector<HTMLElement>("#globalOverlay")?.classList.remove("show");
    window.dispatchEvent(new CustomEvent("samunmong:screen-request", {
      cancelable: true,
      detail: { screenId }
    }));
  };

  const switchSuspect = (direction: "previous" | "next") => {
    window.dispatchEvent(new CustomEvent("samunmong:suspect-request", {
      detail: { direction }
    }));
  };

  return (
    <>
      <section className="screen use-text-ui" id="interrogationScreen">
        <img
          className="plate"
          id="interrogationPlate"
          src={initialPlate}
          alt="취조실"
        />
        {!isMagicTheme && !isSpaceTheme ? <InterrogationCharacter2D /> : null}
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

        <div className="new-fact-toast" id="newFactToast" role="status" aria-live="polite" aria-hidden="true">
          <span>수사 노트</span>
          <strong id="newFactTitle">새로운 사실이 기록되었습니다</strong>
        </div>

        <div className="hud suspect-name" id="suspectName">
          {isSpaceTheme ? (
            <>
              <div className="suspect-name-line">
                <span>이름 :</span>
                <strong className="suspect-name-value">{initialName}</strong>
              </div>
              <fieldset className="suspect-auth-card">
                <legend>정거장 개인 인증 ID</legend>
                <strong className="suspect-auth-id">ORBIT-13-DAT-0319</strong>
              </fieldset>
            </>
          ) : initialName}
        </div>
        <div className="suspect-switch">
          <button
            className="arrow"
            type="button"
            id="prevSuspect"
            aria-label="이전 등장인물"
            onClick={() => switchSuspect("previous")}
          >
            ←
          </button>
          <button
            className="arrow"
            type="button"
            id="nextSuspect"
            aria-label="다음 등장인물"
            onClick={() => switchSuspect("next")}
          >
            →
          </button>
        </div>

        <nav className="hud scene-dock interrogation-tools" aria-label="취조실 도구">
          <button className="scene-chip map-chip" id="openMapFromInterrogation" type="button" aria-label={`${copy.map} 열기`}>
            <img src={mapIcon} alt="" />
            <span className="sr-only">{copy.map}</span>
          </button>
          <button className="scene-chip note-chip" id="openNoteProp" type="button" aria-label={`${copy.note} 보기`}>
            <img src={noteIcon} alt="" />
            <span className="sr-only">{copy.note}</span>
          </button>
          {isSpaceTheme ? (
            <button className="scene-chip briefing-chip" data-go="briefingScreen" type="button" aria-label="사건 브리핑 다시 보기">
              <img src={briefingIcon} alt="" draggable={false} />
              <span className="sr-only">사건 브리핑</span>
            </button>
          ) : null}
          {!isSpaceTheme ? (
            <button className="scene-chip journal-chip" data-go="briefingScreen" type="button" aria-label={`${copy.journal} 다시 보기`}>
              <img src={journalIcon} alt="" />
              <span className="sr-only">{copy.journal}</span>
            </button>
          ) : null}
          <button
            className="scene-chip bag-chip"
            id="toggleEvidenceBag"
            type="button"
            aria-expanded="false"
            aria-label={`${copy.bag} 열기`}
          >
            <img src={bagIcon} alt="" />
            <span className="sr-only">{copy.bag}</span>
          </button>
          {isMagicTheme ? (
            <button className="scene-chip tool-chip open-tool-panel" type="button" aria-label={`${copy.tools} 열기`}>
              <img src={toolIcon} alt="" />
              <span className="sr-only">{copy.tools}</span>
            </button>
          ) : null}
          <button className="tool-prop hint-prop" id="interrogationHint" type="button" aria-label="심문 힌트">
            <img src={hintIcon} alt="" />
            <span className="sr-only">힌트</span>
          </button>
          <AccuseSuspect>
            <button className="tool-prop accuse-prop" id="accuseButton" type="button" aria-label="범인 지목">
              <img src={accuseIcon} alt="" />
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
                <img id="presentedEvidenceImage" src="/samunmong/assets/evidence-transparent/evidence-wooden-tag-transparent.webp" alt="" hidden />
                <span>제시할 증거</span>
                <strong id="presentedEvidence">없음</strong>
                <b id="presentedEvidenceRole" hidden>단서</b>
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
          <div className="evidence-response-marker" id="evidenceResponseMarker" hidden>
            <img id="responseEvidenceImage" src="/samunmong/assets/evidence-transparent/evidence-wooden-tag-transparent.webp" alt="" />
            <span><b id="responseEvidenceRole">증거 대면</b><small id="responseEvidenceMeaning">진술과 비교해 보십시오</small></span>
          </div>
        </div>

        <div className="overlay" id="overlay" />

        {/* 사이드 서랍형 기록장 패널 */}
        <InvestigationNote>
          <aside className="note-drawer investigation-note-panel conversation-note" id="noteDrawer" aria-hidden="true">
            <button className="close-button note-close" id="closeNote" type="button" aria-label={`${copy.note} 닫기`}>
              ×
            </button>
            {!isSpaceTheme ? <p className="note-kicker">{copy.noteKicker}</p> : null}
            <h2>{copy.note}</h2>
            <p className="note-lead">{copy.noteLead}</p>
            <div className="note-suspect-tabs" data-note-tabs aria-label="기록할 등장인물 선택">
              {copy.suspects.map((suspect, index) => (
                <button className={`note-suspect-tab${index === 0 ? " active" : ""}`} type="button" data-suspect-id={suspect.id} key={suspect.id}>{suspect.name}</button>
              ))}
            </div>
            {!isSpaceTheme ? (
              <p className="note-conversation-meta">
                현재 기록: <span className="note-current-suspect" id="noteSuspect">{copy.suspects[0].name}</span>
              </p>
            ) : null}
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
        <img id="genericEvidenceImage" src="/samunmong/assets/evidence-transparent/evidence-wooden-tag-transparent.webp" alt="" />
        <div>
          <strong id="genericEvidenceTitle">단서 발견</strong>
          <p id="genericEvidenceText">단서를 확인했습니다.</p>
        </div>
      </aside>

      <div className="global-overlay" id="globalOverlay" />

      {/* 현장과 취조실이 함께 사용하는 보따리 팝업 */}
      <EvidenceInventory>
        <aside className="hud evidence-bag-pop" id="evidenceBagPop" aria-hidden="true" style={bagPanelStyle}>
          {isMagicTheme ? (
            <div className="dimensional-pouch-aura" aria-hidden="true">
              <span className="pouch-ring pouch-ring-outer" />
              <span className="pouch-ring pouch-ring-middle" />
              <span className="pouch-ring pouch-ring-core" />
            </div>
          ) : null}
          <div className="bag-pop-head">
            <strong>{copy.bag}</strong>
            <button className="close-button mini-close" id="closeEvidenceBag" type="button" aria-label={`${copy.bag} 닫기`}>
              ×
            </button>
          </div>
          <div className="evidence-location-tabs" id="evidenceLocationTabs" aria-label="증거 장소 선택" />
          <div className="evidence-list evidence-grid" id="evidenceList">
            <div className="evidence-empty" id="emptyInterrogationEvidence">
              {copy.bag}에 담긴 증거가 없습니다.
            </div>
          </div>
          {!isMagicTheme && !isSpaceTheme ? (
            <section className="evidence-story-preview" id="evidenceStoryPreview" hidden>
              <button className="evidence-story-preview-close" id="closeEvidenceStoryPreview" type="button" aria-label="증거 상세 닫기">×</button>
              <header className="evidence-story-preview-head">
                <span id="evidencePreviewKind">현장 증거</span>
                <strong id="evidencePreviewTitle">증거를 선택하세요</strong>
              </header>
              <div className="evidence-story-path">
                <div className="evidence-story-node evidence-story-object">
                  <img id="evidencePreviewImage" src="/samunmong/assets/evidence-transparent/evidence-wooden-tag-transparent.webp" alt="" />
                  <small>발견한 물건</small><b id="evidencePreviewObject">증거</b>
                </div>
                <i className="evidence-story-arrow" aria-hidden="true">→</i>
                <div className="evidence-story-node"><small>확인된 사실</small><b id="evidencePreviewFact">아직 살펴보지 않았습니다.</b></div>
                <i className="evidence-story-arrow" aria-hidden="true">→</i>
                <div className="evidence-story-node"><small id="evidencePreviewRole">남은 의문</small><b id="evidencePreviewMeaning">무엇과 이어지는 증거일까?</b></div>
              </div>
              <button className="evidence-direct-action" id="evidenceDirectAction" type="button">직접 살펴보기</button>
              <div className="evidence-related-row" id="evidenceRelatedRow" />
              <div className="evidence-connection-result" id="evidenceConnectionResult" hidden>
                <div className="evidence-connection-images"><img id="connectionImageA" alt="" /><span>＋</span><img id="connectionImageB" alt="" /></div>
                <span>자동으로 이어진 실마리</span><strong id="evidenceConnectionText">두 증거가 이어집니다.</strong>
              </div>
              <div className="evidence-people-row" id="evidencePeopleRow" aria-label="관련 인물" />
              <button className="evidence-present-confirm" id="confirmEvidencePresent" type="button">이 증거를 선택하기</button>
            </section>
          ) : null}
        </aside>
      </EvidenceInventory>

      <aside className="global-panel tool-panel" id="toolPanel" aria-hidden="true" style={toolPanelStyle}>
        {isMagicTheme ? (
          <div className="arcane-panel-aura" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        ) : null}
        <div className="global-panel-head">
          <div>
            <p className="tool-panel-kicker">{copy.toolKicker}</p>
            <h2>{copy.toolTitle}</h2>
          </div>
          {!isSpaceTheme && !isMagicTheme ? (
            <p className="tool-panel-guide">알맞은 도구로 증거를 감식해 숨겨진 사실을 밝혀내세요.</p>
          ) : null}
          <button className="close-button global-close" type="button" aria-label={`${copy.tools} 닫기`}>
            닫기
          </button>
        </div>
        {isSpaceTheme || isMagicTheme ? (
          <p>단서 하나와 도구 하나를 골라 증거 위에 놓으세요.</p>
        ) : null}
        {!isSpaceTheme && !isMagicTheme ? (
          <ol className="tool-flow-guide" aria-label="증거 감식 순서">
            <li><b>1</b><span>증거 고르기</span></li>
            <li><b>2</b><span>도구 고르기</span></li>
            <li><b>3</b><span>그림대로 한 번 조작</span></li>
          </ol>
        ) : null}
        <div className="tool-workbench">
          <div className="tool-evidence-list" id="toolEvidenceList">
            <div className="evidence-empty">아직 분석할 증거가 없습니다.</div>
          </div>
          <section className="tool-preview" aria-live="polite">
            <div className="tool-preview-image">
              <img className="tool-workbench-plate" src="/samunmong/assets/interactions/evidence-tools/examination-workbench-v1.webp" alt="" aria-hidden="true" />
              <img id="toolPreviewImage" src="/samunmong/assets/evidence-transparent/evidence-wooden-tag-transparent.webp" alt="" draggable={false} />
              <img id="toolRevealImage" className="tool-reveal-image" src="/samunmong/assets/evidence-transparent/evidence-wooden-tag-transparent.webp" alt="" aria-hidden="true" draggable={false} />
              <div className="tool-reaction-layer" id="toolReactionLayer" aria-hidden="true">
                <img id="toolReactionPrimary" src="/samunmong/assets/interactions/evidence-tools/wood-dust-stroke.png" alt="" />
                <img id="toolReactionSecondary" src="/samunmong/assets/interactions/evidence-tools/fiber-highlight.png" alt="" />
              </div>
              <div className="tool-analysis-progress" id="toolAnalysisProgress" aria-hidden="true">
                <span id="toolAnalysisProgressFill" />
              </div>
              <span className="tool-analysis-stage" id="toolAnalysisStage">조사 준비</span>
              <span className="tool-gesture-guide" id="toolGestureGuide">아래 도구 중 하나를 올려놓으세요</span>
            </div>
            <div className="tool-preview-copy">
              <span className="tool-panel-kicker">지금 살펴볼 증거</span>
              <h3 id="toolPreviewTitle">증거를 선택하세요</h3>
              <p id="toolPreviewNote">왼쪽 목록에서 분석할 증거를 고르면 이곳에 크게 표시됩니다.</p>
              <div className="analysis-target">
                감식 진행: <strong id="analysisTarget">선택 안 됨</strong>
              </div>
              <div className="tool-conclusion" id="toolConclusion" hidden>
                <span className="tool-conclusion-seal" id="toolConclusionRole">동선</span>
                <div><small>눈에 밟히는 흔적</small><strong id="toolConclusionFact">새로운 흔적이 보입니다.</strong></div>
                <i aria-hidden="true">→</i>
                <div><small>남은 의문</small><b id="toolConclusionMeaning">사건과 어떤 관계가 있는 것일까?</b></div>
              </div>
            </div>
          </section>
        </div>
        <div className="tool-grid" id="toolGrid" />
      </aside>

      <aside className="global-panel tool-result-panel" id="toolResultPopup" aria-hidden="true" aria-live="polite">
        {isMagicTheme ? <div className="arcane-result-sigil" aria-hidden="true" /> : null}
        <p className="tool-panel-kicker" id="toolResultKicker">새 단서</p>
        <h2 id="toolResultTitle">증거 분석 결과</h2>
        <p id="toolResultText">새로운 정보가 드러났습니다.</p>
        <div className="evidence-result-story" id="toolResultStory">
          <b id="toolResultStoryRole">단서</b>
          <span id="toolResultStoryBeat">사건과 연결</span>
        </div>
        <div className="evidence-result-context">
          <span id="toolResultLocation">발견 장소</span>
          <div className="evidence-result-people" id="toolResultPeople" aria-label="관련 인물" />
        </div>
        <div className="evidence-acquisition-visual" aria-hidden="true">
          <img className="evidence-acquisition-crest" src="/samunmong/assets/interactions/evidence-acquisition/acquisition-crest-v1.png" alt="" />
          <span className="evidence-source-token">
            <img id="toolResultSourceImage" src="/samunmong/assets/evidence-transparent/evidence-wooden-tag-transparent.webp" alt="" />
          </span>
          <span className="evidence-transform-mark">→</span>
          <img id="toolResultImage" className="evidence-acquisition-object" src="/samunmong/assets/interactions/evidence-tools/expanded/result-evidence-confirmed.png" alt="" width="320" />
          {!isMagicTheme && !isSpaceTheme ? (
            <>
              <img className="evidence-acquisition-seal" src="/samunmong/assets/interactions/sato-skills/official-seal/objects/seal-imprint.png" alt="" />
              <img className="evidence-acquisition-parcel" src="/samunmong/assets/interactions/evidence-collection/sealed-evidence-parcel.webp" alt="" />
            </>
          ) : null}
        </div>
        <div className="evidence-result-actions">
          <button className="button" id="openResultInBag" type="button">{copy.bag}에서 보기</button>
          <button className="button primary" id="closeToolResult" type="button">계속</button>
        </div>
      </aside>

      {!isSpaceTheme && !isMagicTheme ? (
        <aside className="global-panel" id="documentAssemblyPanel" aria-hidden="true" aria-live="polite">
          <div className="global-panel-head">
            <div>
              <p className="tool-panel-kicker">문서 복원</p>
              <h2 id="documentAssemblyTitle">찢어진 조각 맞추기</h2>
            </div>
            <button className="close-button global-close" type="button">그만두기</button>
          </div>
          <p id="documentAssemblyGuide">조각을 끌어 윤곽에 맞추십시오 · 짧게 누르면 회전</p>
          <div className="document-assembly-stage" id="documentAssemblyStage" aria-label="찢어진 문서 조각 맞춤판">
            {[
              ["a", "fragment-a-v2.png"], ["b", "fragment-b-v2.png"], ["c", "fragment-c-v2.png"],
            ].map(([pieceId, fileName]) => (
              <div className="document-target" data-document-target={pieceId} key={`target-${pieceId}`}><img src={`/samunmong/assets/interactions/document-puzzle/drag-pieces/${fileName}`} alt="" /></div>
            ))}
            <img className="document-assembly-board" id="documentAssemblyBoard" src="/samunmong/assets/interactions/document-puzzle/board-empty.webp" alt="문서 맞춤판" />
            {[
              ["a", "fragment-a-v2.png"], ["b", "fragment-b-v2.png"], ["c", "fragment-c-v2.png"],
            ].map(([pieceId, fileName]) => (
              <button className="document-piece" type="button" data-document-piece={pieceId} key={pieceId} aria-label={`문서 조각 ${pieceId.toUpperCase()} 옮기기`}>
                <img src={`/samunmong/assets/interactions/document-puzzle/drag-pieces/${fileName}`} alt={`문서 조각 ${pieceId.toUpperCase()}`} draggable={false} />
              </button>
            ))}
          </div>
        </aside>
      ) : null}

      {!isSpaceTheme && !isMagicTheme ? (
        <>
          <aside className="global-panel tactile-puzzle-panel" id="rubbingPuzzlePanel" aria-hidden="true" aria-live="polite">
            <div className="global-panel-head">
              <div><p className="tool-panel-kicker">장부 검험</p><h2>지워진 출입 기록 압흔 뜨기</h2></div>
              <button className="close-button global-close" type="button">그만두기</button>
            </div>
            <p id="rubbingPuzzleGuide">붉은 손가락 고리가 달린 먹뭉치를 잡아 장부를 덮은 한지 위로 길게 문지르십시오.</p>
            <div className="tactile-puzzle-stage" id="rubbingPuzzleStage">
              <img id="rubbingPuzzleImage" src="/samunmong/assets/interactions/ledger-rubbing-puzzle/state-1-v1.png" alt="지워진 출입 기록 위에 한지를 고정한 장부 탁본 작업판" draggable={false} />
              <span className="rubbing-lane active" data-rubbing-lane="1"><i>→</i></span>
              <span className="rubbing-lane" data-rubbing-lane="2"><i>←</i></span>
              <span className="rubbing-lane" data-rubbing-lane="3"><i>→</i></span>
              <button className="rubbing-charcoal" id="rubbingCharcoal" type="button" aria-label="먹뭉치를 잡아 탁본하기">
                <img src="/samunmong/assets/interactions/hand-tools-generated/joseon-rubbing-pad-v2.png" alt="조선식 탁본 먹뭉치" draggable={false} />
              </button>
            </div>
          </aside>

          <aside className="global-panel tactile-puzzle-panel" id="knotPuzzlePanel" aria-hidden="true" aria-live="polite">
            <div className="global-panel-head">
              <div><p className="tool-panel-kicker">손끝 채증</p><h2>매듭 풀기</h2></div>
              <button className="close-button global-close" type="button">그만두기</button>
            </div>
            <p id="knotPuzzleGuide">느슨한 고리부터 차례로 당기십시오.</p>
            <div className="tactile-puzzle-stage knot-puzzle-stage" id="knotPuzzleStage">
              <img id="knotPuzzleImage" src="/samunmong/assets/interactions/knot-puzzle/state-1.png" alt="옷고름 매듭" draggable={false} />
              <button className="knot-drag-handle knot-center" type="button" data-knot-loop="1" aria-label="가운데 고리 당기기"><span>↓</span></button>
              <button className="knot-drag-handle knot-left" type="button" data-knot-loop="2" aria-label="왼쪽 고리 당기기"><span>←</span></button>
              <button className="knot-drag-handle knot-right" type="button" data-knot-loop="3" aria-label="오른쪽 고리 당기기"><span>→</span></button>
            </div>
          </aside>

          <aside className="global-panel tactile-puzzle-panel" id="footprintPuzzlePanel" aria-hidden="true" aria-live="polite">
            <div className="global-panel-head">
              <div><p className="tool-panel-kicker">흔적 대조</p><h2>짚신 밑창 포개기</h2></div>
              <button className="close-button global-close" type="button">그만두기</button>
            </div>
            <p id="footprintPuzzleGuide">짚신을 흔적 쪽으로 끌어 정확히 포개십시오.</p>
            <div className="tactile-puzzle-stage footprint-match-stage" id="footprintPuzzleStage">
              <img id="footprintPuzzleImage" src="/samunmong/assets/interactions/footprint-puzzle/state-1.png" alt="발자국 대조판" draggable={false} />
              <span className="footprint-drop-target" id="footprintDropTarget" aria-hidden="true" />
              <button className="footprint-shoe-piece" id="footprintShoePiece" type="button" aria-label="짚신 밑창을 끌어 발자국에 포개기">
                <img src="/samunmong/assets/interactions/evidence-reverse/muddy-straw-shoe-sole-v2.png" alt="" draggable={false} />
                <span>짚신 밑창</span>
              </button>
              <span className="footprint-measure-target" id="footprintMeasureTarget" aria-hidden="true">발끝부터 뒤꿈치까지</span>
              <button className="footprint-measure-tool" id="footprintMeasureTool" type="button" aria-label="실측줄을 발자국 길이에 맞춰 놓기">
                <img src="/samunmong/assets/interactions/evidence-tools/expanded/tool-footprint-measuring-cord.png" alt="조선식 발자국 실측줄" draggable={false} />
                <span>실측줄 놓기</span>
              </button>
            </div>
          </aside>

          <aside className="global-panel tactile-puzzle-panel" id="materialPuzzlePanel" aria-hidden="true" aria-live="polite">
            <div className="global-panel-head">
              <div><p className="tool-panel-kicker" id="materialPuzzleKicker">손끝 감식</p><h2 id="materialPuzzleTitle">증거 살피기</h2></div>
              <button className="close-button global-close" type="button">그만두기</button>
            </div>
            <p id="materialPuzzleGuide">흔적을 직접 확인하십시오.</p>
            <div className="tactile-puzzle-stage material-puzzle-stage" id="materialPuzzleStage">
              <img id="materialPuzzleImage" src="/samunmong/assets/interactions/focus-puzzle/state-1.png" alt="증거 감식 작업판" draggable={false} />
              <span className="tactile-hand-guide" id="materialPuzzleGesture">천천히 움직이기</span>
              <div className="material-direct-layer" id="materialDirectLayer" hidden>
                <span className="material-path-target active" data-material-target="1" />
                <span className="material-path-target" data-material-target="2" />
                <span className="material-path-target" data-material-target="3" />
                <button className="material-hand-tool" id="materialHandTool" type="button" aria-label="감식 도구를 잡아 빛나는 지점으로 옮기기">
                  <img id="materialHandToolImage" src="/samunmong/assets/mudeok-interaction/tool-magnifying-glass.webp" alt="조선식 돋보기" draggable={false} />
                  <span className="visually-hidden" id="materialHandToolName">돋보기</span>
                </button>
              </div>
              <div className="sample-touch-points" id="sampleTouchPoints" hidden>
                <span className="sample-drop-zone active" data-sample-target="1">첫 자리</span>
                <span className="sample-drop-zone" data-sample-target="2">둘째 자리</span>
                <span className="sample-drop-zone" data-sample-target="3">판정 자리</span>
                <button type="button" data-sample-point="1" data-label="가" aria-label="첫 번째 표본 끌기">
                  <img data-sample-image alt="" draggable={false} />
                </button>
                <button type="button" data-sample-point="2" data-label="나" aria-label="두 번째 표본 끌기">
                  <img data-sample-image alt="" draggable={false} />
                </button>
                <button type="button" data-sample-point="3" data-label="고정" aria-label="겹치는 지점 끌기">
                  <img data-sample-image alt="" draggable={false} />
                </button>
              </div>
            </div>
          </aside>

          <aside className="global-panel tactile-puzzle-panel" id="specialEvidencePuzzlePanel" aria-hidden="true" aria-live="polite">
            <div className="global-panel-head">
              <div><p className="tool-panel-kicker" id="specialPuzzleKicker">증거 복원</p><h2 id="specialPuzzleTitle">흔적 연결하기</h2></div>
              <button className="close-button global-close" type="button">그만두기</button>
            </div>
            <p id="specialPuzzleGuide">조각을 순서대로 연결하십시오.</p>
            <div className="tactile-puzzle-stage special-puzzle-stage" id="specialPuzzleStage">
              <img id="specialPuzzleImage" src="/samunmong/assets/interactions/red-thread-puzzle/state-1.png" alt="증거 연결 작업판" draggable={false} />
              <span className="tactile-hand-guide" id="specialPuzzleGesture">핀 연결하기</span>
              <div className="sample-touch-points special-touch-points" id="specialTouchPoints">
                <button type="button" data-special-point="1" aria-label="첫 번째 연결점" />
                <button type="button" data-special-point="2" aria-label="두 번째 연결점" />
                <button type="button" data-special-point="3" aria-label="세 번째 연결점" />
              </div>
              <button className="special-explorer-tool" id="specialExplorerTool" type="button" hidden>
                <img id="specialExplorerReaction" className="special-explorer-reaction" src="/samunmong/assets/interactions/evidence-tools/candle-bloom.png" alt="" draggable={false} aria-hidden="true" />
                <img id="specialExplorerToolImage" className="special-explorer-tool-image" src="/samunmong/assets/interactions/hand-tools-generated/joseon-candle-holder-v2.png" alt="장부를 비출 촛대" draggable={false} />
              </button>
              <button className="special-surface-handle" id="specialSurfaceHandle" type="button" hidden>
                <img id="specialSurfaceToolImage" src="/samunmong/assets/interactions/hand-tools-generated/joseon-bamboo-sieve-v2.png" alt="조선식 대나무 체" draggable={false} />
                <span className="surface-direction" id="specialSurfaceDirection">↔</span>
              </button>
            </div>
          </aside>

          <aside className="global-panel tactile-puzzle-panel" id="evidenceConfrontationPanel" aria-hidden="true" aria-live="polite">
            <div className="global-panel-head">
              <div><p className="tool-panel-kicker">심문 대면</p><h2 id="confrontationTitle">증거를 심문상에 올리기</h2></div>
              <button className="close-button global-close" type="button">대면 취소</button>
            </div>
            <p id="confrontationGuide">증거패를 심문상에 올린 뒤 관인을 끌어 찍으십시오.</p>
            <div className="tactile-puzzle-stage ritual-drag-stage" id="confrontationStage">
              <img id="confrontationImage" src="/samunmong/assets/interactions/confrontation-puzzle/state-1.png" alt="증거 대면 심문상" draggable={false} />
              <span className="ritual-drop-target confrontation-target-one" data-ritual-target="confrontation-1" aria-hidden="true" />
              <span className="ritual-drop-target confrontation-target-three" data-ritual-target="confrontation-2" aria-hidden="true" />
              <button className="ritual-drag-piece evidence-tablet active" type="button" data-ritual-kind="confrontation" data-ritual-step="1"><strong>증거패</strong><span id="confrontationEvidenceName">선택 증거</span></button>
              <button className="ritual-drag-piece official-seal" type="button" data-ritual-kind="confrontation" data-ritual-step="2"><strong>관인</strong><span>끌어 찍기</span></button>
            </div>
          </aside>

          <aside className="global-panel tactile-puzzle-panel" id="sleeveInspectionPanel" aria-hidden="true" aria-live="polite">
            <div className="global-panel-head">
              <div><p className="tool-panel-kicker">신체 확인</p><h2 id="sleeveInspectionTitle">소매 아래 확인</h2></div>
              <button className="close-button global-close" type="button">확인 취소</button>
            </div>
            <p id="sleeveInspectionGuide">손목 끈을 풀고 소매를 올려 팔의 흔적을 확인하십시오.</p>
            <div className="tactile-puzzle-stage ritual-drag-stage sleeve-drag-stage" id="sleeveInspectionStage">
              <img id="sleeveInspectionImage" src="/samunmong/assets/interactions/sleeve-inspection-puzzle/state-1.png" alt="소매 확인 작업판" draggable={false} />
              <span className="ritual-drop-target sleeve-target-one" data-ritual-target="sleeve-1" aria-hidden="true" />
              <span className="ritual-drop-target sleeve-target-two" data-ritual-target="sleeve-2" aria-hidden="true" />
              <button className="ritual-drag-piece wrist-cord active" type="button" data-ritual-kind="sleeve" data-ritual-step="1"><strong>손목 끈</strong><span>옆으로 당기기</span></button>
              <button className="ritual-drag-piece sleeve-fold" type="button" data-ritual-kind="sleeve" data-ritual-step="2"><strong>소매 끝</strong><span>위로 밀기</span></button>
            </div>
          </aside>
        </>
      ) : null}

      <InvestigationNote>
        <aside className="global-panel investigation-note-panel conversation-note" id="fieldNotePanel" aria-hidden="true">
          <button className="close-button note-close global-close" type="button" aria-label={`${copy.note} 닫기`}>
            ×
          </button>
          <div className="global-panel-head">
            <div>
              {!isSpaceTheme ? <p className="note-kicker">{copy.noteKicker}</p> : null}
              <h2>{copy.note}</h2>
            </div>
          </div>
          <p className="note-lead">{copy.noteLead}</p>
          <div className="note-suspect-tabs" data-note-tabs aria-label="기록할 등장인물 선택">
            {copy.suspects.map((suspect, index) => (
              <button className={`note-suspect-tab${index === 0 ? " active" : ""}`} type="button" data-suspect-id={suspect.id} key={suspect.id}>{suspect.name}</button>
            ))}
          </div>
          {!isSpaceTheme ? (
            <p className="note-conversation-meta">
              현재 기록: <span className="note-current-suspect">{copy.suspects[0].name}</span>
            </p>
          ) : null}
          <div className="conversation-log" data-note-log aria-live="polite">
            <p className="conversation-empty">아직 이 인물과 나눈 대화가 없습니다.</p>
          </div>
        </aside>
      </InvestigationNote>

      <aside className="global-panel map-panel" id="mapPanel" aria-hidden="true">
        <button
          className="close-button global-close map-floating-close"
          type="button"
          aria-label={`${copy.map} 닫기`}
          onClick={() => {
            document.querySelector<HTMLElement>("#mapPanel")?.classList.remove("show", "closing");
            document.querySelector<HTMLElement>("#mapPanel")?.setAttribute("aria-hidden", "true");
            document.querySelector<HTMLElement>("#globalOverlay")?.classList.remove("show");
          }}
        >
          닫기
        </button>
        <div className="map-board">
          <img src={themeMap.image} alt={themeMap.alt} />
          {themeMap.locations.map((location) => (
            <span className="map-label" data-location-screen={location.screen} style={mapPositionStyle({ x: location.x, y: location.labelY ?? location.y, rot: location.rot })} key={location.screen}>
              {location.text}
            </span>
          ))}
          {themeMap.locations.map((location) => (
            <button
              className="map-pin-button"
              type="button"
              data-map-go={location.goTo}
              data-location-screen={location.screen}
              style={mapPinStyle(location)}
              aria-label={location.label}
              disabled={!location.goTo}
              onClick={() => moveFromMap(location.goTo)}
              key={`pin-${location.screen}`}
            />
          ))}
          {isMagicTheme ? (
            <p className="magic-map-progress" id="magicMapProgress" aria-live="polite">
              첫 조사 장소에서 증거를 모두 찾으면 다음 장소의 봉인이 풀립니다.
            </p>
          ) : null}
        </div>
      </aside>

      {isSpaceTheme ? (
        <>
          <div className="space-evidence-detail-overlay" id="spaceEvidenceDetailOverlay" aria-hidden="true" />
          <aside
            className="space-evidence-detail"
            id="spaceEvidenceDetail"
            role="dialog"
            aria-modal="true"
            aria-labelledby="spaceEvidenceDetailTitle"
            aria-hidden="true"
          >
            <button className="space-evidence-detail-close" id="closeSpaceEvidenceDetail" type="button" aria-label="증거 상세 닫기">
              ×
            </button>
            <section className="space-residue-analysis-summary" id="spaceResidueAnalysisSummary">
              <span>ORBIT-13 · MATERIAL ANALYSIS RESULT</span>
              <h2 id="spaceResidueAnalysisTitle">소독천과 장갑 분석 결과</h2>
              <div className="space-residue-analysis-grid">
                <article>
                  <h3>소독천 분석 결과</h3>
                  <p>▪ 생체 활성 화합물 검출</p>
                  <p>▪ 성분 코드: RX-47B</p>
                  <p>▪ 분류: 근육 조직 재생 촉진제</p>
                  <p>▪ 승인 상태: 승인 기록 없음</p>
                </article>
                <article>
                  <h3>수술용 장갑 분석 결과</h3>
                  <p>▪ 투명 고분자 화합물 검출</p>
                  <p>▪ 상온 상태: 점성 젤</p>
                  <p>▪ 저온 상태: 급속 경화</p>
                </article>
              </div>
            </section>
            <div className="space-evidence-detail-visual">
              <img
                id="spaceEvidenceDetailImage"
                src="/assets/space-station/evidence/thruster-freeze-record-detail.webp"
                alt="정면에서 본 추진 레버 결빙 진단 화면"
              />
            </div>
            <div className="space-evidence-detail-copy">
              <span id="spaceEvidenceDetailKicker">ORBIT-13 · EQUIPMENT DIAGNOSTIC</span>
              <h2 id="spaceEvidenceDetailTitle">추진 레버 결빙 기록</h2>
              <p id="spaceEvidenceDetailDescription">
                데이비드의 우주복에서 전송된 마지막 장비 진단 화면이다. 비상 추진 레버 연결부가
                정체불명의 투명한 결빙 물질로 뒤덮여 있다. 레버 작동 신호는 입력됐지만 추진 가스
                밸브는 열리지 않았다. 기록만으로는 결빙 물질의 정확한 성분을 확인할 수 없다.
              </p>
              <div
                className="space-medical-recovered-record"
                id="spaceEvidenceStructuredRecord"
                aria-live="polite"
                hidden
              />
              <form className="space-medical-recovery-form" id="spaceMedicalRecoveryForm" hidden>
                <label htmlFor="spaceMedicalRecoveryPassword">
                  의료 기록을 복구하려면 비밀번호 4자리를 입력하시오.
                </label>
                <div className="space-medical-recovery-controls">
                  <input
                    id="spaceMedicalRecoveryPassword"
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    autoComplete="off"
                    aria-describedby="spaceMedicalRecoveryError"
                  />
                  <button type="submit">기록 복구</button>
                </div>
                <p className="space-medical-recovery-error" id="spaceMedicalRecoveryError" role="alert" />
              </form>
              <div className="space-medical-recovered-record" id="spaceMedicalRecoveredRecord" aria-live="polite" hidden>
                <p>▪ 투약 시각: OST 21:52</p>
                <p>▪ 환자: 데이비드</p>
                <p>▪ 담당 의사: 메르스</p>
                <p>▪ 삭제 시각: OST 22:31</p>
              </div>
            </div>
          </aside>
          <div className="space-analysis-overlay" id="spaceAnalysisOverlay" aria-hidden="true" />
          <aside
            className="space-analysis-panel"
            id="spaceAnalysisPanel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="spaceAnalysisTitle"
            aria-hidden="true"
          >
            <button className="space-evidence-detail-close" id="closeSpaceAnalysis" type="button" aria-label="성분 분석 닫기">
              ×
            </button>
            <span className="space-analysis-kicker">ORBIT-13 · MATERIAL ANALYZER</span>
            <h2 id="spaceAnalysisTitle">성분 분석</h2>
            <p className="space-analysis-guide" id="spaceAnalysisGuide">어떤 증거를 분석하시겠습니까?</p>
            <div className="space-analysis-evidence-list" id="spaceAnalysisEvidenceList" />
            <div className="space-analysis-progress" id="spaceAnalysisProgress" hidden>
              <strong id="spaceAnalysisProgressLabel">시료 분석 중</strong>
              <div className="space-analysis-progress-track" aria-hidden="true">
                <span id="spaceAnalysisProgressBar" />
              </div>
            </div>
            <div className="space-analysis-result" id="spaceAnalysisResult" aria-live="polite" hidden>
              <h3 id="spaceAnalysisResultTitle" />
              <div id="spaceAnalysisResultLines" />
              <button id="spaceAnalysisBack" type="button">다른 증거 분석</button>
            </div>
          </aside>
          <div className="space-keycard-terminal-overlay" id="spaceKeycardTerminalOverlay" aria-hidden="true" />
          <aside
            className="space-keycard-terminal-panel"
            id="spaceKeycardTerminalPanel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="spaceKeycardTerminalTitle"
            aria-hidden="true"
          >
            <button className="space-evidence-detail-close" id="closeSpaceKeycardTerminal" type="button" aria-label="접속 단말기 닫기">
              ×
            </button>
            <span>ORBIT-13 · ACCESS RECOVERY TERMINAL</span>
            <h2 id="spaceKeycardTerminalTitle">접속 기록 복구</h2>
            <div className="space-keycard-terminal-choice" id="spaceKeycardTerminalChoice">
              <p>연결할 칩을 선택하십시오.</p>
              <button id="spaceKeycardTerminalChip" type="button">
                <img src="/assets/space-station/evidence/access-keycard-chip.webp" alt="" />
                <strong>접속 키카드 칩</strong>
              </button>
            </div>
            <div className="space-keycard-terminal-loading" id="spaceKeycardTerminalLoading" hidden>
              <div className="space-keycard-loading-spinner" aria-hidden="true">
                {Array.from({ length: 10 }, (_, index) => <i key={`keycard-spinner-${index}`} />)}
              </div>
              <p>접속 키카드 칩의 손상된 기록을 복구하고 있습니다.</p>
            </div>
            <div className="space-keycard-terminal-result" id="spaceKeycardTerminalResult" aria-live="polite" hidden>
              <p>▪ 등록 대원: HARRY</p>
              <p>▪ 대원 ID: ORBIT-13-DAT-0319</p>
              <p>▪ 최근 접속: OST 22:31 의료실 보조 단말</p>
              <p>▪ 실행 명령: MEDICAL RECORD / DELETE</p>
            </div>
          </aside>
        </>
      ) : null}

      <div className="toast" id="toast" role="status" aria-live="polite">
        <button className="toast-close" id="closeToast" type="button" aria-label="알림 닫기" hidden>×</button>
        <span className="toast-evidence-kicker" aria-hidden="true">▣ 증거 확보</span>
        <img className="toast-evidence-image" id="toastEvidenceImage" alt="" hidden />
        <span className="toast-copy">
          <strong className="toast-title" id="toastTitle" hidden />
          <span className="toast-message" id="toastMessage" />
        </span>
      </div>
      <div className="fade" id="fade">
        이동 중...
      </div>
    </>
  );
}
