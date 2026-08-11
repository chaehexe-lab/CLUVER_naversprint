import type { DreamOption, SceneDockAction, SceneHotspot, SceneProp } from "./gameTypes";

export const screenImages = {
  mainScreen: "/samunmong/assets/main-screen-v2.png",
  tutorialScreen: "/samunmong/assets/main-screen-v2.png",
  dreamScreen: "/samunmong/assets/main-screen-v2.png"
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
    "꿈에서 깨어나려면 각 사건을 조사하고, 증거와 증언의 모순을 밝혀내야 합니다.",
    "조사 화면의 힌트는 아직 찾지 못한 단서 위치를 잠깐 빛나게 해 주는 도구입니다."
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
    image: "/samunmong/assets/theme-joseon-murder.png",
    disabled: false
  },
  {
    id: "chooseMagicSchool",
    state: "PLAYABLE",
    kicker: "DREAM 02",
    title: "마법학교 방화사건",
    description: "불길은 꺼졌지만 주문을 건 이름은 아직 재 속에 남아 있습니다.",
    meta: "금서 · 마력 흔적 · 사라진 목격자",
    image: "/samunmong/assets/theme-magic-school.png",
    disabled: false
  },
  {
    id: "chooseSpaceStation",
    state: "PLAYABLE",
    kicker: "DREAM 03",
    title: "우주정거장 살인사건",
    description: "오르빗-13의 정전 이후, 한 우주비행사가 궤도 밖 어둠 속으로 사라졌습니다.",
    meta: "에어록 · 산소 기록 · 마지막 무전",
    image: "/assets/space-station/backgrounds/orbit-13-airlock.png",
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
    image: "/samunmong/assets/labels/transparent/tool-village-map.png",
    label: "마을 지도"
  },
  {
    className: "bag-chip open-bag-panel",
    ariaLabel: "보따리 열기",
    image: "/samunmong/assets/labels/transparent/tool-bag-short.png",
    label: "보따리"
  },
  {
    className: "tool-chip open-tool-panel",
    ariaLabel: "도구 열기",
    image: "/samunmong/assets/labels/transparent/tool-investigation-tools.png",
    label: "도구"
  },
  {
    className: "note-chip open-note-panel",
    ariaLabel: "기록장 열기",
    image: "/samunmong/assets/labels/transparent/tool-note-short.png",
    label: "기록장"
  },
  {
    className: "journal-chip",
    ariaLabel: "사건 일지 다시 보기",
    image: "/samunmong/assets/labels/transparent/tool-investigation-note.png",
    label: "사건 일지",
    goTo: "briefingScreen"
  },
  {
    className: "room-chip",
    ariaLabel: "취조실로 이동",
    image: "/samunmong/assets/labels/transparent/tool-interrogation-room.png",
    label: "취조실",
    goTo: "interrogationScreen"
  }
] satisfies SceneDockAction[];

export const fieldOneScene = {
  id: "fieldOne",
  image: "/samunmong/assets/scenes-integrated/scene-field-one-evidence-integrated.png",
  alt: "유문석 집 문 앞에 쓰러진 점순과 조사할 증거가 놓인 사건 현장",
  props: [] as SceneProp[],
  hotspots: [
    { evidenceName: "찢어진 약속 편지", ariaLabel: "찢어진 약속 편지 조사", x: "70.6%", y: "88.6%", w: "10.2%", h: "8.8%", clipPath: "polygon(7% 35%, 44% 8%, 94% 24%, 98% 76%, 32% 96%, 2% 70%)", radius: "12px", rot: "7deg" },
    { id: "hopaeHotspot", className: "hopae-glow", ariaLabel: "호패 조각 조사", x: "56.6%", y: "87.0%", w: "7.2%", h: "8.8%", clipPath: "polygon(26% 6%, 75% 8%, 96% 58%, 70% 96%, 24% 90%, 3% 43%)", radius: "14px", rot: "-10deg" }
  ] satisfies SceneHotspot[],
  dock: [
    { id: "openMapFromField", ...investigationDock[0], className: "map-chip" },
    { id: "openBagFromField", ...investigationDock[1], className: "bag-chip" },
    investigationDock[2],
    { id: "openNoteFromField", ...investigationDock[3], className: "note-chip" },
    investigationDock[4],
    investigationDock[5]
  ] satisfies SceneDockAction[],
  inspect: {
    id: "hopaeInspect",
    image: "/samunmong/assets/evidence-wooden-tag.png",
    title: "호패 조각",
    text: "특정 도구를 이용해 자세히 알아봐야 할 것 같다."
  }
} as const;

