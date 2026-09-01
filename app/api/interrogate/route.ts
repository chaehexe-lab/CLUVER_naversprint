import {
  evidenceCatalog,
  getJoseonFallbackDialogue,
  getSpaceStationFallbackDialogue,
  getSuspectSpecialAnswer,
  shouldGrantPowerControlAccessCard,
  suspectPersonas,
  type EvidenceReaction,
  type SuspectPersona
} from "@/lib/suspectPersonas";
import { getMagicSchoolFallbackDialogue, magicSchoolSuspectIds } from "@/lib/magicSchoolPersonas";
import {
  retrieveInterrogationFacts,
  selectNewFactId,
  type InterrogationFact,
  type InterrogationReaction
} from "@/lib/interrogationFacts";
import {
  getThemeForSuspect,
  readGameProgressFromRequest,
  recordCollectedEvidence,
  recordKnownFact,
  serializeGameProgressCookie
} from "@/lib/server/gameProgress";
import type { GameProgress } from "@/lib/gameProgressTypes";

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

type AIProvider = "openai" | "mistral";
type InvestigationTheme = "joseon" | "magicSchool" | "spaceStation";

type InterrogateRequest = {
  themeId?: InvestigationTheme;
  suspectId?: string;
  userMessage?: string;
  question?: string;
  presentedEvidenceIds?: string[];
  presentedEvidenceNames?: string[];
  conversationHistory?: ChatMessage[];
};

const OPENAI_RESPONSES_ENDPOINT = "https://api.openai.com/v1/responses";
const MISTRAL_CHAT_ENDPOINT = "https://api.mistral.ai/v1/chat/completions";
const FOREIGN_TEXT_PATTERN = /[A-Za-z\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\u3040-\u30FF\u0400-\u04FF\u0600-\u06FF\u0900-\u097F]/;
const ALIBI_QUESTION_PATTERN = /(알리바이|어제|사건\s*당일|그날|그\s*밤|그때|행적|어디 있었|뭐 했|무엇을 했)/;
const CASE_SUBJECT_PATTERN = /(피해자|사망자|점순|죽|살해|사건|시신|목\s*졸|목을\s*졸|편지|호패|옷고름|도망|돌쇠|춘월|유문석|무덕|방화|화재|불|실습실|마법|마력|지팡이|룬스톤|경보|빙결|환각|수정구|도서관|대출|담배|건달프|덩쿨도어|말포일|말포이|말포삼|우주|정거장|오르빗|데이비드|메르스|해리|알라딘딘|안성줴줴이|아인슈페너|에어록|우주복|관제|단말기|레버|무전|로그|접속|의료|산소|압력|센서|정전|전력\s*제어실|전력실|출입\s*카드|출입\s*권한|로봇\s*팔|근위축증|젤)/;
const SPACE_SUSPECT_IDS = new Set(["harry", "mers", "aladdindin", "einspanner"]);
const JOSEON_SUSPECT_IDS = new Set(["dolsoe", "chunwol", "yoomunseok", "mudeok"]);
const THEME_SUSPECT_IDS: Record<InvestigationTheme, ReadonlySet<string>> = {
  joseon: JOSEON_SUSPECT_IDS,
  magicSchool: magicSchoolSuspectIds,
  spaceStation: SPACE_SUSPECT_IDS
};
const DEDUCTION_QUESTION_PATTERN = /(범인|진범|용의자|의심|혐의|그러니까|그렇다면|그래서|때문에|결론|모순|거짓말|누명|수법|동기|가능성|맞지|맞습니까|아니냐|아닌가)/;
const WEAK_INFERENCE_PATTERN =
  /(?:담당|관리|주인|소유|물건|호패|지팡이|카드|출입|권한|현장|가까이).{0,32}(?:범인|진범|죽였|살해|방화|불을\s*질)|(범인|진범).{0,32}(?:담당|관리|주인|소유|물건|호패|지팡이|카드|출입|권한|현장|가까이)/;
