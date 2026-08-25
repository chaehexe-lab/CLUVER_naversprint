"use client";

import { briefing } from "@/lib/gameData";
import type { GameTheme } from "@/lib/gameTheme";
import { useState } from "react";

const magicRecordCards = [
  {
    name: "기록 책",
    kind: "세 권의 기록",
    image: "/samunmong/assets/magic-school/intro/final-ui/archive-books-closed.webp"
  },
  {
    name: "말포일",
    kind: "학생기록부",
    image: "/samunmong/assets/magic-school/intro/final-ui/student-record-open.webp"
  },
  {
    name: "건달프",
    kind: "경비근무일지",
    image: "/samunmong/assets/magic-school/intro/final-ui/guard-log-open.webp"
  },
  {
    name: "덩쿨도어",
    kind: "교직원 기록",
    image: "/samunmong/assets/magic-school/intro/final-ui/faculty-record-open.webp"
  }
] as const;

const memoryTraceEvidence = [
  { name: "피", className: "blood", label: "붉은 잔흔" },
  { name: "깨진 안경", className: "glasses", label: "깨진 안경" },
  { name: "발자국", className: "footprint", label: "그을린 발자국" },
  { name: "찢어진 종이", className: "paper", label: "찢어진 종이" },
  { name: "열쇠", className: "key", label: "녹슨 열쇠" }
] as const;

function MagicBriefingPopupFrame() {
  return (
    <div className="magic-briefing-popup-frame" aria-hidden="true">
      <svg viewBox="0 0 1400 820" preserveAspectRatio="none" role="presentation">
        <defs>
          <linearGradient id="magicPopupPanelFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#07122b" stopOpacity=".98" />
            <stop offset=".5" stopColor="#0b1634" stopOpacity=".93" />
            <stop offset="1" stopColor="#17102e" stopOpacity=".97" />
          </linearGradient>
          <linearGradient id="magicPopupCyanEdge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#60e8ff" stopOpacity=".08" />
            <stop offset=".2" stopColor="#9af5ff" stopOpacity=".78" />
            <stop offset=".5" stopColor="#f2ffff" stopOpacity=".38" />
            <stop offset=".8" stopColor="#9af5ff" stopOpacity=".78" />
            <stop offset="1" stopColor="#60e8ff" stopOpacity=".08" />
          </linearGradient>
          <linearGradient id="magicPopupGoldEdge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7d4d2c" stopOpacity=".28" />
            <stop offset=".5" stopColor="#f0c779" stopOpacity=".72" />
            <stop offset="1" stopColor="#56341f" stopOpacity=".32" />
          </linearGradient>
          <radialGradient id="magicPopupTopGlow" cx="50%" cy="0%" r="64%">
            <stop offset="0" stopColor="#94f4ff" stopOpacity=".34" />
            <stop offset=".38" stopColor="#62dcff" stopOpacity=".1" />
            <stop offset="1" stopColor="#62dcff" stopOpacity="0" />
          </radialGradient>
          <filter id="magicPopupGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect className="magic-popup-base" width="1400" height="820" rx="58" />
        <rect className="magic-popup-mist" x="22" y="22" width="1356" height="776" rx="48" />
        <rect className="magic-popup-outer-line" x="42" y="42" width="1316" height="736" rx="38" />
        <rect className="magic-popup-inner-line" x="74" y="76" width="1252" height="668" rx="30" />

        <path className="magic-popup-top-rail" d="M188 82H560M840 82h372" />
        <path className="magic-popup-bottom-rail" d="M188 738H560M840 738h372" />
        <path className="magic-popup-side-rail" d="M108 196V348M108 472v152M1292 196V348M1292 472v152" />

        <g className="magic-popup-orb">
          <circle cx="700" cy="82" r="42" />
          <circle cx="700" cy="82" r="25" />
          <path d="M700 40v84M658 82h84M670 52l60 60M730 52l-60 60" />
        </g>

        <g className="magic-popup-corners">
          <path d="M42 154C88 142 116 114 128 42" />
          <path d="M1358 154c-46-12-74-40-86-112" />
          <path d="M42 666c46 12 74 40 86 112" />
          <path d="M1358 666c-46 12-74 40-86 112" />
          <path d="M78 110h86v20h-50v50H94v-86" />
          <path d="M1322 110h-86v20h50v50h20v-86" />
          <path d="M78 710h86v-20h-50v-50H94v86" />
          <path d="M1322 710h-86v-20h50v-50h20v86" />
        </g>

        <g className="magic-popup-runes">
          <text x="188" y="126">ᚱ ᚢ ᚾ ᛖ ᛋ</text>
          <text x="930" y="126">ᛗ ᚨ ᚾ ᚨ</text>
          <text x="188" y="704">ᚨ ᚱ ᚲ ᚨ ᚾ ᛖ</text>
          <text x="930" y="704">ᛗ ᛖ ᛗ ᛟ ᚱ ᚤ</text>
        </g>
      </svg>
      <span className="magic-popup-particle particle-one" />
      <span className="magic-popup-particle particle-two" />
      <span className="magic-popup-particle particle-three" />
    </div>
  );
}

