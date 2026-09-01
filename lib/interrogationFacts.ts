import type { SuspectPersona } from "@/lib/suspectPersonas";

export type FactVisibility = "public" | "collected" | "revealed" | "hidden" | "never";
export type InterrogationReaction = "calm" | "attentive" | "avoid" | "nervous" | "shocked" | "silent";

export type InterrogationFact = {
  id: string;
  suspectIds: string[];
  topics: string[];
  aliases: string[];
  fact: string;
  reasoningGuide?: string;
  visibility: FactVisibility;
  evidenceNames?: string[];
  requiresAllEvidence?: boolean;
  responseMode?: InterrogationReaction;
  pressure?: number;
  discoverable?: boolean;
};

type RetrieveFactsInput = {
  persona: SuspectPersona;
  question: string;
  evidenceNames: string[];
  collectedEvidenceNames: string[];
  revealedFactIds: string[];
  limit?: number;
};

const commonSemanticAliases: Record<string, string[]> = {
  alibi: ["알리바이", "어디", "행적", "그날", "그때", "어젯밤", "사건 당일", "무엇", "뭐", "했나", "있었나"],
  relationship: ["관계", "사이", "마음", "좋아", "미워", "사랑", "질투", "혼인"],
  escape: ["도망", "떠나다", "달아나다", "야반도주", "함께 가다", "밤 외출", "계획"],
  letter: ["편지", "쪽지", "약속", "글씨", "문장", "창고", "불러내다"],
  hopae: ["호패", "패", "끈", "분가루", "가루", "누명", "훔치다", "사라지다"],
  injury: ["상처", "긁히다", "피", "붕대", "팔", "저항", "몸싸움"],
  ribbon: ["옷고름", "비단", "끈", "목", "조르다", "찢어지다", "향"],
  death: ["죽음", "살해", "범인", "시신", "점순", "어떻게 죽", "누가 죽"],
  diary: ["일기", "기록", "뒷문", "목격", "들었다", "보았다", "말했다"],
  wand: ["지팡이", "부러진 지팡이", "폐기함", "버렸다", "누명"],
  rune: ["룬스톤", "경보", "빙결", "얼리다", "화염 감지"],
  crystal: ["수정구", "기록", "환각", "조작", "출입 기록"],
  library: ["도서관", "대출", "보안 마법책", "책", "공부"],
  arson: ["방화", "불", "화재", "실습실", "범인"],
  powerAccess: ["전력 제어실", "전력실", "제어실", "출입 카드", "출입증", "카드", "권한", "입장"],
  keycard: ["접속 키카드", "키카드 대여", "빌려주다", "빌려줬다", "누구에게"],
  suit: ["우주복", "추진 레버", "결빙", "공구", "클램프", "장비 점검"],
  blackout: ["정전", "전압 센서", "지연 타이머", "보조 전력", "외벽 패널"],
  medicine: ["약물", "앰풀", "혈액 시료", "냉각 보관함", "의료실"],
  radio: ["무전", "에어록", "22시 11분", "시간만 맞으면"]
};

