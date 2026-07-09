window.SAMUNMONG_CONTENT = {
  screenImages: {
    mainScreen: "/samunmong/assets/main-screen-v2.png",
    tutorialScreen: "/samunmong/assets/main-screen-v2.png",
    dreamScreen: "/samunmong/assets/main-screen-v2.png",
    fieldOne: "/samunmong/assets/scenes-integrated/scene-field-one-evidence-integrated.png",
    chunwolRoom: "/samunmong/assets/scenes-integrated/scene-chunwol-room-evidence-integrated.png",
    mudeokServantRoom: "/samunmong/assets/scenes-integrated/scene-mudeok-servant-room-evidence-integrated.png",
    yoomunseokSarangbang: "/samunmong/assets/scenes-integrated/scene-yoomunseok-sarangbang-evidence-integrated.png",
    dolsoeQuarters: "/samunmong/assets/scenes-integrated/scene-dolsoe-quarters-evidence-integrated.png",
    backGateCourtyard: "/samunmong/assets/scenes-integrated/scene-back-gate-courtyard-evidence-integrated.png",
    interrogationScreen: "/samunmong/assets/scene-interrogation-dolsoe.png?v=scene-20260707"
  },

  suspects: [
    { name: "돌쇠", id: "dolsoe", scene: "/samunmong/assets/scene-interrogation-dolsoe.png?v=scene-20260707", sleeveScene: "/samunmong/assets/scene-interrogation-dolsoe-sleeve.png?v=sleeve-20260707" },
    { name: "춘월", id: "chunwol", scene: "/samunmong/assets/scene-interrogation-chunwol.png?v=scene-20260707", sleeveScene: "/samunmong/assets/scene-interrogation-chunwol-sleeve.png?v=sleeve-20260707" },
    { name: "유문석", id: "yoomunseok", scene: "/samunmong/assets/scene-interrogation-yoomunseok.png?v=scene-20260707", sleeveScene: "/samunmong/assets/scene-interrogation-yoomunseok-sleeve.png?v=sleeve-20260707" },
    { name: "무덕", id: "mudeok", scene: "/samunmong/assets/scene-interrogation-mudeok.png?v=scene-20260707", sleeveScene: "/samunmong/assets/scene-interrogation-mudeok-sleeve.png?v=sleeve-20260707" }
  ],

  evidenceData: {
    "호패 조각": {
      note: "점순 옆에서 발견된 신분 단서. 일부 글자가 긁혀 있다.",
      location: "유문석 집 앞",
      logic: "현장에 놓인 호패가 정말 유문석의 것인지, 누가 일부러 떨어뜨렸는지 확인해야 한다.",
      relatedSuspects: ["유문석", "춘월"],
      contradiction: "유문석의 물건처럼 보이지만 긁힌 흔적과 끊어진 끈이 있으면 누군가가 가져가 꾸민 증거일 수 있다.",
      img: "/samunmong/assets/evidence-wooden-tag.png",
      tool: "돋보기",
      toolResult: "긁힌 글자 주변에 억지로 문지른 흔적이 보인다."
    },
    "돌쇠의 그림": {
      note: "춘월의 방에서 발견된 초상화. 춘월과 돌쇠의 관계를 추적할 단서다.",
      location: "춘월의 방",
      logic: "춘월이 돌쇠에게 관심을 숨기고 있었다면 점순과 돌쇠의 관계를 질투했을 가능성이 생긴다.",
      relatedSuspects: ["춘월", "돌쇠"],
      contradiction: "춘월이 돌쇠를 모른다고 하거나 관심이 없다고 말하면 그림의 보관 상태와 맞지 않는다.",
      img: "/samunmong/assets/evidence-portrait.png",
      tool: "촛불 비추기",
      toolResult: "그림 뒤쪽에 접힌 종이 자국이 희미하게 보인다."
    },
    "사라진 노리개": {
      note: "장식 고리가 느슨해진 노리개. 누가 떨어뜨렸는지 확인해야 한다.",
      location: "춘월의 방",
      logic: "장신구가 사라지거나 손상된 시점은 누군가 급히 움직였거나 몸싸움을 겪었는지 따질 근거가 된다.",
      relatedSuspects: ["춘월"],
      contradiction: "춘월이 방을 떠난 적 없다고 말하면 장신구 손상과 이동 경위를 다시 물을 수 있다.",
      img: "/samunmong/assets/evidence-transparent/evidence-norigae-transparent.png",
      tool: "돋보기",
      toolResult: "고리 부분에 급히 잡아당긴 듯한 흠집이 있다."
    },
    "나무 상자": {
      note: "사랑방에서 확인한 작은 나무 상자. 안에 무엇이 있었는지 확인해야 한다.",
      location: "유문석 사랑방",
      logic: "상자 안에 있던 물건이 사라졌다면 호패나 문서가 누군가에게 넘어간 경로를 추적할 수 있다.",
      relatedSuspects: ["유문석", "무덕"],
      contradiction: "상자 안의 빈자리와 호패 주머니가 함께 확인되면 유문석의 물건이 외부로 나간 정황이 된다.",
      img: "/samunmong/assets/evidence-transparent/evidence-wooden-box-transparent.png",
      tool: "돋보기",
      toolResult: "틈새를 자세히 살피자 상자 안쪽에 잘게 부서진 종이 가루가 남아 있다."
    },
    "무덕의 번진 일기": {
      note: "먹이 번져 읽기 어려운 일기. 숨긴 문장을 추적할 수 있다.",
      location: "무덕의 하인방",
      logic: "날짜별 기록을 보면 점순이 혼난 일, 밤에 찾아온 사람, 춘월이 숨긴 그림을 차례로 확인할 수 있다.",
      relatedSuspects: ["무덕", "유문석", "춘월", "돌쇠"],
      contradiction: "무덕의 기록은 각 용의자의 진술을 날짜별로 대조하게 만드는 기준점이다.",
      entries: [
        { date: "6/29", text: "점순이가 크게 혼나는 소리가 들렸다. 사랑방 쪽에서 난 소리였고, 문이 닫혀 있어 누구 목소리인지는 똑똑히 듣지 못했다. 한참 뒤 점순이가 눈가를 훔치며 마당을 지나갔다." },
        { date: "6/30", text: "밤늦게 점순이를 보러 누군가 온 것 같다. 뒷문이 잠깐 열리는 소리가 났고, 점순이는 한동안 돌아오지 않았다. 다음 날 아침 마당 끝에는 흙 묻은 발자국이 희미하게 남아 있었다." },
        { date: "7/1", text: "길을 지나가다가 춘월 아씨가 누군가의 얼굴을 그리고 있는 것을 보았다. 얼굴 아래에는 미처 다 쓰지 못한 짧은 글귀가 있었고, 아씨는 그것을 손끝으로 문질러 지웠다. 내가 다가오자 아씨는 놀란 듯 그림을 접어 품에 숨겼다." }
      ],
      img: "/samunmong/assets/mudeok-interaction/evidence-mudeok-smeared-diary.png",
      tool: "촛불 비추기",
      toolResult: "빛을 비추자 번진 먹 아래로 날짜별 기록이 더 또렷하게 드러난다."
    },
    "진흙 묻은 짚신": {
      note: "문밖의 젖은 길과 같은 진흙이 묻은 짚신.",
      location: "무덕의 하인방",
      logic: "6월 30일 밤의 발자국과 비교하면 점순을 만나러 온 사람이 어느 길로 움직였는지 따질 수 있다.",
      relatedSuspects: ["무덕", "돌쇠"],
      contradiction: "짚신의 흙과 뒷문 발자국이 맞으면 밤 이동 진술을 흔들 수 있다.",
      img: "/samunmong/assets/mudeok-interaction/evidence-mudeok-muddy-straw-shoes.png",
      tool: "먼지털이 붓",
      toolResult: "짚신 바닥의 흙 결이 현장 발자국과 비슷하다."
    },
    "찢어진 옷고름": {
      note: "거칠게 끊어진 옷고름. 급한 몸싸움의 흔적일 수 있다.",
      location: "무덕의 하인방",
      logic: "점순이 저항했거나 누군가 붙잡았다는 물리적 근거가 된다.",
      relatedSuspects: ["춘월", "무덕"],
      contradiction: "누구도 접촉하지 않았다고 하면 손톱 밑 실타래와 함께 반박할 수 있다.",
      img: "/samunmong/assets/mudeok-interaction/evidence-torn-collar-tie.png",
      tool: "돋보기",
      toolResult: "천 올이 한 방향으로 잡아당겨져 있다."
    },
    "손톱 밑 실타래": {
      note: "작은 실타래 표본. 옷감이나 끈과 대조할 수 있다.",
      location: "무덕의 하인방",
      logic: "점순이 마지막 순간에 누군가의 옷을 붙잡았는지 확인하는 단서다.",
      relatedSuspects: ["춘월"],
      contradiction: "긁힌 팔 흔적이나 찢어진 옷고름과 맞물리면 접촉을 숨긴 진술이 무너진다.",
      img: "/samunmong/assets/mudeok-interaction/evidence-fingernail-thread-sample.png",
      tool: "돋보기",
      toolResult: "찢어진 옷고름의 섬유와 비슷한 꼬임이 보인다."
    },
    "점순 목 검안 종이": {
      note: "점순의 목 주변을 살핀 기록지. 직접적인 결론은 없지만 중요한 단서다.",
      location: "무덕의 하인방",
      logic: "날카로운 상처보다 목 주변 압박 흔적을 중심으로 범행 방식을 다시 보게 만든다.",
      relatedSuspects: ["무덕", "춘월"],
      contradiction: "흉기를 단정하는 진술보다 몸싸움과 압박 흔적을 따져야 한다.",
      img: "/samunmong/assets/mudeok-interaction/evidence-jeomsun-neck-exam-paper.png",
      tool: "촛불 비추기",
      toolResult: "종이 위에 눌린 선이 희미하게 드러난다."
    },
    "빈 호패 주머니": {
      note: "호패가 빠진 주머니. 호패 조각과 함께 봐야 한다.",
      location: "유문석 사랑방",
      logic: "유문석의 호패가 현장에 놓이기 전에 방에서 빠져나갔는지 확인할 수 있다.",
      relatedSuspects: ["유문석", "춘월", "무덕"],
      contradiction: "호패 조각과 끊어진 호패끈을 함께 보면 유문석이 직접 떨어뜨린 것인지 의심할 수 있다.",
      img: "/samunmong/assets/evidence-transparent/evidence-empty-hopae-holder.png",
      tool: "돋보기",
      toolResult: "안쪽 가장자리에 끊어진 실의 마찰 흔적이 있다."
    },
    "하인 장부": {
      note: "하인들의 출입과 심부름 기록을 적은 장부.",
      location: "유문석 사랑방",
      logic: "누가 어느 방에 들어갈 수 있었는지 확인해 호패와 문서 이동 가능성을 좁힌다.",
      relatedSuspects: ["무덕", "유문석", "춘월"],
      contradiction: "출입 기록이 비어 있거나 지워졌다면 누군가 동선을 숨긴 정황이 된다.",
      img: "/samunmong/assets/evidence-transparent/evidence-servant-ledger.png",
      tool: "촛불 비추기",
      toolResult: "빛에 비추자 장부장 사이로 눌려 있던 빈 줄 하나가 드러난다."
    },
    "종이칼": {
      note: "사랑방 책상에 놓인 종이칼. 편지 조각과 절단면을 비교할 수 있다.",
      location: "유문석 사랑방",
      logic: "편지가 찢긴 것이 아니라 일부가 잘렸다면 계획적으로 문서를 숨긴 정황이 된다.",
      relatedSuspects: ["유문석", "춘월"],
      contradiction: "편지를 모른다는 말과 칼끝의 종이 섬유가 충돌할 수 있다.",
      img: "/samunmong/assets/evidence-transparent/evidence-paper-knife.png",
      tool: "돋보기",
      toolResult: "칼끝에 아주 작은 종이 섬유가 붙어 있다."
    },
    "먹가루": {
      note: "책상 주변에 흩어진 먹가루. 문서가 급히 지워졌는지 확인할 수 있다.",
      location: "유문석 사랑방",
      logic: "글씨를 지우거나 문질러 없앤 사람이 있는지 확인하는 단서다.",
      relatedSuspects: ["유문석", "춘월"],
      contradiction: "춘월의 그림 아래 지워진 글귀와 연결하면 감춘 마음이나 이름을 추궁할 수 있다.",
      img: "/samunmong/assets/evidence-transparent/evidence-ink-powder.png",
      tool: "돋보기",
      toolResult: "확대해 보니 가루가 문지른 자국을 따라 고르게 흩어져 있다."
    },
    "혼서 조각": {
      note: "혼례와 관련 있어 보이는 문서 조각.",
      location: "유문석 사랑방",
      logic: "강제 혼인 압박이 사건 동기와 연결되는지 확인하는 단서다.",
      relatedSuspects: ["춘월", "유문석"],
      contradiction: "춘월이 단순한 피해자라고만 말할 때, 혼인을 피할 다른 목적이 있었는지 묻는 근거가 된다.",
      img: "/samunmong/assets/evidence-transparent/evidence-marriage-letter.png",
      tool: "촛불 비추기",
      toolResult: "붉은 인장 아래 흐린 이름 자국이 보인다."
    },
    "낡은 칼": {
      note: "돌쇠 처소에서 확인한 오래된 칼. 직접 증거보다 사용 흔적을 조사해야 한다.",
      location: "돌쇠 처소",
      logic: "돌쇠에게도 의심스러운 물건이 있지만 상처 방식과 맞는지 따져야 한다.",
      relatedSuspects: ["돌쇠"],
      contradiction: "흉기처럼 보이지만 검안 종이와 맞지 않으면 돌쇠를 향한 미끼 단서일 수 있다.",
      img: "/samunmong/assets/evidence-transparent/evidence-axe-knife.png",
      tool: "돋보기",
      toolResult: "날 가장자리에 오래된 얼룩과 새 얼룩이 섞인 듯한 흔적이 보인다."
    },
    "피 묻은 붕대": {
      note: "피로 보이는 얼룩이 남은 붕대. 상처의 흔적과 연결될 수 있다.",
      location: "돌쇠 처소",
      logic: "돌쇠가 다쳤는지, 아니면 다른 사람의 피를 닦았는지 확인해야 한다.",
      relatedSuspects: ["돌쇠"],
      contradiction: "상처를 숨기면 소매 확인이나 현장 몸싸움 흔적과 비교할 수 있다.",
      img: "/samunmong/assets/evidence-transparent/evidence-bloodied-bandage.png",
      tool: "돋보기",
      toolResult: "얼룩 가장자리가 아직 짙고 불규칙하게 번진 흔적이 보인다."
    },
    "도망 보따리": {
      note: "급히 싼 보따리. 누군가 떠날 준비를 했는지 확인해야 한다.",
      location: "돌쇠 처소",
      logic: "점순과 돌쇠가 떠나려 했다는 사실을 밝히고, 그 계획을 누가 알았는지 이어 묻는 단서다.",
      relatedSuspects: ["돌쇠", "무덕", "춘월"],
      contradiction: "도망 계획을 숨긴 돌쇠의 진술은 약속 편지와 무덕의 일기 기록으로 압박할 수 있다.",
      img: "/samunmong/assets/evidence-transparent/evidence-escape-bundle.png",
      tool: "돋보기",
      toolResult: "묶음 틈을 살피자 안쪽에 접힌 종이 조각이 끼어 있다."
    },
    "작은 발자국": {
      note: "뒷문 마당과 현장 주변에 남은 작은 발자국.",
      location: "뒷문 마당",
      logic: "밤에 뒷문을 오간 사람이 남성 짚신이 아니라 여성의 신발을 신었을 가능성을 보여준다.",
      relatedSuspects: ["춘월", "무덕"],
      contradiction: "돌쇠만 뒷문을 오갔다는 추정과 맞지 않는 이동 흔적이다.",
      img: "/samunmong/assets/evidence-transparent/evidence-small-footprints.png",
      tool: "촛불 비추기",
      toolResult: "촛불을 낮게 비추자 발자국의 폭과 앞코 모양이 드러났다. 남성의 짚신이 아니라 여성의 고급 신발 자국으로 보인다."
    },
    "끊어진 호패끈": {
      note: "호패가 연결되어 있었을 법한 끊어진 끈.",
      location: "뒷문 마당",
      logic: "호패가 자연스럽게 떨어진 것이 아니라 이동 중 끊기거나 잘렸는지 확인하는 단서다.",
      relatedSuspects: ["유문석", "춘월"],
      contradiction: "호패 조각과 따로 발견된 끈은 현장 조작 가능성을 키운다.",
      img: "/samunmong/assets/evidence-transparent/evidence-cut-hopae-cord.png",
      tool: "돋보기",
      toolResult: "끊어진 단면이 칼로 잘린 부분과 거칠게 찢긴 부분으로 나뉜다."
    },
    "맞물리는 종이 조각": {
      note: "다른 편지 조각과 맞물릴 수 있는 종이 조각.",
      location: "뒷문 마당",
      logic: "찢어진 문서 조각과 맞추면 점순을 유인한 약속 편지의 원문에 가까워진다.",
      relatedSuspects: ["돌쇠", "춘월"],
      contradiction: "점순이 돌쇠의 쪽지라고 믿었지만 실제 작성자가 따로 있었는지 묻는 근거다.",
      img: "/samunmong/assets/evidence-transparent/evidence-matching-paper-scraps.png",
      tool: "촛불 비추기",
      toolResult: "빛 아래에서 가장자리를 맞춰 보니 찢어진 결이 자연스럽게 이어진다."
    },
    "찢어진 문서 조각": {
      note: "뒷문 마당에서 발견된 찢어진 문서 조각. 다른 종이 조각과 맞춰 확인해야 한다.",
      location: "뒷문 마당",
      logic: "맞물리는 종이 조각과 이어 보면 점순을 유인한 약속 편지가 일부 찢겨 이동했을 가능성이 생긴다.",
      relatedSuspects: ["돌쇠", "춘월", "무덕"],
      contradiction: "뒷문 쪽 문서 조각은 누군가 편지 조각을 들고 이동했거나 숨기려 했다는 정황이 된다.",
      img: "/samunmong/assets/evidence-transparent/evidence-torn-letter-transparent.png",
      tool: "촛불 비추기",
      toolResult: "종이 뒷면에 흐릿한 먹 자국이 보인다."
    },
    "찢어진 약속 편지": {
      note: "점순의 손에서 발견된 찢어진 약속 편지. '오늘 밤 창고에서 기다리시오, 함께 떠납시다'라는 문장이 남아 있다.",
      location: "유문석 집 앞",
      logic: "점순은 이 편지를 돌쇠가 보낸 쪽지라고 믿고 창고로 향했으나, 정중한 말투가 돌쇠의 평소 말투와 맞지 않는다.",
      relatedSuspects: ["돌쇠", "춘월", "무덕"],
      contradiction: "도망 보따리와 맞물리면 돌쇠의 계획을 누군가 이용했을 가능성이 생긴다.",
      img: "/samunmong/assets/evidence-transparent/evidence-torn-letter-transparent.png",
      tool: "촛불 비추기",
      toolResult: "종이 뒷면에 흐릿한 먹 자국이 보인다."
    },
    "긁힌 팔 흔적": {
      note: "심문 중 소매 아래에서 확인한 긁힌 흔적. 실오라기나 몸싸움 흔적과 대조할 수 있다.",
      location: "취조실",
      logic: "점순이 저항하며 남긴 흔적일 수 있어 손톱 밑 실타래와 연결된다.",
      relatedSuspects: ["춘월"],
      contradiction: "춘월이 점순을 가까이 만난 적 없다고 하면 긁힌 팔과 실타래가 직접 반박 근거가 된다.",
      img: "/samunmong/assets/evidence-transparent/evidence-scratched-arm.png",
      tool: "돋보기",
      toolResult: "상처 주변에 작은 섬유 먼지가 붙어 있는 듯하다."
    }
  }
};
