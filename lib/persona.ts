// 용의자 표시용 위험도입니다. "culprit"는 최종 범인을 별도로 강조할 때 사용합니다.
export type SuspicionLevel = "low" | "medium" | "high" | "culprit";

// 인물의 서사상 역할입니다. falseLead는 초반에 강하게 의심받지만 범인이 아닌 인물입니다.
export type CharacterRole =
  | "victim"
  | "culprit"
  | "suspect"
  | "witness"
  | "falseLead";

// 취조실, 인물 도감, 대사 출력에서 공통으로 사용할 수 있는 인물 페르소나 구조입니다.
export interface CharacterPersona {
  // 코드에서 인물을 찾을 때 쓰는 고유 ID입니다.
  id: string;
  name: string;
  role: CharacterRole;
  suspicionLevel: SuspicionLevel;
  ageRange: string;
  socialPosition: string;
  // 플레이어가 처음 마주하는 겉모습입니다.
  publicFace: string;
  // 최종 추리나 반전에서 드러나는 실제 사정입니다.
  privateTruth: string;
  motive: string;
  relationshipToVictim: string;
  speechStyle: string;
  // 취조실 UI에서 인물의 반응 톤을 잡는 기준입니다.
  interrogationAttitude: string;
  // 첫 심문 때 기본으로 보여줄 수 있는 대사입니다.
  openingStatement: string;
  // 증거를 제시하거나 압박했을 때 나올 수 있는 반응입니다.
  pressureResponse: string;
  // 플레이어가 단서를 통해 단계적으로 밝혀야 하는 숨은 정보입니다.
  secrets: string[];
  alibiOrClaim: string;
  // 특정 증거를 인물과 연결했을 때의 오해와 진실을 함께 둡니다.
  evidenceLinks: EvidenceLink[];
  // 심문 분기나 증거 제시 이벤트에서 재사용할 짧은 대사입니다.
  dialogueSamples: DialogueSample[];
}

// 하나의 단서가 플레이어에게 어떤 오해를 만들고, 실제로는 무엇을 뜻하는지 정리합니다.
export interface EvidenceLink {
  evidenceId: string;
  evidenceName: string;
  playerInference: string;
  truth: string;
}

// trigger는 UI나 게임 로직에서 대사를 호출하는 키로 사용할 수 있습니다.
export interface DialogueSample {
  trigger: string;
  line: string;
}