export const interrogationFacts: InterrogationFact[] = [
  {
    id: "CHUNWOL_ALIBI",
    suspectIds: ["chunwol"],
    topics: ["alibi"],
    aliases: ["자기 방", "방에 있었다"],
    fact: "춘월은 사건 당일 밤 자기 방에 있었다고 주장한다.",
    visibility: "public",
    responseMode: "calm"
  },
  {
    id: "CHUNWOL_HEARD_ESCAPE_PLAN",
    suspectIds: ["chunwol", "mudeok"],
    topics: ["escape", "diary"],
    aliases: ["무덕에게 들었다", "점순의 밤 외출", "돌쇠와 떠나다"],
    fact: "춘월은 무덕에게 점순의 밤 외출과 돌쇠 이야기를 얼핏 들었다.",
    visibility: "public",
    responseMode: "avoid",
    pressure: 1,
    discoverable: true
  },
  {
    id: "CHUNWOL_HIDDEN_PORTRAIT",
    suspectIds: ["chunwol"],
    topics: ["relationship"],
    aliases: ["돌쇠의 그림", "돌쇠 초상", "숨긴 그림", "지운 글씨"],
    fact: "춘월의 방에서 돌쇠를 섬세하게 그린 숨겨 둔 초상이 발견되었다.",
    visibility: "collected",
    evidenceNames: ["돌쇠의 그림"],
    responseMode: "nervous",
    pressure: 2,
    discoverable: true
  },
  {
    id: "CHUNWOL_LETTER_ACCESS",
    suspectIds: ["chunwol"],
    topics: ["letter"],
    aliases: ["찢어진 약속 편지", "정중한 말투", "집안 종이", "창고에서 기다리시오"],
    fact: "찢어진 약속 편지는 양반가에서 쓰는 종이와 정중한 말투로 작성되었다.",
    reasoningGuide: "편지 작성자가 돌쇠가 아닐 가능성을 높이지만, 특정 양반가 인물이 썼다고 단독으로 확정하지는 못한다.",
    visibility: "collected",
    evidenceNames: ["찢어진 약속 편지"],
    responseMode: "avoid",
    pressure: 2,
    discoverable: true
  },
  {
    id: "CHUNWOL_RIBBON_MATERIAL",
    suspectIds: ["chunwol", "mudeok", "yoomunseok"],
    topics: ["ribbon", "death"],
    aliases: ["찢어진 옷고름", "고급 비단", "하녀 물건", "목을 조르다"],
    fact: "찢어진 옷고름은 하녀가 쓰기 어려운 고급 비단이며 점순의 목을 조른 흔적과 맞는다.",
    reasoningGuide: "고급 비단에 접근할 수 있는 인물의 혐의를 높이며, 단순 소유보다 실제 훼손 부위와의 일치가 중요하다.",
    visibility: "collected",
    evidenceNames: ["찢어진 옷고름"],
    responseMode: "nervous",
    pressure: 3,
    discoverable: true
  },
  {
    id: "CHUNWOL_ARM_SCRATCH",
    suspectIds: ["chunwol"],
    topics: ["injury"],
    aliases: ["긁힌 팔 흔적", "팔의 긁힌 자국", "소매 아래 상처"],
    fact: "춘월의 소매 아래에는 누군가의 저항으로 생긴 듯한 긁힌 상처가 있다.",
    reasoningGuide: "사건 직전 몸싸움 가능성을 높이는 직접 정황이지만, 상처의 시점과 원인을 함께 확인해야 한다.",
    visibility: "collected",
    evidenceNames: ["긁힌 팔 흔적"],
    responseMode: "nervous",
    pressure: 3,
    discoverable: true
  },
  {
    id: "CHUNWOL_HOPAE_POWDER",
    suspectIds: ["chunwol", "yoomunseok"],
    topics: ["hopae"],
    aliases: ["호패 조각", "향이 섞인 가루", "고운 분가루", "화장 가루"],
    fact: "현장의 호패 조각에서 향이 섞인 고운 분가루가 발견되었다.",
    reasoningGuide: "호패 원래 주인보다 분가루를 사용하는 사람이 호패를 만졌거나 옮겼을 가능성을 높인다.",
    visibility: "collected",
    evidenceNames: ["호패 조각"],
    responseMode: "avoid",
    pressure: 2,
    discoverable: true
  },
  {
    id: "CHUNWOL_CRIME_TRUTH",
    suspectIds: ["chunwol"],
    topics: ["death", "letter", "ribbon"],
    aliases: ["범행", "자백", "진범"],
    fact: "춘월이 거짓 편지로 점순을 유인하고 옷고름으로 목을 졸랐다.",
    visibility: "never",
    responseMode: "silent"
  },
  {
    id: "DOLSOE_ALIBI",
    suspectIds: ["dolsoe"],
    topics: ["alibi", "escape"],
    aliases: ["뒷문에서 헤어졌다", "창고에는 가지 않았다"],
    fact: "돌쇠는 사건 당일 밤 점순과 뒷문 근처에서 도망 계획만 확인한 뒤 헤어졌고 창고에는 가지 않았다고 주장한다.",
    visibility: "public",
    responseMode: "calm"
  },
  {
    id: "DOLSOE_ESCAPE_PLAN",
    suspectIds: ["dolsoe"],
    topics: ["escape"],
    aliases: ["도망 보따리", "점순과 떠나다", "뒷문 약속"],
    fact: "돌쇠와 점순은 함께 마을을 떠날 계획을 세웠다.",
    visibility: "collected",
    evidenceNames: ["도망 보따리", "무덕의 번진 일기"],
    responseMode: "nervous",
    pressure: 2,
    discoverable: true
  },
  {
    id: "DOLSOE_LETTER_MISMATCH",
    suspectIds: ["dolsoe", "chunwol", "yoomunseok"],
    topics: ["letter"],
    aliases: ["돌쇠의 글씨", "돌쇠 말투", "편지 위조"],
    fact: "찢어진 약속 편지의 정중한 문장과 글씨는 돌쇠의 평소 말투와 맞지 않는다.",
    reasoningGuide: "돌쇠가 편지를 썼다는 가설을 약화하며, 누군가 돌쇠를 사칭했을 가능성을 높인다.",
    visibility: "collected",
    evidenceNames: ["찢어진 약속 편지"],
    responseMode: "attentive",
    pressure: 2,
    discoverable: true
  },
  {
    id: "DOLSOE_ARM_WOUND",
    suspectIds: ["dolsoe"],
    topics: ["injury"],
    aliases: ["돌쇠의 팔 상처", "피 묻은 붕대", "일하다 다치다"],
    fact: "돌쇠는 팔 상처와 피 묻은 붕대가 일을 하다 다친 흔적이라고 주장한다.",
    visibility: "collected",
    evidenceNames: ["돌쇠의 팔 상처", "피 묻은 붕대"],
    responseMode: "nervous",
    pressure: 1
  },
  {
    id: "YOOMUNSEOK_ALIBI",
    suspectIds: ["yoomunseok"],
    topics: ["alibi", "hopae"],
    aliases: ["사랑방", "호패를 찾지 못했다"],
    fact: "유문석은 사건 전날부터 호패를 찾지 못했고 사건 당일 밤 사랑방 근처를 떠나지 않았다고 주장한다.",
    reasoningGuide: "호패 분실은 그의 설명일 뿐이고 사랑방 알리바이도 별도 검증이 필요하다.",
    visibility: "public",
    responseMode: "calm"
  },
  {
    id: "YOOMUNSEOK_MISSING_HOPAE",
    suspectIds: ["yoomunseok", "chunwol"],
    topics: ["hopae"],
    aliases: ["빈 호패 주머니", "끊어진 호패끈", "호패 분실"],
    fact: "유문석의 호패는 사건 전날 이미 사라졌고 빈 주머니에는 끊어진 끈이 남아 있었다.",
    reasoningGuide: "현장 호패만으로 유문석을 범인이라 보는 추론을 약화하고, 누군가 호패를 훔쳐 누명을 씌웠을 가능성을 높인다.",
    visibility: "collected",
    evidenceNames: ["빈 호패 주머니", "끊어진 호패끈", "호패 조각"],
    responseMode: "nervous",
    pressure: 2,
    discoverable: true
  },
  {
    id: "YOOMUNSEOK_LETTER_DENIAL",
    suspectIds: ["yoomunseok"],
    topics: ["letter"],
    aliases: ["편지를 쓰지 않았다", "누명", "말투를 이용하다"],
    fact: "유문석은 찢어진 약속 편지를 자신이 쓰지 않았다고 일관되게 부정한다.",
    visibility: "collected",
    evidenceNames: ["찢어진 약속 편지"],
    responseMode: "attentive",
    pressure: 1
  },
  {
    id: "MUDEOK_ALIBI",
    suspectIds: ["mudeok"],
    topics: ["alibi", "diary"],
    aliases: ["하인방", "뒷문 소리", "나가 보지 않았다"],
    fact: "무덕은 사건 당일 밤 하인방 근처에서 뒷문이 열리는 소리를 들었지만 직접 나가 보지는 않았다고 주장한다.",
    visibility: "public",
    responseMode: "calm"
  },
  {
    id: "MUDEOK_TOLD_CHUNWOL",
    suspectIds: ["mudeok", "chunwol"],
    topics: ["diary", "escape"],
    aliases: ["춘월에게 말했다", "점순의 행방을 물었다", "얼결에 말하다"],
    fact: "무덕은 춘월이 점순의 밤 외출을 캐묻자 돌쇠와 떠날 가능성을 얼결에 말했다.",
    visibility: "collected",
    evidenceNames: ["무덕의 번진 일기", "도망 보따리"],
    responseMode: "nervous",
    pressure: 2,
    discoverable: true
  },
  {
    id: "MUDEOK_FOUND_RIBBON",
    suspectIds: ["mudeok", "chunwol"],
    topics: ["ribbon"],
    aliases: ["주운 옷고름", "무덕의 방", "집 근처에 버리다"],
    fact: "무덕은 집 근처에 버려진 고급 비단 옷고름을 주워 하인방에 숨겼다.",
    visibility: "collected",
    evidenceNames: ["찢어진 옷고름"],
    responseMode: "nervous",
    pressure: 2,
    discoverable: true
  },
  {
    id: "MALPOI_DISCARDED_WAND",
    suspectIds: ["malpoi", "malpoil"],
    topics: ["wand", "arson"],
    aliases: ["말포이 지팡이", "버린 지팡이", "기숙사 폐기함", "주워 간 지팡이"],
    fact: "말포이는 사건 전에 부러진 지팡이를 기숙사 폐기함에 버렸으며, 누군가 그 지팡이를 가져가 범행에 다시 사용할 수 있었다.",
    reasoningGuide: "지팡이의 원래 소유만으로 말포이를 범인이라 보는 추론을 약화하고, 폐기함 접근자를 확인하게 한다.",
    visibility: "collected",
    evidenceNames: ["부러진 지팡이"],
    responseMode: "nervous",
    pressure: 1,
    discoverable: true
  },
  {
    id: "MALPOI_CANNOT_FREEZE_RUNE",
    suspectIds: ["malpoi", "malpoil"],
    topics: ["rune", "arson"],
    aliases: ["빙결 마법을 못 쓴다", "룬스톤을 얼리지 못한다", "화염 마법 학생"],
    fact: "말포이는 강한 화염 마법은 사용하지만 경보 룬스톤을 멈출 만큼 정교한 빙결 마법은 사용하지 못한다.",
    reasoningGuide: "화재만 보면 의심할 수 있으나 경보 무력화 수법과 맞지 않아 말포이 단독 범행 가설을 약화한다.",
    visibility: "collected",
    evidenceNames: ["화염 감지 룬스톤"],
    responseMode: "attentive",
    pressure: 2,
    discoverable: true
  },
  {
    id: "MALPOSAM_ALIBI",
    suspectIds: ["malposam"],
    topics: ["alibi", "crystal"],
    aliases: ["기록 수정구실", "수정구실에 있었다", "사건 당시 위치"],
    fact: "말포삼은 사건 당시 기록 수정구실에 있었으며 처음에는 수정구를 만지지 않았다고 주장한다.",
    visibility: "public",
    responseMode: "avoid",
    pressure: 1
  },
  {
    id: "MALPOSAM_CAST_ILLUSION",
    suspectIds: ["malposam", "malpoil"],
    topics: ["crystal", "arson"],
    aliases: ["환각 마법", "출입 기록을 가렸다", "수정구 조작"],
    fact: "조작된 기록 수정구의 환각 마력은 말포삼의 것이며, 그는 증거를 확인하면 자신이 기록을 가렸다는 사실을 인정한다.",
    visibility: "collected",
    evidenceNames: ["조작된 기록 수정구"],
    responseMode: "shocked",
    pressure: 3,
    discoverable: true
  },
  {
    id: "MALPOSAM_NAMES_MALPOIL",
    suspectIds: ["malposam", "malpoil"],
    topics: ["crystal", "relationship", "arson"],
    aliases: ["누가 부탁", "말포일 부탁", "깜짝 실험", "기록을 가려 달라"],
    fact: "말포삼은 말포일이 깜짝 실험을 준비한다며 복도 출입 기록을 잠시 가려 달라고 부탁했다고 진술한다.",
    reasoningGuide: "말포일이 기록을 숨길 동기와 조작 기회를 만들었다는 점에서 그의 혐의를 크게 높인다.",
    visibility: "collected",
    evidenceNames: ["말포삼의 자백"],
    responseMode: "shocked",
    pressure: 3,
    discoverable: true
  },
  {
    id: "MALPOIL_LIBRARY_ALIBI",
    suspectIds: ["malpoil"],
    topics: ["alibi", "library"],
    aliases: ["도서관에서 공부", "기숙사로 돌아갔다", "사건 당시 행적"],
    fact: "말포일은 사건 당시 도서관에서 공부한 뒤 곧바로 기숙사로 돌아갔다고 주장한다.",
    visibility: "public",
    responseMode: "calm"
  },
  {
    id: "MALPOIL_SECURITY_BOOK",
    suspectIds: ["malpoil", "malpoi", "malposam"],
    topics: ["library", "rune", "arson"],
    aliases: ["보안 마법책", "경보 해제법", "말포일 대출", "빙결 마법책"],
    fact: "말포일은 사건 전날 빙결 마법으로 화염 경보 룬스톤을 멈추는 방법이 적힌 보안 마법책을 빌렸다.",
    reasoningGuide: "범행 수법을 미리 조사한 정황이므로 말포일의 혐의를 높이지만, 실제 실행 증거와 연결해야 한다.",
    visibility: "collected",
    evidenceNames: ["도서관 대출 기록부"],
    responseMode: "nervous",
    pressure: 2,
    discoverable: true
  },
  {
    id: "MALPOIL_ALIBI_BROKEN",
    suspectIds: ["malpoil"],
    topics: ["library", "crystal", "alibi", "arson"],
    aliases: ["알리바이 모순", "기록 조작 지시", "경보 해제 준비"],
    fact: "말포일은 경보 해제법을 미리 조사했고 말포삼에게 자신의 출입 기록을 가리게 했으므로 도서관에만 있었다는 알리바이가 성립하지 않는다.",
    visibility: "collected",
    evidenceNames: ["도서관 대출 기록부", "말포삼의 자백"],
    requiresAllEvidence: true,
    responseMode: "silent",
    pressure: 4,
    discoverable: true
  },
  {
    id: "MALPOIL_ARSON_TRUTH",
    suspectIds: ["malpoil"],
    topics: ["wand", "rune", "crystal", "arson"],
    aliases: ["진범", "범행 전말", "누명을 씌웠다", "열등감"],
    fact: "말포일은 말포이에게 누명을 씌우려고 버려진 지팡이를 사용해 불을 지르고, 빙결 마법으로 경보를 멈춘 뒤 말포삼에게 기록 조작을 부탁했다.",
    visibility: "never",
    responseMode: "silent"
  },
  {
    id: "HARRY_KEYCARD_LOAN",
    suspectIds: ["harry"],
    topics: ["keycard"],
    aliases: ["키카드를 누구에게 빌려줬나", "접속 카드를 빌린 사람", "카드 대여 시각", "메르스"],
    fact: "해리는 키카드 대여를 직접 질문받으면 21시 43분경 메르스에게 빌려줬고 손상된 채 돌려받았다고 밝힌다.",
    reasoningGuide: "해리 계정의 접속을 곧바로 해리 본인의 행동으로 볼 수 없게 하며, 당시 카드를 빌린 메르스의 접근 가능성을 높인다.",
    visibility: "public",
    responseMode: "nervous",
    pressure: 1,
    discoverable: true
  },
  {
    id: "ALADDINDIN_POWER_ACCESS",
    suspectIds: ["aladdindin"],
    topics: ["powerAccess"],
    aliases: ["전력 제어실에 들어가는 법", "출입 카드를 달라", "제어실 출입 권한"],
    fact: "알라딘딘은 전력 제어실 출입 카드를 관리하며, 조사관이 출입 방법이나 카드를 요청하면 카드를 건넨다.",
    reasoningGuide: "전력 제어실 접근 기회를 뜻하지만, 접근 권한만으로 전력 조작의 실행자를 확정하지 못한다.",
    visibility: "public",
    responseMode: "attentive"
  },
  {
    id: "ALADDINDIN_SUIT_CHECK",
    suspectIds: ["aladdindin"],
    topics: ["suit"],
    aliases: ["추진 레버 결빙", "공구 클램프", "점검 당시 정상"],
    fact: "출발 전 점검에서는 추진 레버가 정상이었고 엔지니어 공구 클램프에서는 젤 흔적이 검출되지 않았다.",
    reasoningGuide: "알라딘딘의 공구로 레버를 조작했다는 가설을 약화하며, 점검 이후 다른 접근자를 찾아야 한다.",
    visibility: "collected",
    evidenceNames: ["추진 레버 결빙 기록", "엔지니어 공구 클램프"],
    responseMode: "attentive",
    pressure: 1,
    discoverable: true
  },
  {
    id: "ALADDINDIN_HEARD_MERS_RADIO",
    suspectIds: ["aladdindin"],
    topics: ["blackout", "radio"],
    aliases: ["메르스의 수상한 무전", "이제 시간만 맞으면 된다", "22시 11분 무전"],
    fact: "전력 조작 증거로 압박받은 알라딘딘은 22시 11분경 에어록 근처에서 메르스가 이제 시간만 맞으면 된다고 무전하는 것을 들었다고 밝힌다.",
    reasoningGuide: "타이머 작동 시점과 메르스의 발언이 맞물려 그의 사전 계획 가능성을 높이지만, 목격 진술과 장치 설치를 직접 연결해야 한다.",
    visibility: "collected",
    evidenceNames: ["조작된 전압 센서", "비인가 지연 타이머"],
    responseMode: "nervous",
    pressure: 2,
    discoverable: true
  },
  {
    id: "EINSPANNER_SAW_MERS_AMPOULE",
    suspectIds: ["einspanner"],
    topics: ["medicine"],
    aliases: ["메르스가 옮긴 냉각 보관함", "21시 47분 목격", "앰풀의 주인"],
    fact: "약물 증거로 추궁받은 아인슈페너는 21시 47분경 메르스가 앰풀이 든 냉각 보관함을 의료실 방향으로 옮기는 모습을 봤다고 밝힌다.",
    reasoningGuide: "메르스가 약물에 직접 접근했다는 가능성을 높이지만, 실제 투여 기록과 연결해야 한다.",
    visibility: "collected",
    evidenceNames: ["혈액 시료 분석 기록", "미승인 약물"],
    responseMode: "nervous",
    pressure: 2,
    discoverable: true
  }
];

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function tokenize(value: string) {
  return normalize(value)
    .split(/[^가-힣a-z0-9]+/)
    .flatMap((token) => (token.length >= 2 ? [token] : []));
}

