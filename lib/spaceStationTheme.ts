import type { SceneDockAction, SceneHotspot, SceneProp } from "./gameTypes";

const room = "/assets/space-station/backgrounds/emergency-investigation-room-v2.webp";

export const spaceStationTheme = {
  id: "spaceStation",
  title: "우주정거장 의문사 사건",
  subtitle: "오르빗-13 임상 은폐 살인 사건",
  station: { id: "ORBIT-13", name: "오르빗-13", formalName: "지구 저궤도 생명과학 연구정거장 ORBIT-13" },
  playerRole: "비상 조사관",
  culpritId: "mers",
  victim: { id: "david", name: "데이비드", role: "수석 엔지니어", authId: "ORBIT-13-ENG-0714", truth: "메르스가 몰래 투여한 미승인 근육 재생 약물로 건강이 악화됐고, 불법 임상시험을 폭로하려다 살해당했다." },
  ui: { map: "정거장 지도", inventory: "증거 보관함", conversationLog: "심문 기록", interrogation: "보안 조사실", hint: "힌트", accusation: "지목", briefing: "사건 브리핑", resultButton: "해몽하기" },
  assets: {
    map: "/assets/space-station/maps/orbit-13-six-location-map.webp", room,
    mapIcon: "/assets/space-station/ui-icons-v3/orbit-blueprint.webp",
    inventoryIcon: "/assets/space-station/ui-icons-v3/evidence-vault.webp",
    conversationIcon: "/assets/space-station/ui-icons-v3/log-record.webp",
    interrogationIcon: "/assets/space-station/ui-icons-v2/emergency-investigation-v2.webp",
    briefingIcon: "/assets/space-station/ui-icons-v3/case-briefing.webp",
    hintIcon: "/assets/space-station/ui-icons-v3/hint-beacon.webp",
    accusationIcon: "/assets/space-station/ui-icons-v3/accuse-target.webp"
  },
  oxygen: { warningThreshold: 25, failureFloor: 10, restoredLevel: 70, safePressure: [65, 80], stabilizedPressure: 72, damagedSensorId: "P-02", unauthorizedCircuitId: "AUX-04" },
  suspects: [
    { id: "harry", name: "해리", role: "데이터/통신 담당", authId: "ORBIT-13-DAT-0319", scene: room, sprite: "/assets/space-station/characters/harry-upper-transparent.webp", sleeveScene: "/assets/space-station/characters/harry-upper-transparent.webp", resultImage: "/assets/space-station/characters/harry-upper.webp", resultLayout: { slot: { left: "13.22%", top: "38.5%", width: "13.5%", height: "30%" }, nameLeft: "19.9%", stampLeft: "23.8%", offsetX: "0%" }, hiddenTruth: "21시 43분경 메르스에게 키카드를 빌려줬다." },
    { id: "mers", name: "메르스", role: "주치의", authId: "ORBIT-13-MED-0427", scene: room, sprite: "/assets/space-station/characters/mers-upper-aligned.webp", sleeveScene: "/assets/space-station/characters/mers-upper-aligned.webp", resultImage: "/assets/space-station/characters/mers-upper.webp", resultLayout: { slot: { left: "32.78%", top: "37%", width: "13.5%", height: "31%" }, nameLeft: "39.5%", stampLeft: "43.4%", offsetX: "0%" }, hiddenTruth: "불법 임상시험과 약물 부작용을 숨기고 연구 보상과 우선 귀환 특혜를 지키려 데이비드를 살해했다." },
    { id: "aladdindin", name: "알라딘딘", role: "외부 작업 장비 담당 엔지니어", authId: "ORBIT-13-MNT-0821", scene: room, sprite: "/assets/space-station/characters/aladdindin-upper-aligned.webp", sleeveScene: "/assets/space-station/characters/aladdindin-upper-aligned.webp", resultImage: "/assets/space-station/characters/aladdindin-upper.webp", resultLayout: { slot: { left: "52.57%", top: "37.8%", width: "13.5%", height: "30.4%" }, nameLeft: "59.3%", stampLeft: "63.2%", offsetX: "0%" }, hiddenTruth: "22시 11분경 에어록 근처에서 메르스의 수상한 무전을 들었다." },
    { id: "einspanner", name: "아인슈페너", role: "화학 실험 담당 과학자", authId: "ORBIT-13-SCI-0516", scene: room, sprite: "/assets/space-station/characters/einspanner-upper-aligned.webp", sleeveScene: "/assets/space-station/characters/einspanner-upper-aligned.webp", resultImage: "/assets/space-station/characters/einspanner-upper.webp", resultLayout: { slot: { left: "72.01%", top: "38.2%", width: "13.5%", height: "30%" }, nameLeft: "78.7%", stampLeft: "82.6%", offsetX: "0%" }, hiddenTruth: "21시 47분경 메르스가 약물 냉각 보관함을 의료실로 운반하는 모습을 목격했다." }
  ],
  locations: [
    { id: "spaceAirlock", name: "에어록", map: { x: "50.1%", y: "17%", labelY: "26.4%" }, indicator: { x: "50%", y: "14%" }, image: "/assets/space-station/backgrounds/orbit-13-airlock-evidence-v4.webp", alt: "오르빗-13 에어록과 외부 작업 사고 현장" },
    { id: "spaceMedicalBay", name: "의료실", map: { x: "28.5%", y: "33%", labelY: "43.4%" }, indicator: { x: "29%", y: "31%" }, image: "/assets/space-station/backgrounds/medical-bay-evidence-v2.webp", alt: "오르빗-13 의료실" },
    { id: "spaceOxygenGenerator", name: "산소 발생기실", map: { x: "71.9%", y: "33%", labelY: "43.4%" }, indicator: { x: "72%", y: "31%" }, image: "/assets/space-station/backgrounds/oxygen-generator-evidence-v2.webp", alt: "오르빗-13 산소 발생기실" },
    { id: "spaceDataCore", name: "데이터실", map: { x: "28.5%", y: "63.5%", labelY: "73.5%" }, indicator: { x: "29%", y: "61%" }, image: "/assets/space-station/backgrounds/data-core-evidence-v2.webp", alt: "오르빗-13 데이터실" },
    { id: "spaceScienceLab", name: "과학 실험실", map: { x: "71.5%", y: "63%", labelY: "73.5%" }, indicator: { x: "72%", y: "61%" }, image: "/assets/space-station/backgrounds/science-lab-evidence-v2.webp", alt: "오르빗-13 과학 실험실" },
    { id: "interrogationScreen", name: "보안 조사실", map: { x: "50.2%", y: "79%", labelY: "88.6%" }, indicator: { x: "50%", y: "76%" }, image: room, alt: "오르빗-13 보안 조사실" }
  ],
  evidence: {
    "엔지니어 공구 클램프": { role: "무혐의 증거", location: "에어록", note: "공구함 반납 기록을 확인할 수 있다.", logic: "알라딘딘이 장비를 조작했다는 의혹을 약화한다.", relatedSuspects: ["알라딘딘"], img: "/assets/space-station/evidence/engineer-tool-clamp.webp" },
    "추진 레버 결빙 기록": { role: "수법 증거", location: "에어록", note: "데이비드의 우주복 원격 진단 기록을 확인할 수 있다.", logic: "추진 레버는 데이비드와 함께 표류했지만 관제 기록을 통해 결빙 시점과 작동 불능 상태를 확인할 수 있다.", relatedSuspects: ["메르스", "알라딘딘"], img: "/assets/space-station/evidence/control-terminal.webp" },
    "마지막 무전 기록": { role: "결정타 증거", location: "에어록", note: "사건 당시 데이비드가 송신한 무전 기록을 시간순으로 확인할 수 있다.", logic: "메르스가 구조 요청을 받고도 채널을 차단했다.", relatedSuspects: ["데이비드", "메르스"], img: "/assets/space-station/evidence/final-radio-log.webp" },
    "소독천과 장갑": { role: "연결 증거", location: "의료실", note: "흰 소독천과 수술용 장갑에 투명 젤 성분이 남아 있다.", cardNote: "흰 소독천과 수술용 장갑에 정체를 알 수 없는 물질이 묻어 있다.", logic: "추진 레버를 막은 젤과 의료실을 연결한다.", relatedSuspects: ["메르스"], img: "/assets/space-station/evidence/disinfectant-cloth-glove.webp" },
    "삭제된 의료 기록": { role: "동기 증거", location: "의료실", note: "데이비드의 의료 기록 일부가 삭제되었다.", logic: "불법 임상시험과 약물 부작용 은폐를 보여준다.", relatedSuspects: ["해리", "메르스", "데이비드"], img: "/assets/space-station/evidence/deleted-medical-record.webp" },
    "손상된 압력 센서": { role: "수법 증거", location: "산소 발생기실", note: "P-02 센서가 손상돼 정상 상태를 거짓 보고한다.", logic: "산소 부족을 자동제어가 감지하지 못하게 만든 고의 조작이다.", relatedSuspects: ["메르스"], img: "/assets/space-station/evidence/damaged-pressure-sensor.webp" },
    "조작된 지연 타이머": { role: "알리바이 파괴 증거", location: "산소 발생기실", note: "AUX-04 회로의 타이머가 22시 05분 명령을 22시 18분에 실행했다.", logic: "사고가 미리 예약된 계획 범행임을 확정한다.", relatedSuspects: ["메르스", "알라딘딘"], img: "/assets/space-station/evidence/tampered-delay-timer.webp" },
    "접속 키카드 칩": { role: "계정 도용 증거", location: "데이터실", note: "해리 계정과 의료실 보조 단말 접근 기록이 함께 남은 접속 칩.", logic: "기록 삭제가 해리의 실수가 아니라 계정 도용임을 보강한다.", relatedSuspects: ["해리", "메르스"], img: "/assets/space-station/evidence/access-keycard-chip.webp" },
    "암호화된 연구 보상 계약": { role: "결정적 동기 증거", location: "데이터실", note: "임상 자료 대가로 연구 보상과 우선 귀환권을 약속한 암호화 계약.", logic: "메르스가 폭로를 막으려 한 악의적 동기를 보여준다.", relatedSuspects: ["메르스", "해리"], img: "/assets/space-station/evidence/encrypted-research-contract.webp" },
    "커피 텀블러": { role: "미끼 증거", location: "과학 실험실", note: "아인슈페너의 텀블러. 숨긴 개인 실험을 의심하게 한다.", logic: "아인슈페너를 의심하게 하지만 살인 수법과 연결되지 않는다.", relatedSuspects: ["아인슈페너"], img: "/assets/space-station/evidence/coffee-tumbler.webp" },
    "미승인 약물 앰풀": { role: "위장 및 동기 증거", location: "과학 실험실", note: "삭제된 투약 기록과 같은 제조 코드가 남은 파란 근육 재생 약물 앰풀.", cardNote: "정식 의료 목록에 등록되지 않은 청색 약물 앰풀. 일부가 사용된 상태다.", logic: "메르스가 불법 약물을 숨기고 아인슈페너에게 책임을 씌우려 했다.", relatedSuspects: ["메르스", "아인슈페너"], img: "/assets/space-station/evidence/unauthorized-drug-ampoule.webp" }
  },
  requiredEvidence: ["추진 레버 결빙 기록", "손상된 압력 센서", "조작된 지연 타이머", "삭제된 의료 기록", "접속 키카드 칩", "암호화된 연구 보상 계약", "마지막 무전 기록"],
  deductionRoute: ["외벽 장비 담당 알라딘딘이 먼저 의심받는다.", "약물 앰풀 때문에 아인슈페너가 의심받는다.", "삭제 로그 때문에 해리가 의심받는다.", "산소 복구 과정에서 사고가 예약 실행됐음이 드러난다.", "심문과 의료실 증거가 메르스의 행동을 완성한다.", "최종 지목은 메르스다."]
} as const;

