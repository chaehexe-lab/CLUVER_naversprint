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
    state: "LOCKED",
    kicker: "DREAM 01",
    title: "우주정거장 살인사건",
    description: "중력이 사라진 복도 안, 시체만이 제자리를 떠나지 못했습니다.",
    meta: "폐쇄 공간 · 산소 기록 · 사라진 카메라",
    image: "../../assets/theme-space-station.png",
    disabled: true,
    ariaLabel: "우주정거장 살인사건은 아직 잠겨 있습니다"
  },
  {
    state: "LOCKED",
    kicker: "DREAM 02",
    title: "마법학교 방화사건",
    description: "불길은 꺼졌지만 주문을 건 이름은 아직 재 속에 남아 있습니다.",
    meta: "금서 · 마력 흔적 · 사라진 목격자",
    image: "../../assets/theme-magic-school.png",
    disabled: true,
    ariaLabel: "마법학교 방화사건은 아직 잠겨 있습니다"
  },
  {
    id: "chooseJoseon",
    state: "PLAYABLE",
    kicker: "DREAM 03",
    title: "조선시대 살인사건",
    description: "문 앞에 쓰러진 사람, 곁에 남은 호패 조각 하나가 모두의 관계를 뒤집습니다.",
    meta: "호패 조각 · 젖은 발자국 · 거짓 증언",
    image: "../../assets/theme-joseon-murder.png",
    disabled: false
  }
] as const;

export const briefing = {
  title: "조선시대 살인사건",
  startLabel: "현장으로 이동"
} as const;

