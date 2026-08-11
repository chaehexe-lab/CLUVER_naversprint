export const spaceStationTheme = {
  id: "spaceStation",
  title: "우주정거장 살인사건",
  subtitle: "오르빗-13 존엄 계약 사건",
  playerRole: "비상 조사관",
  culpritId: "mers",
  victim: {
    id: "david",
    name: "데이비드",
    role: "수석 엔지니어",
    truth: "우주 방사선 유발성 퇴행성 근위축증 말기 환자였고, 메르스에게 순직처럼 보이는 마지막 임무를 부탁했다."
  },
  assets: {
    map: "/assets/space-station/maps/orbit-13-blueprint.png"
  },
  ui: {
    map: "궤도 도면",
    inventory: "증거 보관함",
    tools: "스캔 키트",
    journal: "로그 기록",
    interrogation: "비상 조사실",
    hint: "센서 알림",
    accusation: "최종 보고",
    resultButton: "해몽하기"
  },
  suspects: [
    {
      id: "ansungjyejyei",
      name: "안성줴줴이",
      role: "요리사",
      persona: "완벽주의자이자 결벽증이 심해 손을 정확히 13번 씻는다.",
      suspicion: "사건 직후 손을 지나치게 씻어 증거 인멸처럼 보인다.",
      hiddenTruth: "커피 냄새 아래 섞인 소독약/의료 젤 냄새를 기억한 핵심 목격자다.",
      evidenceShift: "냄새 증언을 물으면 메르스 쪽 단서로 이어진다."
    },
    {
      id: "mers",
      name: "메르스",
      role: "주치의",
      persona: "차분하고 냉정한 의료진. 항상 마스크를 쓰고 메스를 지닌다.",
      suspicion: "메스, 의료용 젤, 의료 기록 삭제, 산소 발생기 조작이 모두 연결된다.",
      hiddenTruth: "데이비드의 부탁으로 사고처럼 보이는 죽음을 설계했다.",
      evidenceShift: "의료 기록 조각과 밀봉 젤 잔류물을 제시하면 직접 부정하지 못하고 흔들린다."
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
    { id: "spaceAirlock", name: "에어록", purpose: "첫 현장. 안전 로프, 마지막 외부 작업 기록, 로봇 팔 충돌 흔적 확인." },
    { id: "spaceSuitPrep", name: "외부 작업 준비실", purpose: "우주복 레버 홈 잔류물과 커피 향 잔류 확인." },
    { id: "spaceMedbay", name: "의료실", purpose: "수술용 밀봉 젤, 메스, 삭제된 의료 기록 단서 확인." },
    { id: "spaceOxygenGenerator", name: "산소 발생기실", purpose: "압력 밸브 센서 손상과 정전 시점 계산." },
    { id: "spaceDataCore", name: "데이터실", purpose: "해리 계정 접속 로그와 삭제된 의료 기록 조각 복구." },
    { id: "spaceLab", name: "과학 실험실", purpose: "아인슈페너의 환각 실험과 커피 텀블러 확인." },
    { id: "spaceGalleyCorridor", name: "주방 복도", purpose: "안성줴줴이의 냄새 증언과 냄새 이동 경로 확인." }
  ],
  evidence: [
    { name: "얼어붙은 레버 홈 잔류물", role: "결정타 증거", location: "외부 작업 준비실", logic: "Shadow Zone에서만 굳는 수술용 밀봉 젤 성분. 알라딘딘이 내부 점검에서 못 본 이유를 설명한다." },
    { name: "산소 발생기 압력 센서 손상", role: "결정타 증거", location: "산소 발생기실", logic: "메스로 생긴 미세 손상. 정전 당시 알리바이를 무력화한다." },
    { name: "삭제된 데이비드 의료 기록 조각", role: "동기 증거", location: "데이터실", logic: "데이비드의 말기 질환과 메르스의 은폐 동기를 밝힌다." },
    { name: "데이비드의 마지막 무전", role: "반전 증거", location: "에어록", logic: "구조 요청처럼 들리지만 메르스에게 보내는 성공 신호였다." },
    { name: "아인슈페너의 커피 텀블러", role: "미끼 증거", location: "과학 실험실", logic: "아인슈페너를 강하게 의심하게 하지만 최종 수법과 맞지 않는다." },
    { name: "알라딘딘의 공구 흔적", role: "미끼 증거", location: "에어록", logic: "엔지니어 범행처럼 보이지만 레버 봉인 수법과 맞지 않는다." },
    { name: "해리 계정 접속 기록", role: "알리바이 파괴 증거", location: "데이터실", logic: "해리가 아니라 메르스가 계정을 도용했음을 보여준다." },
    { name: "안성줴줴이의 냄새 증언", role: "증언 증거", location: "주방 복도", logic: "커피 아래 소독약/의료 젤 냄새가 있었음을 증명한다." }
  ],
  deductionRoute: [
    "알라딘딘의 공구와 로봇 팔 때문에 엔지니어 범행처럼 보인다.",
    "아인슈페너의 커피와 화학약품 때문에 과학자 범행처럼 보인다.",
    "해리의 삭제 로그 때문에 데이터 은폐 범행처럼 보인다.",
    "하지만 산소 발생기 센서 손상과 수술용 밀봉 젤은 의료실 물품과 연결된다.",
    "해리 계정으로 삭제된 것은 연구 로그가 아니라 데이비드의 의료 기록이었다.",
    "데이비드가 말기 환자였다는 사실이 밝혀진다.",
    "마지막 무전은 구조 요청이 아니라 메르스와 데이비드 사이의 약속된 신호였다.",
    "최종 지목은 메르스다."
  ]
} as const;