export const chunwolRoomScene = {
  id: "chunwolRoom",
  image: "/samunmong/assets/scenes-integrated/scene-chunwol-room-evidence-integrated.png",
  alt: "춘월의 방과 초상화 그림 증거",
  props: [] as SceneProp[],
  hotspots: [
    { evidenceName: "헐거워진 노리개", ariaLabel: "헐거워진 노리개 조사", x: "56.0%", y: "76.0%", w: "7.6%", h: "6.8%", clipPath: "ellipse(46% 38% at 50% 54%)", radius: "999px", rot: "-8deg" },
    { id: "portraitHotspot", className: "portrait-glow", ariaLabel: "돌쇠의 그림 조사", x: "63.0%", y: "59.8%", w: "8.0%", h: "20.5%", clipPath: "polygon(18% 4%, 92% 16%, 81% 98%, 8% 84%)", radius: "8px", rot: "4deg" }
  ] satisfies SceneHotspot[],
  dock: [
    { id: "openMapFromRoom", ...investigationDock[0], className: "map-chip" },
    { id: "openBagFromRoom", ...investigationDock[1], className: "bag-chip" },
    investigationDock[2],
    { id: "openNoteFromRoom", ...investigationDock[3], className: "note-chip" },
    investigationDock[4],
    investigationDock[5]
  ] satisfies SceneDockAction[],
  inspect: {
    id: "portraitInspect",
    image: "/samunmong/assets/evidence-portrait-v2.png",
    title: "돌쇠의 그림",
    text: "특정 도구를 이용해 자세히 알아봐야 할 것 같다.",
    buttonId: "collectPortrait",
    buttonLabel: "보따리에 넣기"
  }
} as const;

export const mudeokServantRoomScene = {
  id: "mudeokServantRoom",
  image: "/samunmong/assets/scenes-integrated/scene-mudeok-servant-room-evidence-integrated.png",
  alt: "무덕의 하인방",
  props: [] as SceneProp[],
  hotspots: [
    { evidenceName: "무덕의 번진 일기", ariaLabel: "무덕의 번진 일기 조사", x: "44.6%", y: "79.2%", w: "9.2%", h: "7.6%", clipPath: "polygon(10% 22%, 82% 5%, 96% 73%, 20% 96%)", radius: "8px", rot: "-6deg" },
    { evidenceName: "진흙 묻은 짚신", ariaLabel: "진흙 묻은 짚신 조사", x: "71.7%", y: "65.4%", w: "7.0%", h: "8.2%", clipPath: "ellipse(45% 40% at 50% 52%)", radius: "999px", rot: "-12deg" },
    { evidenceName: "찢어진 옷고름", ariaLabel: "찢어진 옷고름 조사", x: "28.0%", y: "81.8%", w: "8.0%", h: "6.4%", clipPath: "polygon(8% 45%, 92% 8%, 98% 42%, 18% 96%)", radius: "999px", rot: "-13deg" }
  ] satisfies SceneHotspot[],
  dock: [
    { id: "openMapFromMudeokRoom", ...investigationDock[0], className: "map-chip" },
    { id: "openBagFromMudeokRoom", ...investigationDock[1], className: "bag-chip" },
    investigationDock[2],
    { id: "openNoteFromMudeokRoom", ...investigationDock[3], className: "note-chip" },
    investigationDock[4],
    investigationDock[5]
  ] satisfies SceneDockAction[]
} as const;

