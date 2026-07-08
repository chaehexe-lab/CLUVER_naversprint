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
    image: "/samunmong/assets/theme-joseon-murder.png",
    disabled: false
  },
  {
    state: "LOCKED",
    kicker: "DREAM 02",
    title: "마법학교 방화사건",
    description: "불길은 꺼졌지만 주문을 건 이름은 아직 재 속에 남아 있습니다.",
    meta: "금서 · 마력 흔적 · 사라진 목격자",
    image: "/samunmong/assets/theme-magic-school.png",
    disabled: true,
    ariaLabel: "마법학교 방화사건은 아직 잠겨 있습니다"
  },
  {
    state: "LOCKED",
    kicker: "DREAM 03",
    title: "우주정거장 살인사건",
    description: "중력이 사라진 복도 안, 시체만이 제자리를 떠나지 못했습니다.",
    meta: "폐쇄 공간 · 산소 기록 · 사라진 카메라",
    image: "/samunmong/assets/theme-space-station.png",
    disabled: true,
    ariaLabel: "우주정거장 살인사건은 아직 잠겨 있습니다"
  }
] as const;

export const briefing = {
  title: "조선시대 살인사건",
  startLabel: "현장으로 이동"
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
    { evidenceName: "찢어진 문서 조각", ariaLabel: "찢어진 문서 조각 조사", x: "69.2%", y: "83.4%", w: "7.8%", h: "8.2%" },
    { id: "hopaeHotspot", className: "hopae-glow", ariaLabel: "호패 조각 조사", x: "55.2%", y: "84.2%", w: "7.2%", h: "8.6%" }
  ] satisfies SceneHotspot[],
  dock: [
    { id: "openMapFromField", ...investigationDock[0], className: "map-chip" },
    { id: "openBagFromField", ...investigationDock[1], className: "bag-chip" },
    investigationDock[2],
    { id: "openNoteFromField", ...investigationDock[3], className: "note-chip" },
    investigationDock[4]
  ] satisfies SceneDockAction[],
  inspect: {
    id: "hopaeInspect",
    image: "/samunmong/assets/evidence-wooden-tag.png",
    title: "호패 조각 발견",
    text: "신분을 밝히는 호패로 추정되는 나무 조각을 발견했다. 일부 글자가 긁혀 있어 주인을 바로 알 수 없다.",
    buttonId: "collectHopae",
    buttonLabel: "보따리에 넣기"
  }
} as const;

export const chunwolRoomScene = {
  id: "chunwolRoom",
  image: "/samunmong/assets/scenes-integrated/scene-chunwol-room-evidence-integrated.png",
  alt: "춘월의 방과 초상화 그림 증거",
  props: [] as SceneProp[],
  hotspots: [
    { evidenceName: "사라진 노리개", ariaLabel: "사라진 노리개 조사", x: "54.5%", y: "76.8%", w: "6.4%", h: "7.4%" },
    { id: "portraitHotspot", className: "portrait-glow", ariaLabel: "돌쇠의 그림 조사", x: "63.4%", y: "55.9%", w: "112px", h: "150px" }
  ] satisfies SceneHotspot[],
  dock: [
    { id: "openMapFromRoom", ...investigationDock[0], className: "map-chip" },
    { id: "openBagFromRoom", ...investigationDock[1], className: "bag-chip" },
    investigationDock[2],
    { id: "openNoteFromRoom", ...investigationDock[3], className: "note-chip" },
    investigationDock[4]
  ] satisfies SceneDockAction[],
  inspect: {
    id: "portraitInspect",
    image: "/samunmong/assets/evidence-portrait.png",
    title: "돌쇠의 그림 발견",
    text: "춘월의 방에서 돌쇠를 그린 듯한 초상화를 발견했다. 그림의 보관 상태가 지나치게 조심스럽다.",
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
    { evidenceName: "무덕의 번진 일기", ariaLabel: "무덕의 번진 일기 조사", x: "47.8%", y: "80.2%", w: "7.4%", h: "6.8%" },
    { evidenceName: "진흙 묻은 짚신", ariaLabel: "진흙 묻은 짚신 조사", x: "75.6%", y: "68.8%", w: "7.6%", h: "7.4%" },
    { evidenceName: "찢어진 옷고름", ariaLabel: "찢어진 옷고름 조사", x: "30.2%", y: "66.4%", w: "6.6%", h: "7.2%" },
    { evidenceName: "손톱 밑 실타래", ariaLabel: "손톱 밑 실타래 조사", x: "41.2%", y: "73.4%", w: "5.2%", h: "5.8%" },
    { evidenceName: "점순 목 검안 종이", ariaLabel: "점순 목 검안 종이 조사", x: "53.4%", y: "80.6%", w: "7.0%", h: "6.8%" }
  ] satisfies SceneHotspot[],
  dock: [
    { id: "openMapFromMudeokRoom", ...investigationDock[0], className: "map-chip" },
    { id: "openBagFromMudeokRoom", ...investigationDock[1], className: "bag-chip" },
    investigationDock[2],
    { id: "openNoteFromMudeokRoom", ...investigationDock[3], className: "note-chip" },
    investigationDock[4]
  ] satisfies SceneDockAction[]
} as const;

