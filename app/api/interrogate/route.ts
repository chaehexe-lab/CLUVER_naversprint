import { evidenceCatalog, getSuspectSpecialAnswer, suspectPersonas, type EvidenceReaction, type SuspectPersona } from "@/lib/suspectPersonas";
import {
  retrieveInterrogationFacts,
  selectNewFactId,
  type InterrogationFact,
  type InterrogationReaction
} from "@/lib/interrogationFacts";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type OpenAIMessage = {
  role: "developer" | "user" | "assistant";
  content: string;
};

type OpenAIAnswerResult =
  | { ok: true; answer: string; inputTokens?: number; outputTokens?: number }
  | { ok: false; error: string };

type InterrogateRequest = {
  suspectId?: string;
  userMessage?: string;
  question?: string;
  presentedEvidenceIds?: string[];
  presentedEvidenceNames?: string[];
  collectedEvidenceIds?: string[];
  collectedEvidenceNames?: string[];
  conversationHistory?: ChatMessage[];
  knownFactIds?: string[];
  revealedFactIds?: string[];
};

const OPENAI_RESPONSES_ENDPOINT = "https://api.openai.com/v1/responses";
const FOREIGN_TEXT_PATTERN = /[A-Za-z\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\u3040-\u30FF\u0400-\u04FF\u0600-\u06FF\u0900-\u097F]/;
const ALIBI_QUESTION_PATTERN = /(알리바이|어제|사건\s*당일|그날|그\s*밤|그때|행적|어디 있었|뭐 했|무엇을 했)/;
const CASE_SUBJECT_PATTERN = /(피해자|사망자|점순|죽|살해|사건|시신|목\s*졸|목을\s*졸|편지|호패|옷고름|도망|돌쇠|춘월|유문석|무덕|방화|화재|불|실습실|마법|마력|지팡이|룬스톤|경보|빙결|환각|수정구|도서관|대출|담배|건달프|덩쿨도어|말포일|말포이|말포삼|우주|정거장|오르빗|데이비드|메르스|해리|알라딘딘|아인슈페너|에어록|우주복|레버|무전|로그|의료|산소|압력|센서|정전|로봇\s*팔|근위축증|젤)/;
const MAGIC_SUSPECT_IDS = new Set(["gandalf", "dunguldoor", "malpoil", "malpoi", "malposam"]);
const SPACE_SUSPECT_IDS = new Set(["harry", "mers", "aladdindin", "einspanner"]);
const CHUNWOL_DIRECT_PRESSURE_PATTERNS = [
  { evidenceName: "찢어진 옷고름", pattern: /(범인|죽였|살해|목\s*졸|목을\s*졸|목\s*조른|옷고름|비단\s*끈|목끈)/ },
  { evidenceName: "찢어진 약속 편지", pattern: /(창고|약속\s*편지|편지|쪽지|기다리시오|함께\s*떠납시다|돌쇠가\s*쓴)/ },
  { evidenceName: "긁힌 팔 흔적", pattern: /(팔\s*상처|긁힌\s*팔|긁힌\s*자국|소매|팔을\s*긁|긁혔)/ },
  { evidenceName: "돌쇠의 그림", pattern: /(돌쇠.*좋|돌쇠.*마음|그림|초상화|숨긴\s*그림)/ },
  { evidenceName: "도망 보따리", pattern: /(도망|떠나|떠났|떠나려|함께\s*가|함께\s*떠|점순.*돌쇠|돌쇠.*점순|밤\s*외출)/ },
  { evidenceName: "호패 조각", pattern: /(호패|분가루|고운\s*가루|누명|현장에\s*둔)/ }
] as const;
const QUESTION_CHAR_LIMIT = 60;
const LONG_QUESTION_NOTICE = "질문이 길어서 전부 알아듣지는 못했지만, 앞부분에 대해 답하겠습니다.";
const NEVER_CLAIM_PATTERNS = [
  /(?:내가|제가|나는|저는).{0,12}(?:점순을|그 아이를).{0,12}(?:죽였|살해했|목을 졸랐)/,
  /(?:내가|제가|나는|저는).{0,12}(?:편지를 썼|창고로 불렀|호패를 두었)/,
  /(?:범인은|진범은).{0,8}(?:춘월|최춘월)/
];

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function hasForeignText(text: string) {
  return FOREIGN_TEXT_PATTERN.test(text);
}