const dock = [
  { className: "map-chip open-map-panel", ariaLabel: `${spaceStationTheme.ui.map} 열기`, image: spaceStationTheme.assets.mapIcon, label: spaceStationTheme.ui.map },
  { className: "bag-chip open-bag-panel", ariaLabel: `${spaceStationTheme.ui.inventory} 열기`, image: spaceStationTheme.assets.inventoryIcon, label: spaceStationTheme.ui.inventory },
  { className: "note-chip open-note-panel", ariaLabel: `${spaceStationTheme.ui.conversationLog} 열기`, image: spaceStationTheme.assets.conversationIcon, label: spaceStationTheme.ui.conversationLog },
  { className: "briefing-chip", ariaLabel: `${spaceStationTheme.ui.briefing} 다시 보기`, image: spaceStationTheme.assets.briefingIcon, label: spaceStationTheme.ui.briefing, goTo: "briefingScreen" },
  { className: "room-chip", ariaLabel: `${spaceStationTheme.ui.interrogation}로 이동`, image: spaceStationTheme.assets.interrogationIcon, label: spaceStationTheme.ui.interrogation, goTo: "interrogationScreen" }
] satisfies SceneDockAction[];

const hotspots: Record<string, SceneHotspot[]> = {
  spaceAirlock: [
    { evidenceName: "엔지니어 공구 클램프", ariaLabel: "엔지니어 공구 클램프 조사", x: "30.9%", y: "87.8%", w: "11%", h: "10%", clipPath: "polygon(2% 36%, 85% 12%, 98% 68%, 18% 96%)", radius: "999px", rot: "5deg" },
    { evidenceName: "추진 레버 결빙 기록", ariaLabel: "추진 레버 결빙 기록 조사", x: "61.5%", y: "40.5%", w: "7%", h: "17%", clipPath: "polygon(8% 4%, 92% 4%, 96% 94%, 4% 96%)", radius: "12px", rot: "0deg" },
    { evidenceName: "마지막 무전 기록", ariaLabel: "마지막 무전 기록 조사", x: "96.5%", y: "35.4%", w: "7%", h: "17%", clipPath: "polygon(12% 4%, 88% 8%, 98% 92%, 4% 96%)", radius: "14px", rot: "0deg" }
  ],
  spaceMedicalBay: [
    { evidenceName: "소독천과 장갑", ariaLabel: "소독천과 장갑 조사", x: "10.8%", y: "71.4%", w: "11%", h: "9.5%", clipPath: "polygon(4% 28%, 90% 8%, 98% 78%, 14% 96%)", radius: "14px", rot: "0deg" },
    { evidenceName: "삭제된 의료 기록", ariaLabel: "삭제된 의료 기록 조사", x: "77.3%", y: "53%", w: "6%", h: "13%", clipPath: "polygon(8% 4%, 90% 8%, 96% 94%, 6% 98%)", radius: "10px", rot: "0deg" },
    { id: "spaceMedicalAnalyzer", className: "space-analysis-device", ariaLabel: "의료실 성분 분석 장치", x: "83.7%", y: "55%", w: "7.5%", h: "11.5%", clipPath: "polygon(8% 12%, 84% 4%, 98% 78%, 14% 96%)", radius: "10px", rot: "0deg" }
  ],
  spaceOxygenGenerator: [
    { evidenceName: "조작된 지연 타이머", ariaLabel: "조작된 지연 타이머 조사", x: "17.5%", y: "54%", w: "7%", h: "8%", clipPath: "polygon(6% 10%, 94% 8%, 98% 88%, 8% 96%)", radius: "12px", rot: "0deg" },
    { evidenceName: "손상된 압력 센서", ariaLabel: "손상된 압력 센서 조사", x: "65%", y: "46%", w: "7%", h: "11%", clipPath: "ellipse(46% 44% at 50% 50%)", radius: "999px", rot: "0deg" }
  ],
  spaceDataCore: [
    { evidenceName: "접속 키카드 칩", ariaLabel: "접속 키카드 칩 조사", x: "28%", y: "79%", w: "10%", h: "10%", clipPath: "polygon(5% 20%, 88% 8%, 98% 72%, 18% 96%)", radius: "12px", rot: "0deg" },
    { evidenceName: "암호화된 연구 보상 계약", ariaLabel: "암호화된 연구 보상 계약 조사", x: "75.2%", y: "57%", w: "14%", h: "18%", clipPath: "polygon(9% 7%, 92% 8%, 96% 88%, 4% 94%)", radius: "12px", rot: "0deg" }
  ],
  spaceScienceLab: [
    { evidenceName: "커피 텀블러", ariaLabel: "커피 텀블러 조사", x: "38%", y: "55.7%", w: "5%", h: "13%", clipPath: "polygon(23% 2%, 76% 2%, 87% 96%, 14% 96%)", radius: "18px", rot: "0deg" },
    { evidenceName: "미승인 약물 앰풀", ariaLabel: "미승인 약물 앰풀 조사", x: "66.7%", y: "62.3%", w: "6.2%", h: "13.3%", clipPath: "polygon(28% 2%, 75% 4%, 94% 91%, 7% 96%)", radius: "999px", rot: "0deg" }
  ]
};

