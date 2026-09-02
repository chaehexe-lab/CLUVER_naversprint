"use client";

import { briefing } from "@/lib/gameData";
import type { GameTheme } from "@/lib/gameTheme";
import { useEffect, useState } from "react";

type MagicIntroAudioWindow = Window & {
  __samunmongMagicIntroAudio?: {
    alarmAudio: HTMLAudioElement;
    fireAudio: HTMLAudioElement;
  };
};

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

const magicStudentRecords = [
  {
    name: "말포일",
    subtitle: "세쌍둥이 첫째 · 원소마법 종합반",
    portrait: "/samunmong/assets/magic-school/interrogation/malpoil-sprite.webp",
    conduct: "예의가 바르고 수업 태도가 성실함. 방과 후에는 대부분 도서관에서 시간을 보냄.",
    notes: "둘째 말포이의 재능과 성적을 자주 의식하는 모습이 관찰됨.",
    courses: "5대 원소 기초 마법 강의 전 과정 수강 완료.",
    memo: "최근 마법 보안 기기의 구조와 약점을 다룬 도서를 대출함."
  },
  {
    name: "말포이",
    subtitle: "세쌍둥이 둘째 · 화염마법 심화반",
    portrait: "/samunmong/assets/magic-school/interrogation/malpoi-sprite.webp",
    conduct: "천재적인 마력으로 주목받으나 규칙을 가볍게 여기고 잦은 소동을 일으킴.",
    notes: "마력이 지나치게 강해 지팡이를 자주 부숨. 섬세한 빙결 마법 제어에는 서툼.",
    courses: "화염 마법 관련 기초·심화 강의 전 과정 수강 완료.",
    memo: "최근 파손된 개인 지팡이를 기숙사 폐기함에 버렸다고 진술함."
  },
  {
    name: "말포삼",
    subtitle: "세쌍둥이 셋째 · 환각마법 연구반",
    portrait: "/samunmong/assets/magic-school/interrogation/malposam-sprite.webp",
    conduct: "매우 소심하며 타인과 눈을 잘 맞추지 못함. 혼자 도서관에 머무는 시간이 김.",
    notes: "환각 마법과 기록 수정술에 강한 흥미를 보이며 첫째 말포일을 깊이 따름.",
    courses: "환각 마법 기초 및 기록 매체 응용 과목을 집중 수강함.",
    memo: "사건 전후 수정구 기록에 관해 질문하자 눈에 띄게 긴장함."
  }
] as const;

const magicGuardRecord = {
  name: "건달프",
  subtitle: "야간 경비 책임자 · 제1연금술관 담당",
  portrait: "/samunmong/assets/magic-school/interrogation/gandalf-sprite.webp",
  duty: "사건 당일 저녁, 제1 연금술 실습실과 중앙 복도를 정기 순찰함.",
  conduct: "근무 규칙을 철저히 지키며 학생들의 야간 출입을 엄격하게 단속함.",
  notes: "금지 구역 흡연 문제로 학년부장 덩쿨도어와 자주 충돌해 왔음.",
  testimony: "말포일은 평소 매일 도서관에 머무는 모범생이라며 강하게 신뢰하고 있음."
} as const;

const magicFacultyRecord = {
  name: "덩쿨도어",
  subtitle: "학년부장 · 화염 마법 담당",
  subject: "제1 연금술 실습실 수업과 화염 마법 과목을 담당하며 실습실 관리 권한을 가지고 있음.",
  conduct: "냉담하고 무관심한 태도가 잦으며 학생 문제에 깊게 관여하지 않는 편.",
  notes: "사건 직후 몸에서 탄 냄새가 났고 현장 근처에서 목격되어 의심을 받음.",
  memo: "금지된 마법 담배 흡연 의심이 있음. 방화 여부와 별개로 당시 행적 확인이 필요함."
} as const;