const investigationDock = [
  {
    className: "map-chip open-map-panel",
    ariaLabel: "마을지도 열기",
    image: "/samunmong/assets/labels/transparent/tool-village-map.png",
    label: "마을지도"
  },
  {
    className: "bag-chip open-bag-panel",
    ariaLabel: "수사 가방 열기",
    image: "/samunmong/assets/labels/transparent/tool-evidence-bag.png",
    label: "수사 가방"
  },
  {
    className: "tool-chip open-tool-panel",
    ariaLabel: "도구 열기",
    image: "/samunmong/assets/labels/transparent/tool-investigation-tools.png",
    label: "도구"
  },
  {
    className: "note-chip open-note-panel",
    ariaLabel: "수사노트 열기",
    image: "/samunmong/assets/labels/transparent/tool-investigation-note.png",
    label: "수사노트"
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
  image: "/samunmong/assets/scenes-evidence-baked/scene-gatehouse-jeomsun-door-footprints-v4-evidence-baked.png",
  alt: "유문석 집 문 앞에 쓰러진 점순과 호패 조각, 젖은 발자국이 있는 사건 현장",
  hotspots: [
    { evidenceName: "작은 발자국", ariaLabel: "작은 발자국 조사", x: "38.5%", y: "84%", w: "118px", h: "168px" },
    { evidenceName: "찢어진 문서 조각", ariaLabel: "찢어진 문서 조각 조사", x: "72%", y: "84%", w: "104px", h: "76px" },
    { id: "hopaeHotspot", className: "hopae-glow", ariaLabel: "호패 조각 조사", x: "58%", y: "87%", w: "112px", h: "74px" }
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
    buttonLabel: "가방에 넣기"
  }
} as const;

export const chunwolRoomScene = {
  id: "chunwolRoom",
  image: "/samunmong/assets/scenes-evidence-baked/scene-chunwol-room-evidence-baked.png",
  alt: "춘월의 방과 초상화 그림 증거",
  props: [{ image: "/samunmong/assets/evidence-transparent/evidence-norigae-transparent.png", alt: "", x: "44%", y: "78%", w: "52px", rot: "12deg" }] satisfies SceneProp[],
  hotspots: [
    { evidenceName: "사라진 노리개", ariaLabel: "사라진 노리개 조사", x: "44%", y: "78%", w: "70px", h: "56px" },
    { id: "portraitHotspot", className: "portrait-glow", ariaLabel: "돌쇠의 그림 조사", x: "60.7%", y: "62.5%", w: "94px", h: "138px" }
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
    buttonLabel: "가방에 넣기"
  }
} as const;

export const mudeokServantRoomScene = {
  id: "mudeokServantRoom",
  image: "/samunmong/assets/scenes-evidence-baked/scene-mudeok-servant-room-evidence-baked.png",
  alt: "무덕의 하인방",
  props: [
    { image: "/samunmong/assets/mudeok-interaction/evidence-mudeok-smeared-diary.png", alt: "", x: "47%", y: "76%", w: "56px", rot: "-8deg" },
    { image: "/samunmong/assets/mudeok-interaction/evidence-mudeok-muddy-straw-shoes.png", alt: "", x: "76%", y: "81%", w: "58px", rot: "11deg" },
    { image: "/samunmong/assets/mudeok-interaction/evidence-torn-collar-tie.png", alt: "", x: "27%", y: "70%", w: "48px", rot: "-18deg" },
    { image: "/samunmong/assets/mudeok-interaction/evidence-fingernail-thread-sample.png", alt: "", x: "39%", y: "63%", w: "34px", rot: "8deg" },
    { image: "/samunmong/assets/mudeok-interaction/evidence-jeomsun-neck-exam-paper.png", alt: "", x: "54%", y: "79%", w: "58px", rot: "5deg" }
  ] satisfies SceneProp[],
  hotspots: [
    { evidenceName: "무덕의 번진 일기", ariaLabel: "무덕의 번진 일기 조사", x: "47%", y: "76%", w: "72px", h: "54px" },
    { evidenceName: "진흙 묻은 짚신", ariaLabel: "진흙 묻은 짚신 조사", x: "76%", y: "81%", w: "76px", h: "56px" },
    { evidenceName: "찢어진 옷고름", ariaLabel: "찢어진 옷고름 조사", x: "27%", y: "70%", w: "62px", h: "74px" },
    { evidenceName: "손톱 밑 실타래", ariaLabel: "손톱 밑 실타래 조사", x: "39%", y: "63%", w: "52px", h: "52px" },
    { evidenceName: "점순 목 검안 종이", ariaLabel: "점순 목 검안 종이 조사", x: "54%", y: "79%", w: "72px", h: "62px" }
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
  image: "/samunmong/assets/scenes-evidence-baked/scene-yoomunseok-sarangbang-evidence-baked.png",
  alt: "유문석의 사랑방",
  props: [
    { image: "/samunmong/assets/evidence-transparent/evidence-empty-hopae-holder.png", alt: "", x: "42%", y: "64%", w: "54px", rot: "-5deg" },
    { image: "/samunmong/assets/evidence-transparent/evidence-wooden-box-transparent.png", alt: "", x: "28%", y: "67%", w: "58px", rot: "6deg" },
    { image: "/samunmong/assets/evidence-transparent/evidence-servant-ledger.png", alt: "", x: "61%", y: "58%", w: "60px", rot: "4deg" },
    { image: "/samunmong/assets/evidence-transparent/evidence-paper-knife.png", alt: "", x: "70%", y: "74%", w: "52px", rot: "18deg" },
    { image: "/samunmong/assets/evidence-transparent/evidence-ink-powder.png", alt: "", x: "52%", y: "73%", w: "54px", rot: "-11deg" },
    { image: "/samunmong/assets/evidence-transparent/evidence-marriage-letter.png", alt: "", x: "34%", y: "75%", w: "58px", rot: "-7deg" }
  ] satisfies SceneProp[],
  hotspots: [
    { evidenceName: "빈 호패 주머니", ariaLabel: "빈 호패 주머니 조사", x: "42%", y: "64%", w: "72px", h: "54px" },
    { evidenceName: "나무 상자", ariaLabel: "나무 상자 조사", x: "28%", y: "67%", w: "74px", h: "60px" },
    { evidenceName: "하인 장부", ariaLabel: "하인 장부 조사", x: "61%", y: "58%", w: "78px", h: "64px" },
    { evidenceName: "종이칼", ariaLabel: "종이칼 조사", x: "70%", y: "74%", w: "66px", h: "72px" },
    { evidenceName: "먹가루", ariaLabel: "먹가루 조사", x: "52%", y: "73%", w: "68px", h: "62px" },
    { evidenceName: "혼서 조각", ariaLabel: "혼서 조각 조사", x: "34%", y: "75%", w: "74px", h: "58px" }
  ] satisfies SceneHotspot[],
  dock: investigationDock
} as const;

export const dolsoeQuartersScene = {
  id: "dolsoeQuarters",
  image: "/samunmong/assets/scenes-evidence-baked/scene-dolsoe-quarters-evidence-baked.png",
  alt: "돌쇠의 처소",
  props: [
    { image: "/samunmong/assets/evidence-transparent/evidence-axe-knife.png", alt: "", x: "43%", y: "71%", w: "62px", rot: "-10deg" },
    { image: "/samunmong/assets/evidence-transparent/evidence-bloodied-bandage.png", alt: "", x: "58%", y: "76%", w: "54px", rot: "8deg" },
    { image: "/samunmong/assets/evidence-transparent/evidence-escape-bundle.png", alt: "", x: "69%", y: "67%", w: "64px", rot: "5deg" }
  ] satisfies SceneProp[],
  hotspots: [
    { evidenceName: "낡은 칼", ariaLabel: "낡은 칼 조사", x: "43%", y: "71%", w: "84px", h: "70px" },
    { evidenceName: "피 묻은 붕대", ariaLabel: "피 묻은 붕대 조사", x: "58%", y: "76%", w: "76px", h: "58px" },
    { evidenceName: "도망 보따리", ariaLabel: "도망 보따리 조사", x: "69%", y: "67%", w: "82px", h: "70px" }
  ] satisfies SceneHotspot[],
  dock: investigationDock
} as const;

export const backGateCourtyardScene = {
  id: "backGateCourtyard",
  image: "/samunmong/assets/scenes-evidence-baked/scene-back-gate-courtyard-evidence-baked.png",
  alt: "대문 뒤쪽 뒷문 마당",
  props: [
    { image: "/samunmong/assets/evidence-transparent/evidence-small-footprints.png", alt: "", x: "47%", y: "76%", w: "66px", rot: "10deg" },
    { image: "/samunmong/assets/evidence-transparent/evidence-cut-hopae-cord.png", alt: "", x: "58%", y: "69%", w: "48px", rot: "-18deg" },
    { image: "/samunmong/assets/evidence-transparent/evidence-matching-paper-scraps.png", alt: "", x: "70%", y: "77%", w: "58px", rot: "12deg" },
    { image: "/samunmong/assets/evidence-transparent/evidence-torn-letter-transparent.png", alt: "", x: "35%", y: "68%", w: "52px", rot: "-6deg" }
  ] satisfies SceneProp[],
  hotspots: [
    { evidenceName: "작은 발자국", ariaLabel: "작은 발자국 조사", x: "47%", y: "76%", w: "90px", h: "64px" },
    { evidenceName: "끊어진 호패끈", ariaLabel: "끊어진 호패끈 조사", x: "58%", y: "69%", w: "68px", h: "54px" },
    { evidenceName: "맞물리는 종이 조각", ariaLabel: "맞물리는 종이 조각 조사", x: "70%", y: "77%", w: "78px", h: "58px" },
    { evidenceName: "찢어진 문서 조각", ariaLabel: "찢어진 문서 조각 조사", x: "35%", y: "68%", w: "70px", h: "58px" }
  ] satisfies SceneHotspot[],
  dock: investigationDock
} as const;