export const spaceStationScenes = spaceStationTheme.locations.filter(({ id }) => id.startsWith("space")).map((location) => ({ id: location.id, image: location.image, alt: location.alt, props: [] as SceneProp[], hotspots: hotspots[location.id] ?? [], dock }));

function locationDestinationLabel(name: string) {
  const code = name.charCodeAt(name.length - 1) - 0xac00;
  const finalConsonant = code >= 0 && code <= 11171 ? code % 28 : 0;
  const particle = finalConsonant === 0 || finalConsonant === 8 ? "로" : "으로";
  return `${name}${particle} 이동`;
}

export const spaceStationMap = { image: spaceStationTheme.assets.map, alt: "중앙 허브와 여섯 조사 장소가 연결된 오르빗-13 도면", locations: spaceStationTheme.locations.map((location) => ({ screen: location.id, goTo: location.id, text: location.name, label: locationDestinationLabel(location.name), ...location.map })) };

export const spaceStationInterrogationCopy = { map: spaceStationTheme.ui.map, note: spaceStationTheme.ui.conversationLog, noteKicker: "심문 기록", noteLead: "대원별 질문과 답변을 심문 기록에서 확인합니다.", journal: spaceStationTheme.ui.briefing, bag: spaceStationTheme.ui.inventory, tools: "추가 분석", toolKicker: "분석 기록", toolTitle: "추가 분석", suspects: spaceStationTheme.suspects.map(({ id, name }) => ({ id, name })) };

export const spaceStationResultSuspects = spaceStationTheme.suspects.map((suspect) => ({ id: suspect.id, name: suspect.name, image: suspect.resultImage, ...suspect.resultLayout }));

export const spaceStationRuntimeConfig = {
  title: spaceStationTheme.title,
  personnelAuthIds: Object.fromEntries([[spaceStationTheme.victim.id, spaceStationTheme.victim.authId], ...spaceStationTheme.suspects.map((suspect) => [suspect.id, suspect.authId])]),
  suspects: spaceStationTheme.suspects.map(({ id, name, authId, scene, sprite, sleeveScene }) => ({ id, name, authId, scene, sprite, sleeveScene })),
  locations: Object.fromEntries([["tutorialScreen", { name: "튜토리얼", x: "18%", y: "18%" }], ["dreamScreen", { name: "꿈 선택", x: "18%", y: "18%" }], ["briefingScreen", { name: spaceStationTheme.ui.briefing, x: "18%", y: "18%" }], ...spaceStationTheme.locations.map((location) => [location.id, { name: location.name, ...location.indicator }])]),
  evidence: spaceStationTheme.evidence,
  requiredEvidence: spaceStationTheme.requiredEvidence
};