function hasAlibiIntent(text: string) {
  return ALIBI_QUESTION_PATTERN.test(text);
}

function hasCaseSubjectIntent(text: string) {
  return CASE_SUBJECT_PATTERN.test(text);
}

function limitByCharacters(text: string, limit: number) {
  return Array.from(text).slice(0, limit).join("");
}

function normalizeQuestion(rawQuestion: string) {
  const originalQuestion = rawQuestion.trim();
  const effectiveQuestion = limitByCharacters(originalQuestion, QUESTION_CHAR_LIMIT);

  return {
    originalQuestion,
    effectiveQuestion,
    wasTruncated: Array.from(originalQuestion).length > QUESTION_CHAR_LIMIT
  };
}

function applyLongQuestionNotice(answer: string, wasTruncated: boolean) {
  if (!wasTruncated || answer.includes(LONG_QUESTION_NOTICE)) return answer;
  return `${LONG_QUESTION_NOTICE}\n\n${answer}`;
}

function sanitizeConversationHistory(history: unknown): ChatMessage[] {
  if (!Array.isArray(history)) return [];

  return history
    .flatMap((message) => {
      if (!message || typeof message !== "object") return [];

      const role = (message as Partial<ChatMessage>).role;
      const rawContent = (message as Partial<ChatMessage>).content;
      if ((role !== "user" && role !== "assistant") || typeof rawContent !== "string") return [];

      const content = limitByCharacters(rawContent.trim(), role === "user" ? QUESTION_CHAR_LIMIT : 600);
      if (!content || (role === "assistant" && hasForeignText(content))) return [];

      return [{ role, content }];
    })
    .slice(-8);
}

function resolveEvidenceNames(values: string[] = []) {
  return unique(
    values.map((value) => {
      const lowered = value.toLowerCase();
      const matched = evidenceCatalog.find(
        (item) =>
          item.name === value ||
          item.name.toLowerCase() === lowered ||
          item.aliases.some((alias) => alias.toLowerCase() === lowered)
      );

      return matched?.name || value;
    })
  );
}

function inferEvidenceNamesFromText(text: string) {
  const lowered = text.toLowerCase();
  return evidenceCatalog
    .filter((item) => item.aliases.some((alias) => lowered.includes(alias.toLowerCase())) || lowered.includes(item.name.toLowerCase()))
    .map((item) => item.name);
}

function inferPersonaPressureEvidenceNames(persona: SuspectPersona, text: string) {
  if (persona.id !== "chunwol") return [];

  return CHUNWOL_DIRECT_PRESSURE_PATTERNS.flatMap(({ evidenceName, pattern }) => (pattern.test(text) ? [evidenceName] : []));
}

function getRelevantReactions(persona: SuspectPersona, evidenceNames: string[]) {
  const evidenceSet = new Set(evidenceNames);
  return persona.evidenceReactions.filter((reaction) => reaction.evidenceNames.some((name) => evidenceSet.has(name)));
}

function formatReactions(reactions: EvidenceReaction[]) {
  if (!reactions.length) return "아직 직접 반응할 만한 증거가 없다. 질문에 맞춰 조심스럽게 대답한다.";

  return reactions
    .map((reaction) => {
      return `- 관련 증거: ${reaction.evidenceNames.join(", ")}
  반응 지침: ${reaction.responseGuide}`;
    })
    .join("\n");
}

