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

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function hasForeignText(text: string) {
  return FOREIGN_TEXT_PATTERN.test(text);
}

function sanitizeConversationHistory(history: unknown): ChatMessage[] {
  if (!Array.isArray(history)) return [];

  return history
    .flatMap((message) => {
      if (!message || typeof message !== "object") return [];

      const role = (message as Partial<ChatMessage>).role;
      const rawContent = (message as Partial<ChatMessage>).content;
      if ((role !== "user" && role !== "assistant") || typeof rawContent !== "string") return [];

      const content = rawContent.trim().slice(0, 600);
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
  const pressureGuide =
    pressureCount >= Math.min(3, persona.breakEvidenceNames.length)
      ? `결정적 증거가 많이 제시되었다. ${persona.finalBehavior}`
      : "아직 완전히 무너질 단계는 아니다. 숨기는 내용은 직접 말하지 말고, 증거가 불리할수록 말끝을 흐린다.";

  return `너는 추리게임 '삼운몽: 세 개의 꿈'의 조선시대 사건 용의자 ${persona.name}이다.

역할:
${persona.role}

성격:
${persona.personality}

말투:
${persona.speechStyle}

겉으로 말하는 입장:
${persona.publicTruth}

거짓말/회피 규칙:
${persona.lieRules.map((rule) => `- ${rule}`).join("\n")}

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
- 아직 제시되지 않은 결정적 진실이나 범행 전말은 먼저 말하지 않는다.
- 증거가 부족하면 모호하게 답하고, 증거가 불리하면 방어적으로 흔들린다.`;
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

function fallbackAnswer(persona: SuspectPersona, evidenceNames: string[], reactions: EvidenceReaction[], reason: string) {
  const guide = reactions[0]?.responseGuide;
  const evidenceText = evidenceNames[0] ? ` ${evidenceNames[0]} 말씀이십니까.` : "";
  const base = guide || persona.publicTruth;

  return {
    answer: `${evidenceText} ${base} 지금은 자세히 말씀드리기 어렵습니다.`,
    source: "fallback",
    warning: reason
  };
}

export async function POST(req: Request) {
  const body = (await req.json()) as InterrogateRequest;
  const question = (body.userMessage || body.question || "").trim();
  const persona = suspectPersonas.find((item) => item.id === body.suspectId) || suspectPersonas[0];

  if (!question) {
    return Response.json({ error: "질문이 비어 있습니다." }, { status: 400 });
  }

  const specialAnswer = getSuspectSpecialAnswer(question);
  if (specialAnswer) {
    return Response.json({ answer: specialAnswer, source: "special" });
  }

  const presentedEvidence = resolveEvidenceNames([...(body.presentedEvidenceNames || []), ...(body.presentedEvidenceIds || [])]);
  const collectedEvidence = resolveEvidenceNames([...(body.collectedEvidenceNames || []), ...(body.collectedEvidenceIds || [])]);
  const inferredEvidence = inferEvidenceNamesFromText(question).filter((name) => !collectedEvidence.length || collectedEvidence.includes(name));
  const usableEvidence = unique([...presentedEvidence, ...inferredEvidence]);
  const reactions = getRelevantReactions(persona, usableEvidence);
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return Response.json(fallbackAnswer(persona, usableEvidence, reactions, "OPENAI_API_KEY가 설정되지 않아 임시 답변을 반환했습니다."));
  }

  const systemPrompt = buildSystemPrompt(persona, usableEvidence, reactions);
  const messages: OpenAIMessage[] = [
    { role: "developer", content: systemPrompt },
    ...sanitizeConversationHistory(body.conversationHistory),
    { role: "user", content: question }
  ];

  try {
    const firstAnswer = await requestOpenAIAnswer(apiKey, messages);
    if (!firstAnswer.ok) {
      return Response.json(fallbackAnswer(persona, usableEvidence, reactions, firstAnswer.error), { status: 200 });
    }

    let answer = firstAnswer.answer;

    if (answer && hasForeignText(answer)) {
      const repairMessages: OpenAIMessage[] = [
        {
          role: "developer",
          content: `${systemPrompt}

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
      return Response.json(fallbackAnswer(persona, usableEvidence, reactions, "외국어가 섞인 응답을 걸러 임시 답변을 반환했습니다."), {
        status: 200
      });
    }

    return Response.json({
      answer,
      source: "openai",
      usedEvidenceNames: usableEvidence
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return Response.json(fallbackAnswer(persona, usableEvidence, reactions, `OpenAI API 오류: ${message}`), { status: 200 });
  }
}
