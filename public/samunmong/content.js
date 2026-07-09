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
      note: "점순 옆에서 발견된 신분 단서. 유문석의 물건처럼 보이지만 일부 글자가 긁혀 있다.",
      location: "유문석 집 앞",
      logic: "현장에 놓인 호패가 정말 유문석이 떨어뜨린 것인지, 누군가 유문석에게 누명을 씌우려고 가져다 둔 것인지 확인해야 한다.",
      relatedSuspects: ["유문석", "춘월"],
      contradiction: "유문석의 물건처럼 보이지만 긁힌 흔적과 끊어진 끈이 있으면 누군가가 가져가 꾸민 증거일 수 있다.",
      img: "/samunmong/assets/evidence-wooden-tag.png",
      tool: "먼지털이 붓",
      toolResult: "먼지털이 붓으로 털자 긁힌 글자 홈 사이에 고운 분가루가 남아 있다.\n거칠게 굴러다닌 물건이라기보다, 누군가 손에 쥐고 옮긴 뒤 일부러 현장에 둔 듯하다."
    },
    "돌쇠의 그림": {
      note: "춘월의 방에서 발견된 초상화. 단순한 호감보다 오래 숨겨 온 마음과 집착을 보여 주는 단서다.",
      location: "춘월의 방",
      logic: "춘월이 돌쇠를 마음에 두고 있었다면, 점순과 돌쇠가 함께 떠난다는 사실은 춘월에게 사랑을 빼앗기는 일처럼 느껴졌을 수 있다.",
      relatedSuspects: ["춘월", "돌쇠"],
      contradiction: "춘월이 돌쇠에게 관심이 없다고 말하면, 여러 번 고쳐 그린 초상과 숨겨 둔 보관 방식이 맞지 않는다.",
      img: "/samunmong/assets/evidence-portrait-v2.png",
      tool: "돋보기",
      toolResult: "돋보기로 보니 돌쇠의 눈매와 옷깃이 여러 번 고쳐져 있다.\n그림 가장자리에는 지운 글씨 자국이 남아 있고, ‘떠나지 마라’로 보이는 획이 희미하다.\n우연한 초상이라기보다 오래 눌러 둔 마음에 가깝다."
    },
    "헐거워진 노리개": {
      note: "장식 고리가 느슨해진 노리개. 누가 급히 잡아챘거나 떨어뜨렸는지 확인해야 한다.",
      location: "춘월의 방",
      logic: "장신구가 손상된 시점은 누군가 급히 움직였거나 몸싸움을 겪었는지 따질 근거가 된다.",
      relatedSuspects: ["춘월"],
      contradiction: "춘월이 방을 떠난 적 없다고 말하면 장신구가 헐거워진 경위를 다시 물을 수 있다.",
      img: "/samunmong/assets/evidence-transparent/evidence-norigae-transparent.png"
    },
    "무덕의 번진 일기": {
      note: "먹이 번져 읽기 어려운 일기. 숨긴 문장을 추적할 수 있다.",
      location: "무덕의 하인방",
      logic: "날짜별 기록을 보면 점순과 돌쇠의 도망 계획이 무덕을 거쳐 춘월에게 닿았고, 춘월의 감정이 그 계획과 충돌했음을 확인할 수 있다.",
      relatedSuspects: ["무덕", "유문석", "춘월", "돌쇠"],
      contradiction: "무덕의 기록은 각 용의자의 진술을 날짜별로 대조하게 만드는 기준점이다.",
      entries: [
        { date: "6/29", text: "점순이가 크게 혼나는 소리가 들렸다. 사랑방 쪽에서 난 소리였고, 문이 닫혀 있어 누구 목소리인지는 똑똑히 듣지 못했다. 한참 뒤 점순이가 눈가를 훔치며 마당을 지나갔다." },
        { date: "6/30", text: "밤늦게 점순이를 보러 누군가 온 것 같다. 뒷문이 잠깐 열리는 소리가 났고, 점순이는 한동안 돌아오지 않았다. 다음 날 아침 마당 끝에는 흙 묻은 발자국이 희미하게 남아 있었다." },
        { date: "7/1", text: "아침에 춘월 아씨께 점순 누이가 밤에 누군가를 만난 듯하다고 말해 버렸다. 아씨는 한참 말이 없더니 돌쇠 이름을 되물었다. 그 뒤 길에서 아씨가 돌쇠 얼굴을 그리고 있는 것을 보았다. 그림 아래에는 미처 다 지우지 못한 ‘떠나지 마라’ 같은 글귀가 남아 있었다." }
      ],
      img: "/samunmong/assets/mudeok-interaction/evidence-mudeok-smeared-diary.png",
      tool: "촛불 비추기",
      toolResult: "촛불을 비추자 번진 먹 아래 기록이 또렷해진다."
    },
    "진흙 묻은 짚신": {
      note: "문밖의 젖은 길과 같은 진흙이 묻은 짚신.",
      location: "무덕의 하인방",
      logic: "6월 30일 밤의 발자국과 비교하면 점순을 만나러 온 사람이 어느 길로 움직였는지 따질 수 있다.",
      relatedSuspects: ["무덕", "돌쇠"],
      contradiction: "짚신의 흙과 뒷문 발자국이 맞으면 밤 이동 진술을 흔들 수 있다.",
      img: "/samunmong/assets/mudeok-interaction/evidence-mudeok-muddy-straw-shoes.png"
    },
    "찢어진 옷고름": {
      note: "무덕의 방에서 발견된 찢어진 옷고름. 하인 옷감보다 고급스럽고, 목을 조를 때 쓰였을 가능성이 있다.",
      location: "무덕의 하인방",
      logic: "무덕의 집 근처에 버린 옷고름을 무덕이 주워 방에 둔 정황으로 볼 수 있다.",
      relatedSuspects: ["춘월", "무덕"],
      contradiction: "무덕의 물건처럼 보이지만 재질과 향이 하인 옷보다 양반가 여인의 옷고름에 가깝다면, 무덕이 범인이라는 추정이 흔들린다.",
      img: "/samunmong/assets/mudeok-interaction/evidence-torn-collar-tie.png"
    },
    "빈 호패 주머니": {
      note: "호패가 빠진 주머니. 호패 조각과 함께 봐야 한다.",
      location: "유문석 사랑방",
      logic: "유문석의 호패가 현장에 놓이기 전에 방에서 빠져나갔는지 확인할 수 있다.",
      relatedSuspects: ["유문석", "춘월", "무덕"],
      contradiction: "호패 조각과 끊어진 호패끈을 함께 보면 유문석이 직접 떨어뜨린 것인지 의심할 수 있다.",
      img: "/samunmong/assets/evidence-transparent/evidence-empty-hopae-holder.png"
    },
    "하인 장부": {
      note: "하인들의 출입과 심부름 기록을 적은 장부.",
      location: "유문석 사랑방",
      logic: "누가 어느 방에 들어갈 수 있었는지 확인해 호패와 문서 이동 가능성을 좁힌다.",
      relatedSuspects: ["무덕", "유문석", "춘월"],
      contradiction: "출입 기록이 비어 있거나 지워졌다면 누군가 동선을 숨긴 정황이 된다.",
      img: "/samunmong/assets/evidence-transparent/evidence-servant-ledger.png"
    },
    "혼서 조각": {
      note: "춘월의 혼인을 재촉하는 문서 조각. 집안이 춘월의 뜻보다 혼인을 앞세웠음을 보여 준다.",
      location: "유문석 사랑방",
      logic: "원치 않는 혼인 압박 속에서 춘월은 자기 삶을 통제하지 못했다. 그래서 돌쇠와 점순의 선택까지 붙잡으려 했는지 따져볼 수 있다.",
      relatedSuspects: ["춘월", "유문석"],
      contradiction: "춘월이 자신은 그저 혼인을 원치 않았을 뿐이라고 말하면, 돌쇠 초상화와 도망 계획을 함께 제시해 감정의 방향을 물을 수 있다.",
      img: "/samunmong/assets/evidence-transparent/evidence-marriage-letter.png"
    },
    "피 묻은 붕대": {
      note: "피로 보이는 얼룩이 남은 붕대. 상처의 흔적과 연결될 수 있다.",
      location: "돌쇠 처소",
      logic: "돌쇠가 다쳤는지, 아니면 다른 사람의 피를 닦았는지 확인해야 한다.",
      relatedSuspects: ["돌쇠"],
      contradiction: "상처를 숨기면 소매 확인이나 현장 몸싸움 흔적과 비교할 수 있다.",
      img: "/samunmong/assets/evidence-transparent/evidence-bloodied-bandage.png"
    },
    "도망 보따리": {
      note: "급히 싼 보따리. 누군가 떠날 준비를 했는지 확인해야 한다.",
      location: "돌쇠 처소",
      logic: "점순과 돌쇠가 떠나려 했다는 사실을 밝히고, 그 계획이 춘월에게 알려진 순간 동기가 생겼는지 이어 묻는 단서다.",
      relatedSuspects: ["돌쇠", "무덕", "춘월"],
      contradiction: "도망 계획을 숨긴 돌쇠의 진술은 약속 편지와 무덕의 일기 기록으로 압박할 수 있다.",
      img: "/samunmong/assets/evidence-transparent/evidence-escape-bundle.png"
    },
    "작은 발자국": {
      note: "뒷문 마당과 현장 주변에 남은 작은 발자국.",
      location: "뒷문 마당",
      logic: "밤에 뒷문을 오간 사람이 남성 짚신이 아니라 여성의 신발을 신었을 가능성을 보여준다.",
      relatedSuspects: ["춘월", "무덕"],
      contradiction: "돌쇠만 뒷문을 오갔다는 추정과 맞지 않는 이동 흔적이다.",
      img: "/samunmong/assets/evidence-transparent/evidence-small-footprints.png"
    },
    "끊어진 호패끈": {
      note: "호패가 연결되어 있었을 법한 끊어진 끈.",
      location: "뒷문 마당",
      logic: "호패가 자연스럽게 떨어진 것이 아니라 이동 중 끊기거나 잘렸는지 확인하는 단서다.",
      relatedSuspects: ["유문석", "춘월"],
      contradiction: "호패 조각과 따로 발견된 끈은 현장 조작 가능성을 키운다.",
      img: "/samunmong/assets/evidence-transparent/evidence-cut-hopae-cord.png"
    },
    "찢어진 약속 편지": {
      note: "점순의 손에서 발견된 찢어진 약속 편지. '오늘 밤 창고에서 기다리시오, 함께 떠납시다'라는 정중한 문장이 남아 있다.",
      location: "유문석 집 앞",
      logic: "점순은 돌쇠가 보낸 쪽지라고 믿고 창고로 향했지만, 말투가 돌쇠답지 않다. 누군가 돌쇠를 흉내 내 점순을 유인했을 가능성이 크다.",
      relatedSuspects: ["돌쇠", "춘월", "무덕"],
      contradiction: "도망 보따리와 맞물리면 돌쇠의 계획을 누군가 이용했을 가능성이 생긴다.",
      img: "/samunmong/assets/evidence-transparent/evidence-torn-letter-transparent.png"
    },
    "긁힌 팔 흔적": {
      note: "심문 중 소매 아래에서 확인한 긁힌 흔적. 점순이 마지막 순간 저항하며 남긴 상처일 수 있다.",
      location: "취조실",
      logic: "춘월이 점순과 가까이 있지 않았다고 주장한다면, 팔의 긁힌 흔적은 직접 접촉을 의심하게 만드는 단서가 된다.",
      relatedSuspects: ["춘월"],
      contradiction: "춘월이 점순을 가까이 만난 적 없다고 하면, 긁힌 팔 흔적과 찢어진 옷고름이 진술을 흔든다.",
      img: "/samunmong/assets/evidence-transparent/evidence-scratched-arm.png"
    }
  }
};
