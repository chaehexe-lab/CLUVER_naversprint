import type { DreamOption, SceneDockAction, SceneHotspot, SceneProp } from "./gameTypes";

export const screenImages = {
  mainScreen: "/samunmong/assets/main-screen-v2.webp",
  tutorialScreen: "/samunmong/assets/main-screen-v2.webp",
  dreamScreen: "/samunmong/assets/main-screen-v2.webp"
} as const;

export const mainMenu = [
  { id: "newDream", label: "NEW DREAM", menuY: "53.9%" },
  { id: "continueDream", label: "CONTINUE", menuY: "60.8%" },
  { id: "openSettings", label: "SETTINGS", menuY: "67.8%" },
  { id: "exitGame", label: "EXIT", menuY: "75%" }
] as const;

export const tutorialCopy = {
  title: "꿈에서 깨어나는 법",
  paragraphs: [
    "당신은 세 개의 꿈속 사건을 맡았습니다.",
    "꿈에서 깨어나려면 각 사건을 조사하고, 증거와 증언의 모순을 밝혀내야 합니다."
  ]
} as const;

export const dreamOptions: DreamOption[] = [
  {
    id: "chooseJoseon",
    state: "PLAYABLE",
    kicker: "DREAM 01",
    title: "조선시대 살인사건",
    description: "문 앞에 쓰러진 사람, 곁에 남은 호패 조각 하나가 모두의 관계를 뒤집습니다.",
    meta: "호패 조각 · 젖은 발자국 · 거짓 증언",
    image: "/samunmong/assets/theme-joseon-murder.webp",
    disabled: false
  },
  {
    id: "chooseMagicSchool",
    state: "PLAYABLE",
    kicker: "DREAM 02",
    title: "마법학교 방화사건",
    description: "불길은 꺼졌지만 주문을 건 이름은 아직 재 속에 남아 있습니다.",
    meta: "금서 · 마력 흔적 · 사라진 목격자",
    image: "/samunmong/assets/theme-magic-school.webp",
    disabled: false
  },
  {
    id: "chooseSpaceStation",
    state: "PLAYABLE",
    kicker: "DREAM 03",
    title: "우주정거장 살인사건",
    description: "오르빗-13의 정전 이후, 한 우주비행사가 궤도 밖 어둠 속으로 사라졌습니다.",
    meta: "에어록 · 산소 기록 · 마지막 무전",
    image: "/assets/space-station/backgrounds/orbit-13-airlock.webp",
    disabled: false
  }
] as const;

export const briefing = {
  title: "조선시대 살인사건",
  startLabel: "수사 시작"
} as const;

const investigationDock = [
  {
    className: "map-chip open-map-panel",
    ariaLabel: "마을 지도 열기",
    image: "/samunmong/assets/labels/transparent/tool-village-map.webp",
    label: "마을 지도"
  },
  {
    className: "bag-chip open-bag-panel",
    ariaLabel: "보따리 열기",
    image: "/samunmong/assets/labels/transparent/tool-bag-short.webp",
    label: "보따리"
  },
  {
    className: "note-chip open-note-panel",
    ariaLabel: "기록장 열기",
    image: "/samunmong/assets/labels/transparent/tool-note-short.webp",
    label: "기록장"
  },
  {
    className: "journal-chip",
    ariaLabel: "사건 일지 다시 보기",
    image: "/samunmong/assets/labels/transparent/tool-investigation-note.webp",
    label: "사건 일지",
    goTo: "briefingScreen"
  },
  {
    className: "room-chip",
    ariaLabel: "취조실로 이동",
    image: "/samunmong/assets/labels/transparent/tool-interrogation-room.webp",
    label: "취조실",
    goTo: "interrogationScreen"
  }
] satisfies SceneDockAction[];

export const fieldOneScene = {
  id: "fieldOne",
  image: "/samunmong/assets/scenes-integrated/scene-field-one-clean-v3.png",
  alt: "유문석 집 문 앞에 쓰러진 점순과 조사할 증거가 놓인 사건 현장",
  props: [] as SceneProp[],
  hotspots: [
    { className: "scene-evidence-object field-letter-evidence", evidenceName: "찢어진 약속 편지", ariaLabel: "찢어진 편지 조각 조사", x: "72.7%", y: "87.3%", w: "8.2%", h: "8.5%", clipPath: "polygon(7% 35%, 44% 8%, 94% 24%, 98% 76%, 32% 96%, 2% 70%)", radius: "12px", rot: "7deg" },
    { id: "hopaeHotspot", className: "scene-evidence-object field-hopae-evidence hopae-glow", evidenceName: "호패 조각", ariaLabel: "글자 지워진 나무패 조사", x: "62.8%", y: "87.2%", w: "5.2%", h: "8.5%", clipPath: "polygon(26% 6%, 75% 8%, 96% 58%, 70% 96%, 24% 90%, 3% 43%)", radius: "14px", rot: "-10deg" }
  ] satisfies SceneHotspot[],
  dock: [
    { id: "openMapFromField", ...investigationDock[0], className: "map-chip" },
    { id: "openBagFromField", ...investigationDock[1], className: "bag-chip" },
    { id: "openNoteFromField", ...investigationDock[2], className: "note-chip" },
    investigationDock[3],
    investigationDock[4]
  ] satisfies SceneDockAction[],
  inspect: {
    id: "hopaeInspect",
    image: "/samunmong/assets/evidence-wooden-tag.webp",
    title: "글자 지워진 나무패",
    text: "특정 도구를 이용해 자세히 알아봐야 할 것 같다.",
    closeButtonId: "closeHopaeInspect",
    closeButtonLabel: "호패 조각 팝업 닫기"
  }
} as const;