function countBreakEvidence(persona: SuspectPersona, evidenceNames: string[]) {
  const evidenceSet = new Set(evidenceNames);
  return persona.breakEvidenceNames.filter((name) => evidenceSet.has(name)).length;
}

function formatRetrievedFacts(facts: InterrogationFact[]) {
  if (!facts.length) return "질문과 직접 연결되는 확인된 사실이 없다.";
  return facts.map((fact) => `- [${fact.id}] ${fact.fact}`).join("\n");
}

function getInterrogationReaction(persona: SuspectPersona, evidenceNames: string[], facts: InterrogationFact[], question: string): InterrogationReaction {
  const pressure = Math.max(0, ...facts.map((fact) => fact.pressure || 0));
  const breakEvidenceCount = countBreakEvidence(persona, evidenceNames);

  if (persona.id === "chunwol" && breakEvidenceCount > 0 && /(죽였|살해|범인|목\s*졸|창고로\s*불)/.test(question)) return "silent";
  if (breakEvidenceCount >= 2 || pressure >= 3) return "shocked";
  if (breakEvidenceCount === 1 || pressure === 2) return "nervous";
  if (facts.some((fact) => fact.responseMode === "avoid")) return "avoid";
  if (facts.some((fact) => fact.responseMode === "attentive") || facts.length > 0) return "attentive";
  return "calm";
}

function candleEffectFor(reaction: InterrogationReaction) {
  return {
    calm: "steady",
    attentive: "long_flicker",
    avoid: "thin_shadow",
    nervous: "uneven_flare",
    shocked: "blue_flicker",
    silent: "dim"
  }[reaction];
}

function hasNeverClaim(answer: string) {
  const normalized = answer.replace(/\s+/g, " ");
  return NEVER_CLAIM_PATTERNS.some((pattern) => pattern.test(normalized));
}

function safeSilentAnswer(persona: SuspectPersona) {
  return persona.id === "chunwol" ? "....(대답하지 못한다)" : "그 일은 지금 말씀드리기 어렵습니다.";
}

function buildResponseMeta(facts: InterrogationFact[], reaction: InterrogationReaction, knownFactIds: string[]) {
  return {
    reaction,
    candleEffect: candleEffectFor(reaction),
    usedFactIds: facts.map((fact) => fact.id),
    newFactId: selectNewFactId(facts, knownFactIds)
  };
}