export const yoomunseokSarangbangScene = {
  id: "yoomunseokSarangbang",
  image: "/samunmong/assets/scenes-integrated/scene-yoomunseok-sarangbang-evidence-integrated.png",
  alt: "유문석의 사랑방",
  props: [] as SceneProp[],
  hotspots: [
    { evidenceName: "빈 호패 주머니", ariaLabel: "빈 호패 주머니 조사", x: "21.0%", y: "79.0%", w: "9.0%", h: "13.0%", clipPath: "ellipse(42% 48% at 50% 52%)", radius: "999px", rot: "-9deg" },
    { evidenceName: "하인 장부", ariaLabel: "하인 장부 조사", x: "10.5%", y: "78.2%", w: "15.6%", h: "16.8%", clipPath: "polygon(4% 14%, 88% 4%, 98% 80%, 12% 96%)", radius: "10px", rot: "1deg" },
    { evidenceName: "혼서 조각", ariaLabel: "혼서 조각 조사", x: "64.4%", y: "75.8%", w: "12.8%", h: "7.4%", clipPath: "polygon(5% 24%, 90% 8%, 98% 70%, 28% 96%)", radius: "8px", rot: "5deg" }
  ] satisfies SceneHotspot[],
  dock: investigationDock
} as const;

export const dolsoeQuartersScene = {
  id: "dolsoeQuarters",
  image: "/samunmong/assets/scenes-integrated/scene-dolsoe-quarters-evidence-integrated.png",
  alt: "돌쇠의 처소",
  props: [] as SceneProp[],
  hotspots: [
    { evidenceName: "피 묻은 붕대", ariaLabel: "피 묻은 붕대 조사", x: "15.8%", y: "77.0%", w: "13.0%", h: "12.0%", clipPath: "polygon(8% 24%, 92% 8%, 98% 74%, 20% 96%)", radius: "12px", rot: "-8deg" },
    { evidenceName: "도망 보따리", ariaLabel: "도망 보따리 조사", x: "45.4%", y: "52.8%", w: "9.2%", h: "15.0%", clipPath: "ellipse(43% 48% at 50% 52%)", radius: "999px", rot: "-3deg" }
  ] satisfies SceneHotspot[],
  dock: investigationDock
} as const;

export const backGateCourtyardScene = {
  id: "backGateCourtyard",
  image: "/samunmong/assets/scenes-integrated/scene-back-gate-courtyard-evidence-integrated.png",
  alt: "대문 뒤쪽 뒷문 마당",
  props: [] as SceneProp[],
  hotspots: [
    { evidenceName: "작은 발자국", ariaLabel: "작은 발자국 조사", x: "59.0%", y: "72.8%", w: "11.2%", h: "10.6%", clipPath: "polygon(8% 34%, 24% 12%, 52% 18%, 68% 4%, 96% 34%, 82% 88%, 22% 96%)", radius: "999px", rot: "8deg" },
    { evidenceName: "끊어진 호패끈", ariaLabel: "끊어진 호패끈 조사", x: "36.4%", y: "87.6%", w: "14.4%", h: "6.8%", clipPath: "polygon(2% 60%, 36% 18%, 98% 34%, 78% 80%, 18% 96%)", radius: "999px", rot: "-14deg" }
  ] satisfies SceneHotspot[],
  dock: investigationDock
} as const;