export const chunwolRoomScene = {
  id: "chunwolRoom",
  image: "/samunmong/assets/scenes-integrated/scene-chunwol-room-clean-v3.png",
  alt: "춘월의 방과 초상화 그림 증거",
  props: [] as SceneProp[],
  hotspots: [
    { id: "portraitHotspot", className: "scene-evidence-object portrait-glow", evidenceName: "돌쇠의 그림", ariaLabel: "붉은 끈으로 묶인 의문의 두루마리 조사", x: "74%", y: "55.5%", w: "8%", h: "18%", clipPath: "polygon(18% 4%, 92% 16%, 81% 98%, 8% 84%)", radius: "8px", rot: "4deg" }
  ] satisfies SceneHotspot[],
  lights: [{ x: "27.6%", y: "58.2%", size: "7.5%", strength: 0.38 }],
  dock: [
    { id: "openMapFromRoom", ...investigationDock[0], className: "map-chip" },
    { id: "openBagFromRoom", ...investigationDock[1], className: "bag-chip" },
    { id: "openNoteFromRoom", ...investigationDock[2], className: "note-chip" },
    investigationDock[3],
    investigationDock[4]
  ] satisfies SceneDockAction[],
  inspect: {
    id: "portraitInspect",
    image: "/samunmong/assets/evidence-transparent/evidence-portrait-concealed-v1.png",
    title: "의문의 그림",
    text: "특정 도구를 이용해 자세히 알아봐야 할 것 같다.",
    buttonId: "collectPortrait",
    buttonLabel: "보따리에 넣기"
  }
} as const;

export const mudeokServantRoomScene = {
  id: "mudeokServantRoom",
  image: "/samunmong/assets/scenes-integrated/scene-mudeok-servant-room-clean-v3.png",
  alt: "무덕의 하인방",
  props: [] as SceneProp[],
  hotspots: [
    { className: "scene-evidence-object mudeok-diary-evidence", evidenceName: "무덕의 번진 일기", ariaLabel: "무덕의 번진 일기 조사", x: "48.5%", y: "80.5%", w: "12%", h: "11%", clipPath: "polygon(10% 22%, 82% 5%, 96% 73%, 20% 96%)", radius: "8px", rot: "-2deg" },
    { className: "scene-evidence-object mudeok-shoes-evidence", evidenceName: "진흙 묻은 짚신", ariaLabel: "진흙 묻은 짚신 조사", x: "69.5%", y: "61.5%", w: "9%", h: "12%", clipPath: "ellipse(45% 40% at 50% 52%)", radius: "999px", rot: "-12deg" },
    { className: "scene-evidence-object mudeok-tie-evidence", evidenceName: "찢어진 옷고름", ariaLabel: "찢어진 옷고름 조사", x: "25.5%", y: "88%", w: "15%", h: "12%", clipPath: "polygon(8% 45%, 92% 8%, 98% 42%, 18% 96%)", radius: "999px", rot: "-13deg" }
  ] satisfies SceneHotspot[],
  lights: [{ x: "36.2%", y: "72%", size: "7%", strength: 0.36 }, { x: "78.4%", y: "23.2%", size: "4%", strength: 0.24, delay: "-1.1s" }],
  dock: [
    { id: "openMapFromMudeokRoom", ...investigationDock[0], className: "map-chip" },
    { id: "openBagFromMudeokRoom", ...investigationDock[1], className: "bag-chip" },
    { id: "openNoteFromMudeokRoom", ...investigationDock[2], className: "note-chip" },
    investigationDock[3],
    investigationDock[4]
  ] satisfies SceneDockAction[]
} as const;

