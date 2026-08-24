export const spaceStationTheme = {
  id: "spaceStation",
  title: "우주정거장 살인사건",
  subtitle: "오르빗-13 임상 은폐 살인 사건",
  playerRole: "비상 조사관",
  culpritId: "mers",
  victim: {
    id: "david",
    name: "데이비드",
    role: "수석 엔지니어",
    truth: "메르스가 몰래 투여한 미승인 근육 재생 약물로 건강이 악화됐고, 불법 임상시험을 폭로하려다 살해당했다."
  },
  assets: {
    map: "/assets/space-station/maps/orbit-13-six-location-map.webp"
  },
  ui: {
    map: "정거장 지도",
    inventory: "증거 보관함",
    tools: "스캔 키트",
    journal: "로그 기록",
    interrogation: "보안 조사실",
    hint: "센서 알림",
    accusation: "최종 보고",
    resultButton: "해몽하기"
  },
  suspects: [
    {
      id: "mers",
      name: "메르스",
      role: "주치의",
      persona: "차분하고 냉정한 의료진. 항상 마스크를 쓰고 메스를 지닌다.",
      suspicion: "메스, 의료용 젤, 의료 기록 삭제, 산소 발생기 조작이 모두 연결된다.",
      hiddenTruth: "불법 임상시험과 약물 부작용을 숨기고 연구 보상과 지구 귀환 특혜를 차지하려 데이비드를 살해했다.",
      evidenceShift: "약물 투여 기록과 밀봉 젤 잔류물을 제시하면 의료 사고라는 변명이 무너진다."
    },
    {
      id: "aladdindin",
      name: "알라딘딘",
      role: "엔지니어",
      persona: "거칠고 방어적인 장비 담당자. 늘 공구와 기름 냄새가 난다.",
      suspicion: "우주복 점검 담당이며 안전 로프와 로봇 팔 구조를 잘 안다.",
      hiddenTruth: "내부 점검 당시 젤은 액체 상태라 발견할 수 없었다.",
      evidenceShift: "밀봉 젤의 온도 반응을 확인하면 결백해진다."
    },
    {
      id: "harry",
      name: "해리",
      role: "데이터/통신 담당",
      persona: "로그 삭제 실수 때문에 죄책감에 눌려 있다.",
      suspicion: "데이터를 날려 먹은 탓에 사건 기록이 불완전해졌다.",
      hiddenTruth: "메르스가 해리 계정을 도용했다. 후반에는 로그 복구 조력자가 된다.",
      evidenceShift: "접속 시간대 모순을 제시하면 복구를 돕는다."
    },
    {
      id: "einspanner",
      name: "아인슈페너",
      role: "과학자",
      persona: "커피를 들고 다니는 괴짜 과학자. 화학약품 냄새가 난다.",
      suspicion: "커피와 화학약품 때문에 환각 살인 페이크 진범처럼 보인다.",
      hiddenTruth: "불법 실험은 숨겼지만 데이비드의 죽음 자체는 메르스의 계획이다.",
      evidenceShift: "커피 텀블러와 실험실 증거로 몰리지만 최종 살인 동기와 수법은 맞지 않는다."
    }
  ],
  locations: [
    { id: "spaceAirlock", name: "에어록", purpose: "첫 현장과 외부 작업 준비 구역. 레버 젤, 마지막 무전, 공구 점검 흔적 확인." },
    { id: "spaceMedicalBay", name: "의료실", purpose: "수술용 밀봉 젤, 메스, 삭제된 의료 기록 단서 확인." },
    { id: "spaceOxygenGenerator", name: "산소 발생기실", purpose: "압력 밸브 센서 손상과 조작된 지연 타이머 확인." },
    { id: "spaceDataCore", name: "데이터실", purpose: "해리 계정 접속 로그와 암호화된 연구 보상 계약 복구." },
    { id: "spaceScienceLab", name: "과학 실험실", purpose: "아인슈페너의 커피 텀블러와 숨겨진 미승인 약물 앰풀 확인." }
  ],
  evidence: [
    { name: "얼어붙은 추진 레버 젤", role: "수법 증거", location: "에어록", logic: "의료용 젤이 극저온에서 굳어 비상 추진 레버를 막았음을 보여준다." },
    { name: "마지막 무전 로그", role: "결정타 증거", location: "에어록", logic: "메르스가 데이비드의 구조 요청을 수신하고도 채널을 차단했음을 보여준다." },
    { name: "엔지니어 공구 클램프", role: "무혐의 증거", location: "에어록", logic: "공구에 젤 흔적이 없어 알라딘딘의 장비 조작 의혹을 약화한다." },
    { name: "소독천과 장갑", role: "연결 증거", location: "의료실", logic: "레버 젤과 메르스의 의료용 소독제를 연결한다." },
    { name: "삭제된 의료 기록", role: "동기 증거", location: "의료실", logic: "미승인 약물 투여와 심각한 부작용을 숨긴 사실을 밝힌다." },
    { name: "손상된 압력 센서", role: "수법 증거", location: "산소 발생기실", logic: "메스와 같은 얇은 날붙이로 센서가 고의 손상됐음을 보여준다." },
    { name: "조작된 지연 타이머", role: "알리바이 파괴 증거", location: "산소 발생기실", logic: "정전이 외부 작업 시간에 맞춰 예약됐고 설정 신호가 의료실 단말에서 왔음을 보여준다." },
    { name: "접속 키카드 칩", role: "계정 도용 증거", location: "데이터실", logic: "해리 계정을 이용한 삭제가 의료실 단말에서 실행됐음을 보여준다." },
    { name: "암호화된 연구 보상 계약", role: "결정적 동기 증거", location: "데이터실", logic: "메르스가 임상 자료 대가로 연구 보상과 우선 귀환권을 약속받았음을 밝힌다." },
    { name: "커피 텀블러", role: "미끼 증거", location: "과학 실험실", logic: "아인슈페너를 의심하게 하지만 살인 수법과 직접 연결되지 않는다." },
    { name: "미승인 약물 앰풀", role: "위장 및 동기 증거", location: "과학 실험실", logic: "메르스가 불법 약물을 숨기고 아인슈페너에게 책임을 씌우려 한 정황을 보여준다." },
  ],
  deductionRoute: [
    "알라딘딘의 공구와 로봇 팔 때문에 엔지니어 범행처럼 보인다.",
    "아인슈페너의 커피와 화학약품 때문에 과학자 범행처럼 보인다.",
    "해리의 삭제 로그 때문에 데이터 은폐 범행처럼 보인다.",
    "하지만 산소 발생기 센서 손상과 수술용 밀봉 젤은 의료실 물품과 연결된다.",
    "조작된 지연 타이머로 정전이 의료실 단말에서 예약됐다는 사실이 확인된다.",
    "해리 계정으로 삭제된 것은 데이비드에게 미승인 약물을 투여한 의료 기록이었다.",
    "암호화된 계약으로 메르스가 연구 보상과 우선 귀환권을 대가로 임상 자료를 넘기려 했다는 동기가 밝혀진다.",
    "마지막 무전에서 데이비드는 메르스에게 구조를 요청했지만 개인 채널은 고의로 차단됐다.",
    "최종 지목은 메르스다."
  ]
} as const;