const magicDock = [
  {
    className: "map-chip open-map-panel magic-chip",
    ariaLabel: "학교 지도 열기",
    image: "/samunmong/assets/magic-school/ui/icon-school-map.png",
    label: "학교 지도"
  },
  {
    className: "bag-chip open-bag-panel magic-chip",
    ariaLabel: "마법 가방 열기",
    image: "/samunmong/assets/magic-school/ui/icon-magic-bag.png",
    label: "마법 가방"
  },
  {
    className: "tool-chip open-tool-panel magic-chip",
    ariaLabel: "마력 도구 열기",
    image: "/samunmong/assets/magic-school/ui/icon-mana-tools.png",
    label: "마력 도구"
  },
  {
    className: "note-chip open-note-panel magic-chip",
    ariaLabel: "수사 일지 열기",
    image: "/samunmong/assets/magic-school/ui/icon-investigation-journal.png",
    label: "수사 일지"
  },
  {
    className: "room-chip magic-chip",
    ariaLabel: "교무 조사실로 이동",
    image: "/samunmong/assets/magic-school/ui/icon-staff-room.png",
    label: "교무 조사실",
    goTo: "interrogationScreen"
  }
] satisfies SceneDockAction[];

export const magicSchoolScenes = [
  {
    id: "magicAlchemyLab",
    image: "/samunmong/assets/magic-school/scenes/alchemy-lab.png",
    alt: "불탄 제1 연금술 실습실",
    props: [] as SceneProp[],
    hotspots: [
      { evidenceName: "부러진 지팡이", ariaLabel: "부러진 지팡이 조사", x: "58.2%", y: "76.0%", w: "13.5%", h: "8.8%", clipPath: "polygon(8% 48%, 90% 20%, 98% 56%, 16% 86%)", radius: "999px", rot: "-9deg" },
      { evidenceName: "화염 감지 룬스톤", ariaLabel: "화염 감지 룬스톤 조사", x: "30.5%", y: "66.0%", w: "14.0%", h: "15.0%", clipPath: "ellipse(46% 42% at 50% 52%)", radius: "999px", rot: "0deg" },
      { evidenceName: "기록의 수정구", ariaLabel: "기록의 수정구 조사", x: "75.2%", y: "78.4%", w: "10.5%", h: "11.5%", clipPath: "ellipse(44% 44% at 50% 50%)", radius: "999px", rot: "0deg" }
    ] satisfies SceneHotspot[],
    dock: magicDock
  },
  {
    id: "magicCleaningCloset",
    image: "/samunmong/assets/magic-school/scenes/cleaning-closet.png",
    alt: "연금술 실습실 옆 청소도구함",
    props: [] as SceneProp[],
    hotspots: [
      { evidenceName: "금지된 마법 담배 재", ariaLabel: "금지된 마법 담배 재 조사", x: "43.4%", y: "58.2%", w: "13.0%", h: "13.5%", clipPath: "ellipse(44% 36% at 50% 56%)", radius: "999px", rot: "0deg" }
    ] satisfies SceneHotspot[],
    dock: magicDock
  },
  {
    id: "magicLibrary",
    image: "/samunmong/assets/magic-school/scenes/library.png",
    alt: "마법학교 도서관",
    props: [] as SceneProp[],
    hotspots: [
      { evidenceName: "도서관 대출 기록부", ariaLabel: "도서관 대출 기록부 조사", x: "6.6%", y: "70.0%", w: "27.0%", h: "17.0%", clipPath: "polygon(3% 12%, 94% 8%, 98% 78%, 12% 96%)", radius: "12px", rot: "0deg" },
      { evidenceName: "빙결 흔적이 남은 반납 도서", ariaLabel: "빙결 흔적이 남은 반납 도서 조사", x: "45.0%", y: "72.2%", w: "18.0%", h: "15.0%", clipPath: "polygon(8% 16%, 88% 4%, 98% 78%, 18% 96%)", radius: "10px", rot: "-4deg" }
    ] satisfies SceneHotspot[],
    dock: magicDock
  },
  {
    id: "magicRecordCrystalRoom",
    image: "/samunmong/assets/magic-school/scenes/record-crystal-room.png",
    alt: "기록 수정구실",
    props: [] as SceneProp[],
    hotspots: [
      { evidenceName: "조작된 기록 수정구", ariaLabel: "조작된 기록 수정구 조사", x: "39.4%", y: "25.0%", w: "24.0%", h: "34.0%", clipPath: "ellipse(47% 46% at 50% 50%)", radius: "999px", rot: "0deg" }
    ] satisfies SceneHotspot[],
    dock: magicDock
  },
  {
    id: "magicDormHallway",
    image: "/samunmong/assets/magic-school/scenes/dorm-hallway.png",
    alt: "학생들 기숙사 복도",
    props: [] as SceneProp[],
    hotspots: [
      { evidenceName: "버려진 지팡이 조각", ariaLabel: "버려진 지팡이 조각 조사", x: "48.0%", y: "80.0%", w: "14.0%", h: "7.0%", clipPath: "polygon(4% 48%, 96% 18%, 98% 58%, 12% 90%)", radius: "999px", rot: "-4deg" }
    ] satisfies SceneHotspot[],
    dock: magicDock
  }
] as const;