function expandTerms(fact: InterrogationFact) {
  return [
    ...fact.topics.flatMap((topic) => [topic, ...(commonSemanticAliases[topic] || [])]),
    ...fact.aliases,
    ...(fact.evidenceNames || [])
  ];
}

function canUseFact(fact: InterrogationFact, collectedEvidence: Set<string>, revealedFacts: Set<string>) {
  if (fact.visibility === "never" || fact.visibility === "hidden") return false;
  if (fact.visibility === "public") return true;
  if (fact.visibility === "revealed") return revealedFacts.has(fact.id);
  const evidenceNames = fact.evidenceNames || [];
  return fact.requiresAllEvidence
    ? evidenceNames.length > 0 && evidenceNames.every((name) => collectedEvidence.has(name))
    : evidenceNames.some((name) => collectedEvidence.has(name));
}

function baselineFacts(persona: SuspectPersona): InterrogationFact[] {
  return [
    {
      id: `${persona.id.toUpperCase()}_PUBLIC_STANCE`,
      suspectIds: [persona.id],
      topics: ["relationship", "death"],
      aliases: ["입장", "아는 것", "사건에 대해", "어떻게 생각"],
      fact: persona.publicTruth,
      visibility: "public",
      responseMode: "calm"
    },
    {
      id: `${persona.id.toUpperCase()}_FIXED_ALIBI`,
      suspectIds: [persona.id],
      topics: ["alibi"],
      aliases: ["당시 위치", "그날 한 일", "어디에 있었다"],
      fact: persona.fixedAlibi,
      visibility: "public",
      responseMode: "calm"
    }
  ];
}

