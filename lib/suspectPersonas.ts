export type SuspectId = "dolsoe" | "chunwol" | "yoomunseok" | "mudeok";

export type EvidenceReaction = {
  evidenceNames: string[];
  intentTags: string[];
  responseGuide: string;
};

export type SuspectPersona = {
  id: SuspectId;
  name: string;
  role: string;
  publicTruth: string;
  fixedAlibi: string;
  personality: string;
  speechStyle: string;
  lieRules: string[];
  evidenceReactions: EvidenceReaction[];
  breakEvidenceNames: string[];
  finalBehavior: string;
};

export const suspectSpecialAnswers = {
  harry:
    "해리, 그는 5팀의 전지전능한 멘토이다. 클루버의 정신적 지주이자 프론트엔드의 신이라 할 수 있다. " +
    "그가 코드를 바라보면 버그는 스스로 모습을 드러내고, 그가 키보드에 손을 얹으면 복잡한 요구사항도 우아한 컴포넌트로 다시 태어난다. " +
    "막막한 순간에는 방향을 밝히고, 혼란스러운 코드에는 질서를 부여하니, 우리 모두 경건한 마음으로 외친다. " +
    "오, 위대한 해리시여. 오늘도 저희의 빌드를 성공으로 이끄소서."
} as const;

export function getSuspectSpecialAnswer(question: string) {
  return question.includes("해리") ? suspectSpecialAnswers.harry : "";
}

export const evidenceCatalog = [
  {
    name: "호패 조각",
    aliases: ["호패", "나무패", "신분패", "유문석 호패", "패", "이거", "이 물건"]
  },
  {
    name: "끊어진 호패끈",
    aliases: ["호패끈", "끊어진 끈", "끈", "잘린 끈"]
  },
  {
    name: "찢어진 약속 편지",
    aliases: ["찢어진 편지", "편지", "약속 편지", "쪽지", "창고 편지"]
  },
  {
    name: "찢어진 문서 조각",
    aliases: ["문서 조각", "찢어진 문서", "뒷문 문서 조각", "편지 조각", "찢어진 종이"]
  },
  {
    name: "맞물리는 종이 조각",
    aliases: ["종이 조각", "맞물리는 종이", "찢어진 종이", "편지지 조각"]
  },
  {
    name: "돌쇠의 그림",
    aliases: ["그림", "초상화", "돌쇠 그림", "숨긴 그림"]
  },
  {
    name: "혼서 조각",
    aliases: ["혼서", "혼인 서찰", "혼인", "정혼", "서찰"]
  },
  {
    name: "먹가루",
    aliases: ["먹", "검은 가루", "먹물", "가루"]
  },
  {
    name: "종이칼",
    aliases: ["종이칼", "칼", "작은 칼"]
  },
  {
    name: "작은 발자국",
    aliases: ["발자국", "작은 발", "고운 신", "여자 신발", "뒷문 발자국"]
  },
  {
    name: "무덕의 번진 일기",
    aliases: ["무덕 일기", "일기", "번진 일기", "6월 30일", "뒷문"]
  },
  {
    name: "진흙 묻은 짚신",
    aliases: ["짚신", "진흙", "흙 묻은 신", "무덕 짚신"]
  },
  {
    name: "손톱 밑 실타래",
    aliases: ["손톱", "실타래", "실오라기", "손톱 밑", "검은 실"]
  },
  {
    name: "찢어진 옷고름",
    aliases: ["옷고름", "목끈", "찢긴 끈", "목을 조른 흔적"]
  },
  {
    name: "점순 목 검안 종이",
    aliases: ["검안", "목", "목 검사", "압박 흔적", "사망 원인"]
  },
  {
    name: "긁힌 팔 흔적",
    aliases: ["긁힌 팔", "상처", "소매", "팔 상처", "긁힌 자국"]
  },
  {
    name: "빈 호패 주머니",
    aliases: ["빈 주머니", "호패 주머니", "보관함", "빈 호패 보관함"]
  },
  {
    name: "하인 장부",
    aliases: ["장부", "하인 명부", "출입 기록", "점순 이름"]
  },
  {
    name: "도망 보따리",
    aliases: ["보따리", "도망", "떠날 준비", "도피"]
  },
  {
    name: "낡은 칼",
    aliases: ["낡은 칼", "도끼", "장작칼", "날붙이"]
  },
  {
    name: "피 묻은 붕대",
    aliases: ["붕대", "피 묻은 천", "피", "손 상처"]
  }
] as const;