export const yoomunseokSarangbangScene = {
  id: "yoomunseokSarangbang",
  image: "/samunmong/assets/scenes-integrated/scene-yoomunseok-sarangbang-evidence-integrated.png",
  alt: "유문석의 사랑방",
  props: [] as SceneProp[],
  hotspots: [
    { evidenceName: "빈 호패 주머니", ariaLabel: "빈 호패 주머니 조사", x: "30.4%", y: "69.2%", w: "6.8%", h: "7.0%" },
    { evidenceName: "나무 상자", ariaLabel: "나무 상자 조사", x: "28.4%", y: "66.8%", w: "7.4%", h: "7.6%" },
    { evidenceName: "하인 장부", ariaLabel: "하인 장부 조사", x: "22.6%", y: "72.4%", w: "8.4%", h: "7.6%" },
    { evidenceName: "종이칼", ariaLabel: "종이칼 조사", x: "63.2%", y: "68.8%", w: "7.0%", h: "6.8%" },
    { evidenceName: "먹가루", ariaLabel: "먹가루 조사", x: "68.2%", y: "71.8%", w: "6.2%", h: "6.0%" },
    { evidenceName: "혼서 조각", ariaLabel: "혼서 조각 조사", x: "53.2%", y: "69.8%", w: "7.4%", h: "6.4%" }
  ] satisfies SceneHotspot[],
  dock: investigationDock
} as const;

export const dolsoeQuartersScene = {
  id: "dolsoeQuarters",
  image: "/samunmong/assets/scenes-integrated/scene-dolsoe-quarters-evidence-integrated.png",
  alt: "돌쇠의 처소",
  props: [] as SceneProp[],
  hotspots: [
    { evidenceName: "낡은 칼", ariaLabel: "낡은 칼 조사", x: "78.8%", y: "64.8%", w: "7.2%", h: "8.8%" },
    { evidenceName: "피 묻은 붕대", ariaLabel: "피 묻은 붕대 조사", x: "21.6%", y: "68.4%", w: "8.2%", h: "7.6%" },
    { evidenceName: "도망 보따리", ariaLabel: "도망 보따리 조사", x: "31.8%", y: "54.8%", w: "8.0%", h: "8.4%" }
  ] satisfies SceneHotspot[],
  dock: investigationDock
} as const;

export const backGateCourtyardScene = {
  id: "backGateCourtyard",
  image: "/samunmong/assets/scenes-integrated/scene-back-gate-courtyard-evidence-integrated.png",
  alt: "대문 뒤쪽 뒷문 마당",
  props: [] as SceneProp[],
  hotspots: [
    { evidenceName: "작은 발자국", ariaLabel: "작은 발자국 조사", x: "51.2%", y: "73.4%", w: "9.4%", h: "8.0%" },
    { evidenceName: "끊어진 호패끈", ariaLabel: "끊어진 호패끈 조사", x: "64.6%", y: "68.8%", w: "7.0%", h: "6.4%" },
    { evidenceName: "맞물리는 종이 조각", ariaLabel: "맞물리는 종이 조각 조사", x: "58.2%", y: "76.4%", w: "7.8%", h: "6.6%" },
    { evidenceName: "찢어진 문서 조각", ariaLabel: "찢어진 문서 조각 조사", x: "42.4%", y: "75.6%", w: "7.4%", h: "6.4%" }
  ] satisfies SceneHotspot[],
  dock: investigationDock
} as const;