export const yoomunseokSarangbangScene = {
  id: "yoomunseokSarangbang",
  image: "/samunmong/assets/scenes-integrated/scene-yoomunseok-sarangbang-clean-v3.png",
  alt: "유문석의 사랑방",
  props: [] as SceneProp[],
  hotspots: [
    { className: "scene-evidence-object yoomunseok-holder-evidence", evidenceName: "빈 호패 주머니", ariaLabel: "빈 호패 주머니 조사", x: "27%", y: "83%", w: "12%", h: "18%", clipPath: "ellipse(42% 48% at 50% 52%)", radius: "999px", rot: "-5deg" },
    { className: "scene-evidence-object yoomunseok-ledger-evidence", evidenceName: "하인 장부", ariaLabel: "하인 장부 조사", x: "45.5%", y: "69.5%", w: "16%", h: "14%", clipPath: "polygon(4% 14%, 88% 4%, 98% 80%, 12% 96%)", radius: "10px", rot: "1deg" },
    { className: "scene-evidence-object yoomunseok-marriage-evidence", evidenceName: "혼서 조각", ariaLabel: "혼서 조각 조사", x: "65.5%", y: "76%", w: "14%", h: "14%", clipPath: "polygon(5% 24%, 90% 8%, 98% 70%, 28% 96%)", radius: "8px", rot: "5deg" }
  ] satisfies SceneHotspot[],
  lights: [{ x: "6.2%", y: "50.8%", size: "8%", strength: 0.34 }, { x: "36.6%", y: "53.4%", size: "6%", strength: 0.32, delay: "-.8s" }, { x: "95.2%", y: "23.8%", size: "5%", strength: 0.25, delay: "-1.4s" }],
  dock: investigationDock
} as const;

export const dolsoeQuartersScene = {
  id: "dolsoeQuarters",
  image: "/samunmong/assets/scenes-integrated/scene-dolsoe-quarters-clean-v3.png",
  alt: "돌쇠의 처소",
  props: [] as SceneProp[],
  hotspots: [
    { className: "scene-evidence-object dolsoe-bandage-evidence", evidenceName: "피 묻은 붕대", ariaLabel: "피 묻은 붕대 조사", x: "16%", y: "80%", w: "13%", h: "11%", clipPath: "polygon(8% 24%, 92% 8%, 98% 74%, 20% 96%)", radius: "12px", rot: "-8deg" },
    { className: "scene-evidence-object dolsoe-bundle-evidence", evidenceName: "도망 보따리", ariaLabel: "도망 보따리 조사", x: "48.5%", y: "40.5%", w: "12%", h: "16%", clipPath: "ellipse(43% 48% at 50% 52%)", radius: "999px", rot: "-3deg" }
  ] satisfies SceneHotspot[],
  lights: [{ x: "7.3%", y: "45.7%", size: "5%", strength: 0.3 }, { x: "55.3%", y: "31.5%", size: "6%", strength: 0.34, delay: "-.9s" }],
  dock: investigationDock
} as const;

export const backGateCourtyardScene = {
  id: "backGateCourtyard",
  image: "/samunmong/assets/scenes-integrated/scene-back-gate-courtyard-clean-v3.png",
  alt: "대문 뒤쪽 뒷문 마당",
  props: [] as SceneProp[],
  hotspots: [
    { className: "scene-evidence-object backgate-footprints-evidence", evidenceName: "작은 발자국", ariaLabel: "작은 발자국 조사", x: "58%", y: "77.5%", w: "8%", h: "16%", clipPath: "polygon(8% 34%, 24% 12%, 52% 18%, 68% 4%, 96% 34%, 82% 88%, 22% 96%)", radius: "999px", rot: "8deg" },
    { className: "scene-evidence-object backgate-cord-evidence", evidenceName: "끊어진 호패끈", ariaLabel: "끊어진 호패끈 조사", x: "17.8%", y: "81.8%", w: "14.2%", h: "11.5%", clipPath: "polygon(1% 43%, 18% 20%, 49% 5%, 82% 19%, 99% 48%, 84% 78%, 52% 96%, 17% 84%)", radius: "999px", rot: "-5deg" }
  ] satisfies SceneHotspot[],
  lights: [{ x: "70.5%", y: "28.5%", size: "7%", strength: 0.4 }],
  dock: investigationDock
} as const;