function MagicStartCaseButtonArt({ label }: { label: string }) {
  return (
    <svg
      width="240"
      height="72"
      viewBox="0 0 240 72"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", width: "240px", height: "72px", pointerEvents: "none" }}
    >
      <defs>
        <linearGradient id="magicStartButtonFillV2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#120f12" />
          <stop offset=".42" stopColor="#2b1f23" />
          <stop offset="1" stopColor="#0a0809" />
        </linearGradient>
        <linearGradient id="magicStartButtonEdgeV2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5b3724" stopOpacity=".2" />
          <stop offset=".5" stopColor="#d8a76a" stopOpacity=".82" />
          <stop offset="1" stopColor="#5b3724" stopOpacity=".2" />
        </linearGradient>
        <radialGradient id="magicStartButtonGemV2" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#f2d39a" stopOpacity=".9" />
          <stop offset=".48" stopColor="#9a5a41" stopOpacity=".72" />
          <stop offset="1" stopColor="#2a1521" stopOpacity=".18" />
        </radialGradient>
      </defs>
      <path d="M30 7H210L232 36l-22 29H30L8 36 30 7Z" fill="rgba(0,0,0,.36)" />
      <path d="M34 10H206L224 36l-18 26H34L16 36 34 10Z" fill="url(#magicStartButtonFillV2)" stroke="url(#magicStartButtonEdgeV2)" strokeWidth="2" />
      <path d="M45 19H195L207 36l-12 17H45L33 36 45 19Z" fill="none" stroke="rgba(230, 185, 118, .28)" strokeWidth="1" />
      <path d="M25 36H54M186 36h29" stroke="rgba(217, 166, 102, .56)" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="36" cy="36" r="8" fill="url(#magicStartButtonGemV2)" stroke="rgba(224, 176, 104, .5)" />
      <circle cx="204" cy="36" r="8" fill="url(#magicStartButtonGemV2)" stroke="rgba(224, 176, 104, .5)" />
      <path d="M120 12l5 8-5 8-5-8 5-8ZM120 44l5 8-5 8-5-8 5-8Z" fill="rgba(220, 168, 101, .48)" />
      <text
        data-start-case-label
        x="120"
        y="45"
        textAnchor="middle"
        fill="#f8ead0"
        fontFamily="NanumBareunJeongsin, Noto Serif KR, serif"
        fontSize="25"
        fontWeight="700"
        letterSpacing="1"
      >
        {label}
      </text>
    </svg>
  );
}