// 메인 인물 데이터입니다. 배열 순서는 도감이나 취조실의 기본 노출 순서로 사용할 수 있습니다.
export const characterPersonas: CharacterPersona[] = [
  // 피해자: 직접 심문 대상은 아니지만, 모든 단서가 점순의 마지막 행적을 복원하게 합니다.
  {
    id: "jeomsun",
    name: "점순",
    role: "victim",
    suspicionLevel: "low",
    ageRange: "열아홉 안팎",
    socialPosition: "유문석 집안의 몸종",
    publicFace: "말수가 적고 눈치를 잘 보지만, 맡은 일은 꼼꼼히 해내는 아이로 알려져 있다.",
    privateTruth: "돌쇠와 함께 집을 떠나 새 삶을 시작하려 했다. 그 계획과 춘월의 감정이 겹치며 표적이 되었고, 목을 조른 흔적과 마지막 저항 흔적을 남겼다.",
    motive: "해당 없음. 사건의 피해자이며, 도망 계획과 춘월의 집착 때문에 살해당했다.",
    relationshipToVictim: "본인",
    speechStyle: "상대의 신분에 따라 말을 아끼는 편이다. 돌쇠 앞에서는 조금 더 솔직하고 부드러워진다.",
    interrogationAttitude: "사망한 인물이므로 직접 심문 대상은 아니다. 일기와 편지, 주변 증언을 통해 성격과 행동을 복원한다.",
    openingStatement: "기록과 증거 속에서만 목소리가 남아 있다.",
    pressureResponse: "점순의 선택은 두려움보다 탈출에 가까웠다. 마지막 순간에는 자신을 속여 부른 상대에게 저항했다.",
    secrets: [
      "돌쇠와 함께 도망치기로 약속했다.",
      "사건 전날 밤 뒷문으로 나가 돌쇠와 계획을 확인했다.",
      "창고로 부른 편지를 돌쇠가 쓴 것으로 믿었다.",
      "마지막 순간 옷고름으로 목이 졸리자 버티며 범인의 팔에 긁힌 흔적을 남겼다."
    ],
    alibiOrClaim: "사건 당일 밤, 찢어진 약속 편지를 따라 창고로 향했다.",
    evidenceLinks: [
      {
        evidenceId: "torn-promise-letter",
        evidenceName: "찢어진 약속 편지",
        playerInference: "돌쇠가 점순을 창고로 불러낸 듯하다.",
        truth: "점순은 편지를 믿고 나갔지만, 편지는 돌쇠가 아니라 춘월이 쓴 미끼였다."
      },
      {
        evidenceId: "torn-clothes-tie",
        evidenceName: "찢어진 옷고름",
        playerInference: "피해자가 붙잡혔거나 목이 눌렸을 가능성이 있다.",
        truth: "섬유가 낡아 끊어진 것이 아니라 강한 압박 뒤 찢긴 흔적이다. 하인 옷감보다 고급스러운 비단이라 춘월의 물건일 가능성이 있다."
      }
    ],
    dialogueSamples: [
      {
        trigger: "memory",
        line: "저는 그저 이 집을 나가고 싶었을 뿐입니다."
      },
      {
        trigger: "letter",
        line: "그 글씨가 돌쇠의 마음이라 믿었습니다."
      },
      {
        trigger: "death-cause",
        line: "말은 남기지 못했으나, 목의 그림자와 찢어진 옷고름이 대신 남았습니다."
      }
    ]
  },
  // 초반 미끼 용의자: 호패와 6/29 일기 때문에 강하게 의심받지만 실제 범인은 아닙니다.
  {
    id: "yoo-munseok",
    name: "유문석",
    role: "falseLead",
    suspicionLevel: "high",
    ageRange: "스물여덟 안팎",
    socialPosition: "양반가 도련님, 춘월의 정혼자",
    publicFace: "체면과 질서를 중시하는 엄격한 도련님이다. 아랫사람에게 위계와 분수를 자주 강조한다.",
    privateTruth: "점순을 크게 꾸짖은 일은 사실이지만, 살인은 하지 않았다. 사랑방의 빈 호패 주머니와 잘린 호패끈은 자신을 겨냥한 누명을 보여 준다.",
    motive: "집안의 체면을 해치는 일을 막으려 했다는 의심을 받는다.",
    relationshipToVictim: "주인과 몸종",
    speechStyle: "낮고 단호한 말투. 감정이 흔들려도 체면 때문에 쉽게 인정하지 않는다.",
    interrogationAttitude: "처음에는 불쾌감을 드러내며 권위적으로 버틴다. 호패 이야기가 나오면 당황하지만, 사라진 시점을 반복해서 말한다.",
    openingStatement: "내가 그 아이를 꾸짖은 것은 맞소. 허나 사람을 죽였다는 말은 지나치오.",
    pressureResponse: "호패는 전날부터 보이지 않았소. 내가 현장에 흘렸다면 어찌 그리 말하겠소?",
    secrets: [
      "6월 29일 사랑방에서 점순을 크게 혼냈다.",
      "점순과 돌쇠의 관계를 불쾌하게 여겼다.",
      "호패가 사건 전날부터 없어졌다는 사실을 즉시 알리지 않았다.",
      "하인 장부의 점순 이름 옆 표시 때문에 감시나 처벌 정황을 의심받는다."
    ],
    alibiOrClaim: "사건 전날부터 호패를 찾지 못했고, 사건 당일 밤에는 사랑방 근처를 떠나지 않았다고 주장한다.",
    evidenceLinks: [
      {
        evidenceId: "identity-tag",
        evidenceName: "유문석의 호패",
        playerInference: "유문석이 점순과 다투다 현장에 호패를 흘렸다.",
        truth: "호패는 누군가가 미리 가져와 현장에 떨어뜨린 조작 증거다."
      },
      {
        evidenceId: "muduk-diary-0629",
        evidenceName: "무덕이 일기 6/29",
        playerInference: "사랑방에서 점순을 꾸짖은 남자가 유문석이며, 강한 동기가 있어 보인다.",
        truth: "꾸짖은 일은 사실이지만, 살인의 직접 증거는 아니다. 춘월이 유문석에게 의심이 향하도록 이용한 미끼다."
      },
      {
        evidenceId: "cut-identity-tag-cord",
        evidenceName: "잘린 호패끈",
        playerInference: "격한 몸싸움 중 호패끈이 끊어졌다.",
        truth: "날카로운 것으로 미리 잘린 흔적이 있어 현장 유실이 아니라 조작으로 보아야 한다."
      },
      {
        evidenceId: "empty-identity-tag-box",
        evidenceName: "빈 호패 주머니",
        playerInference: "호패가 원래 사랑방에 보관되어 있었고, 최근 누군가 빼냈을 수 있다.",
        truth: "먼지 자국이 최근에 호패가 빠진 사실을 보여 주며, 유문석이 현장에서 흘린 물건이 아니라 누군가 가져간 물건임을 뒷받침한다."
      },
      {
        evidenceId: "servant-register",
        evidenceName: "하인 장부",
        playerInference: "점순의 이름 옆 표시가 유문석의 감시나 처벌 동기처럼 보인다.",
        truth: "유문석에게 동기가 있어 보이게 하는 권력 관계 단서지만, 살인의 직접 증거는 아니다."
      },
    ],
    dialogueSamples: [
      {
        trigger: "accuse-with-identity-tag",
        line: "호패가 그곳에 있었다 하여 내가 그곳에 있었다는 뜻은 아니오."
      },
      {
        trigger: "diary-0629",
        line: "분수를 알라 한 것은 맞소. 집안의 법도가 무너지면 모두가 다치는 법이니."
      },
      {
        trigger: "cord-cut",
        line: "끈이 칼로 잘렸다고? 그렇다면 누군가 내 이름을 들고 간 것이오."
      },
      {
        trigger: "empty-identity-tag-box",
        line: "그 보관함은 비어 있었소. 허나 내가 비운 것은 아니오."
      }
    ]
  },
  // 관계 은폐형 용의자: 도망 약속을 숨겨 의심받지만, 편지 말투 단서로 누명이 풀립니다.
  {
    id: "dolsoe",
    name: "돌쇠",
    role: "suspect",
    suspicionLevel: "medium",
    ageRange: "스물셋 안팎",
    socialPosition: "집안의 머슴",
    publicFace: "무뚝뚝하고 힘이 좋다. 말보다 행동이 앞서 오해를 사기 쉽다.",
    privateTruth: "점순과 서로 마음을 나누었고 함께 도망치기로 했다. 도망 보따리와 팔의 베인 상처 때문에 의심받지만, 편지의 말투와 상처의 성격이 약속 편지와 저항 흔적에서 벗어나게 해 준다.",
    motive: "점순과의 관계가 틀어졌거나 도망 계획이 실패해 다툰 것처럼 의심받는다.",
    relationshipToVictim: "연인",
    speechStyle: "짧고 투박하다. 점순에게도 정중한 문어체보다는 직접적인 말을 쓴다.",
    interrogationAttitude: "처음에는 만남 자체를 부인한다. 뒷문 목격 정황을 제시하면 도망 계획을 인정하지만 살인은 완강히 부인한다.",
    openingStatement: "저는 모릅니다. 그날 밤 점순이를 본 적도 없습니다.",
    pressureResponse: "함께 떠나기로 한 건 맞소. 하지만 그날은 약속만 확인했을 뿐이오.",
    secrets: [
      "6월 30일 밤 점순을 몰래 만났다.",
      "점순과 함께 도망치기로 했다.",
      "팔에 베인 상처가 있어 초반 의심을 받는다.",
      "글씨 연습지는 약속 편지의 단정한 필체와 다르다."
    ],
    alibiOrClaim: "점순과 뒷문 근처에서 도망 계획만 확인한 뒤 헤어졌다고 말한다.",
    evidenceLinks: [
      {
        evidenceId: "muduk-diary-0630",
        evidenceName: "무덕이 일기 6/30",
        playerInference: "밤늦게 점순을 찾아온 사람이 돌쇠일 가능성이 높다.",
        truth: "돌쇠가 점순을 만난 것은 사실이지만, 그 만남은 살해 현장이 아니라 도망 약속 확인이었다."
      },
      {
        evidenceId: "torn-promise-letter",
        evidenceName: "찢어진 약속 편지",
        playerInference: "돌쇠가 점순을 창고로 불러냈다.",
        truth: "편지 말투가 돌쇠와 맞지 않는다. 돌쇠는 '기다리시오' 같은 정중한 표현을 쓰지 않는다."
      },
      {
        evidenceId: "cut-hand",
        evidenceName: "돌쇠의 팔 상처",
        playerInference: "점순이 저항하며 돌쇠의 팔을 다치게 했을 수 있다.",
        truth: "상처는 일하다 생긴 베인 자국으로, 손톱으로 긁힌 흔적과 맞지 않는다."
      },
      {
        evidenceId: "escape-bundle",
        evidenceName: "돌쇠의 도망 보따리",
        playerInference: "돌쇠가 점순과 도망칠 준비를 했고 사건에 깊이 얽혀 있다.",
        truth: "오래 준비한 도피 흔적이며, 갑작스러운 살인 준비와는 결이 다르다."
      },
      {
        evidenceId: "bloodstained-cloth",
        evidenceName: "피 묻은 붕대",
        playerInference: "점순의 피를 닦은 붕대처럼 보인다.",
        truth: "돌쇠의 베인 팔을 감싼 붕대이며, 피해자가 남긴 긁힌 흔적과 일치하지 않는다."
      },
      {
        evidenceId: "dolsoe-writing-practice",
        evidenceName: "돌쇠 글씨 연습지",
        playerInference: "돌쇠가 약속 편지를 쓰기 위해 글씨를 연습했을 수 있다.",
        truth: "서툰 붓글씨와 약속 편지의 정중하고 단정한 필체가 달라 돌쇠가 쓴 편지가 아님을 뒷받침한다."
      }
    ],
    dialogueSamples: [
      {
        trigger: "deny-first",
        line: "아니오. 전 그날 아무도 만나지 않았소."
      },
      {
        trigger: "diary-0630",
        line: "점순이와 떠나기로 했소. 그게 죄라면 벌을 받겠소. 허나 죽이진 않았소."
      },
      {
        trigger: "letter-tone",
        line: "내가 점순이에게 '기다리시오'라니. 그런 말은 입에 붙지도 않소."
      },
      {
        trigger: "escape-bundle",
        line: "그 보따리는 떠나려 챙긴 것이오. 해치려 챙긴 것이 아니오."
      }
    ]
  },
  // 진범: 편지, 호패, 팔 상처가 모두 춘월에게 모이도록 설계된 인물입니다.
  {
    id: "chunwol",
    name: "춘월",
    role: "culprit",
    suspicionLevel: "culprit",
    ageRange: "스물여섯 안팎",
    socialPosition: "유문석 집안의 아씨",
    publicFace: "단정하고 침착하며, 집안일을 조용히 살피는 인물로 보인다.",
    privateTruth: "점순과 돌쇠의 도망 계획을 알고 있었다. 돌쇠인 척 편지를 써 점순을 창고로 유인하고, 자신의 옷고름으로 목을 졸라 살해한 뒤 유문석의 호패를 현장에 남겨 누명을 씌웠다.",
    motive: "춘월은 원치 않는 혼인을 앞두고 자기 삶을 통제하지 못하고 있었다. 그 와중에 돌쇠에게 품은 마음을 오래 숨겼고, 점순이 돌쇠와 함께 떠나려 한다는 사실을 듣자 사랑을 빼앗기는 일뿐 아니라 자신의 체면과 집안 질서까지 무너지는 일로 받아들였다.",
    relationshipToVictim: "집안의 윗사람과 몸종",
    speechStyle: "차분하고 예의 바르지만 문장이 지나치게 정돈되어 있다. 감정을 숨길수록 더 공손해진다.",
    interrogationAttitude: "초반에는 걱정하는 척하며 수사관의 추론을 유문석과 돌쇠 쪽으로 돌린다. 편지지와 팔의 긁힌 자국을 추궁하면 침착함이 무너진다.",
    openingStatement: "점순이가 그런 일을 당하다니 아직도 믿기지 않습니다. 집안 모두가 놀랐지요.",
    pressureResponse: "그 종이는 제 방에도 있는 흔한 종이입니다. 그것만으로 어찌 저를 의심하십니까?",
    secrets: [
      "점순과 돌쇠의 도망 계획을 알고 있었다.",
      "돌쇠의 말투를 흉내 내지 못해 정중한 약속 편지를 남겼다.",
      "유문석의 호패를 미리 가져갔다.",
      "호패끈을 날카로운 것으로 잘라 현장에 떨어뜨렸다.",
      "범행에 쓴 옷고름을 무덕의 집 근처에 버렸고, 무덕이 그것을 주워 방에 두었다.",
      "점순과 몸싸움을 벌이다 팔에 긁힌 자국이 생겼다.",
      "춘월의 방에 숨겨진 돌쇠 초상화에는 여러 번 고쳐 그린 흔적과 '떠나지 마라'는 글귀가 남아 있다. 혼서 조각은 유문석의 사랑방에서 발견되며, 복원된 하인 장부와 대조해야 춘월이 혼서 문갑 때문에 사랑방을 다녀간 시각과 사유를 확인할 수 있다. 두 증거만으로 춘월의 감정이나 범행 동기를 단정하지 않는다."
    ],
    alibiOrClaim: "사건 당일 밤 방에 있었다고 말하며, 소란을 직접 보지 못했다고 주장한다.",
    evidenceLinks: [
      {
        evidenceId: "paper-from-chunwol",
        evidenceName: "춘월 주변의 편지지",
        playerInference: "약속 편지가 춘월 주변 물건으로 쓰였을 수 있다.",
        truth: "점순을 창고로 유인한 편지는 춘월의 주변에서 나온 종이로 작성되었다."
      },
      {
        evidenceId: "torn-promise-letter",
        evidenceName: "찢어진 약속 편지",
        playerInference: "돌쇠가 쓴 편지처럼 보인다.",
        truth: "정중한 말투가 돌쇠와 맞지 않는다. 춘월이 돌쇠인 척 쓴 편지다."
      },
      {
        evidenceId: "identity-tag",
        evidenceName: "유문석의 호패",
        playerInference: "유문석이 범인일 가능성을 가리킨다.",
        truth: "춘월이 유문석에게 의심을 돌리기 위해 현장에 남겼다."
      },
      {
        evidenceId: "scratch-on-arm",
        evidenceName: "춘월의 팔 긁힌 자국",
        playerInference: "점순이 마지막 순간 저항하며 남긴 흔적일 수 있다.",
        truth: "점순이 마지막으로 저항한 상대가 춘월임을 드러내는 결정적 단서다."
      },
      {
        evidenceId: "torn-clothes-tie",
        evidenceName: "찢어진 옷고름",
        playerInference: "뒷문을 지나던 누군가의 옷에서 뜯겨 나간 비단일 수 있다.",
        truth: "점순의 목에 남은 압박 흔적과 폭·마찰 방향이 닮았다. 이것만으로 주인이나 범행 도구를 단정할 수 없으며, 뜯긴 저고리와 진술을 함께 봐야 한다."
      },
      {
        evidenceId: "dolsoe-portrait",
        evidenceName: "돌쇠 초상화",
        playerInference: "춘월이 돌쇠에게 사적인 감정을 품었을 수 있다.",
        truth: "단순한 호감이 아니라 오래 숨긴 집착에 가깝다. 점순과 돌쇠의 도망 계획을 막으려 한 감정적 동기를 강하게 보강한다."
      },
      {
        evidenceId: "marriage-letter",
        evidenceName: "혼서 조각",
        playerInference: "춘월이 원치 않는 혼인 압박을 받고 있었을 수 있다.",
        truth: "춘월이 자기 삶을 마음대로 정하지 못하던 압박을 보여 준다. 그 압박이 돌쇠와 점순의 선택을 통제하려는 마음으로 뒤틀렸지만, 범행을 정당화하지는 않는다."
      },
    ],
    dialogueSamples: [
      {
        trigger: "first-interrogation",
        line: "사또께서는 먼저 호패의 주인을 살피셔야 하지 않을까요?"
      },
      {
        trigger: "letter-paper",
        line: "집안의 종이가 어찌 제 것뿐이겠습니까. 누구나 손댈 수 있는 물건입니다."
      },
      {
        trigger: "scratch-on-arm",
        line: "그 상처를 그런 식으로 보지 말아 주십시오. 더는 말씀드릴 수 없습니다."
      },
      {
        trigger: "final-accusation",
        line: "그 아이가 돌쇠와 떠난다 들었을 때, 제게 남은 것마저 빼앗기는 줄 알았습니다. 혼인도 제 뜻이 아니었는데, 돌쇠마저 제 뜻 밖으로 가 버릴까 두려웠습니다."
      }
    ]
  },
  // 핵심 목격자: 직접 본 장면보다 일기 기록으로 사건의 시간표를 이어 주는 인물입니다.
  {
    id: "muduk",
    name: "무덕",
    role: "witness",
    suspicionLevel: "low",
    ageRange: "열다섯 안팎",
    socialPosition: "잔심부름을 맡는 어린 하인",
    publicFace: "겁이 많고 조심스럽지만, 집안 구석구석의 소리를 잘 듣고 기억한다.",
    privateTruth: "직접 본 것은 많지 않지만, 번진 일기와 짚신 단서를 통해 사건의 시간표를 이어 준다. 잠깐 의심받지만 작은 발자국과 짚신의 차이로 목격자 위치가 분명해진다.",
    motive: "없다. 다만 윗사람들이 두려워 처음에는 일기를 보여 주길 망설이고, 밤에 밖에 나간 것처럼 보이는 진흙 묻은 짚신 때문에 오해를 받는다.",
    relationshipToVictim: "같은 집에서 일하던 하인",
    speechStyle: "머뭇거리며 말끝을 흐린다. 확실히 들은 말만 조심스럽게 반복한다.",
    interrogationAttitude: "강하게 몰아붙이면 위축된다. 안심시키면 일기 내용을 토대로 중요한 말을 꺼낸다.",
    openingStatement: "저는 본 게 아니라 들은 것뿐입니다. 그래서 말해도 되는지 모르겠습니다.",
    pressureResponse: "사랑방 쪽이었습니다. '네 분수를 알라'는 말만은 똑똑히 들었습니다.",
    secrets: [
      "6월 29일 사랑방 쪽에서 점순이 꾸중 듣는 소리를 들었다.",
      "6월 30일 밤 뒷문이 열리고 낮은 목소리가 오가는 것을 들었다.",
      "다음 날 아침 그 일이 마음에 걸려 춘월에게 물었다.",
      "무덕이 방의 진흙 묻은 짚신은 작은 발자국과 맞지 않는 미끼 단서다."
    ],
    alibiOrClaim: "사건 전후로 자신이 들은 내용을 일기에 적어 두었다.",
    evidenceLinks: [
      {
        evidenceId: "muduk-diary-0629",
        evidenceName: "무덕이 일기 6/29",
        playerInference: "유문석이 점순을 심하게 꾸짖었다.",
        truth: "유문석에게 동기가 있어 보이게 만드는 초반 단서다."
      },
      {
        evidenceId: "muduk-diary-0630",
        evidenceName: "무덕이 일기 6/30",
        playerInference: "점순이 사건 전날 누군가와 몰래 만났다.",
        truth: "점순과 돌쇠의 도망 약속이 실제였고, 춘월이 그 정보를 알게 되는 통로가 된다."
      },
      {
        evidenceId: "muduk-blurred-diary",
        evidenceName: "무덕이의 번진 일기",
        playerInference: "무덕이 뭔가를 숨기거나 말을 지운 듯하다.",
        truth: "등잔으로 보면 번진 글씨 아래에 발소리와 뒷문을 암시하는 단어가 드러나, 무덕이 범인이 아니라 목격자임을 강화한다."
      },
      {
        evidenceId: "muddy-straw-shoes",
        evidenceName: "진흙 묻은 짚신",
        playerInference: "무덕이 밤에 뒷문 마당을 오갔을 수 있다.",
        truth: "진흙은 비슷하지만 발 크기와 무게감이 작은 발자국과 달라 무덕이 남긴 흔적이 아님을 보여 준다. 발자국의 실제 주인은 확정하지 않는다."
      },
      {
        evidenceId: "small-footprint",
        evidenceName: "작은 발자국",
        playerInference: "무덕의 짚신 흔적일 수 있다.",
        truth: "무덕의 짚신보다 짧고 좁아 같은 흔적이 아니다. 발자국만으로 남긴 사람을 특정할 수는 없다."
      },
      {
        evidenceId: "torn-clothes-tie",
        evidenceName: "찢어진 옷고름",
        playerInference: "무덕의 방에 있었으므로 무덕이 범인일 수 있다.",
        truth: "무덕은 집 근처에 버려진 옷고름을 주워 방에 두었다. 겁이 나 숨겼을 뿐, 재질은 하녀 물건보다 양반가 여인의 옷고름에 가깝다."
      }
    ],
    dialogueSamples: [
      {
        trigger: "diary-0629",
        line: "눈가를 훔치며 마당을 지나간 건 점순 누이가 맞습니다."
      },
      {
        trigger: "diary-0630",
        line: "뒷문이 아주 잠깐 열렸습니다. 낮은 목소리라 얼굴은 보지 못했습니다."
      },
      {
        trigger: "asked-chunwol",
        line: "무서워서 춘월 아씨께 여쭈었습니다. 제가 잘못 들은 건지 알고 싶어서요."
      },
      {
        trigger: "muddy-straw-shoes",
        line: "제 짚신에 흙이 묻은 건 맞습니다. 하지만 그 작은 발자국은 제 것이 아닙니다."
      }
    ]
  }
];