const spaceDock = [
  {
    className: "map-chip open-map-panel",
    ariaLabel: "궤도 도면 열기",
    image: "/assets/space-station/ui-icons-v3/orbit-blueprint.png",
    label: "궤도 도면"
  },
  {
    className: "bag-chip open-bag-panel",
    ariaLabel: "증거 보관함 열기",
    image: "/assets/space-station/ui-icons-v3/evidence-vault.png",
    label: "증거 보관함"
  },
  {
    className: "tool-chip open-tool-panel",
    ariaLabel: "스캔 도구 열기",
    image: "/assets/space-station/ui-icons-v3/scan-tool.png",
    label: "스캔 도구"
  },
  {
    className: "note-chip open-note-panel",
    ariaLabel: "로그 기록 열기",
    image: "/assets/space-station/ui-icons-v3/log-record.png",
    label: "로그 기록"
  },
  {
    className: "room-chip",
    ariaLabel: "비상 조사실로 이동",
    image: "/assets/space-station/ui-icons-v2/emergency-investigation-v2.png",
    label: "비상 조사실",
    goTo: "interrogationScreen"
  }
] satisfies SceneDockAction[];

export const spaceStationScenes = [
  {
    id: "spaceAirlock",
    image: "/assets/space-station/backgrounds/orbit-13-airlock.png",
    alt: "오르빗-13 에어록과 외부 작업 사고 현장",
    props: [
      { image: "/assets/space-station/evidence/frozen-lever-gel.png", alt: "얼어붙은 레버 젤", x: "67%", y: "73%", w: "12%", rot: "-8deg" },
      { image: "/assets/space-station/evidence/final-radio-log.png", alt: "마지막 무전 로그", x: "82%", y: "82%", w: "10%", rot: "6deg" }
    ] satisfies SceneProp[],
    hotspots: [
      { evidenceName: "얼어붙은 추진 레버 젤", ariaLabel: "얼어붙은 추진 레버 젤 조사", x: "67%", y: "73%", w: "12%", h: "13%", clipPath: "ellipse(45% 42% at 50% 52%)", radius: "999px", rot: "-8deg" },
      { evidenceName: "마지막 무전 로그", ariaLabel: "마지막 무전 로그 조사", x: "82%", y: "82%", w: "10%", h: "12%", clipPath: "polygon(8% 12%, 90% 6%, 98% 82%, 20% 96%)", radius: "12px", rot: "6deg" }
    ] satisfies SceneHotspot[],
    dock: spaceDock
  },
  {
    id: "spaceMedicalBay",
    image: "/assets/space-station/backgrounds/medical-bay.png",
    alt: "오르빗-13 의료실",
    props: [
      { image: "/assets/space-station/evidence/disinfectant-cloth-glove.png", alt: "소독천과 장갑", x: "41%", y: "76%", w: "13%", rot: "-3deg" },
      { image: "/assets/space-station/evidence/deleted-medical-record.png", alt: "삭제된 의료 기록", x: "62%", y: "68%", w: "13%", rot: "4deg" }
    ] satisfies SceneProp[],
    hotspots: [
      { evidenceName: "소독천과 장갑", ariaLabel: "소독천과 장갑 조사", x: "41%", y: "76%", w: "13%", h: "12%", clipPath: "ellipse(45% 39% at 50% 52%)", radius: "999px", rot: "-3deg" },
      { evidenceName: "삭제된 의료 기록", ariaLabel: "삭제된 의료 기록 조사", x: "62%", y: "68%", w: "13%", h: "15%", clipPath: "polygon(6% 8%, 92% 12%, 96% 86%, 10% 92%)", radius: "12px", rot: "4deg" }
    ] satisfies SceneHotspot[],
    dock: spaceDock
  },
  {
    id: "spaceOxygenGenerator",
    image: "/assets/space-station/backgrounds/oxygen-generator.png",
    alt: "오르빗-13 산소 발생기실",
    props: [
      { image: "/assets/space-station/evidence/damaged-pressure-sensor.png", alt: "손상된 압력 센서", x: "54%", y: "67%", w: "12%", rot: "2deg" }
    ] satisfies SceneProp[],
    hotspots: [
      { evidenceName: "손상된 압력 센서", ariaLabel: "손상된 압력 센서 조사", x: "54%", y: "67%", w: "12%", h: "12%", clipPath: "ellipse(45% 42% at 50% 50%)", radius: "999px", rot: "2deg" }
    ] satisfies SceneHotspot[],
    dock: spaceDock
  },
  {
    id: "spaceDataCore",
    image: "/assets/space-station/backgrounds/data-core.png",
    alt: "오르빗-13 데이터 코어",
    props: [
      { image: "/assets/space-station/evidence/access-keycard-chip.png", alt: "접속 키카드 칩", x: "58%", y: "74%", w: "10%", rot: "-7deg" }
    ] satisfies SceneProp[],
    hotspots: [
      { evidenceName: "접속 키카드 칩", ariaLabel: "접속 키카드 칩 조사", x: "58%", y: "74%", w: "10%", h: "11%", clipPath: "polygon(8% 18%, 86% 8%, 96% 70%, 24% 96%)", radius: "12px", rot: "-7deg" }
    ] satisfies SceneHotspot[],
    dock: spaceDock
  },
  {
    id: "spaceSuitPrep",
    image: "/assets/space-station/backgrounds/suit-prep.png",
    alt: "오르빗-13 외부 작업 준비실",
    props: [
      { image: "/assets/space-station/evidence/engineer-tool-clamp.png", alt: "엔지니어 공구 클램프", x: "43%", y: "80%", w: "13%", rot: "9deg" }
    ] satisfies SceneProp[],
    hotspots: [
      { evidenceName: "엔지니어 공구 클램프", ariaLabel: "엔지니어 공구 클램프 조사", x: "43%", y: "80%", w: "13%", h: "10%", clipPath: "polygon(6% 38%, 88% 14%, 98% 54%, 18% 88%)", radius: "999px", rot: "9deg" }
    ] satisfies SceneHotspot[],
    dock: spaceDock
  },
  {
    id: "spaceGalleyCorridor",
    image: "/assets/space-station/backgrounds/galley-corridor.png",
    alt: "오르빗-13 주방 복도",
    props: [
      { image: "/assets/space-station/evidence/coffee-tumbler.png", alt: "커피 텀블러", x: "66%", y: "79%", w: "8%", rot: "-5deg" }
    ] satisfies SceneProp[],
    hotspots: [
      { evidenceName: "커피 텀블러", ariaLabel: "커피 텀블러 조사", x: "66%", y: "79%", w: "8%", h: "12%", clipPath: "ellipse(38% 48% at 50% 50%)", radius: "999px", rot: "-5deg" }
    ] satisfies SceneHotspot[],
    dock: spaceDock
  },
  {
    id: "spaceScienceLab",
    image: "/assets/space-station/backgrounds/science-lab.png",
    alt: "오르빗-13 과학 실험실",
    props: [] as SceneProp[],
    hotspots: [] as SceneHotspot[],
    dock: spaceDock
  }
] as const;