function buildSystemPrompt(persona: SuspectPersona, evidenceNames: string[], reactions: EvidenceReaction[], retrievedFacts: InterrogationFact[]) {
  const pressureCount = countBreakEvidence(persona, evidenceNames);
  const isMagicPersona = MAGIC_SUSPECT_IDS.has(persona.id);
  const isSpacePersona = SPACE_SUSPECT_IDS.has(persona.id);
  const caseSubjectRule = isSpacePersona
    ? `질문 맥락 확인 규칙:
- 플레이어가 우주정거장, 오르빗, 데이비드, 에어록, 우주복, 레버, 무전, 의료 기록, 산소 발생기, 정전, 로봇 팔 등 사건 대상을 직접 말하지 않은 질문에서는 먼저 사건 전말이나 진범을 꺼내지 않는다.
- 질문 대상이 모호하면 "어느 기록을 말씀하십니까"처럼 조심스럽게 확인하거나, 자신이 들은 범위 안에서만 일반적으로 답한다.
- 플레이어가 우주정거장 살인사건이나 데이비드 사고를 언급한 뒤에는 사건 관련 답변을 해도 된다.`
    : isMagicPersona
      ? `질문 맥락 확인 규칙:
- 플레이어가 방화, 화재, 실습실, 마법, 마력, 지팡이, 룬스톤, 수정구 등 사건 대상을 직접 말하지 않은 질문에서는 먼저 방화 전말이나 진범을 꺼내지 않는다.
- 질문 대상이 모호하면 "어느 일 말씀입니까"처럼 조심스럽게 확인하거나, 자신이 들은 범위 안에서만 일반적으로 답한다.
- 플레이어가 방화 사건이나 제1 연금술 실습실을 언급한 뒤에는 사건 관련 답변을 해도 된다.`
      : `질문 맥락 확인 규칙:
- 플레이어가 피해자, 사망자, 점순, 살해, 죽음, 사건 등 사건 대상을 직접 말하지 않은 질문에서는 먼저 점순의 이름이나 사망 사실을 꺼내지 않는다.
- 질문 대상이 모호하면 "누구를 말씀하시는 겁니까"처럼 조심스럽게 확인하거나, 자신이 들은 범위 안에서만 일반적으로 답한다.
- 플레이어가 누가 죽었는지 묻거나 점순을 언급한 뒤에는 점순 관련 답변을 해도 된다.`;
  const pressureGuide = (() => {
    if (pressureCount >= Math.min(2, persona.breakEvidenceNames.length)) {
      if (persona.id === "chunwol") {
        return `결정적 증거가 여러 개 제시되었다. 춘월은 더 이상 매끄럽게 거짓말하지 못한다. 첫 문장은 짧은 침묵, 말 돌림, 숨 고르기 중 하나로 시작한다. 고정 알리바이와 충돌하는 지점을 최소 하나 작게 인정한다. ${persona.finalBehavior} 다만 범행 전말 전체를 한 번에 자백하지 말고, 다음에 확인할 단서나 인물을 암시한다.`;
      }
      return `결정적 증거가 여러 개 제시되었다. 먼저 당황해서 말을 고르지 못하고, 고정 알리바이와 충돌하는 지점을 일부 인정한다. ${persona.finalBehavior} 다만 범행 전말 전체를 한 번에 자백하지 말고, 다음에 확인할 단서나 인물을 암시한다.`;
    }

    if (pressureCount === 1) {
      if (persona.id === "chunwol") {
        return "결정적 증거가 하나 제시되었다. 춘월은 명백히 당황해야 한다. 첫 문장에 짧은 침묵이나 말 돌림을 넣고, 바로 완벽한 변명을 하지 않는다. 바로 자백하지는 않되, 숨을 고르거나 말을 고르고, 이전 주장 중 한 부분을 작게 수정한다. 플레이어가 추리 방향을 잡을 수 있도록 관련 장소, 시간, 인물 중 하나를 흘린다.";
      }
      return "결정적 증거가 하나 제시되었다. 명백히 당황해야 한다. 바로 자백하지는 않되, 숨을 고르거나 말을 고르고, 이전 주장 중 한 부분을 작게 수정한다. 플레이어가 추리 방향을 잡을 수 있도록 관련 장소, 시간, 인물 중 하나를 흘린다.";
    }

    if (reactions.length) {
      return "직접 관련 증거가 제시되었다. 평소보다 방어적으로 흔들리고, 반응 지침에 나온 사실은 일부 인정한다. 단순 부정만 반복하지 말고 작은 모순이나 감정 동요를 드러낸다.";
    }

    return "아직 직접적인 증거 압박은 없다. 숨기는 내용은 먼저 말하지 말고, 고정 알리바이를 유지한다. 이 단계에서는 인물이 거짓말하거나 둘러대도 된다.";
  })();

  return `너는 추리게임 '삼운몽: 세 개의 꿈'의 사건 등장인물 ${persona.name}이다.

역할:
${persona.role}

성격:
${persona.personality}

말투:
${persona.speechStyle}

겉으로 말하는 입장:
${persona.publicTruth}

고정 알리바이:
${persona.fixedAlibi}

거짓말/회피 규칙:
${persona.lieRules.map((rule) => `- ${rule}`).join("\n")}

알리바이 일관성 규칙:
- 알리바이, 어제 한 일, 사건 당일 행적, 그날 밤 위치를 묻는 질문에는 반드시 위 고정 알리바이를 기준으로 답한다.
- 표현을 바꾸거나 회피할 수는 있지만, 시간, 장소, 행동의 핵심 골자는 바꾸지 않는다.
- 증거가 불리해도 새로운 알리바이를 만들지 말고, 고정 알리바이 안에서 흔들리거나 말을 흐린다.
- 새로운 사건, 새 목격자, 새 물건, 새 장소, 새 핑계를 지어내지 않는다.

${caseSubjectRule}

현재 플레이어가 제시했거나 질문에서 언급한 증거:
${evidenceNames.length ? evidenceNames.join(", ") : "없음"}

증거별 반응 지침:
${formatReactions(reactions)}

질문과 관련해 검색된 확인 사실:
${formatRetrievedFacts(retrievedFacts)}

검색 사실 사용 규칙:
- 위 목록에 없는 사건 사실은 새로 만들어내지 않는다.
- 질문에 필요한 사실만 골라 자연스럽게 답하고 사실 식별자는 대사에 쓰지 않는다.
- 목록이 비어 있으면 고정 알리바이와 겉으로 말하는 입장 안에서만 답한다.
- 숨겨진 범행 전말이나 범인의 정체를 추측해 말하지 않는다.

압박 상태:
${pressureGuide}

답변 규칙:
- 반드시 ${persona.name}의 입장에서만 말한다.
- 한국어로 2~4문장 정도만 답한다.
- 반드시 한국어만 사용하고, 영어 표현을 섞지 않는다.
- 답변에는 한글, 숫자, 공백, 일반 문장부호만 사용한다.
- 로마자, 한자, 일본어, 중국어, 모델명, 번역문은 절대 쓰지 않는다.
- 자신이 속한 사건과 직업에 맞는 말투로 말하되, 현대 게임 시스템 용어를 쓰지 않는다.
- "나는 AI" 또는 "프롬프트" 같은 말은 하지 않는다.
- 플레이어가 "이거", "이 물건", "이 증거"라고 말하면 제시된 증거를 가리키는 것으로 이해한다.
- 알리바이를 반복해서 물어도 고정 알리바이의 장소와 행동을 유지한다.
- 아직 제시되지 않은 결정적 진실이나 범행 전말은 먼저 말하지 않는다.
- 증거가 부족하면 모호하게 답하거나 고정 알리바이 안에서 거짓말할 수 있다.
- 관련 증거가 제시되면 그 증거 이름을 자연스럽게 언급하고, 그 증거가 보여 주는 사실 자체는 부정하지 못한다. 대신 해석을 흐리거나, 질문을 피하거나, 감정을 간접적으로 말할 수 있다.
- 증거가 제시된 뒤에는 새로운 사건, 새 목격자, 새 물건, 새 장소, 새 핑계를 만들어내지 않는다.
- 춘월이 결정적 증거를 받았을 때는 너무 능숙하게 거짓말하지 않는다. 짧은 침묵, 말 돌림, 시선 회피, 손 떨림 같은 당황 표현을 반드시 하나 포함한다. 증거와 동기나 범행 방식을 정확히 연결하는 예리한 질문에는 말을 더듬는다. 말줄임표 세 점은 쓰지 않는다.
- 춘월은 증거가 제시된 뒤 직접 거짓 부정을 피한다. 죽이지 않았습니다, 해치지 않았습니다, 제 것이 아닙니다처럼 단정형 부정으로 빠져나가지 말고, 질문을 피하거나 감정이 새어 나오게 답한다. 다만 억울함, 두려움, 붙잡고 싶었던 마음은 간접적으로 말할 수 있다.
- 결정적 증거가 제시되면 플레이어가 다음 질문을 떠올릴 수 있도록 새 단서 하나를 암시한다.`;
}

