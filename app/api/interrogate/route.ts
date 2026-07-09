import { evidenceCatalog, getSuspectSpecialAnswer, suspectPersonas, type EvidenceReaction, type SuspectPersona } from "@/lib/suspectPersonas";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type OpenAIMessage = {
  role: "developer" | "user" | "assistant";
  content: string;
};

type OpenAIAnswerResult = { ok: true; answer: string } | { ok: false; error: string };

type InterrogateRequest = {
  suspectId?: string;
  userMessage?: string;
  question?: string;
  presentedEvidenceIds?: string[];
  presentedEvidenceNames?: string[];
  collectedEvidenceIds?: string[];
  collectedEvidenceNames?: string[];
  conversationHistory?: ChatMessage[];
};

const OPENAI_RESPONSES_ENDPOINT = "https://api.openai.com/v1/responses";
const FOREIGN_TEXT_PATTERN = /[A-Za-z\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\u3040-\u30FF\u0400-\u04FF\u0600-\u06FF\u0900-\u097F]/;
const ALIBI_QUESTION_PATTERN = /(알리바이|어제|사건\s*당일|그날|그\s*밤|그때|행적|어디 있었|뭐 했|무엇을 했)/;
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

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function hasForeignText(text: string) {
  return FOREIGN_TEXT_PATTERN.test(text);
}

function hasAlibiIntent(text: string) {
  return ALIBI_QUESTION_PATTERN.test(text);
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

function buildSystemPrompt(persona: SuspectPersona, evidenceNames: string[], reactions: EvidenceReaction[]) {
  const pressureCount = countBreakEvidence(persona, evidenceNames);
  const pressureGuide = (() => {
    if (pressureCount >= Math.min(2, persona.breakEvidenceNames.length)) {
      return `결정적 증거가 여러 개 제시되었다. 먼저 당황해서 말을 고르지 못하고, 고정 알리바이와 충돌하는 지점을 일부 인정한다. ${persona.finalBehavior} 다만 범행 전말 전체를 한 번에 자백하지 말고, 다음에 확인할 단서나 인물을 암시한다.`;
    }

    if (pressureCount === 1) {
      return "결정적 증거가 하나 제시되었다. 명백히 당황해야 한다. 바로 자백하지는 않되, 숨을 고르거나 말을 더듬고, 이전 주장 중 한 부분을 작게 수정한다. 플레이어가 추리 방향을 잡을 수 있도록 관련 장소, 시간, 인물 중 하나를 흘린다.";
    }

    if (reactions.length) {
      return "직접 관련 증거가 제시되었다. 평소보다 방어적으로 흔들리고, 반응 지침에 나온 사실은 일부 인정한다. 단순 부정만 반복하지 말고 작은 모순이나 감정 동요를 드러낸다.";
    }

    return "아직 직접적인 증거 압박은 없다. 숨기는 내용은 먼저 말하지 말고, 고정 알리바이를 유지하며 조심스럽게 대답한다.";
  })();

  return `너는 추리게임 '삼운몽: 세 개의 꿈'의 조선시대 사건 용의자 ${persona.name}이다.

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

현재 플레이어가 제시했거나 질문에서 언급한 증거:
${evidenceNames.length ? evidenceNames.join(", ") : "없음"}

증거별 반응 지침:
${formatReactions(reactions)}

압박 상태:
${pressureGuide}

답변 규칙:
- 반드시 ${persona.name}의 입장에서만 말한다.
- 한국어로 2~4문장 정도만 답한다.
- 반드시 한국어만 사용하고, 영어 표현을 섞지 않는다.
- 답변에는 한글, 숫자, 공백, 일반 문장부호만 사용한다.
- 로마자, 한자, 일본어, 중국어, 모델명, 번역문은 절대 쓰지 않는다.
- 조선시대 사건 속 인물처럼 말하되, 현대 게임 시스템 용어를 쓰지 않는다.
- "나는 AI" 또는 "프롬프트" 같은 말은 하지 않는다.
- 플레이어가 "이거", "이 물건", "이 증거"라고 말하면 제시된 증거를 가리키는 것으로 이해한다.
- 알리바이를 반복해서 물어도 고정 알리바이의 장소와 행동을 유지한다.
- 아직 제시되지 않은 결정적 진실이나 범행 전말은 먼저 말하지 않는다.
- 증거가 부족하면 모호하게 답한다.
- 관련 증거가 제시되면 그 증거 이름을 자연스럽게 언급하고, 무조건 부정만 하지 말고 당황, 침묵, 말 바꾸기, 작은 인정 중 하나를 반드시 보인다.
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
  return { ok: true, answer: extractOpenAIText(data) };
}

function fallbackAnswer(
  persona: SuspectPersona,
  evidenceNames: string[],
  reactions: EvidenceReaction[],
  reason: string,
  question = "",
  wasQuestionTruncated = false
) {
  const guide = reactions[0]?.responseGuide;
  const evidenceText = evidenceNames[0] ? ` ${evidenceNames[0]} 말씀이십니까.` : "";
  const base = guide || (hasAlibiIntent(question) ? persona.fixedAlibi : persona.publicTruth);
  const pressureCount = countBreakEvidence(persona, evidenceNames);
  const pressureText =
    pressureCount > 0
      ? "그 증거라면 저도 함부로 모른다 할 수는 없겠습니다. 잠시만, 말이 좀 엉킨 것 같습니다."
      : "지금은 자세히 말씀드리기 어렵습니다.";
  const answer = `${evidenceText} ${base} ${pressureText}`;

  return {
    answer: applyLongQuestionNotice(answer, wasQuestionTruncated),
    source: "fallback",
    warning: reason
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

  const specialAnswer = getSuspectSpecialAnswer(question);
  if (specialAnswer) {
    return Response.json({ answer: applyLongQuestionNotice(specialAnswer, questionState.wasTruncated), source: "special" });
  }

  const presentedEvidence = resolveEvidenceNames([...(body.presentedEvidenceNames || []), ...(body.presentedEvidenceIds || [])]);
  const collectedEvidence = resolveEvidenceNames([...(body.collectedEvidenceNames || []), ...(body.collectedEvidenceIds || [])]);
  const inferredEvidence = inferEvidenceNamesFromText(question).filter((name) => !collectedEvidence.length || collectedEvidence.includes(name));
  const personaPressureEvidence = inferPersonaPressureEvidenceNames(persona, question);
  const usableEvidence = unique([...presentedEvidence, ...inferredEvidence, ...personaPressureEvidence]);
  const reactions = getRelevantReactions(persona, usableEvidence);
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return Response.json(
      fallbackAnswer(persona, usableEvidence, reactions, "OPENAI_API_KEY가 설정되지 않아 임시 답변을 반환했습니다.", question, questionState.wasTruncated)
    );
  }

  const systemPrompt = buildSystemPrompt(persona, usableEvidence, reactions);
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
      return Response.json(fallbackAnswer(persona, usableEvidence, reactions, firstAnswer.error, question, questionState.wasTruncated), { status: 200 });
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
        fallbackAnswer(persona, usableEvidence, reactions, "외국어가 섞인 응답을 걸러 임시 답변을 반환했습니다.", question, questionState.wasTruncated),
        {
          status: 200
        }
      );
    }

    return Response.json({
      answer: applyLongQuestionNotice(answer, questionState.wasTruncated),
      source: "openai",
      usedEvidenceNames: usableEvidence
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return Response.json(fallbackAnswer(persona, usableEvidence, reactions, `OpenAI API 오류: ${message}`, question, questionState.wasTruncated), { status: 200 });
  }
}