const magicDock = [
  {
    className: "map-chip open-map-panel magic-chip",
    ariaLabel: "학교 지도 열기",
    image: "/samunmong/assets/magic-school/ui/icon-school-map.webp",
    label: "학교 지도"
  },
  {
    className: "bag-chip open-bag-panel magic-chip",
    ariaLabel: "마법 가방 열기",
    image: "/samunmong/assets/magic-school/ui/icon-magic-bag.webp",
    label: "마법 가방"
  },
  {
    className: "tool-chip open-tool-panel magic-chip",
    ariaLabel: "마력 도구 열기",
    image: "/samunmong/assets/magic-school/ui/icon-mana-tools.webp",
    label: "마력 도구"
  },
  {
    className: "note-chip open-note-panel magic-chip",
    ariaLabel: "수사 일지 열기",
    image: "/samunmong/assets/magic-school/ui/icon-investigation-journal.webp",
    label: "수사 일지"
  },
  {
    className: "room-chip magic-chip",
    ariaLabel: "교무 조사실로 이동",
    image: "/samunmong/assets/magic-school/ui/icon-staff-room.webp",
    label: "교무 조사실",
    goTo: "interrogationScreen"
  }
] satisfies SceneDockAction[];

export const magicSchoolScenes = [
  {
    id: "magicAlchemyLab",
    image: "/samunmong/assets/magic-school/scenes/alchemy-lab.webp",
    alt: "불탄 제1 연금술 실습실",
    props: [] as SceneProp[],
    hotspots: [
      { evidenceName: "부러진 지팡이", ariaLabel: "부러진 지팡이 조사", x: "62.1%", y: "81.0%", w: "13.5%", h: "8.8%", clipPath: "polygon(8% 48%, 90% 20%, 98% 56%, 16% 86%)", radius: "999px", rot: "-9deg" },
      { evidenceName: "화염 감지 룬스톤", ariaLabel: "화염 감지 룬스톤 조사", x: "28.6%", y: "66.4%", w: "14.0%", h: "15.0%", clipPath: "ellipse(46% 42% at 50% 52%)", radius: "999px", rot: "0deg" },
      { evidenceName: "기록의 수정구", ariaLabel: "기록의 수정구 조사", x: "75.5%", y: "78.0%", w: "10.5%", h: "11.5%", clipPath: "ellipse(44% 44% at 50% 50%)", radius: "999px", rot: "0deg" }
    ] satisfies SceneHotspot[],
    dock: magicDock
  },
  {
    id: "magicCleaningCloset",
    image: "/samunmong/assets/magic-school/scenes/cleaning-closet.webp",
    alt: "연금술 실습실 옆 청소도구함",
    props: [] as SceneProp[],
    hotspots: [
      { evidenceName: "금지된 마법 담배 재", ariaLabel: "금지된 마법 담배 재 조사", x: "50.4%", y: "61.7%", w: "13.0%", h: "13.5%", clipPath: "ellipse(44% 36% at 50% 56%)", radius: "999px", rot: "0deg" }
    ] satisfies SceneHotspot[],
    dock: magicDock
  },
  {
    id: "magicLibrary",
    image: "/samunmong/assets/magic-school/scenes/library.webp",
    alt: "마법학교 도서관",
    props: [] as SceneProp[],
    hotspots: [
      { evidenceName: "도서관 대출 기록부", ariaLabel: "도서관 대출 기록부 조사", x: "21.4%", y: "76.4%", w: "30.0%", h: "19.0%", clipPath: "polygon(3% 12%, 94% 8%, 98% 78%, 12% 96%)", radius: "12px", rot: "0deg" },
      { evidenceName: "빙결 흔적이 남은 반납 도서", ariaLabel: "빙결 흔적이 남은 반납 도서 조사", x: "60.7%", y: "74.6%", w: "19.0%", h: "17.0%", clipPath: "polygon(8% 16%, 88% 4%, 98% 78%, 18% 96%)", radius: "10px", rot: "-4deg" }
    ] satisfies SceneHotspot[],
    dock: magicDock
  },
  {
    id: "magicRecordCrystalRoom",
    image: "/samunmong/assets/magic-school/scenes/record-crystal-room.webp",
    alt: "기록 수정구실",
    props: [] as SceneProp[],
    hotspots: [
      { evidenceName: "조작된 기록 수정구", ariaLabel: "조작된 기록 수정구 조사", x: "51.0%", y: "35.5%", w: "24.0%", h: "38.0%", clipPath: "ellipse(47% 46% at 50% 50%)", radius: "999px", rot: "0deg" }
    ] satisfies SceneHotspot[],
    dock: magicDock
  },
  {
    id: "magicDormHallway",
    image: "/samunmong/assets/magic-school/scenes/dorm-hallway.webp",
    alt: "학생들 기숙사 복도",
    props: [] as SceneProp[],
    hotspots: [
      { evidenceName: "버려진 지팡이 조각", ariaLabel: "버려진 지팡이 조각 조사", x: "58.8%", y: "82.0%", w: "15.0%", h: "7.0%", clipPath: "polygon(4% 48%, 96% 18%, 98% 58%, 12% 90%)", radius: "999px", rot: "-4deg" }
    ] satisfies SceneHotspot[],
    dock: magicDock
  }
] as const;

export { spaceStationScenes } from "./spaceStationTheme";