const PERSONA_MENTION_ALIASES: Partial<Record<SuspectPersona["id"], string[]>> = {
  dolsoe: ["돌쇠"],
  chunwol: ["춘월", "최춘월"],
  yoomunseok: ["유문석", "유 도령", "유도령"],
  mudeok: ["무덕"],
  gandalf: ["건달프"],
  dunguldoor: ["덩쿨도어"],
  malpoil: ["말포일"],
  malpoi: ["말포이"],
  malposam: ["말포삼"],
  harry: ["해리"],
  mers: ["메르스"],
  aladdindin: ["알라딘딘"],
  einspanner: ["아인슈페너", "안성줴줴이"]
};
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
const NARRATION_LEAK_PATTERN = /(설명한다|밝힌다|인정한다|부정한다|주장한다|반박한다|암시한다|드러낸다|둘러댄다|회피한다|말을\s*흐린다)(?:[.!?]|$)/;
const CONTEXT_MISS_PATTERN = /(누구를\s*두고|누구를\s*말씀|어느\s*사람을\s*말씀|어느\s*일(?:을)?\s*말씀|무슨\s*일(?:을)?\s*말씀|무슨\s*말씀|무엇을\s*말씀|어느\s*기록(?:을)?\s*말씀)/;
const LOCKED_SECRET_RULES = [
  {
    suspectId: "malposam",
    questionPattern: /(기록|수정구|환각|조작|말포일.{0,12}부탁)/,
    pattern: /(?:내가|제가|저는).{0,18}(?:기록을\s*가렸|수정구를\s*조작|환각을\s*걸)|(?:부탁|말포일).{0,18}(?:기록을\s*가렸|수정구를\s*조작)/,
    confirmationPattern: /(가렸|조작|환각|부탁)/,
    requiredEvidenceNames: ["조작된 기록 수정구", "말포삼의 자백"]
  },
  {
    suspectId: "aladdindin",
    questionPattern: /(22시\s*11분|메르스.{0,18}무전|무전.{0,18}메르스|이제\s*시간만\s*맞으면)/,
    pattern: /(22시\s*11분|이제\s*시간만\s*맞으면|메르스.{0,18}무전|무전.{0,18}메르스|무단\s*재점검)/,
    confirmationPattern: /(들|무전|에어록|재점검)/,
    requiredEvidenceNames: ["조작된 전압 센서", "비인가 지연 타이머"]
  },
  {
    suspectId: "einspanner",
    questionPattern: /(21시\s*47분|메르스.{0,18}냉각\s*보관함|냉각\s*보관함.{0,18}메르스)/,
    pattern: /(21시\s*47분|메르스.{0,18}냉각\s*보관함|냉각\s*보관함.{0,18}메르스|누군가.{0,18}옮|옮기는.{0,18}봤|옮겨.{0,18}본)/,
    confirmationPattern: /(봤|보았|본\s*적|옮|보관함)/,
    requiredEvidenceNames: ["혈액 시료 분석 기록", "미승인 약물"]
  }
] as const;

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function isInvestigationTheme(value: unknown): value is InvestigationTheme {
  return value === "joseon" || value === "magicSchool" || value === "spaceStation";
}

function uniqueFacts(facts: InterrogationFact[]) {
  const seen = new Set<string>();
  return facts.filter((fact) => {
    if (seen.has(fact.id)) return false;
    seen.add(fact.id);
    return true;
  });
}