function SpaceStationBriefingScreen() {
  const [briefingStep, setBriefingStep] = useState(0);

  return (
    <section className="screen briefing-screen space-station-briefing-screen" id="briefingScreen">
      <img
        className="plate"
        src="/assets/space-station/backgrounds/space-briefing-room.webp"
        alt="우주정거장 오르빗-13 사건 브리핑실"
      />
      <div className="shade" />
      <article
        className="hud briefing-card"
        data-briefing-step={briefingStep}
        style={{
          width: briefingStep === 0 ? "min(820px, 56vw)" : "min(1180px, 82vw)",
          minHeight: "auto",
          left: "50%",
          top: "50%",
          gap: "12px",
          padding: briefingStep === 0 ? "34px 44px 10px" : "20px 40px 8px",
          border: "1px solid rgba(160, 207, 229, .36)",
          borderRadius: "22px",
          color: "#eaf6ff",
          background: "rgba(7, 13, 20, .48)",
          boxShadow: "0 26px 80px rgba(0,0,0,.48), inset 0 0 42px rgba(101, 180, 226, .1)",
          backdropFilter: "blur(3px)"
        }}
      >
        {briefingStep === 0 ? <p className="briefing-kicker">ORBIT-13 INCIDENT LOG</p> : null}
        <h2>{briefingStep === 0 ? "우주정거장 살인사건" : "데이비드의 마지막 생체 기록"}</h2>
        <div className={`briefing-step${briefingStep === 0 ? " active" : ""}`} data-briefing-panel="0">
          <div className="briefing-copy" id="briefingCopy" aria-live="polite" />
        </div>
        <div className={`briefing-step space-remote-report${briefingStep === 1 ? " active" : ""}`} data-briefing-panel="1">
          <div className="space-report-left">
            <section className="space-crew-profile">
              <span className="space-profile-label">피해자</span>
              <div className="space-profile-identity">
                <div className="space-profile-visual">
                  <img src="/assets/space-station/characters/david-upper.png" alt="데이비드 대원 프로필" draggable={false} />
                  <span className="space-critical-status">STATUS CRITICAL</span>
                </div>
                <div><strong>데이비드</strong><p>오르빗-13 수석 엔지니어</p></div>
              </div>
            </section>
            <div className="space-status-chip"><span>현재 상태</span><strong>시신 미회수 · 사망 추정</strong></div>
          </div>
          <div className="space-report-right">
            <section className="space-report-summary">
              <h3>최종 원격 판정 기록</h3>
              <div className="space-report-summary-body">
                <div className="space-report-summary-copy">
                  <p>외부 작업 중 갑작스러운 심박 이상과 근력 저하가 감지되었습니다.<br />직후 추진 레버가 응답하지 않았고 산소 수치가 비정상적으로 감소했습니다.</p>
                  <p>안전줄 체결 신호가 해제된 뒤 구조 가능 궤도를 벗어났으며,<br />생체 신호와 통신이 모두 끊겼습니다.</p>
                  <p className="space-report-verdict">시신을 회수하지 못해 정확한 사인은 확정할 수 없으나,<br />이탈 전부터 이어진 신체 이상과 장비 오류는 단순 외부 작업 사고로 보기 어렵습니다.</p>
                </div>
                <img
                  className="space-body-scan-image"
                  src="/assets/space-station/panels/digital-human-scan-v3.png"
                  alt="디지털 인체 스캔 장식"
                  draggable={false}
                />
              </div>
            </section>
            <section className="space-timeline-panel">
              <h3>사건 로그 타임라인</h3>
              <ol className="space-report-timeline" aria-label="정거장 시각 기록">
                <li><time>22:14</time><span>외부 작업 시작</span></li><li><time>22:19</time><span>심박 이상 · 악력 급감</span></li>
                <li><time>22:21</time><span>추진 레버 응답 정지</span></li><li><time>22:22</time><span>우주복 산소 수치 급락</span></li>
                <li><time>22:23</time><span>안전줄 체결 신호 해제</span></li><li><time>22:24</time><span>마지막 무전 수신</span></li>
                <li><time>22:26</time><span>생체 신호 · 통신 두절</span></li>
              </ol>
            </section>
          </div>
        </div>
        <div className="briefing-actions">
          <button
            className="button primary briefing-start ready"
            id="startCase"
            type="button"
            aria-label="조사 시작"
          >
            조사 시작
          </button>
        </div>
        <button
          key={briefingStep}
          id={briefingStep === 0 ? "spaceBriefingReportNext" : "spaceBriefingNext"}
          type="button"
          {...(briefingStep === 1 ? { "data-go": "spaceAirlock" } : {})}
          onClick={briefingStep === 0 ? ((event) => {
            event.preventDefault();
            event.stopPropagation();
            setBriefingStep(1);
          }) : undefined}
          aria-label={briefingStep === 0 ? "생체 기록 보기" : "에어록으로 이동"}
          style={{
            justifySelf: "center",
            width: "clamp(155px, 16.2vw, 234px)",
            aspectRatio: "420 / 132",
            padding: 0,
            border: 0,
            background: "transparent",
            cursor: "pointer",
            zIndex: 8,
            filter: "drop-shadow(0 18px 28px rgba(0,0,0,.48))"
          }}
        >
          <img
            src={briefingStep === 0
              ? "/assets/space-station/ui-buttons/space-next-button.svg"
              : "/assets/space-station/ui-buttons/space-investigation-start-button.svg"}
            alt={briefingStep === 0 ? "다음" : "조사 시작"}
            draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          />
        </button>
      </article>
    </section>
  );
}