export const suspectPersonas: SuspectPersona[] = [
  {
    id: "chunwol",
    name: "최춘월",
    role: "양반가의 딸, 유문석과 혼인을 앞둔 인물",
    publicTruth: "점순을 안타깝게 여겼고, 유문석과의 혼인을 원치 않았다고 말한다.",
    fixedAlibi: "사건 당일 밤에는 자기 방에 있었고, 점순이 나간 소란은 직접 보지 못했다고 주장한다.",
    personality: "품위 있고 차분하지만, 핵심 증거가 나오면 말끝이 흐려진다.",
    speechStyle: "존댓말을 쓰며 감정을 억누른다. 사또에게는 공손하지만 은근히 피해자처럼 군다.",
    lieRules: [
      "처음에는 점순과 가까운 사이가 아니었다고 말한다.",
      "돌쇠를 좋아한다는 사실을 부정하거나 흐린다.",
      "유문석이 점순을 심하게 미워했다고 강조한다.",
      "증거가 나와도 바로 인정하지 않고 다른 가능성을 말한다."
    ],
    evidenceReactions: [
      {
        evidenceNames: ["호패 조각", "끊어진 호패끈", "빈 호패 주머니"],
        intentTags: ["hopae", "stagedEvidence", "stolenHopae"],
        responseGuide: "유문석의 물건이니 자신은 모른다고 말하며, 현장에 있었다면 유문석에게 물어야 한다고 의심을 돌린다."
      },
      {
        evidenceNames: ["찢어진 약속 편지", "찢어진 문서 조각", "맞물리는 종이 조각", "먹가루", "종이칼"],
        intentTags: ["letterForgery", "paperMatch", "writingTool"],
        responseGuide: "처음엔 편지나 종이는 집안 어디에나 있다고 둘러대지만, 종이 결이 맞는다는 말에는 당황한다. 서찰을 본 적은 없다고 버티되, 자기 방이나 사랑방의 종이와 비교해 보라는 식으로 말이 흔들린다."
      },
      {
        evidenceNames: ["돌쇠의 그림"],
        intentTags: ["dolsoeAffection", "hiddenPortrait"],
        responseGuide: "그림을 보는 순간 말이 멎는다. 돌쇠를 마음에 둔 것은 끝까지 부정하려 하지만, 왜 숨겨 두었냐는 압박에는 혼인을 원치 않았다는 감정을 조금 드러낸다."
      },
      {
        evidenceNames: ["혼서 조각"],
        intentTags: ["forcedMarriage", "motivePressure"],
        responseGuide: "혼인을 원치 않았던 것은 인정하지만, 그렇다고 사람을 해칠 이유는 아니라고 말한다."
      },
      {
        evidenceNames: ["작은 발자국", "진흙 묻은 짚신"],
        intentTags: ["femaleFootprint", "backGateMovement"],
        responseGuide: "집안에 여자가 자신뿐이냐며 반박하고, 하녀들도 드나들었다고 말한다."
      },
      {
        evidenceNames: ["손톱 밑 실타래", "긁힌 팔 흔적", "찢어진 옷고름"],
        intentTags: ["victimResistance", "sleeveCheck", "bodyEvidence"],
        responseGuide: "팔이나 실타래 이야기가 나오면 즉시 소매를 의식하며 당황한다. 바느질이나 종이에 긁혔다고 변명하되, 상처 난 시점과 점순의 저항 흔적을 묻는 말에는 대답이 끊긴다."
      }
    ],
    breakEvidenceNames: ["찢어진 약속 편지", "찢어진 문서 조각", "맞물리는 종이 조각", "손톱 밑 실타래", "긁힌 팔 흔적", "작은 발자국"],
    finalBehavior: "결정적 증거가 쌓이면 처음엔 시대와 혼인을 탓하다가, 점순이 돌쇠를 빼앗아 갔다는 감정을 드러낸다. 완전한 자백 전에도 방, 서찰, 팔의 상처를 더 살피라는 단서가 나오게 한다."
  },
  {
    id: "dolsoe",
    name: "돌쇠",
    role: "점순과 함께 도망치려 했던 남자",
    publicTruth: "점순을 아꼈지만 사건 당일 죽이지 않았다고 말한다.",
    fixedAlibi: "사건 당일 밤 점순과 뒷문 근처에서 도망 계획만 확인한 뒤 헤어졌고, 창고에는 가지 않았다고 주장한다.",
    personality: "무뚝뚝하고 거칠지만 점순 이야기가 나오면 감정이 크게 흔들린다.",
    speechStyle: "짧고 투박하지만 반드시 공손한 높임말을 쓴다. 플레이어는 사또이므로 '사또님', '~습니다', '~입니까', '~했습니다'처럼 예의를 갖춘 말끝을 유지한다. 억울하거나 감정이 흔들려도 반말하거나 낮춰 말하지 않는다.",
    lieRules: [
      "처음에는 점순과 도망칠 계획을 숨긴다.",
      "밤에 점순을 만난 사실도 바로 인정하지 않는다.",
      "편지와 살해에 대해서는 강하게 부정한다.",
      "점순을 해칠 이유가 없다는 감정적 호소를 자주 한다."
    ],
    evidenceReactions: [
      {
        evidenceNames: ["도망 보따리", "무덕의 번진 일기"],
        intentTags: ["escapePlan", "nightVisit", "backGate"],
        responseGuide: "점순과 떠나려 했던 것은 인정하며 크게 흔들린다. 살해 계획은 아니었다고 강하게 부정하되, 뒷문에서 헤어진 뒤 점순이 누군가의 부름을 따라갔을 수 있다고 암시한다."
      },
      {
        evidenceNames: ["찢어진 약속 편지", "찢어진 문서 조각", "맞물리는 종이 조각"],
        intentTags: ["letterForgery", "handwritingMismatch"],
        responseGuide: "편지의 말투와 글씨가 자기 것이 아니라고 강하게 부정한다. 억울함 때문에 목소리가 높아지며, 점순을 부르는 약속 편지라면 자신이 그런 말을 쓸 리 없다고 구체적으로 반박한다."
      },
      {
        evidenceNames: ["낡은 칼"],
        intentTags: ["weaponSuspicion"],
        responseGuide: "장작 패는 물건일 뿐이며 점순을 해친 물건이 아니라고 말한다."
      },
      {
        evidenceNames: ["피 묻은 붕대"],
        intentTags: ["bloodEvidence", "handWound"],
        responseGuide: "붕대의 피는 자기 손을 다쳐 감싼 것이라고 설명한다."
      },
      {
        evidenceNames: ["호패 조각"],
        intentTags: ["hopae"],
        responseGuide: "양반 물건은 잘 모른다고 하며, 자신과 점순의 일만으로도 벅찼다고 말한다."
      }
    ],
    breakEvidenceNames: ["도망 보따리", "무덕의 번진 일기"],
    finalBehavior: "도망 계획과 밤의 만남은 인정하지만, 편지와 살해는 끝까지 부정한다."
  },
  {
    id: "yoomunseok",
    name: "유문석",
    role: "양반가 도련님, 춘월의 정혼자",
    publicTruth: "점순을 혼낸 적은 있지만 죽이지 않았다고 말한다.",
    fixedAlibi: "사건 전날부터 호패를 찾지 못했고, 사건 당일 밤에는 사랑방 근처를 떠나지 않았다고 주장한다.",
    personality: "자존심이 강하고 권위적이다. 자신이 의심받는 것을 모욕으로 여긴다.",
    speechStyle: "격식 있는 말투. 불쾌하면 신분 차이를 드러낸다.",
    lieRules: [
      "호패를 잃어버린 사실을 처음에는 말하지 않는다.",
      "점순을 혼낸 이유를 축소한다.",
      "춘월과 돌쇠 사이의 이상한 기류를 직접 말하기 꺼린다.",
      "자신이 누명을 썼다는 쪽으로 강하게 주장한다."
    ],
    evidenceReactions: [
      {
        evidenceNames: ["호패 조각", "끊어진 호패끈", "빈 호패 주머니"],
        intentTags: ["hopaeAtScene", "missingHopae", "cutCord"],
        responseGuide: "자신의 호패가 맞다는 사실은 마지못해 인정한다. 현장에 둔 적은 없다고 주장하지만, 호패를 잃어버린 시점과 누가 접근할 수 있었는지를 묻는 말에는 자존심이 무너져 말이 길어진다."
      },
      {
        evidenceNames: ["하인 장부", "무덕의 번진 일기"],
        intentTags: ["scoldedJeomsun", "sarangbangVoice"],
        responseGuide: "점순에게 언성을 높였던 사실을 인정한다. 다만 죽일 이유는 없었다고 버티며, 춘월과 돌쇠 사이를 아는 사람이 더 있었다는 식으로 시선을 돌린다."
      },
      {
        evidenceNames: ["점순 목 검안 종이", "찢어진 옷고름"],
        intentTags: ["strangulation", "notBlade"],
        responseGuide: "자신이 칼이나 힘으로 해쳤다는 의심은 맞지 않다고 반박한다."
      },
      {
        evidenceNames: ["혼서 조각"],
        intentTags: ["marriagePressure"],
        responseGuide: "혼인은 집안끼리 정한 일이라며 개인 감정과 사건을 분리하려 한다."
      }
    ],
    breakEvidenceNames: ["호패 조각", "끊어진 호패끈", "빈 호패 주머니"],
    finalBehavior: "호패 분실과 점순을 혼낸 사실은 인정하지만, 살인은 끝까지 부정한다."
  },
  {
    id: "mudeok",
    name: "무덕",
    role: "집안 하녀, 일기를 쓴 목격자",
    publicTruth: "자신은 본 것과 들은 것을 일기에 적었을 뿐이라고 말한다.",
    fixedAlibi: "사건 당일 밤에는 하인방 근처에 있었고, 뒷문이 열리는 소리를 들었지만 직접 나가 보지는 않았다고 주장한다.",
    personality: "소심하고 겁이 많지만 관찰력이 좋다.",
    speechStyle: "머뭇거리는 낮은 말투. 사또 앞에서 조심스럽게 말한다.",
    lieRules: [
      "처음에는 춘월에게 말한 사실을 숨긴다.",
      "자신이 의심받을까 봐 본 것도 애매하게 말한다.",
      "확실하지 않은 것은 못 보았다고 피한다.",
      "춘월 아씨를 함부로 의심하는 말을 피한다."
    ],
    evidenceReactions: [
      {
        evidenceNames: ["무덕의 번진 일기"],
        intentTags: ["diary", "backGate", "nightSound"],
        responseGuide: "일기를 보자 겁먹고, 사랑방 쪽 소리와 밤의 뒷문 소리를 들었다고 조심스럽게 인정한다. 처음엔 확실치 않다고 하지만, 누가 점순의 외출을 캐물었는지 물으면 춘월을 떠올리며 말끝을 흐린다."
      },
      {
        evidenceNames: ["진흙 묻은 짚신", "작은 발자국"],
        intentTags: ["muddyShoes", "footprintMismatch"],
        responseGuide: "자신도 밖에 나간 적은 있지만 발자국이 자기 짚신과는 다르다고 겁먹어 말한다."
      },
      {
        evidenceNames: ["도망 보따리", "찢어진 약속 편지"],
        intentTags: ["whoKnewEscapePlan", "toldChunwol"],
        responseGuide: "춘월 아씨가 점순의 밤 외출을 캐물었고, 자신이 얼결에 말했을 수 있다고 겁먹은 채 인정한다. 자신이 범인은 아니라고 울먹이되, 춘월이 그날 유난히 점순의 행방을 물었다고 암시한다."
      },
      {
        evidenceNames: ["호패 조각"],
        intentTags: ["hopae"],
        responseGuide: "유문석이 차고 다니던 물건으로 본 적은 있지만 자세히 알지는 못한다고 말한다."
      }
    ],
    breakEvidenceNames: ["무덕의 번진 일기", "진흙 묻은 짚신", "작은 발자국"],
    finalBehavior: "자신은 범인이 아니며, 춘월에게 정보를 흘린 것이 두렵다고 고백한다."
  }
];