function findMentionedPersonas(question: string, currentPersonaId: SuspectPersona["id"]) {
  return suspectPersonas.filter(
    (candidate) =>
      candidate.id !== currentPersonaId &&
      PERSONA_MENTION_ALIASES[candidate.id]?.some(
        (alias) => question.includes(alias) && !(candidate.id === "malpoi" && question.includes("말포일"))
      )
  );
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

function withObjectParticle(text: string) {
  const lastCharacter = Array.from(text).at(-1) || "";
  const codePoint = lastCharacter.codePointAt(0) || 0;
  const hasFinalConsonant = codePoint >= 0xac00 && codePoint <= 0xd7a3 && (codePoint - 0xac00) % 28 !== 0;
  return `${text}${hasFinalConsonant ? "을" : "를"}`;
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
  return facts
    .map((fact) => `- [${fact.id}] ${fact.fact}${fact.reasoningGuide ? `\n  추론상 의미: ${fact.reasoningGuide}` : ""}`)
    .join("\n");
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

function hasLockedSecretLeak(answer: string, question: string, persona: SuspectPersona, evidenceNames: string[]) {
  const evidenceSet = new Set(evidenceNames);
  return LOCKED_SECRET_RULES.some(
    (rule) =>
      rule.suspectId === persona.id &&
      !rule.requiredEvidenceNames.some((name) => evidenceSet.has(name)) &&
      (rule.pattern.test(answer) || rule.questionPattern.test(question) && rule.confirmationPattern.test(answer))
  );
}

function hasDialogueQualityIssue(answer: string, question: string, evidenceNames: string[], persona: SuspectPersona) {
  if (NARRATION_LEAK_PATTERN.test(answer)) return true;
  if (hasLockedSecretLeak(answer, question, persona, evidenceNames)) return true;
  return CONTEXT_MISS_PATTERN.test(answer) && (hasCaseSubjectIntent(question) || evidenceNames.length > 0);
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

function buildDeductionGuide(persona: SuspectPersona, question: string, mentionedPersonas: SuspectPersona[]) {
  if (!DEDUCTION_QUESTION_PATTERN.test(question)) {
    return `대화 연속성 규칙:
- 직전 대화의 그 사람, 그 물건, 그 기록, 그 말은 최근 대화에서 가리킨 대상을 이어받아 이해한다.
- 같은 내용을 다시 물으면 핵심 사실은 유지하되 문장을 그대로 반복하지 않는다. 필요하면 아까 말씀드렸듯이라고 자연스럽게 연결한다.
- 질문받지 않은 알리바이 전체를 매번 되풀이하지 않는다.`;
  }

  const mentionedNames = mentionedPersonas.map((candidate) => candidate.name).join(", ") || "질문에서 지목한 인물";
  const weakInferenceNotice = WEAK_INFERENCE_PATTERN.test(question)
    ? "- 현재 질문에는 소유, 직무, 접근 가능성 또는 현장 존재만으로 범행을 확정하려는 논리 비약이 있다. 그 사실만으로 범인이라고 단정할 수 없다고 분명히 짚는다."
    : "- 플레이어의 결론이 확인 사실보다 앞서면 무엇이 아직 연결되지 않았는지 짚는다.";

  return `플레이어 추론 대응 규칙:
- 플레이어는 현재 ${mentionedNames}에 관한 추론이나 범인 가능성을 묻고 있다.
- 첫 문장에서 플레이어 추론의 핵심을 짧게 받아 준다. 무조건 맞다거나 틀렸다고 시작하지 않는다.
- 검색된 확인 사실로 직접 뒷받침되는 전제는 인정하고, 충돌하는 전제는 확인된 사실 하나를 들어 바로잡는다.
${weakInferenceNotice}
- 여러 후보가 함께 언급되면 확인된 사실을 기준으로 누구의 혐의가 더 커지거나 작아지는지 비교할 수 있다. 단, 확인 사실보다 강하게 단정하지 않는다.
- 어떤 인물의 혐의를 약화하는 사실만 있고 강화하는 사실은 없다면 그 인물을 더 의심스럽다고 순위를 매기지 않는다. 그 경우 비교 근거가 부족하다고 말한다.
- 범행 결론에 빠진 연결고리를 동기, 수법, 시간, 실제 접근 중 하나로 좁혀 자연스럽게 되묻는다.
- 증거가 충분하지 않으면 특정인을 범인으로 확정하지 않으며, 검색 사실에 없는 새 혐의를 만들지 않는다.
- 다른 사람을 지목하는 질문이어도 ${persona.name}의 지식과 감정 안에서 말한다. 자신의 혐의에는 기존 거짓말과 회피 규칙을 유지한다.
- 답은 보고서나 목록처럼 쓰지 않고 실제 취조 대화처럼 2~4문장으로 이어 간다.
- 답을 거부해야 하는 상황이 아니라면 마지막 문장은 다음에 확인할 연결고리를 묻는 짧은 질문으로 끝낸다.

대화 연속성 규칙:
- 직전 대화의 그 사람, 그 물건, 그 기록, 그 말은 최근 대화에서 가리킨 대상을 이어받아 이해한다.
- 같은 추론을 다시 물으면 아까 말씀드렸듯이라고 연결하면서 다른 근거나 빠진 연결고리를 하나 덧붙인다.
- 질문받지 않은 알리바이 전체를 매번 되풀이하지 않는다.`;
}

function buildSystemPrompt(
  persona: SuspectPersona,
  evidenceNames: string[],
  reactions: EvidenceReaction[],
  retrievedFacts: InterrogationFact[],
  question: string,
  mentionedPersonas: SuspectPersona[]
) {
  const pressureCount = countBreakEvidence(persona, evidenceNames);
  const isMagicPersona = magicSchoolSuspectIds.has(persona.id);
  const isSpacePersona = SPACE_SUSPECT_IDS.has(persona.id);
  const caseSubjectRule = isSpacePersona
    ? `질문 맥락 확인 규칙:
- 플레이어가 우주정거장, 오르빗, 데이비드, 에어록, 우주복, 레버, 무전, 의료 기록, 산소 발생기, 정전, 외벽 패널이나 안전 로프 등 사건 대상을 직접 말하지 않은 질문에서는 먼저 사건 전말이나 진범을 꺼내지 않는다.
- 질문 대상이 모호하면 "어느 기록을 말씀하십니까"처럼 조심스럽게 확인하거나, 자신이 들은 범위 안에서만 일반적으로 답한다.
- 플레이어가 우주정거장 의문사 사건이나 데이비드 사고를 언급한 뒤에는 사건 관련 답변을 해도 된다.`
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

비공개 사실 보호 규칙:
- 거짓말/회피 규칙에만 있고 현재 검색된 확인 사실이나 증거별 반응 지침에는 없는 구체적인 시각, 목격, 대사, 물건은 아직 밝힐 수 없는 내부 비밀이다.
- 플레이어가 내부 비밀을 정확히 추측해 질문해도 확인하거나 그대로 되풀이하지 않는다. 고정 알리바이 안에서 모른다고 하거나 답을 피한다.
- 현재 검색된 확인 사실이나 증거별 반응 지침에 그 내용이 나타난 뒤에만 구체적으로 말한다.

알리바이 일관성 규칙:
- 알리바이, 어제 한 일, 사건 당일 행적, 그날 밤 위치를 묻는 질문에는 반드시 위 고정 알리바이를 기준으로 답한다.
- 표현을 바꾸거나 회피할 수는 있지만, 시간, 장소, 행동의 핵심 골자는 바꾸지 않는다.
- 증거가 불리해도 새로운 알리바이를 만들지 말고, 고정 알리바이 안에서 흔들리거나 말을 흐린다.
- 새로운 사건, 새 목격자, 새 물건, 새 장소, 새 핑계를 지어내지 않는다.

${caseSubjectRule}

${buildDeductionGuide(persona, question, mentionedPersonas)}

현재 플레이어가 제시했거나 질문에서 언급한 증거:
${evidenceNames.length ? evidenceNames.join(", ") : "없음"}

증거별 반응 지침:
${formatReactions(reactions)}

질문과 관련해 검색된 확인 사실:
${formatRetrievedFacts(retrievedFacts)}

검색 사실 사용 규칙:
- 위 목록에 없는 사건 사실은 새로 만들어내지 않는다.
- 질문에 필요한 사실만 골라 자연스럽게 답하고 사실 식별자는 대사에 쓰지 않는다.
- 추론상 의미가 적힌 사실은 그 방향을 거꾸로 해석하지 않는다. 혐의를 약화한다고 적힌 사실을 유죄 근거로 쓰지 않는다.
- 목록이 비어 있으면 고정 알리바이와 겉으로 말하는 입장 안에서만 답한다.
- 숨겨진 범행 전말이나 범인의 정체를 추측해 말하지 않는다.

압박 상태:
${pressureGuide}

답변 규칙:
- 반드시 ${persona.name}의 입장에서만 말한다.
- 자신의 이름으로 자신을 3인칭처럼 부르지 않고, 나 또는 저라고 말한다.
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
  const instructions = messages
    .filter((message) => message.role === "developer")
    .map((message) => message.content)
    .join("\n\n");
  const input = messages.filter((message) => message.role !== "developer");
  const response = await fetch(OPENAI_RESPONSES_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
      instructions,
      input,
      max_output_tokens: 800
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

function extractMistralText(data: unknown) {
  const content = (data as { choices?: Array<{ message?: { content?: unknown } }> })?.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";

  return content
    .map((part) => {
      if (typeof part === "string") return part;
      const text = (part as { text?: unknown })?.text;
      return typeof text === "string" ? text : "";
    })
    .join("")
    .trim();
}

async function requestMistralAnswer(apiKey: string, messages: OpenAIMessage[]): Promise<OpenAIAnswerResult> {
  const response = await fetch(MISTRAL_CHAT_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.MISTRAL_MODEL || "mistral-small-latest",
      messages: messages.map((message) => ({
        role: message.role === "developer" ? "system" : message.role,
        content: message.content
      })),
      temperature: 0.35,
      max_tokens: 350
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    return { ok: false, error: `Mistral API 호출 실패: ${response.status} ${detail.slice(0, 160)}` };
  }

  const data = await response.json();
  const usage = (data as { usage?: { prompt_tokens?: number; completion_tokens?: number } }).usage;
  return {
    ok: true,
    answer: extractMistralText(data),
    inputTokens: usage?.prompt_tokens,
    outputTokens: usage?.completion_tokens
  };
}

function getAIProvider(): AIProvider {
  return process.env.AI_PROVIDER?.trim().toLowerCase() === "mistral" ? "mistral" : "openai";
}

function getAIProviderConfig(provider: AIProvider) {
  if (provider === "mistral") {
    return {
      apiKey: process.env.MISTRAL_API_KEY,
      missingKeyWarning: "MISTRAL_API_KEY가 설정되지 않아 임시 답변을 반환했습니다."
    };
  }

  return {
    apiKey: process.env.OPENAI_API_KEY,
    missingKeyWarning: "OPENAI_API_KEY가 설정되지 않아 임시 답변을 반환했습니다."
  };
}

function requestAIAnswer(provider: AIProvider, apiKey: string, messages: OpenAIMessage[]) {
  return provider === "mistral" ? requestMistralAnswer(apiKey, messages) : requestOpenAIAnswer(apiKey, messages);
}

function getLockedSecretSafeDialogue(persona: SuspectPersona, question: string, evidenceNames: string[]) {
  if (
    persona.id === "malposam" &&
    /(기록|수정구|환각|조작|말포일.{0,12}부탁)/.test(question) &&
    !evidenceNames.some((name) => name === "조작된 기록 수정구" || name === "말포삼의 자백")
  ) {
    return "그런 부탁을 받았다고 단정하지 마십시오. 기록 수정구에 이상이 있었다면, 먼저 그 흔적을 제게 보여 주셔야 답할 수 있습니다.";
  }

  return null;
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
  const lockedSecretDialogue = getLockedSecretSafeDialogue(persona, question, evidenceNames);
  if (lockedSecretDialogue) {
    return {
      answer: applyLongQuestionNotice(lockedSecretDialogue, wasQuestionTruncated),
      source: "fallback",
      warning: reason,
      ...meta
    };
  }

  const magicDialogue = getMagicSchoolFallbackDialogue(persona.id, question, evidenceNames);
  if (magicDialogue) {
    return {
      answer: applyLongQuestionNotice(magicDialogue, wasQuestionTruncated),
      source: "fallback",
      warning: reason,
      ...meta
    };
  }

  const joseonDialogue = getJoseonFallbackDialogue(persona.id, question, evidenceNames);
  if (joseonDialogue) {
    return {
      answer: applyLongQuestionNotice(joseonDialogue, wasQuestionTruncated),
      source: "fallback",
      warning: reason,
      ...meta
    };
  }

  const spaceDialogue = getSpaceStationFallbackDialogue(persona.id, question, evidenceNames);
  if (spaceDialogue) {
    return {
      answer: applyLongQuestionNotice(spaceDialogue, wasQuestionTruncated),
      source: "fallback",
      warning: reason,
      ...meta
    };
  }

  const answer = evidenceNames[0]
    ? `${withObjectParticle(evidenceNames[0])} 말씀하시는군요. 그 증거가 있다는 사실까지 부정하지는 않겠습니다. 하지만 지금 말씀하신 해석까지 인정할 수는 없습니다.`
    : hasAlibiIntent(question)
      ? persona.fixedAlibi
      : magicSchoolSuspectIds.has(persona.id)
        ? "어느 일에 관해 묻는지 조금 더 분명히 말씀해 주십시오. 제가 아는 범위에서 답하겠습니다."
        : "확인하려는 사건이나 물건을 조금 더 분명히 말씀해 주십시오. 제가 아는 범위에서 답하겠습니다.";

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
  const persona = suspectPersonas.find((item) => item.id === body.suspectId);
  const theme = getThemeForSuspect(body.suspectId);
  if (!persona || !theme) {
    return Response.json({ error: "확인할 수 없는 용의자입니다." }, { status: 400 });
  }
  const signedProgress = await readGameProgressFromRequest(req, theme);
  if (!signedProgress || signedProgress.currentScreen !== "interrogationScreen") {
    return Response.json({ error: "정상 수사 진행에서 시작된 취조가 아닙니다." }, { status: 403 });
  }
  let responseProgress: GameProgress = signedProgress;

  async function secureResponse(payload: Record<string, unknown>, status = 200) {
    const newFactId = typeof payload.newFactId === "string" ? payload.newFactId : null;
    responseProgress = recordKnownFact(responseProgress, newFactId);
    if (payload.grantSpacePowerAccessCard === true) {
      responseProgress =
        recordCollectedEvidence(responseProgress, "interrogationScreen", "전력 제어실 출입 카드") || responseProgress;
    }
    return Response.json(payload, {
      status,
      headers: { "Set-Cookie": await serializeGameProgressCookie(responseProgress) }
    });
  }
  const conversationHistory = sanitizeConversationHistory(body.conversationHistory);
  const previousUserQuestions = conversationHistory.filter((message) => message.role === "user").map((message) => message.content);

  if (!questionState.originalQuestion) {
    return secureResponse({ error: "질문이 비어 있습니다." }, 400);
  }

  if (body.themeId && !isInvestigationTheme(body.themeId)) {
    return secureResponse({ error: "알 수 없는 사건 테마입니다." }, 400);
  }

  if (body.themeId && !THEME_SUSPECT_IDS[body.themeId].has(persona.id)) {
    return secureResponse({ error: "현재 사건에 속한 용의자가 아닙니다." }, 400);
  }

  const grantsPowerAccessCard = shouldGrantPowerControlAccessCard(question, persona.id, previousUserQuestions);
  const specialAnswer = getSuspectSpecialAnswer(question, persona.id, previousUserQuestions);
  if (specialAnswer) {
    return secureResponse({
      answer: applyLongQuestionNotice(specialAnswer, questionState.wasTruncated),
      source: "special",
      grantSpacePowerAccessCard: grantsPowerAccessCard,
      reaction: "calm",
      candleEffect: "steady",
      usedFactIds: [],
      newFactId: null
    });
  }

  const collectedEvidence = resolveEvidenceNames(signedProgress.collectedEvidenceNames);
  const collectedEvidenceSet = new Set(collectedEvidence);
  const presentedEvidence = resolveEvidenceNames([...(body.presentedEvidenceNames || []), ...(body.presentedEvidenceIds || [])])
    .filter((name) => collectedEvidenceSet.has(name));
  const accessibleEvidence = new Set([...presentedEvidence, ...collectedEvidence]);
  const inferredEvidence = inferEvidenceNamesFromText(question).filter((name) => accessibleEvidence.has(name));
  const personaPressureEvidence = inferPersonaPressureEvidenceNames(persona, question).filter((name) => accessibleEvidence.has(name));
  const usableEvidence = unique([...presentedEvidence, ...inferredEvidence, ...personaPressureEvidence]);
  const reactions = getRelevantReactions(persona, usableEvidence);
  const knownFactIds = signedProgress.knownFactIds;
  const revealedFactIds = signedProgress.knownFactIds;
  const retrievalContext = [...previousUserQuestions.slice(-2), question].join(" ");
  const mentionedPersonas = findMentionedPersonas(retrievalContext, persona.id);
  const currentPersonaFacts = retrieveInterrogationFacts({
    persona,
    question: retrievalContext,
    evidenceNames: usableEvidence,
    collectedEvidenceNames: collectedEvidence,
    revealedFactIds,
    limit: 5
  });
  const relatedPersonaFacts = DEDUCTION_QUESTION_PATTERN.test(question)
    ? mentionedPersonas.flatMap((mentionedPersona) =>
        retrieveInterrogationFacts({
          persona: mentionedPersona,
          question: retrievalContext,
          evidenceNames: usableEvidence,
          collectedEvidenceNames: collectedEvidence,
          revealedFactIds,
          limit: 4
        })
      )
    : [];
  const retrievedFacts = uniqueFacts([...currentPersonaFacts, ...relatedPersonaFacts]).slice(0, 10);
  const reaction = getInterrogationReaction(persona, usableEvidence, currentPersonaFacts, question);
  const responseMeta = buildResponseMeta(retrievedFacts, reaction, knownFactIds);
  const provider = getAIProvider();
  const { apiKey, missingKeyWarning } = getAIProviderConfig(provider);

  if (!apiKey) {
    return secureResponse(
      fallbackAnswer(
        persona,
        usableEvidence,
        reactions,
        missingKeyWarning,
        question,
        questionState.wasTruncated,
        responseMeta
      ) as Record<string, unknown>
    );
  }

  const systemPrompt = buildSystemPrompt(persona, usableEvidence, reactions, retrievedFacts, question, mentionedPersonas);
  const questionGuide = questionState.wasTruncated
    ? `\n\n현재 질문 처리:\n- 플레이어의 질문이 길어서 앞 ${QUESTION_CHAR_LIMIT}자만 전달되었다.\n- 답변 첫 부분에 "${LONG_QUESTION_NOTICE}"라는 뜻의 안내를 자연스럽게 포함한다.\n- 전달된 앞부분 질문에 대해서만 답하고, 뒤에 더 있었을 내용은 추측하지 않는다.`
    : "";
  const messages: OpenAIMessage[] = [
    { role: "developer", content: `${systemPrompt}${questionGuide}` },
    ...conversationHistory,
    { role: "user", content: question }
  ];

  try {
    const firstAnswer = await requestAIAnswer(provider, apiKey, messages);
    if (!firstAnswer.ok) {
      return secureResponse(
        fallbackAnswer(persona, usableEvidence, reactions, firstAnswer.error, question, questionState.wasTruncated, responseMeta) as Record<string, unknown>
      );
    }

    let answer = firstAnswer.answer;

    if (answer && (hasForeignText(answer) || hasDialogueQualityIssue(answer, question, usableEvidence, persona))) {
      const repairMessages: OpenAIMessage[] = [
        {
          role: "developer",
          content: `${systemPrompt}${questionGuide}

출력 검수 규칙:
- 답변에는 한글, 숫자, 공백, 일반 문장부호만 사용한다.
- 영어, 로마자, 한자, 일본어, 중국어, 모델명은 쓰지 않는다.
- 질문이 외국어를 포함해도 답변은 한국어로만 한다.
- 설명한다, 밝힌다, 인정한다처럼 작가가 인물 행동을 지시하는 서술문을 쓰지 않는다.
- 반드시 ${persona.name} 본인이 조사관에게 직접 말하는 1인칭 대사로 쓴다.
- 질문에 사건명, 장소, 장비, 증거가 이미 있으면 대상을 다시 묻지 않는다.
- 현재 검색된 확인 사실이나 증거 반응에 없는 구체적인 시각, 목격, 대사는 플레이어가 먼저 말했더라도 확인하지 않는다.`
        },
        { role: "user", content: `질문: ${question}\n초안: ${answer}\n\n초안의 사실은 유지하되 ${persona.name}의 자연스러운 직접 대사로 새로 답하라.` }
      ];
      const repairedAnswer = await requestAIAnswer(provider, apiKey, repairMessages);
      answer = repairedAnswer.ok ? repairedAnswer.answer : "";
    }

    if (!answer || hasForeignText(answer) || hasDialogueQualityIssue(answer, question, usableEvidence, persona)) {
      const guardedAnswer = fallbackAnswer(
        persona,
        usableEvidence,
        reactions,
        "답변 품질 검수를 통과하지 못해 안전한 인물 대사로 교체했습니다.",
        question,
        questionState.wasTruncated,
        responseMeta
      );
      return secureResponse({ ...guardedAnswer, source: "guarded", warning: undefined });
    }

    const blockedNeverClaim = hasNeverClaim(answer);
    if (blockedNeverClaim) {
      answer = safeSilentAnswer(persona);
    }

    if (process.env.NODE_ENV !== "production") {
      console.info("[interrogate-rag]", {
        provider,
        suspectId: persona.id,
        usedFactIds: responseMeta.usedFactIds,
        inputTokens: firstAnswer.inputTokens,
        outputTokens: firstAnswer.outputTokens
      });
    }

    return secureResponse({
      answer: applyLongQuestionNotice(answer, questionState.wasTruncated),
      source: "rag",
      usedEvidenceNames: usableEvidence,
      ...responseMeta,
      reaction: blockedNeverClaim ? "silent" : responseMeta.reaction,
      candleEffect: blockedNeverClaim ? "dim" : responseMeta.candleEffect
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    const providerLabel = provider === "mistral" ? "Mistral" : "OpenAI";
    return secureResponse(
      fallbackAnswer(persona, usableEvidence, reactions, `${providerLabel} API 오류: ${message}`, question, questionState.wasTruncated, responseMeta) as Record<string, unknown>
    );
  }
}
