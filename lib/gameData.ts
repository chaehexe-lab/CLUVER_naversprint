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
    title: "우주정거장 의문사 사건",
    description: "오르빗-13의 정전 직후, 한 우주비행사가 정거장 밖 어둠 속으로 사라졌습니다.",
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
    { className: "scene-evidence-object field-letter-evidence concealed-space-hotspot", evidenceName: "찢어진 약속 편지", ariaLabel: "점순이 쥔 손 살피기", x: "66%", y: "75%", w: "15%", h: "16%", clipPath: "ellipse(47% 42% at 52% 53%)", radius: "999px", rot: "5deg" },
    { id: "hopaeHotspot", className: "scene-evidence-object field-hopae-evidence hopae-glow concealed-space-hotspot", evidenceName: "호패 조각", ariaLabel: "점순의 겉옷 안쪽 살피기", x: "49%", y: "61%", w: "19%", h: "20%", clipPath: "polygon(8% 13%, 83% 2%, 100% 71%, 78% 100%, 5% 84%)", radius: "16px", rot: "-4deg" }
  ] satisfies SceneHotspot[],
  lights: [
    { x: "18.5%", y: "39.2%", size: "4.6%", strength: 0.12, mode: "painted" },
    { x: "59.5%", y: "27.4%", size: "5.2%", strength: 0.14, delay: "-1.7s", mode: "painted" },
    { x: "80.4%", y: "20.5%", size: "6%", strength: 0.15, delay: "-3.2s", mode: "painted" }
  ],
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
  image: "/samunmong/assets/scenes-integrated/scene-chunwol-room-separate-chest-v2.png",
  alt: "춘월의 방, 안쪽 벽의 잠긴 세로형 의복장과 별도의 검은 문갑",
  props: [] as SceneProp[],
  hotspots: [
    { id: "jeogoriHotspot", className: "scene-evidence-object concealed-space-hotspot locked-clothing-chest-hotspot", evidenceName: "고름이 뜯긴 저고리", ariaLabel: "왼쪽 안쪽 벽의 잠긴 의복장 살피기", x: "19.2%", y: "20%", w: "12.5%", h: "35%", clipPath: "polygon(4% 1%, 96% 1%, 98% 99%, 2% 99%)", radius: "8px", rot: "0deg" },
    { id: "chunwolKeyHotspot", className: "scene-evidence-object concealed-space-hotspot", evidenceName: "쇠열쇠", ariaLabel: "안쪽 검은 문갑 살피기", x: "38.2%", y: "33%", w: "13.5%", h: "25%", clipPath: "polygon(3% 1%, 97% 1%, 100% 98%, 2% 100%)", radius: "8px", rot: "0deg" },
    { id: "portraitHotspot", className: "scene-evidence-object portrait-glow concealed-space-hotspot", evidenceName: "돌쇠의 그림", ariaLabel: "병풍에 걸린 자주빛 천 뒤쪽 살피기", x: "75.2%", y: "27%", w: "9.8%", h: "36%", clipPath: "polygon(18% 0%, 91% 4%, 100% 87%, 68% 100%, 4% 84%, 10% 11%)", radius: "10px", rot: "1deg" }
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
    { className: "scene-evidence-object mudeok-diary-evidence concealed-space-hotspot", evidenceName: "무덕의 번진 일기", ariaLabel: "오른쪽 침구 더미 살피기", x: "91%", y: "42%", w: "18%", h: "26%", clipPath: "polygon(5% 8%, 92% 2%, 100% 88%, 8% 99%)", radius: "16px", rot: "0deg" },
    { className: "scene-evidence-object mudeok-shoes-evidence concealed-space-hotspot", evidenceName: "진흙 묻은 짚신", ariaLabel: "빨랫바구니 안쪽 살피기", x: "85%", y: "82%", w: "23%", h: "28%", clipPath: "ellipse(48% 47% at 52% 52%)", radius: "999px", rot: "0deg" }
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
    { className: "scene-evidence-object yoomunseok-room-key yoomunseok-room-key-concealed field-tool-hotspot", evidenceName: "놋쇠 고리열쇠", ariaLabel: "큰 서안의 붓통 사이에 섞인 놋쇠 고리 살피기", image: "/samunmong/assets/evidence-transparent/field-tool-joseon-sarangbang-key-v1.png", x: "67.5%", y: "43%", w: "9%", h: "25%", clipPath: "none", radius: "0", rot: "0deg" },
    { className: "scene-evidence-object yoomunseok-holder-evidence concealed-space-hotspot", evidenceName: "빈 호패 주머니", ariaLabel: "서안 왼쪽의 닫힌 서랍 살피기", x: "41%", y: "76%", w: "12%", h: "15%", clipPath: "polygon(3% 22%, 94% 6%, 99% 83%, 8% 97%)", radius: "10px", rot: "-2deg" },
    { className: "scene-evidence-object yoomunseok-ledger-evidence concealed-space-hotspot", evidenceName: "하인 장부", ariaLabel: "사랑방 왼쪽의 쌓인 문서 더미 살피기", x: "10%", y: "76%", w: "20%", h: "27%", clipPath: "polygon(4% 12%, 88% 2%, 99% 86%, 10% 100%)", radius: "14px", rot: "0deg" },
    { className: "scene-evidence-object yoomunseok-marriage-evidence concealed-space-hotspot", evidenceName: "혼서 조각", ariaLabel: "문서장 안쪽의 검은 문서함 살피기", x: "25%", y: "19%", w: "19%", h: "24%", clipPath: "polygon(4% 4%, 96% 2%, 98% 94%, 2% 99%)", radius: "10px", rot: "0deg" }
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
    { className: "scene-evidence-object dolsoe-bandage-evidence concealed-space-hotspot", evidenceName: "피 묻은 붕대", ariaLabel: "침상 곁 작은 서랍 살피기", x: "50%", y: "62%", w: "10%", h: "17%", clipPath: "polygon(5% 4%, 96% 4%, 94% 96%, 3% 96%)", radius: "8px", rot: "0deg" },
    { className: "scene-evidence-object dolsoe-bundle-evidence concealed-space-hotspot", evidenceName: "도망 보따리", ariaLabel: "작업대의 덮인 짚바구니 살피기", x: "14%", y: "69%", w: "22%", h: "19%", clipPath: "ellipse(48% 45% at 50% 52%)", radius: "999px", rot: "0deg" }
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
    { className: "scene-evidence-object backgate-footprints-evidence concealed-space-hotspot", evidenceName: "작은 발자국", ariaLabel: "바닥의 젖은 낙엽과 짚 걷어 보기", x: "55%", y: "78%", w: "36%", h: "27%", clipPath: "ellipse(48% 42% at 50% 53%)", radius: "999px", rot: "0deg" },
    { className: "scene-evidence-object backgate-cord-evidence concealed-space-hotspot", evidenceName: "끊어진 호패끈", ariaLabel: "왼쪽의 뒤집힌 짚바구니 들어 보기", x: "29%", y: "63%", w: "16%", h: "19%", clipPath: "ellipse(47% 46% at 51% 52%)", radius: "999px", rot: "0deg" },
    { className: "scene-evidence-object backgate-silk-tie-evidence concealed-space-hotspot onggi-search-hotspot", evidenceName: "찢어진 옷고름", ariaLabel: "왼쪽 장독의 금 간 뚜껑 살피기", x: "18%", y: "61%", w: "14%", h: "22%", clipPath: "ellipse(48% 46% at 50% 52%)", radius: "999px", rot: "0deg" }
  ] satisfies SceneHotspot[],
  lights: [{ x: "69.7%", y: "28.5%", size: "6.2%", strength: 0.16, mode: "painted" }],
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
