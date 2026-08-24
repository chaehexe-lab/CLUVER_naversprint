export const STARTABLE_SCREENS = new Set([
  "tutorialScreen",
  "dreamScreen",
  "briefingScreen",
  "fieldOne",
  "chunwolRoom",
  "mudeokServantRoom",
  "yoomunseokSarangbang",
  "dolsoeQuarters",
  "backGateCourtyard",
  "magicAlchemyLab",
  "magicCleaningCloset",
  "magicLibrary",
  "magicRecordCrystalRoom",
  "magicDormHallway",
  "spaceAirlock",
  "spaceMedicalBay",
  "spaceOxygenGenerator",
  "spaceDataCore",
  "spaceScienceLab",
  "interrogationScreen"
]);

export const routeInitialScreens = {
  "/crime_scene": "fieldOne",
  "/field-one": "fieldOne",
  "/chunwol-room": "chunwolRoom",
  "/mudeok-servant-room": "mudeokServantRoom",
  "/yoomunseok-sarangbang": "yoomunseokSarangbang",
  "/dolsoe-quarters": "dolsoeQuarters",
  "/back-gate-courtyard": "backGateCourtyard",
  "/magic-alchemy-lab": "magicAlchemyLab",
  "/magic-cleaning-closet": "magicCleaningCloset",
  "/magic-library": "magicLibrary",
  "/magic-record-crystal-room": "magicRecordCrystalRoom",
  "/magic-dorm-hallway": "magicDormHallway",
  "/space-airlock": "spaceAirlock",
  "/space-medical-bay": "spaceMedicalBay",
  "/space-oxygen-generator": "spaceOxygenGenerator",
  "/space-data-core": "spaceDataCore",
  "/space-science-lab": "spaceScienceLab",
  "/interrogation": "interrogationScreen",
  "/tutorial": "tutorialScreen",
  "/dream": "dreamScreen",
  "/briefing": "briefingScreen"
} as const;

export type StartableScreen = (typeof routeInitialScreens)[keyof typeof routeInitialScreens];

export const screenLocationLabels = {
  mainScreen: "\uBA54\uC778 \uB85C\uBE44",
  tutorialScreen: "\uD29C\uD1A0\uB9AC\uC5BC",
  dreamScreen: "\uAFC8 \uC120\uD0DD",
  briefingScreen: "\uC0AC\uAC74 \uBE0C\uB9AC\uD551",
  fieldOne: "\uC720\uBB38\uC11D \uC9D1 \uC55E",
  chunwolRoom: "\uCD98\uC6D4\uC758 \uBC29",
  mudeokServantRoom: "\uBB34\uB355\uC758 \uD558\uC778\uBC29",
  yoomunseokSarangbang: "\uC720\uBB38\uC11D \uC0AC\uB791\uBC29",
  dolsoeQuarters: "\uB3CC\uC1E0 \uCC98\uC18C",
  backGateCourtyard: "\uB4B7\uBB38 \uB9C8\uB2F9",
  magicAlchemyLab: "제1 연금술 실습실",
  magicCleaningCloset: "청소도구함",
  magicLibrary: "도서관",
  magicRecordCrystalRoom: "기록 수정구실",
  magicDormHallway: "학생들 기숙사",
  spaceAirlock: "에어록",
  spaceMedicalBay: "의료실",
  spaceOxygenGenerator: "산소 발생기실",
  spaceDataCore: "데이터실",
  spaceScienceLab: "과학 실험실",
  interrogationScreen: "\uCDE8\uC870\uC2E4"
} as const;

export type ScreenLocationId = keyof typeof screenLocationLabels;