const memoryTraceEvidence = [
  {
    name: "부러진 지팡이",
    className: "fire",
    label: "부러진 지팡이",
    description: "발화 지점 가까이에서 심하게 그을린 채 발견됨",
    result: "화염 마력 검출",
    resultDescription: "지팡이 내부에 폭발적으로 방출된 화염 마력이 남아 있음",
    resultImage: "/samunmong/assets/magic-school/briefing/scene-investigation/fire-magic-analysis-emblem-v1.png",
    image: "/samunmong/assets/magic-school/evidence-cutouts/broken-wand.webp"
  },
  {
    name: "화염 감지 룬스톤",
    className: "ice",
    label: "화염 감지 룬스톤",
    description: "큰 화재가 났지만 경보가 한 번도 울리지 않음",
    result: "빙결 마력 검출",
    resultDescription: "차가운 마력이 룬의 공명을 얼려 작동을 막은 흔적이 있음",
    resultImage: "/samunmong/assets/magic-school/briefing/scene-investigation/ice-magic-analysis-emblem-v1.png",
    image: "/samunmong/assets/magic-school/evidence-cutouts/fire-rune-stone.webp"
  },
  {
    name: "기록의 수정구",
    className: "illusion",
    label: "기록의 수정구",
    description: "사건 시간대의 영상만 흐릿하게 깨져 있음",
    result: "환각 마력 검출",
    resultDescription: "누군가 사건 당시 기록 위에 거짓 잔상을 덮어쓴 흔적이 있음",
    resultImage: "/samunmong/assets/magic-school/briefing/scene-investigation/illusion-magic-analysis-emblem-v1.png",
    image: "/samunmong/assets/magic-school/evidence-cutouts/record-crystal.webp"
  }
] as const;

const magicIncidentScene = "/samunmong/assets/magic-school/briefing/incident-hero/magic-alchemy-lab-fire-map-match-v2.png";