export default function BriefingScreen({ initialTheme }: { initialTheme: GameTheme }) {
  const [joseonStep, setJoseonStep] = useState(0);

  if (initialTheme === "spaceStation") {
    return <SpaceStationBriefingScreen />;
  }

  const isMagicTheme = initialTheme === "magicSchool";
  const briefingTitle = isMagicTheme ? "마법학교 방화사건" : briefing.title;
  const briefingKicker = isMagicTheme ? "기억 수정구" : "사건기록";
  const activeStep = isMagicTheme ? 0 : joseonStep;

  const startJoseonInvestigation = () => {
    if (isMagicTheme) return;
    window.dispatchEvent(new CustomEvent("samunmong:screen-request", {
      cancelable: true,
      detail: { screenId: "fieldOne" }
    }));
  };

  return (
    <section className="screen briefing-screen" id="briefingScreen">
      {isMagicTheme ? <div className="magic-memory-stage">
        <div className="magic-summon-circle magic-summon-circle-outer" />
        <div className="magic-summon-circle magic-summon-circle-inner" />
        <button className="memory-orb-trigger" id="memoryOrbTrigger" type="button" aria-label="기억 수정구를 눌러 봉인된 기억 복원하기">
          <span className="memory-orb">
            <span className="memory-orb-glass" />
            <span className="memory-orb-smoke" />
            <span className="memory-orb-rune rune-one">ᚱ</span>
            <span className="memory-orb-rune rune-two">ᛟ</span>
            <span className="memory-orb-rune rune-three">ᛗ</span>
          </span>
        </button>
        <p className="memory-orb-prompt">기억 수정구를 눌러 봉인된 사건을 복원하세요</p>
        <div className="memory-particles">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div> : null}
      {isMagicTheme ? <div className="memory-restore-ritual" aria-hidden="true">
        <span className="memory-beam" />
        <span className="memory-beam-core" />
        <span className="memory-forming-cloud" />
        <span className="memory-forming-rune rune-a">ᚱ</span>
        <span className="memory-forming-rune rune-b">ᛗ</span>
        <span className="memory-forming-rune rune-c">ᛟ</span>
        <span className="memory-forming-rune rune-d">ᚨ</span>
        <span className="memory-forming-spark spark-a" />
        <span className="memory-forming-spark spark-b" />
        <span className="memory-forming-spark spark-c" />
        <span className="memory-forming-spark spark-d" />
      </div> : null}
      <article
        className={`hud briefing-card${isMagicTheme ? "" : " joseon-briefing-card"}`}
        data-briefing-step={activeStep}
      >
        <button className="close-button briefing-journal-close" id="closeBriefingJournal" type="button" aria-label="사건 일지 닫기">
          닫기
        </button>
        {isMagicTheme ? <MagicBriefingPopupFrame /> : null}
        <div className="briefing-card-content">
          {isMagicTheme ? <div className="memory-shard-nav" aria-hidden="true">
            <span data-memory-shard="0">사건 잔상</span>
            <span data-memory-shard="1">숨은 단서</span>
            <span data-memory-shard="2">관계자</span>
          </div> : null}
          <p className="briefing-kicker">{briefingKicker}</p>
          <h2>{briefingTitle}</h2>

          <div
            className={`briefing-step${activeStep === 0 ? " active" : ""}`}
            data-briefing-panel="0"
            aria-hidden={activeStep !== 0}
          >
            {isMagicTheme ? <section className="memory-trace-sequence" data-memory-trace-state="intro" aria-label="사건 잔상 복원">
              <div className="memory-trace-frame">
                <img src="/samunmong/assets/magic-school/intro/memory-trace/memory-trace-frame.webp" alt="마법학교 방화사건 기억 프레임과 사건 현장" draggable={false} />
                <div className="memory-trace-photo-zone" data-memory-draw-zone>
                  <svg className="memory-trace-drawing" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    <path data-memory-draw-path d="" />
                    <circle data-memory-draw-guide cx="50" cy="50" r="31" />
                  </svg>
                  <div className="memory-trace-evidence" aria-hidden="true">
                    {memoryTraceEvidence.map((item) => (
                      <span className={`memory-evidence ${item.className}`} data-memory-evidence key={item.name}>
                        <span>{item.label}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <p className="memory-trace-instruction" data-memory-trace-instruction>
                  지팡이를 이용해 원을 그려 사건의 잔상을 확인하세요.
                </p>
                <div className="memory-trace-dialog" aria-live="polite">
                  <p data-memory-trace-copy />
                  <button type="button" data-memory-trace-continue disabled>
                    계속하기
                  </button>
                </div>
              </div>
            </section> : null}
            <div
              className={`briefing-copy${isMagicTheme ? "" : " done briefing-rise-in"}`}
              id="briefingCopy"
              aria-live="polite"
            >
              {!isMagicTheme ? (
                <>
                  <span className="briefing-copy-line briefing-copy-discovery">
                    “사또님, 관아 근처에서 사람이 쓰러진 채 발견되었습니다.”
                  </span>
                  <span className="briefing-copy-line briefing-copy-role">
                    당신은 이 꿈에서 <strong>고을의 사또</strong>입니다.
                  </span>
                  <span className="briefing-copy-line">
                    현장을 조사하여 증거를 모으고, 용의자를 심문하여 범인을 찾아야 합니다.
                  </span>
                </>
              ) : null}
            </div>
          </div>

          <div
            className={`briefing-step${!isMagicTheme && activeStep === 1 ? " active" : ""}`}
            data-briefing-panel="1"
            aria-hidden={isMagicTheme || activeStep !== 1}
          >
            {isMagicTheme ? <>
              <p className="briefing-caption strong">실습실의 불은 어떻게 번졌는가</p>
              <figure className="magic-case-file-visual">
                <img src="/samunmong/assets/magic-school/intro/rebuilt/case-page-02.webp" alt="마법학교 방화사건 마력 잔흔 분석 기록" draggable={false} />
                <div className="magic-case-click-zones" aria-label="마력 흔적 넘기기">
                  <button type="button" data-briefing-prev-zone aria-label="이전 마력 흔적" />
                  <button type="button" data-briefing-next-zone aria-label="다음 마력 흔적" />
                </div>
              </figure>
            </> : (
              <>
                <p className="briefing-caption strong">점순이는 어떻게 죽었는가</p>
                <div className="briefing-death-layout">
                  <div className="briefing-evidence-stack">
                    <figure className="briefing-evidence-photo">
                      <img src="/samunmong/assets/mudeok-interaction/evidence-jeomsun-neck-exam-paper.webp" alt="점순 초기 검안 기록" draggable={false} />
                    </figure>
                    <figure className="briefing-evidence-photo briefing-evidence-photo-small">
                      <img src="/samunmong/assets/mudeok-interaction/evidence-jeomsun-hand-exam-paper.webp" alt="점순이 손끝 밑 살점 검안 종이" draggable={false} />
                    </figure>
                    <p className="briefing-evidence-caption">검안 기록</p>
                  </div>
                  <div className="briefing-death-copy">
                    <p>사또님, 검안 결과를 살펴보니 <br />목에 <strong>희미한 끈 자국</strong>이 보입니다.</p>
                    <p>또한 점순이의 손톱 밑에는 <strong>살점으로 보이는 흔적</strong>이 남아 있었습니다.</p>
                    <p>이는 누군가 점순이의 목을 조른 정황으로 보입니다.</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {isMagicTheme ? (
            <div className="briefing-step" data-briefing-panel="2" aria-hidden="true">
              <p className="briefing-caption strong">세 권의 기록 책을 차례로 펼쳐 보십시오, 선생님.</p>
              <div className="magic-record-intro" data-record-kind="card">
                <nav className="magic-record-tabs" aria-label="관계자 기록 바로가기">
                  {magicRecordCards.map((record, index) => (
                    <button
                      className={`magic-record-tab${index === 0 ? " active" : ""}`}
                      type="button"
                      data-record-card-tab={index}
                      key={record.name}
                    >
                      <span>{record.kind}</span>
                      <br />
                      <strong>{record.name}</strong>
                    </button>
                  ))}
                </nav>

                <section className="magic-record-carousel" aria-label="관계자 기록 카드">
                  {magicRecordCards.map((record, index) => (
                    <article
                      className={`magic-record-card${index === 0 ? " active" : ""}`}
                      data-record-card={index}
                      key={record.name}
                    >
                      <img src={record.image} alt={`${record.name} ${record.kind}`} draggable={false} />
                      {index === 0 ? (
                        <div className="magic-book-click-zones" aria-label="기록 책 선택">
                          <button type="button" data-record-card-tab="1" aria-label="학생기록부 펼치기" />
                          <button type="button" data-record-card-tab="2" aria-label="경비근무일지 펼치기" />
                          <button type="button" data-record-card-tab="3" aria-label="교직원 기록 펼치기" />
                        </div>
                      ) : null}
                    </article>
                  ))}
                  <div className="magic-record-page-controls" aria-label="관계자 기록 넘기기">
                    <button type="button" data-student-prev aria-label="이전 관계자 기록">‹</button>
                    <span data-student-page-indicator>1 / 5</span>
                    <button type="button" data-student-next aria-label="다음 관계자 기록">›</button>
                  </div>
                </section>
              </div>
            </div>
          ) : null}

          <div className="briefing-actions">
            <button
              className="briefing-nav"
              id="briefingPrev"
              type="button"
              disabled={!isMagicTheme && activeStep === 0}
              onClick={!isMagicTheme ? () => setJoseonStep(0) : undefined}
            >
              이전
            </button>
            <button
              className="briefing-nav primary"
              id="briefingNext"
              type="button"
              onClick={!isMagicTheme ? () => setJoseonStep(1) : undefined}
            >
              다음
            </button>
            <button
              className="magic-start-case-button"
              id="startCase"
              type="button"
              aria-label={briefing.startLabel}
              onClick={!isMagicTheme ? startJoseonInvestigation : undefined}
              style={{
                width: "240px",
                height: "72px",
                minWidth: "240px",
                minHeight: "72px",
                padding: 0,
                border: 0,
                borderRadius: 0,
                color: "transparent",
                background: "transparent",
                boxShadow: "none",
                textShadow: "none",
                overflow: "visible"
              }}
            >
              <MagicStartCaseButtonArt label={briefing.startLabel} />
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}
