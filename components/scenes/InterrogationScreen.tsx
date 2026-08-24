import AccuseSuspect from "@/components/AccuseSuspect";
import EvidenceInventory from "@/components/EvidenceInventory";
import InvestigationNote from "@/components/InvestigationNote";
import InterrogationCandle3D from "@/components/effects/InterrogationCandle3D";
import InterrogationCharacterRig3D from "@/components/effects/InterrogationCharacterRig3D";
import type { GameTheme } from "@/lib/gameTheme";
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
  spaceStation: {
    image: "/assets/space-station/maps/orbit-13-blueprint.webp",
    alt: "우주정거장 오르빗-13 조사 구역 도면",
    locations: [
      { screen: "spaceAirlock", goTo: "spaceAirlock", text: "에어록", label: "에어록으로 이동", x: "18%", y: "25%" },
      { screen: "spaceMedicalBay", goTo: "spaceMedicalBay", text: "의료실", label: "의료실로 이동", x: "18%", y: "39%" },
      { screen: "spaceOxygenGenerator", goTo: "spaceOxygenGenerator", text: "산소 발생기실", label: "산소 발생기실로 이동", x: "18%", y: "55%" },
      { screen: "spaceDataCore", goTo: "spaceDataCore", text: "데이터실", label: "데이터실로 이동", x: "18%", y: "72%" },
      { screen: "spaceScienceLab", goTo: "spaceScienceLab", text: "과학 실험실", label: "과학 실험실로 이동", x: "82%", y: "25%" },
      { screen: "spaceGalleyCorridor", goTo: "spaceGalleyCorridor", text: "주방 복도", label: "주방 복도로 이동", x: "82%", y: "39%" },
      { screen: "spaceSuitPrep", goTo: "spaceSuitPrep", text: "외부 작업 준비실", label: "외부 작업 준비실로 이동", x: "82%", y: "55%" },
      { screen: "spaceObservation", text: "관측 구역", label: "관측 구역 위치", x: "82%", y: "72%" },
      { screen: "interrogationScreen", goTo: "interrogationScreen", text: "비상 조사실", label: "비상 조사실로 이동", x: "50%", y: "78%" }
    ]
  }
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
  spaceStation: {
    map: "궤도 도면",
    note: "로그 기록",
    noteKicker: "통신 로그",
    noteLead: "대원별 질문과 답변을 통신 기록처럼 확인합니다.",
    journal: "최종 보고서",
    bag: "증거 보관함",
    tools: "스캔 도구",
    toolKicker: "신호 분석",
    toolTitle: "스캔 분석",
    suspects: [
      { id: "harry", name: "해리" },
      { id: "mers", name: "메르스" },
      { id: "aladdindin", name: "알라딘딘" },
      { id: "ansungjyejyei", name: "안성줴줴이" },
      { id: "einspanner", name: "아인슈페너" }
    ]
  }
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
      ? "/assets/space-station/backgrounds/emergency-investigation-room-v2.webp"
    : "/samunmong/assets/scene-interrogation-room-empty.png";
  const initialSuspect = isSpaceTheme ? "harry" : isMagicTheme ? "malpoi" : "dolsoe";
  const initialSprite = isSpaceTheme ? "/assets/space-station/characters/harry-upper-transparent.webp" : isMagicTheme ? "/samunmong/assets/magic-school/interrogation/malpoi-sprite.webp" : "/samunmong/assets/scene-interrogation-dolsoe.webp?v=scene-20260707";
  const initialName = isSpaceTheme ? "해리" : isMagicTheme ? "말포이" : "";
  const mapIcon = isSpaceTheme ? "/assets/space-station/ui-icons-v3/orbit-blueprint.webp" : isMagicTheme ? "/samunmong/assets/magic-school/ui/icon-school-map.webp" : "/samunmong/assets/labels/transparent/tool-village-map.webp";
  const noteIcon = isSpaceTheme ? "/assets/space-station/ui-icons-v3/log-record.webp" : isMagicTheme ? "/samunmong/assets/magic-school/ui/icon-investigation-journal.webp" : "/samunmong/assets/labels/transparent/tool-note-short.webp";
  const journalIcon = isSpaceTheme ? "/assets/space-station/ui-icons-v3/final-report.webp" : isMagicTheme ? "/samunmong/assets/magic-school/ui/icon-investigation-journal.webp" : "/samunmong/assets/ui-generated/tool-case-journal.webp";
  const bagIcon = isSpaceTheme ? "/assets/space-station/ui-icons-v3/evidence-vault.webp" : isMagicTheme ? "/samunmong/assets/magic-school/ui/icon-magic-bag.webp" : "/samunmong/assets/labels/transparent/tool-bag-short.webp";
  const toolIcon = isSpaceTheme ? "/assets/space-station/ui-icons-v3/scan-tool.webp" : isMagicTheme ? "/samunmong/assets/magic-school/ui/icon-mana-tools.webp" : "/samunmong/assets/labels/transparent/tool-investigation-tools.webp";
  const hintIcon = isSpaceTheme ? "/assets/space-station/ui-icons-v3/hint-beacon.webp" : isMagicTheme ? "/samunmong/assets/magic-school/ui/icon-mana-hint.webp" : "/samunmong/assets/ui-generated/tool-hint.webp";
  const accuseIcon = isSpaceTheme ? "/assets/space-station/ui-icons-v3/accuse-target.webp" : isMagicTheme ? "/samunmong/assets/magic-school/ui/icon-final-accuse.webp" : "/samunmong/assets/labels/transparent/tool-accuse-short.webp";
  const bagPanelStyle = isSpaceTheme
    ? ({ backgroundImage: "url('/assets/space-station/panels/evidence-vault-panel-v2.webp')" } satisfies CSSProperties)
    : undefined;
  const toolPanelStyle = isSpaceTheme
    ? ({ backgroundImage: "url('/assets/space-station/panels/scan-tools-panel-v2.webp')" } satisfies CSSProperties)
    : undefined;
  const notePanelStyle = isSpaceTheme
    ? ({ backgroundImage: "url('/assets/space-station/panels/log-record-panel-v2.webp')" } satisfies CSSProperties)
    : undefined;

  return (
    <>
      <section className="screen use-text-ui" id="interrogationScreen">
        <img
          className="plate"
          id="interrogationPlate"
          src={initialPlate}
          alt="취조실"
        />
        {!isMagicTheme && !isSpaceTheme ? <InterrogationCharacterRig3D initialTexture={initialSprite} /> : null}
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
        {!isMagicTheme && !isSpaceTheme ? (
          <>
            <div className="interrogation-candle-patch" aria-hidden="true" />
            <div className="interrogation-candle" id="interrogationCandle" data-state="calm" aria-hidden="true">
              <span className="candle-light" />
              <InterrogationCandle3D />
            </div>
          </>
        ) : null}

        <div className="new-fact-toast" id="newFactToast" role="status" aria-live="polite" aria-hidden="true">
          <span>수사 노트</span>
          <strong id="newFactTitle">새로운 사실이 기록되었습니다</strong>
        </div>

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
          <button className="scene-chip map-chip" id="openMapFromInterrogation" type="button" aria-label={`${copy.map} 열기`}>
            <img src={mapIcon} alt="" />
            <span className="sr-only">{copy.map}</span>
          </button>
          <button className="scene-chip note-chip" id="openNoteProp" type="button" aria-label={`${copy.note} 보기`}>
            <img src={noteIcon} alt="" />
            <span className="sr-only">{copy.note}</span>
          </button>
          <button className="scene-chip journal-chip" data-go="briefingScreen" type="button" aria-label={`${copy.journal} 다시 보기`}>
            <img src={journalIcon} alt="" />
            <span className="sr-only">{copy.journal}</span>
          </button>
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
          <button className="scene-chip tool-chip open-tool-panel" type="button" aria-label={`${copy.tools} 열기`}>
            <img src={toolIcon} alt="" />
            <span className="sr-only">{copy.tools}</span>
          </button>
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
          <aside className="note-drawer investigation-note-panel conversation-note" id="noteDrawer" aria-hidden="true" style={notePanelStyle}>
            <button className="close-button note-close" id="closeNote" type="button" aria-label={`${copy.note} 닫기`}>
              ×
            </button>
            <p className="note-kicker">{copy.noteKicker}</p>
            <h2>{copy.note}</h2>
            <p className="note-lead">{copy.noteLead}</p>
            <div className="note-suspect-tabs" data-note-tabs aria-label="기록할 등장인물 선택">
              {copy.suspects.map((suspect, index) => (
                <button className={`note-suspect-tab${index === 0 ? " active" : ""}`} type="button" data-suspect-id={suspect.id} key={suspect.id}>{suspect.name}</button>
              ))}
            </div>
            <p className="note-conversation-meta">
              현재 기록: <span className="note-current-suspect" id="noteSuspect">{copy.suspects[0].name}</span>
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
          <div className="evidence-story-nav" aria-label="사건 흐름별 증거 보기">
            <span>사건 흐름</span>
            <div className="evidence-story-filters" id="evidenceStoryFilters">
              <button className="active" type="button" data-story-filter="all" aria-pressed="true">전체</button>
              <button type="button" data-story-filter="동기" aria-pressed="false">동기</button>
              <button type="button" data-story-filter="동선" aria-pressed="false">동선</button>
              <button type="button" data-story-filter="누명" aria-pressed="false">누명</button>
              <button type="button" data-story-filter="수법" aria-pressed="false">수법·상흔</button>
              <button type="button" data-story-filter="진술" aria-pressed="false">진술</button>
            </div>
            <button className="evidence-thread-open" id="openEvidenceThread" type="button">
              사건 줄거리 <b id="evidenceThreadCount">0</b>
            </button>
          </div>
          <div className="evidence-location-tabs" id="evidenceLocationTabs" aria-label="증거 장소 선택" />
          <div className="evidence-list evidence-grid" id="evidenceList">
            <div className="evidence-empty" id="emptyInterrogationEvidence">
              {copy.bag}에 담긴 증거가 없습니다.
            </div>
          </div>
          <div className="evidence-story-preview" id="evidenceStoryPreview" hidden>
            <button className="evidence-story-preview-close" id="closeEvidenceStoryPreview" type="button" aria-label="증거 흐름 닫기">×</button>
            <div className="evidence-story-preview-head">
              <span id="evidencePreviewKind">현장 증거</span>
              <strong id="evidencePreviewTitle">증거 이름</strong>
            </div>
            <div className="evidence-story-path" aria-label="증거가 말하는 사건 흐름">
              <div className="evidence-story-node evidence-story-object">
                <img id="evidencePreviewImage" src="/samunmong/assets/evidence-transparent/evidence-wooden-tag-transparent.webp" alt="" />
                <small>발견물</small>
                <b id="evidencePreviewObject">증거</b>
              </div>
              <span className="evidence-story-arrow" aria-hidden="true">→</span>
              <div className="evidence-story-node evidence-story-fact">
                <small>확인된 사실</small>
                <b id="evidencePreviewFact">흔적 확인</b>
              </div>
              <span className="evidence-story-arrow" aria-hidden="true">→</span>
              <div className="evidence-story-node evidence-story-meaning">
                <small id="evidencePreviewRole">사건 의미</small>
                <b id="evidencePreviewMeaning">사건과 연결</b>
              </div>
            </div>
            <div className="evidence-people-row" id="evidencePeopleRow" aria-label="이 증거와 관련된 인물" />
            <div className="evidence-related-row" id="evidenceRelatedRow" aria-label="이어 볼 증거" />
            <div className="evidence-connection-result" id="evidenceConnectionResult" hidden>
              <div className="evidence-connection-images">
                <img id="connectionImageA" src="/samunmong/assets/evidence-transparent/evidence-wooden-tag-transparent.webp" alt="" />
                <span aria-hidden="true">＋</span>
                <img id="connectionImageB" src="/samunmong/assets/evidence-transparent/evidence-wooden-tag-transparent.webp" alt="" />
              </div>
              <span>실마리 연결</span>
              <strong id="evidenceConnectionText">두 증거가 하나의 사실을 가리킵니다.</strong>
            </div>
            <button className="evidence-present-confirm" id="confirmEvidencePresent" type="button">이 증거를 심문에 제시</button>
          </div>
          <div className="evidence-thread-panel" id="evidenceThreadPanel" hidden>
            <button className="evidence-story-preview-close" id="closeEvidenceThread" type="button" aria-label="사건 줄거리 닫기">×</button>
            <div className="evidence-thread-head">
              <span>{initialTheme === "joseon" ? "사또가 밝혀낸 연결" : initialTheme === "magicSchool" ? "교사가 밝혀낸 연결" : "조사관이 밝혀낸 연결"}</span>
              <strong>사건 줄거리</strong>
              <p>직접 이어 붙인 증거만 기록됩니다.</p>
            </div>
            <div className="evidence-thread-list" id="evidenceThreadList" />
          </div>
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
          <p>{isSpaceTheme ? "스캔 장비를 고른 뒤 증거를 확인하십시오." : "단서 하나와 도구 하나를 골라 증거 위에 놓으세요."}</p>
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
                <div><small>확인된 사실</small><strong id="toolConclusionFact">새로운 흔적을 확인했습니다.</strong></div>
                <i aria-hidden="true">→</i>
                <div><small>사건에서의 의미</small><b id="toolConclusionMeaning">사건 흐름과 이어집니다.</b></div>
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
        <aside className="global-panel investigation-note-panel conversation-note" id="fieldNotePanel" aria-hidden="true" style={notePanelStyle}>
          <div className="global-panel-head">
            <div>
              <p className="note-kicker">{copy.noteKicker}</p>
              <h2>{copy.note}</h2>
            </div>
            <button className="close-button note-close global-close" type="button" aria-label={`${copy.note} 닫기`}>
              ×
            </button>
          </div>
          <p className="note-lead">{copy.noteLead}</p>
          <div className="note-suspect-tabs" data-note-tabs aria-label="기록할 등장인물 선택">
            {copy.suspects.map((suspect, index) => (
              <button className={`note-suspect-tab${index === 0 ? " active" : ""}`} type="button" data-suspect-id={suspect.id} key={suspect.id}>{suspect.name}</button>
            ))}
          </div>
          <p className="note-conversation-meta">
            현재 기록: <span className="note-current-suspect">{copy.suspects[0].name}</span>
          </p>
          <div className="conversation-log" data-note-log aria-live="polite">
            <p className="conversation-empty">아직 이 인물과 나눈 대화가 없습니다.</p>
          </div>
        </aside>
      </InvestigationNote>

      <aside className="global-panel map-panel" id="mapPanel" aria-hidden="true">
        <button className="close-button global-close map-floating-close" type="button" aria-label={`${copy.map} 닫기`}>
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
              style={mapPinStyle(location)}
              aria-label={location.label}
              disabled={!location.goTo}
              key={`pin-${location.screen}`}
            />
          ))}
        </div>
      </aside>

      <div className="toast" id="toast" role="status" aria-live="polite">
        <button className="toast-close" id="closeToast" type="button" aria-label="알림 닫기" hidden>×</button>
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