export function retrieveInterrogationFacts({
  persona,
  question,
  evidenceNames,
  collectedEvidenceNames,
  revealedFactIds,
  limit = 5
}: RetrieveFactsInput) {
  const query = normalize(`${question} ${evidenceNames.join(" ")}`);
  const queryTokens = new Set(tokenize(query));
  const collectedEvidence = new Set([...collectedEvidenceNames, ...evidenceNames]);
  const revealedFacts = new Set(revealedFactIds);
  const facts = [...interrogationFacts, ...baselineFacts(persona)];

  return facts
    .filter((fact) => fact.suspectIds.includes(persona.id))
    .filter((fact) => canUseFact(fact, collectedEvidence, revealedFacts))
    .map((fact) => {
      const directEvidenceHits = (fact.evidenceNames || []).filter((name) => evidenceNames.includes(name)).length;
      const terms = expandTerms(fact);
      const phraseHits = terms.filter((term) => query.includes(normalize(term))).length;
      const tokenHits = terms
        .flatMap(tokenize)
        .filter((token) => queryTokens.has(token)).length;
      const score = directEvidenceHits * 12 + phraseHits * 5 + tokenHits * 2;
      return { fact, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || (b.fact.pressure || 0) - (a.fact.pressure || 0))
    .slice(0, limit)
    .map(({ fact }) => fact);
}

export function selectNewFactId(facts: InterrogationFact[], knownFactIds: string[]) {
  const known = new Set(knownFactIds);
  return facts.find((fact) => fact.discoverable && !known.has(fact.id))?.id || null;
}