function playMagicButtonClick() {
  const buttonAudio = new Audio("/samunmong/sound/sfx/button.mp3");
  buttonAudio.volume = 0.64;
  void buttonAudio.play().catch(() => undefined);
}

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
        fontSize="20"
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
  const [isJournalOpen, setIsJournalOpen] = useState(false);

  useEffect(() => {
    const openJournal = () => {
      setBriefingStep(1);
      setIsJournalOpen(true);
    };
    const closeJournal = () => setIsJournalOpen(false);

    window.addEventListener("samunmong:briefing-journal-open", openJournal);
    window.addEventListener("samunmong:briefing-journal-close", closeJournal);
    return () => {
      window.removeEventListener("samunmong:briefing-journal-open", openJournal);
      window.removeEventListener("samunmong:briefing-journal-close", closeJournal);
    };
  }, []);

  useEffect(() => {
    if (isJournalOpen) {
      window.dispatchEvent(new CustomEvent("samunmong:briefing-journal-ready"));
    }
  }, [isJournalOpen]);

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
          padding: briefingStep === 0 ? "34px 44px 10px" : isJournalOpen ? "20px 40px 32px" : "20px 40px 8px",
          border: "1px solid rgba(160, 207, 229, .36)",
          borderRadius: "22px",
          color: "#eaf6ff",
          background: "rgba(7, 13, 20, .48)",
          boxShadow: "0 26px 80px rgba(0,0,0,.48), inset 0 0 42px rgba(101, 180, 226, .1)",
          backdropFilter: "blur(3px)"
        }}
      >
        <button className="close-button briefing-journal-close" id="closeBriefingJournal" type="button" aria-label="사건 브리핑 닫기">
          닫기
        </button>
        {briefingStep === 0 ? <p className="briefing-kicker">ORBIT-13 INCIDENT LOG</p> : null}
        <h2>{briefingStep === 0 ? "우주정거장 의문사 사건" : "데이비드의 마지막 생체 기록"}</h2>
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
                <div className="space-profile-copy">
                  <strong>데이비드</strong>
                  <p>오르빗-13 수석 엔지니어</p>
                  <div className="space-profile-auth-line">
                    <span>ID :</span>
                    <strong>ORBIT-13-ENG-0714</strong>
                  </div>
                </div>
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
        {!isJournalOpen ? <button
            key={briefingStep}
            id={briefingStep === 0 ? "spaceBriefingReportNext" : "spaceBriefingNext"}
            type="button"
            {...(briefingStep === 1 ? { "data-go": "spaceAirlock" } : {})}
            onClick={briefingStep === 0 ? ((event) => {
              event.preventDefault();
              event.stopPropagation();
              window.dispatchEvent(new CustomEvent("samunmong:briefing-step-change", { detail: { step: 1 } }));
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
          </button> : null}
      </article>
    </section>
  );
}

export default function BriefingScreen({ initialTheme, active = false }: { initialTheme: GameTheme; active?: boolean }) {
  const [joseonStep, setJoseonStep] = useState(0);
  const [magicEntryStage, setMagicEntryStage] = useState<"alarm" | "welcome" | "orb" | "opening" | "scene" | "records">("alarm");
  const [orbTransitionFrame, setOrbTransitionFrame] = useState(0);
  const [orbSmokeFrame, setOrbSmokeFrame] = useState(1);
  const [incidentMagicFrame, setIncidentMagicFrame] = useState(1);
  const [investigatedMagicEvidence, setInvestigatedMagicEvidence] = useState<string[]>([]);
  const [magicRecordIndex, setMagicRecordIndex] = useState(0);
  const [magicStudentIndex, setMagicStudentIndex] = useState(0);
  const isMagicTheme = initialTheme === "magicSchool";
  const isMagicSceneComplete = investigatedMagicEvidence.length === memoryTraceEvidence.length;

  useEffect(() => {
    if (!isMagicTheme) return;
    const playSceneVideos = () => {
      document.querySelectorAll<HTMLVideoElement>("#briefingScreen video").forEach((video) => {
        video.muted = true;
        void video.play().catch(() => undefined);
      });
    };
    const timer = window.setTimeout(playSceneVideos, 0);
    document.addEventListener("visibilitychange", playSceneVideos);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", playSceneVideos);
    };
  }, [isMagicTheme, magicEntryStage]);

  useEffect(() => {
    if (!isMagicTheme || !active || magicEntryStage !== "alarm") return;
    const audioWindow = window as MagicIntroAudioWindow;
    const pendingAudio = audioWindow.__samunmongMagicIntroAudio;
    const alarmAudio = pendingAudio?.alarmAudio ?? new Audio("/samunmong/sound/sfx/magic-school-alarm.mp3");
    const fireAudio = pendingAudio?.fireAudio ?? new Audio("/samunmong/sound/sfx/magic-school-fire.mp3");
    delete audioWindow.__samunmongMagicIntroAudio;
    alarmAudio.volume = 0.62;
    fireAudio.volume = 0.42;
    fireAudio.loop = true;
    void alarmAudio.play().catch(() => undefined);
    void fireAudio.play().catch(() => undefined);
    const revealTimer = window.setTimeout(() => setMagicEntryStage("welcome"), 4000);
    return () => {
      window.clearTimeout(revealTimer);
      alarmAudio.pause();
      fireAudio.pause();
      alarmAudio.currentTime = 0;
      fireAudio.currentTime = 0;
    };
  }, [active, isMagicTheme, magicEntryStage]);

  useEffect(() => {
    if (!isMagicTheme || !active || magicEntryStage !== "welcome") return;
    const inkAudio = new Audio("/samunmong/sound/sfx/magic-school-ink-type.mp3");
    inkAudio.volume = 0.48;
    inkAudio.loop = false;
    void inkAudio.play().catch(() => undefined);
    return () => {
      inkAudio.pause();
      inkAudio.currentTime = 0;
    };
  }, [active, isMagicTheme, magicEntryStage]);

  useEffect(() => {
    if (!isMagicTheme || magicEntryStage !== "orb") return;
    const smokeFrames = [1, 2, 3, 2];
    let smokeIndex = 0;
    setOrbSmokeFrame(smokeFrames[smokeIndex]);
    const smokeTimer = window.setInterval(() => {
      smokeIndex = (smokeIndex + 1) % smokeFrames.length;
      setOrbSmokeFrame(smokeFrames[smokeIndex]);
    }, 520);
    return () => window.clearInterval(smokeTimer);
  }, [isMagicTheme, magicEntryStage]);

  useEffect(() => {
    if (!isMagicTheme || magicEntryStage !== "scene") return;
    const sceneFrames = [1, 2, 3, 2];
    let sceneIndex = 0;
    setIncidentMagicFrame(sceneFrames[sceneIndex]);
    const sceneTimer = window.setInterval(() => {
      sceneIndex = (sceneIndex + 1) % sceneFrames.length;
      setIncidentMagicFrame(sceneFrames[sceneIndex]);
    }, 460);
    return () => window.clearInterval(sceneTimer);
  }, [isMagicTheme, magicEntryStage]);

  useEffect(() => {
    if (!isMagicTheme || !active || magicEntryStage !== "scene") return;
    const fireAudio = new Audio("/samunmong/sound/sfx/magic-school-fire.mp3");
    fireAudio.volume = 0.42;
    fireAudio.loop = true;
    void fireAudio.play().catch(() => undefined);
    return () => {
      fireAudio.pause();
      fireAudio.currentTime = 0;
    };
  }, [active, isMagicTheme, magicEntryStage]);

  useEffect(() => {
    if (!isMagicTheme || magicEntryStage !== "scene") return;
    const screen = document.querySelector("#briefingScreen");
    screen?.classList.remove("awaiting-memory-orb", "memory-restoring");
    screen?.classList.add("memory-restored");
  }, [isMagicTheme, magicEntryStage]);

  if (initialTheme === "spaceStation") {
    return <SpaceStationBriefingScreen />;
  }

  const briefingTitle = isMagicTheme ? "마법학교 방화사건" : briefing.title;
  const briefingKicker = isMagicTheme ? "기억 수정구" : "사건기록";
  const activeStep = isMagicTheme ? (magicEntryStage === "records" ? 2 : 0) : joseonStep;

  const startJoseonInvestigation = () => {
    if (isMagicTheme) return;
    window.dispatchEvent(new CustomEvent("samunmong:screen-request", {
      cancelable: true,
      detail: { screenId: "fieldOne" }
    }));
  };

  const openMagicMemory = () => {
    if (magicEntryStage !== "orb") return;
    playMagicButtonClick();
    const orbAudio = new Audio("/samunmong/sound/sfx/magic-school-orb-open.mp3");
    orbAudio.volume = 0.7;
    void orbAudio.play().catch(() => undefined);
    setMagicEntryStage("opening");
    setOrbTransitionFrame(1);
    window.setTimeout(() => setOrbTransitionFrame(2), 360);
    window.setTimeout(() => setOrbTransitionFrame(3), 780);
    window.setTimeout(() => {
      setMagicEntryStage("scene");
      setOrbTransitionFrame(0);
    }, 1250);
  };

  const inspectMagicEvidence = (evidenceName: string) => {
    if (investigatedMagicEvidence.includes(evidenceName)) return;
    playMagicButtonClick();
    setInvestigatedMagicEvidence((current) => [...current, evidenceName]);
  };

  const enterMagicInvestigation = () => {
    if (!isMagicSceneComplete) return;
    playMagicButtonClick();
    setMagicEntryStage("records");
  };

  const startMagicInvestigation = () => {
    if (magicEntryStage !== "records") return;
    playMagicButtonClick();
    window.dispatchEvent(new CustomEvent("samunmong:screen-request", {
      cancelable: true,
      detail: { screenId: "magicAlchemyLab" }
    }));
  };

  return (
    <section className={`screen briefing-screen${active ? " active" : ""}${isMagicTheme ? ` magic-entry-${magicEntryStage}` : ""}`} id="briefingScreen">
      {isMagicTheme && magicEntryStage === "alarm" ? (
        <div aria-label="화재 경보가 울리는 어두운 화면" style={{ position: "absolute", inset: 0, zIndex: 80, background: "#000" }} />
      ) : null}
      {isMagicTheme && magicEntryStage === "welcome" ? (
        <section className="magic-entry-welcome-panel" role="dialog" aria-modal="true" aria-labelledby="magicWelcomeTitle">
          <img className="magic-entry-backdrop" src="/samunmong/assets/magic-school/scenes/alchemy-lab.webp" alt="아르카나 마법학교 제1 연금술 실습실" draggable={false} />
          <div className="magic-entry-document">
            <img src="/samunmong/assets/magic-school/briefing/scene-investigation/new-teacher-briefing-frame-v1.png" alt="" draggable={false} />
            <div className="magic-entry-ink-copy">
              <p>ARCANA FACULTY NOTICE</p>
              <h2 id="magicWelcomeTitle">
                선생님, 아르카나 마법학교에 오신 것을<br />
                환영합니다.
              </h2>
              <span>첫 부임을 앞둔 밤, 제1 연금술 실습실에서 원인을 알 수 없는 화재가 발생했습니다.</span>
              <strong>기억 수정구에 남은 현장을 보시겠습니까?</strong>
              <button type="button" onClick={() => {
                playMagicButtonClick();
                setMagicEntryStage("orb");
              }}>현장 확인하기</button>
            </div>
          </div>
        </section>
      ) : null}
      {isMagicTheme && (magicEntryStage === "orb" || magicEntryStage === "opening") ? (
        <section className={`magic-entry-orb-stage${magicEntryStage === "opening" ? " is-opening" : ""}`} aria-label="기억 수정구로 현장 확인하기">
          <img className="magic-entry-backdrop" src="/samunmong/assets/magic-school/scenes/alchemy-lab.webp" alt="" draggable={false} />
          <div className="magic-entry-orb-copy">
            <p>봉인된 현장 기억</p>
            <h2>수정구를 눌러 화재 당시의 현장을 확인하십시오.</h2>
          </div>
          <img
            src={`/samunmong/assets/magic-school/intro/orb-lavender-white-smoke-v${orbSmokeFrame}.png`}
            alt=""
            aria-hidden="true"
            draggable={false}
            style={{
              position: "absolute",
              zIndex: 2,
              left: "50%",
              top: "52%",
              width: "min(570px, 52vw)",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none"
            }}
          />
          <button className="magic-entry-orb-button" type="button" onClick={openMagicMemory} aria-label="기억 수정구 열기" disabled={magicEntryStage === "opening"}>
            <img src="/samunmong/assets/magic-school/intro/rebuilt/memory-orb-v3.png" alt="기억 수정구" draggable={false} />
            <span>현장 기억 열기</span>
          </button>
          {orbTransitionFrame > 0 ? (
            <img
              src={`/samunmong/assets/magic-school/intro/orb-transition/orb-transition-0${orbTransitionFrame}.png`}
              alt=""
              aria-hidden="true"
              draggable={false}
              style={{
                position: "absolute",
                zIndex: 12,
                left: "50%",
                top: "50%",
                width: orbTransitionFrame === 1 ? "48vmin" : orbTransitionFrame === 2 ? "82vmin" : "145vmax",
                height: orbTransitionFrame === 3 ? "145vmax" : "auto",
                objectFit: "contain",
                pointerEvents: "none",
                transform: "translate(-50%, -50%)"
              }}
            />
          ) : null}
        </section>
      ) : null}
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
          {!isMagicTheme ? <>
            <p className="briefing-kicker">{briefingKicker}</p>
            <h2>{briefingTitle}</h2>
          </> : null}

          <div
            className={`briefing-step${activeStep === 0 ? " active" : ""}`}
            data-briefing-panel="0"
            aria-hidden={activeStep !== 0}
          >
            {isMagicTheme ? <section className="memory-trace-sequence" data-memory-trace-state={isMagicSceneComplete ? "complete" : "intro"} aria-label="화재 현장 조사">
              <div className="memory-trace-frame">
                <img className="magic-investigation-scene-video" src={magicIncidentScene} alt="실제 게임맵과 같은 제1 연금술 실습실의 화재 당시 현장" draggable={false} />
                <img
                  src={`/samunmong/assets/magic-school/briefing/incident-vfx/incident-magic-vfx-0${incidentMagicFrame}.png`}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 2,
                    width: "100%",
                    height: "100%",
                    objectFit: "fill",
                    opacity: 0.08,
                    pointerEvents: "none"
                  }}
                />
                <header className="memory-trace-heading">
                  <p>FIRST SCENE INVESTIGATION</p>
                  <h2>화재 현장을 직접 살펴보십시오</h2>
                  <span>불길과 얼어붙은 경보 룬, 깨진 수정구를 눌러 남은 마법을 확인하세요.</span>
                </header>
                <div className="memory-trace-photo-zone">
                  <div className="memory-trace-evidence">
                    {memoryTraceEvidence.map((item) => {
                      const isRevealed = investigatedMagicEvidence.includes(item.name);
                      return (
                      <button
                        className={`memory-evidence ${item.className}${isRevealed ? " revealed" : ""}`}
                        type="button"
                        aria-label={`${item.label} 조사하기`}
                        key={item.name}
                        onClick={() => inspectMagicEvidence(item.name)}
                      >
                        <strong className="memory-evidence-observation">{item.label} 조사</strong>
                        <span className="memory-evidence-observation">눌러서 흔적 확인</span>
                        <img className="magic-evidence-result-emblem memory-evidence-result" src={item.resultImage} alt="" draggable={false} />
                        <strong className="memory-evidence-result">{item.result}</strong>
                        <span className="memory-evidence-result">{item.resultDescription}</span>
                      </button>
                    )})}
                  </div>
                </div>
                <p className="memory-trace-instruction">
                  {isMagicSceneComplete
                    ? "세 물건에서 서로 다른 마법 사용 흔적이 확인되었습니다."
                    : `현장에서 아직 조사하지 않은 물건이 ${memoryTraceEvidence.length - investigatedMagicEvidence.length}개 남아 있습니다.`}
                </p>
                <div className="memory-trace-dialog" aria-live="polite">
                  <img src="/samunmong/assets/magic-school/briefing/scene-investigation/new-teacher-briefing-frame-v1.png" alt="" draggable={false} />
                  <div className="memory-trace-dialog-content">
                    <span className="memory-trace-dialog-kicker">현장 조사 결과</span>
                    <p>
                      {isMagicSceneComplete ? <>
                        불길에서는 강한 화염 마력이 검출되었습니다.<br />
                        작동하지 않은 경보 룬에는 빙결 마력이, 깨진 수정구에는 환각 마력이 남아 있습니다.<br />
                        서로 다른 세 마법이 한 현장에 남은 이유를 조사해야 합니다.
                      </> : null}
                    </p>
                    <button type="button" disabled={!isMagicSceneComplete} onClick={enterMagicInvestigation}>
                      실제 현장으로 이동하기
                    </button>
                  </div>
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
            className={`briefing-step${activeStep === 1 ? " active" : ""}`}
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
                    <p>또한 점순이의 손톱 밑에는 <strong className="briefing-critical-evidence">살점으로 보이는 흔적</strong>이 남아 있었습니다.</p>
                    <p>이는 누군가 점순이의 목을 조른 정황으로 보입니다.</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {isMagicTheme ? (
            <div className={`briefing-step${activeStep === 2 ? " active" : ""}`} data-briefing-panel="2" aria-hidden={activeStep !== 2}>
              <p className="briefing-caption strong">세 권의 기록 책을 차례로 펼쳐 보십시오, 선생님.</p>
              <div className="magic-record-intro" data-record-kind={magicRecordIndex}>
                <nav className="magic-record-tabs" aria-label="관계자 기록 바로가기">
                  {magicRecordCards.map((record, index) => (
                    <button
                      className={`magic-record-tab${index === magicRecordIndex ? " active" : ""}`}
                      type="button"
                      key={record.name}
                      onClick={(event) => {
                        event.stopPropagation();
                        setMagicRecordIndex(index);
                      }}
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
                      className={`magic-record-card${index === magicRecordIndex ? " active" : ""}`}
                      data-record-card={index}
                      aria-hidden={index !== magicRecordIndex}
                      key={record.name}
                    >
                      {index === 1 ? (
                        <div className="magic-student-ledger" data-magic-student-ledger>
                          <img className="magic-student-ledger-book" src="/samunmong/assets/magic-school/intro/records/student-ledger-blank-v2.png" alt="펼쳐진 마법학교 학생기록부" draggable={false} />
                          {magicStudentRecords.map((student, studentIndex) => (
                            <section
                              className={`magic-student-record${studentIndex === magicStudentIndex ? " active" : ""}`}
                              data-magic-student-record={studentIndex}
                              aria-hidden={studentIndex !== magicStudentIndex}
                              key={student.name}
                            >
                              <div className="magic-student-portrait-frame">
                                <img src={student.portrait} alt={`${student.name} 학생 초상`} draggable={false} />
                              </div>
                              <header className="magic-student-record-heading">
                                <p>아르카나 마법학교 학생기록부</p>
                                <h3>{student.name}</h3>
                                <span>{student.subtitle}</span>
                              </header>
                              <dl className="magic-student-record-fields">
                                <div><dt>평소 행실</dt><dd>{student.conduct}</dd></div>
                                <div><dt>특이 사항</dt><dd>{student.notes}</dd></div>
                                <div><dt>수강 및 관찰 기록</dt><dd>{student.courses}<br />{student.memo}</dd></div>
                              </dl>
                            </section>
                          ))}
                          <button className="magic-student-page-arrow previous" type="button" aria-label="이전 학생 기록" onClick={() => setMagicStudentIndex((magicStudentIndex - 1 + magicStudentRecords.length) % magicStudentRecords.length)}>‹</button>
                          <button className="magic-student-page-arrow next" type="button" aria-label="다음 학생 기록" onClick={() => setMagicStudentIndex((magicStudentIndex + 1) % magicStudentRecords.length)}>›</button>
                          <div className="magic-student-ledger-tabs" aria-label="학생 선택">
                            {magicStudentRecords.map((student, studentIndex) => (
                              <button className={studentIndex === magicStudentIndex ? "active" : ""} type="button" key={student.name} onClick={() => setMagicStudentIndex(studentIndex)}>{student.name}</button>
                            ))}
                          </div>
                        </div>
                      ) : index === 2 ? (
                        <div className="magic-guard-ledger">
                          <img className="magic-guard-ledger-book" src="/samunmong/assets/magic-school/intro/records/guard-ledger-blank-v2.png" alt="펼쳐진 마법학교 경비근무일지" draggable={false} />
                          <div className="magic-guard-portrait-frame">
                            <img src={magicGuardRecord.portrait} alt={`${magicGuardRecord.name} 경비원 초상`} draggable={false} />
                          </div>
                          <div className="magic-guard-id">
                            <strong>{magicGuardRecord.name}</strong>
                            <span>{magicGuardRecord.subtitle}</span>
                          </div>
                          <header className="magic-guard-heading">
                            <p>아르카나 마법학교 보안부</p>
                            <h3>경비근무일지</h3>
                          </header>
                          <dl className="magic-guard-fields">
                            <div className="featured"><dt>특이 사항 및 참고 진술</dt><dd>{magicGuardRecord.notes}<br />{magicGuardRecord.testimony}</dd></div>
                            <div><dt>사건 당일 순찰 기록</dt><dd>{magicGuardRecord.duty}</dd></div>
                            <div><dt>평소 근무 태도</dt><dd>{magicGuardRecord.conduct}</dd></div>
                          </dl>
                        </div>
                      ) : index === 3 ? (
                        <div className="magic-faculty-ledger">
                          <img className="magic-faculty-ledger-book" src="/samunmong/assets/magic-school/intro/records/faculty-ledger-blank-v2.png" alt="펼쳐진 마법학교 교직원 기록부" draggable={false} />
                          <div className="magic-faculty-portrait-frame">
                            <img src="/samunmong/assets/magic-school/interrogation/dunguldoor-sprite.webp" alt="덩쿨도어 교직원 초상" draggable={false} />
                          </div>
                          <div className="magic-faculty-id">
                            <strong>{magicFacultyRecord.name}</strong>
                            <span>{magicFacultyRecord.subtitle}</span>
                          </div>
                          <header className="magic-faculty-heading">
                            <p>아르카나 마법학교 교직원 기록부</p>
                            <h3>교직원 기록</h3>
                          </header>
                          <dl className="magic-faculty-fields">
                            <div><dt>담당 과목</dt><dd>{magicFacultyRecord.subject}</dd></div>
                            <div><dt>평소 행실</dt><dd>{magicFacultyRecord.conduct}</dd></div>
                            <div><dt>특이 사항</dt><dd>{magicFacultyRecord.notes}</dd></div>
                            <div><dt>수사 메모</dt><dd>{magicFacultyRecord.memo}</dd></div>
                          </dl>
                        </div>
                      ) : (
                        <img src={record.image} alt={`${record.name} ${record.kind}`} draggable={false} />
                      )}
                    </article>
                  ))}
                  {magicRecordIndex === 0 ? (
                    <div className="magic-book-click-zones" aria-label="기록 책 선택">
                      <button type="button" aria-label="학생기록부 펼치기" onPointerDown={() => setMagicRecordIndex(1)} onClick={() => setMagicRecordIndex(1)} />
                      <button type="button" aria-label="경비근무일지 펼치기" onPointerDown={() => setMagicRecordIndex(2)} onClick={() => setMagicRecordIndex(2)} />
                      <button type="button" aria-label="교직원 기록 펼치기" onPointerDown={() => setMagicRecordIndex(3)} onClick={() => setMagicRecordIndex(3)} />
                    </div>
                  ) : null}
                  {magicRecordIndex !== 0 ? (
                    <button className="magic-record-back" type="button" aria-label="장부 목록으로 돌아가기" title="장부 목록" onClick={() => setMagicRecordIndex(0)}>
                      <img src="/samunmong/assets/magic-school/ui/icon-ledger-list-v1.png" alt="" draggable={false} />
                    </button>
                  ) : null}
                </section>
              </div>
            </div>
          ) : null}

          <div className="briefing-actions">
            {!isMagicTheme ? <>
              <button
                className="briefing-nav"
                id="briefingPrev"
                type="button"
                disabled={activeStep === 0}
                onClick={() => setJoseonStep(0)}
              >
                이전
              </button>
              <button
                className="briefing-nav primary"
                id="briefingNext"
                type="button"
                onClick={() => setJoseonStep(1)}
              >
                다음
              </button>
            </> : null}
            <button
              className={isMagicTheme ? "magic-start-case-button" : "briefing-nav"}
              id="startCase"
              type="button"
              aria-label={briefing.startLabel}
              onClick={isMagicTheme ? startMagicInvestigation : startJoseonInvestigation}
              style={isMagicTheme ? {
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
              } : undefined}
            >
              {isMagicTheme
                ? <MagicStartCaseButtonArt label={briefing.startLabel} />
                : briefing.startLabel}
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}