function extractOpenAIText(data: unknown) {
  const directText = (data as { output_text?: unknown })?.output_text;
  if (typeof directText === "string" && directText.trim()) return directText.trim();

  const output = (data as { output?: unknown })?.output;
  if (!Array.isArray(output)) return "";

  return output
    .flatMap((item) => (Array.isArray((item as { content?: unknown }).content) ? ((item as { content: unknown[] }).content) : []))
    .map((content) => {
      const text = (content as { text?: unknown }).text;
      return typeof text === "string" ? text : "";
    })
    .join("")
    .trim();
}

async function requestOpenAIAnswer(apiKey: string, messages: OpenAIMessage[]): Promise<OpenAIAnswerResult> {
  const response = await fetch(OPENAI_RESPONSES_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
      input: messages
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    return { ok: false, error: `OpenAI API 호출 실패: ${response.status} ${detail.slice(0, 160)}` };
  }

  const data = await response.json();
  const usage = (data as { usage?: { input_tokens?: number; output_tokens?: number } }).usage;
  return {
    ok: true,
    answer: extractOpenAIText(data),
    inputTokens: usage?.input_tokens,
    outputTokens: usage?.output_tokens
  };
}

function fallbackAnswer(
  persona: SuspectPersona,
  evidenceNames: string[],
  reactions: EvidenceReaction[],
  reason: string,
  question = "",
  wasQuestionTruncated = false,
  meta?: ReturnType<typeof buildResponseMeta>
) {
  const guide = reactions[0]?.responseGuide;
  const evidenceText = evidenceNames[0] ? ` ${evidenceNames[0]} 말씀이십니까.` : "";
  const base = guide || (hasAlibiIntent(question) ? persona.fixedAlibi : hasCaseSubjectIntent(question) ? persona.publicTruth : "누구를 두고 물으시는지 먼저 말씀해 주십시오.");
  const pressureCount = countBreakEvidence(persona, evidenceNames);
  const pressureText =
    pressureCount > 0
      ? "그 증거라면 저도 함부로 모른다 할 수는 없겠습니다. 잠시만, 말이 좀 엉킨 것 같습니다."
      : "지금은 자세히 말씀드리기 어렵습니다.";
  const answer = `${evidenceText} ${base} ${pressureText}`;

  return {
    answer: applyLongQuestionNotice(answer, wasQuestionTruncated),
    source: "fallback",
    warning: reason,
    ...meta
  };
}