// 플레이어가 단서를 해석하는 순서를 설계하기 위한 사건 흐름표입니다.
export const caseTimeline = [
  {
    date: "6/29",
    event: "점순이 사랑방 쪽에서 크게 꾸중을 듣고 눈가를 훔치며 마당을 지나간다.",
    exposedSuspicion: "유문석에게 강한 동기가 있어 보인다.",
    hiddenTruth: "유문석은 점순을 꾸짖었지만, 이 일은 누명을 위한 초반 미끼로 작동한다."
  },
  {
    date: "6/30 초경",
    event: "점순이 밤늦게 뒷문에서 누군가를 만나 도망 약속을 확인한다.",
    exposedSuspicion: "돌쇠가 점순을 몰래 불러냈을 가능성이 생긴다.",
    hiddenTruth: "돌쇠와 점순의 도망 계획을 춘월이 알게 된다."
  },
  {
    date: "7/1 낮",
    event: "무덕이 춘월에게 점순의 밤 외출과 돌쇠 이야기를 얼결에 전한다.",
    exposedSuspicion: "무덕이 사건의 내막을 숨기는 듯 보인다.",
    hiddenTruth: "춘월이 두 사람의 도망 계획을 알게 되는 계기다."
  },
  {
    date: "7/1 초경 반",
    event: "춘월이 혼서 문갑을 찾는다는 명목으로 사랑방에 들어간다.",
    exposedSuspicion: "혼례 준비를 위한 평범한 출입처럼 보인다.",
    hiddenTruth: "호패가 사라진 때 춘월에게 사랑방 접근 기회가 있었다."
  },
  {
    date: "7/1 이경 무렵",
    event: "점순이 '오늘 밤 창고에서 기다리시오, 함께 떠납시다'라는 편지를 믿고 창고로 향하고, 춘월의 옷고름으로 목이 졸린다.",
    exposedSuspicion: "돌쇠가 점순을 창고로 불렀다고 보인다.",
    hiddenTruth: "편지는 춘월이 돌쇠인 척 쓴 것이며, 찢어진 옷고름과 춘월의 팔 상처가 살해 방식과 접촉 흔적을 드러낸다."
  },
  {
    date: "7/1 이경 뒤",
    event: "점순의 시신 근처에서 유문석의 호패가 발견된다.",
    exposedSuspicion: "유문석이 현장에 있었던 것처럼 보인다.",
    hiddenTruth: "춘월이 미리 가져간 호패를 현장에 떨어뜨렸다."
  }
] as const;

// 최종 고발 화면이나 정답 판정에서 사용할 범인 ID입니다.
export const finalCulpritId = "chunwol";
