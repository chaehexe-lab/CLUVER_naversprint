import type { SuspectPersona } from "@/lib/suspectPersonas";

export type FactVisibility = "public" | "collected" | "revealed" | "hidden" | "never";
export type InterrogationReaction = "calm" | "attentive" | "avoid" | "nervous" | "shocked" | "silent";

export type InterrogationFact = {
  id: string;
  suspectIds: string[];
  topics: string[];
  aliases: string[];
  fact: string;
  visibility: FactVisibility;
  evidenceNames?: string[];
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
  diary: ["일기", "기록", "뒷문", "목격", "들었다", "보았다", "말했다"]
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
    visibility: "public",
    responseMode: "calm"
  },
  {
    id: "YOOMUNSEOK_MISSING_HOPAE",
    suspectIds: ["yoomunseok", "chunwol"],
    topics: ["hopae"],
    aliases: ["빈 호패 주머니", "끊어진 호패끈", "호패 분실"],
    fact: "유문석의 호패는 사건 전날 이미 사라졌고 빈 주머니에는 끊어진 끈이 남아 있었다.",
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
  return (fact.evidenceNames || []).some((name) => collectedEvidence.has(name));
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
      const score = directEvidenceHits * 12 + phraseHits * 5 + tokenHits * 2 + (fact.visibility === "public" ? 1 : 0);
      return { fact, score };
    })
    .filter(({ score, fact }) => score > 0 || fact.id.endsWith("_FIXED_ALIBI"))
    .sort((a, b) => b.score - a.score || (b.fact.pressure || 0) - (a.fact.pressure || 0))
    .slice(0, limit)
    .map(({ fact }) => fact);
}

export function selectNewFactId(facts: InterrogationFact[], knownFactIds: string[]) {
  const known = new Set(knownFactIds);
  return facts.find((fact) => fact.discoverable && !known.has(fact.id))?.id || null;
}