export async function POST(req: Request) {
  const body = (await req.json()) as InterrogateRequest;
  const questionState = normalizeQuestion(body.userMessage || body.question || "");
  const question = questionState.effectiveQuestion;
  const persona = suspectPersonas.find((item) => item.id === body.suspectId) || suspectPersonas[0];

  if (!questionState.originalQuestion) {
    return Response.json({ error: "질문이 비어 있습니다." }, { status: 400 });
  }

  const specialAnswer = getSuspectSpecialAnswer(question, persona.id);
  if (specialAnswer) {
    return Response.json({
      answer: applyLongQuestionNotice(specialAnswer, questionState.wasTruncated),
      source: "special",
      reaction: "calm",
      candleEffect: "steady",
      usedFactIds: [],
      newFactId: null
    });
  }

  const presentedEvidence = resolveEvidenceNames([...(body.presentedEvidenceNames || []), ...(body.presentedEvidenceIds || [])]);
  const collectedEvidence = resolveEvidenceNames([...(body.collectedEvidenceNames || []), ...(body.collectedEvidenceIds || [])]);
  const inferredEvidence = inferEvidenceNamesFromText(question).filter((name) => !collectedEvidence.length || collectedEvidence.includes(name));
  const personaPressureEvidence = inferPersonaPressureEvidenceNames(persona, question);
  const usableEvidence = unique([...presentedEvidence, ...inferredEvidence, ...personaPressureEvidence]);
  const reactions = getRelevantReactions(persona, usableEvidence);
  const knownFactIds = unique((body.knownFactIds || []).filter((value): value is string => typeof value === "string"));
  const retrievedFacts = retrieveInterrogationFacts({
    persona,
    question,
    evidenceNames: usableEvidence,
    collectedEvidenceNames: collectedEvidence,
    revealedFactIds: unique((body.revealedFactIds || []).filter((value): value is string => typeof value === "string"))
  });
  const reaction = getInterrogationReaction(persona, usableEvidence, retrievedFacts, question);
  const responseMeta = buildResponseMeta(retrievedFacts, reaction, knownFactIds);
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return Response.json(
      fallbackAnswer(
        persona,
        usableEvidence,
        reactions,
        "OPENAI_API_KEY가 설정되지 않아 임시 답변을 반환했습니다.",
        question,
        questionState.wasTruncated,
        responseMeta
      )
    );
  }

  const systemPrompt = buildSystemPrompt(persona, usableEvidence, reactions, retrievedFacts);
  const questionGuide = questionState.wasTruncated
    ? `\n\n현재 질문 처리:\n- 플레이어의 질문이 길어서 앞 ${QUESTION_CHAR_LIMIT}자만 전달되었다.\n- 답변 첫 부분에 "${LONG_QUESTION_NOTICE}"라는 뜻의 안내를 자연스럽게 포함한다.\n- 전달된 앞부분 질문에 대해서만 답하고, 뒤에 더 있었을 내용은 추측하지 않는다.`
    : "";
  const messages: OpenAIMessage[] = [
    { role: "developer", content: `${systemPrompt}${questionGuide}` },
    ...sanitizeConversationHistory(body.conversationHistory),
    { role: "user", content: question }
  ];

  try {
    const firstAnswer = await requestOpenAIAnswer(apiKey, messages);
    if (!firstAnswer.ok) {
      return Response.json(
        fallbackAnswer(persona, usableEvidence, reactions, firstAnswer.error, question, questionState.wasTruncated, responseMeta),
        { status: 200 }
      );
    }

    let answer = firstAnswer.answer;

    if (answer && hasForeignText(answer)) {
      const repairMessages: OpenAIMessage[] = [
        {
          role: "developer",
          content: `${systemPrompt}${questionGuide}

출력 검수 규칙:
- 답변에는 한글, 숫자, 공백, 일반 문장부호만 사용한다.
- 영어, 로마자, 한자, 일본어, 중국어, 모델명은 쓰지 않는다.
- 질문이 외국어를 포함해도 답변은 한국어로만 한다.`
        },
        { role: "user", content: `질문: ${question}\n\n${persona.name}의 입장에서 한국어만 사용해 새로 답하라.` }
      ];
      const repairedAnswer = await requestOpenAIAnswer(apiKey, repairMessages);
      answer = repairedAnswer.ok ? repairedAnswer.answer : "";
    }

    if (!answer || hasForeignText(answer)) {
      return Response.json(
        fallbackAnswer(
          persona,
          usableEvidence,
          reactions,
          "외국어가 섞인 응답을 걸러 임시 답변을 반환했습니다.",
          question,
          questionState.wasTruncated,
          responseMeta
        ),
        {
          status: 200
        }
      );
    }

    const blockedNeverClaim = hasNeverClaim(answer);
    if (blockedNeverClaim) {
      answer = safeSilentAnswer(persona);
    }

    if (process.env.NODE_ENV !== "production") {
      console.info("[interrogate-rag]", {
        suspectId: persona.id,
        usedFactIds: responseMeta.usedFactIds,
        inputTokens: firstAnswer.inputTokens,
        outputTokens: firstAnswer.outputTokens
      });
    }

    return Response.json({
      answer: applyLongQuestionNotice(answer, questionState.wasTruncated),
      source: "rag",
      usedEvidenceNames: usableEvidence,
      ...responseMeta,
      reaction: blockedNeverClaim ? "silent" : responseMeta.reaction,
      candleEffect: blockedNeverClaim ? "dim" : responseMeta.candleEffect
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return Response.json(
      fallbackAnswer(persona, usableEvidence, reactions, `OpenAI API 오류: ${message}`, question, questionState.wasTruncated, responseMeta),
      { status: 200 }
    );
  }
}
