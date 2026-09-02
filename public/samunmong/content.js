window.SAMUNMONG_CONTENT = {
  screenImages: {
    mainScreen: "/samunmong/assets/main-screen-v2.webp",
    tutorialScreen: "/samunmong/assets/main-screen-v2.webp",
    dreamScreen: "/samunmong/assets/main-screen-v2.webp",
    fieldOne: "/samunmong/assets/scenes-integrated/scene-field-one-clean-v3.webp",
    chunwolRoom: "/samunmong/assets/scenes-integrated/scene-chunwol-room-separate-chest-v2.webp",
    mudeokServantRoom: "/samunmong/assets/scenes-integrated/scene-mudeok-servant-room-clean-v3.webp",
    yoomunseokSarangbang: "/samunmong/assets/scenes-integrated/scene-yoomunseok-sarangbang-clean-v3.webp",
    dolsoeQuarters: "/samunmong/assets/scenes-integrated/scene-dolsoe-quarters-clean-v3.webp",
    backGateCourtyard: "/samunmong/assets/scenes-integrated/scene-back-gate-courtyard-clean-v3.webp",
    interrogationScreen: "/samunmong/assets/scene-interrogation-dolsoe.webp?v=scene-20260707"
  },

  suspects: [
    { name: "돌쇠", id: "dolsoe", scene: "/samunmong/assets/scene-interrogation-dolsoe.webp?v=scene-20260707", sleeveScene: "/samunmong/assets/scene-interrogation-dolsoe-sleeve.webp?v=sleeve-20260707" },
    { name: "춘월", id: "chunwol", scene: "/samunmong/assets/scene-interrogation-chunwol.webp?v=scene-20260707", sleeveScene: "/samunmong/assets/scene-interrogation-chunwol-sleeve.webp?v=sleeve-20260707" },
    { name: "유문석", id: "yoomunseok", scene: "/samunmong/assets/scene-interrogation-yoomunseok.webp?v=scene-20260707", sleeveScene: "/samunmong/assets/scene-interrogation-yoomunseok-sleeve.webp?v=sleeve-20260707" },
    { name: "무덕", id: "mudeok", scene: "/samunmong/assets/scene-interrogation-mudeok.webp?v=scene-20260707", sleeveScene: "/samunmong/assets/scene-interrogation-mudeok-sleeve.webp?v=sleeve-20260707" }
  ],

  evidenceData: {
    "점순의 목 압박 흔적": {
      note: "초기 검안에서 확인된 좁고 희미한 끈 자국.",
      location: "초기 검안",
      logic: "목을 누른 물건의 폭과 재질을 다른 물증과 대조할 기준이다.",
      relatedSuspects: [],
      contradiction: "압박 흔적과 일치하는 물건이 확인되기 전에는 범행 도구를 단정할 수 없다.",
      img: "/samunmong/assets/mudeok-interaction/evidence-jeomsun-neck-exam-paper.webp"
    },
    "점순의 손톱 밑 흔적": {
      note: "초기 검안에서 점순의 손톱 밑에 남은 피부 조직으로 보이는 미세 흔적.",
      location: "초기 검안",
      logic: "마지막 몸싸움에서 상대를 긁었을 가능성을 보여 주는 기준이다. 용의자의 얕은 긁힘과 함께 살펴 접촉 가능성을 확인한다.",
      relatedSuspects: [],
      contradiction: "비슷한 긁힘이 있어도 같은 접촉이라고 확정할 수는 없으며 상처가 생긴 시점을 진술로 확인해야 한다.",
      img: "/samunmong/assets/mudeok-interaction/evidence-jeomsun-hand-exam-paper.webp"
    },
    "호패 조각": {
      note: "점순 옆에서 발견된 신분 단서. 유문석의 물건처럼 보이지만 일부 글자가 긁혀 있다.",
      location: "유문석 집 앞",
      logic: "현장에 놓인 호패가 정말 유문석이 떨어뜨린 것인지, 누군가 유문석에게 누명을 씌우려고 가져다 둔 것인지 확인해야 한다.",
      relatedSuspects: ["유문석", "춘월"],
      contradiction: "유문석의 물건처럼 보이지만 긁힌 흔적과 끊어진 끈이 있으면 누군가가 가져가 꾸민 증거일 수 있다.",
      img: "/samunmong/assets/evidence-transparent/evidence-wooden-tag-transparent.webp",
      reverseImg: "/samunmong/assets/interactions/evidence-reverse/hopae-fragment-back-v2.png",
      tool: "먼지털이 붓",
      toolResult: "이름 홈의 먼지를 털자 오래된 새김 위로 더 얕고 거친 새 긁힘이 드러난다.",
      toolResultAsset: "/samunmong/assets/interactions/evidence-tools/secondary/result-hopae-rubbing.png",
      followUpTools: [{
        tool: "증거 연결판",
        requiresEvidence: ["빈 호패 주머니", "끊어진 호패끈"],
        result: "호패는 끊어진 끈과 맞고, 목제함의 빈 홈에도 정확히 들어간다. 유문석이 현장에서 흘렸다기보다 누군가 함에서 꺼내 옮긴 것일까?",
        asset: "/samunmong/assets/evidence-transparent/evidence-cut-hopae-cord-v2.png"
      }]
    },
    "돌쇠의 그림": {
      note: "춘월의 방에서 발견된 붉은 끈으로 단단히 묶인 두루마리. 펼치기 전에는 안의 그림을 알 수 없다.",
      location: "춘월의 방",
      logic: "펼치면 돌쇠의 얼굴을 여러 번 고친 초상과 지우다 남은 ‘떠나지 마라’가 드러난다. 누군가 돌쇠가 떠나는 일을 원치 않았다는 의문을 만들지만, 그림만으로 그린 사람은 확정하지 않는다.",
      relatedSuspects: ["춘월", "돌쇠"],
      contradiction: "춘월이 그림의 존재나 돌쇠에게 관심이 없었다고 말하면, 왜 자기 방에 이 초상이 숨겨져 있었는지 물을 수 있다.",
      img: "/samunmong/assets/evidence-transparent/evidence-portrait-concealed-v1.png",
      toolResultAsset: "/samunmong/assets/interactions/portrait-stroke-puzzle/state-2.png?v=portrait-reveal-v5",
      tool: "돋보기",
      toolResult: "두루마리를 펼치자 돌쇠의 얼굴이 드러난다. 눈매와 옷깃은 여러 번 고쳐졌고, 가장자리에는 지우다 남은 ‘떠나지 마라’가 보인다. 누가 그렸고 왜 이 방에 숨겼을까?"
    },
    "무덕의 번진 일기": {
      note: "먹이 번져 붙은 세 날짜의 일기. 무덕이 들은 소리와 다른 사람에게 말한 순서가 기록돼 있다.",
      location: "무덕의 하인방",
      logic: "6월 29일 꾸중, 6월 30일 뒷문 기척, 7월 1일 소문 전달 순서를 읽어 도망 계획을 누가 알게 됐는지 심문한다.",
      relatedSuspects: ["무덕", "유문석", "춘월", "돌쇠"],
      contradiction: "무덕의 기록은 각 용의자의 진술을 날짜별로 대조하게 만드는 기준점이다.",
      entries: [
        { date: "6/29", text: "점순이가 크게 혼나는 소리가 들렸다. 사랑방 쪽에서 난 소리였고, 문이 닫혀 있어 누구 목소리인지는 똑똑히 듣지 못했다. 한참 뒤 점순이가 눈가를 훔치며 마당을 지나갔다." },
        { date: "6/30", text: "밤늦게 점순이를 보러 누군가 온 것 같다. 뒷문이 잠깐 열리는 소리가 났고, 점순이는 한동안 돌아오지 않았다. 다음 날 아침 마당 끝에는 흙 묻은 발자국이 희미하게 남아 있었다." },
        { date: "7/1", text: "아침에 안채에 점순 누이가 밤에 누군가를 만난 듯하다고 말해 버렸다. 잠시 뒤 안쪽에서 돌쇠 이름을 되묻는 소리를 들었지만, 누가 물었는지는 보지 못했다." }
      ],
      img: "/samunmong/assets/mudeok-interaction/evidence-mudeok-smeared-diary.webp",
      reverseImg: "/samunmong/assets/interactions/evidence-reverse/diary-back-page-v2.png",
      tool: "촛불 비추기",
      toolResult: "무덕은 점순의 밤 외출을 다음 날 안채에 말했고, 그 뒤 안쪽에서 누군가 돌쇠 이름을 되묻는 소리를 들었다. 무덕은 얼굴을 보지 못했다. 누가 도망 계획을 알게 된 것일까?",
      toolResultAsset: "/samunmong/assets/interactions/diary-timeline-puzzle/state-2.png"
    },
    "진흙 묻은 짚신": {
      note: "무덕의 방에 놓인 진흙 묻은 짚신. 뒷문 발자국보다 커 보이지만 직접 포개 봐야 한다.",
      location: "무덕의 하인방",
      logic: "수집한 짚신을 작은 발자국 위에 직접 포개 길이와 폭이 맞는지 확인한다.",
      relatedSuspects: ["무덕"],
      contradiction: "짚신이 발자국보다 길고 넓다면 무덕이 그 작은 자국을 남겼다는 의심은 약해진다.",
      img: "/samunmong/assets/evidence-transparent/evidence-muddy-straw-shoes-clean-v2.png",
      tool: "발자국 실측줄",
      toolResult: "짚신을 발자국에 포개자 앞코와 양옆이 자국 밖으로 나온다. 무덕의 짚신이 남긴 자국은 아닌 것 같다.",
      toolResultAsset: "/samunmong/assets/interactions/evidence-tools/crosscheck/result-shoes-footprints-size-v1.png"
    },
    "찢어진 옷고름": {
      note: "뒷문 나무 가시에 걸린 자주빛 비단 옷고름. 가운데가 좁게 눌렸고 한쪽 끝이 거칠게 찢어져 있다.",
      location: "뒷문 마당",
      logic: "검안서의 목 자국 위에 실제 옷고름을 포개 폭과 눌린 방향이 닮았는지 확인한다.",
      relatedSuspects: ["춘월"],
      contradiction: "목 자국과 폭이 닮아도 이것만으로 주인이나 범행 도구를 확정할 수는 없다. 뜯긴 저고리와 진술을 더 대조해야 한다.",
      img: "/samunmong/assets/evidence-transparent/evidence-torn-wine-goreum-v1.png",
      tool: "돋보기",
      toolResult: "검안서에 포개자 중앙의 좁게 눌린 폭과 목 자국의 폭이 닮아 있다. 같은 끈인지 확인하려면 이 옷고름이 떨어져 나온 저고리를 찾아야 한다.",
      toolResultAsset: "/samunmong/assets/interactions/evidence-tools/crosscheck/result-wine-goreum-neck-width-v1.png"
    },
    "고름이 뜯긴 저고리": {
      note: "춘월의 방에서 자물쇠로 잠긴 의복 궤 안에 접어 숨긴 자주빛 저고리. 오른쪽 고름 한 짝이 뜯겨 나가 실밥이 드러나 있다.",
      location: "춘월의 방",
      logic: "뒷문에서 주운 자주빛 옷고름의 찢긴 끝을 저고리의 빈 고름 자리에 직접 대조한다.",
      relatedSuspects: ["춘월"],
      contradiction: "색과 직조, 폭과 끊어진 실밥은 이어지지만 누가 언제 뜯었는지는 착용자의 진술로 확인해야 한다.",
      img: "/samunmong/assets/evidence-transparent/evidence-chunwol-jeogori-torn-goreum-v1.png"
    },
    "빈 호패 주머니": {
      note: "세 칸 가운데 호패 자리만 비어 있는 목제 보관함.",
      location: "유문석 사랑방",
      logic: "현장의 호패를 가운데 빈 홈에 직접 넣어 원래 이 함에 보관됐던 물건인지 확인한다.",
      relatedSuspects: ["유문석", "춘월", "무덕"],
      contradiction: "호패 조각과 끊어진 호패끈을 함께 보면 유문석이 직접 떨어뜨린 것인지 의심할 수 있다.",
      img: "/samunmong/assets/evidence-transparent/evidence-empty-hopae-case-v2.png",
      tool: "돋보기",
      toolResult: "현장의 호패를 가운데 빈 홈에 넣자 크기와 윗부분의 둥근 모양이 정확히 맞는다.",
      toolResultAsset: "/samunmong/assets/evidence-transparent/evidence-empty-hopae-case-v2.png"
    },
    "하인 장부": {
      note: "평범한 심부름 사이 한 사람의 이름만 먹으로 덮인 출입 장부.",
      location: "유문석 사랑방",
      logic: "범인을 단정하는 장부가 아니다. 누가 어느 방에 들어갈 기회가 있었는지 확인하고 각자의 진술과 대조할 질문을 만든다.",
      relatedSuspects: ["무덕", "유문석", "춘월"],
      contradiction: "춘월은 호패함이 있던 사랑방에 들어갈 기회가 있었지만, 지워진 마지막 행의 인물과 호패를 옮긴 사람은 장부만으로 알 수 없다.",
      img: "/samunmong/assets/evidence-transparent/evidence-servant-ledger.webp",
      reverseImg: "/samunmong/assets/interactions/evidence-reverse/servant-ledger-back-page-v2.png",
      tool: "촛불 비추기",
      toolResult: "등잔빛 아래 정상적인 심부름 다섯 줄과, 이름만 나중에 덮은 마지막 출입 한 줄이 함께 드러난다.",
      toolResultAsset: "/samunmong/assets/interactions/ledger-rubbing-puzzle/state-4-v1.png"
    },
    "혼서 조각": {
      note: "‘두 집안의 혼인을 정히 약조하오’라는 글과 큰 붉은 인장이 나뉘어 남은 혼서 조각.",
      location: "유문석 사랑방",
      logic: "두 집안 사이에 춘월의 혼인이 추진됐다는 사실까지만 보여 준다. 춘월이 이를 원했는지, 언제 알았는지, 돌쇠와의 관계에 어떤 영향을 주었는지는 진술로 확인해야 한다.",
      relatedSuspects: ["춘월", "유문석"],
      contradiction: "유문석에게는 혼인을 정한 때와 춘월의 뜻을 물을 수 있고, 춘월에게는 혼서를 언제 알았으며 돌쇠의 초상과 어떤 관계인지 물을 수 있다.",
      img: "/samunmong/assets/evidence-transparent/evidence-marriage-letter.webp",
      tool: "문서 맞춤판",
      toolResult: "글줄과 붉은 인장을 맞추자 ‘두 집안의 혼인을 정히 약조하오’가 이어진다. 혼인은 추진됐지만 춘월의 뜻은 적혀 있지 않다. 춘월은 이 약조를 원했던 것일까?",
      toolResultAsset: "/samunmong/assets/interactions/document-puzzle/board-complete-honseo-v2.png"
    },
    "피 묻은 붕대": {
      note: "돌쇠의 처소에서 발견한 매듭진 모시 붕대. 작은 마른 핏자국이 누구의 상처에서 묻었는지는 알 수 없다.",
      location: "돌쇠 처소",
      logic: "돌쇠의 팔을 확인한 뒤 실제 붕대를 팔 위에 직접 놓아 감긴 자리와 핏자국 위치를 대조한다.",
      relatedSuspects: ["돌쇠"],
      contradiction: "상처를 숨기면 소매 확인이나 현장 몸싸움 흔적과 비교할 수 있다.",
      img: "/samunmong/assets/evidence-transparent/evidence-bloodied-bandage.webp",
      tool: "상처 대조첩",
      toolResult: "붕대를 팔 위에 놓자 감긴 자리와 핏자국의 중심이 한 줄 베인 상처에 맞는다. 점순의 저항으로 생길 여러 갈래 긁힘과는 다르다.",
      toolResultAsset: "/samunmong/assets/interactions/evidence-tools/crosscheck/result-bandage-dolsoe-arm-v1.png",
      followUpTools: [{
        tool: "상처 대조첩",
        requiresEvidence: ["돌쇠의 팔 상처"],
        result: "실제 붕대를 돌쇠의 팔에 대자 감긴 자리와 핏자국 중심이 한 줄 베인 상처에 맞는다. 붕대는 이 상처를 감쌌던 듯하지만, 상처가 생긴 시점은 아직 확인해야 한다.",
        asset: "/samunmong/assets/interactions/evidence-tools/crosscheck/result-bandage-dolsoe-arm-v1.png"
      }]
    },
    "돌쇠의 팔 상처": {
      note: "심문 중 돌쇠의 소매 아래에서 확인한 베인 상처. 붕대를 감았던 흔적과 함께 봐야 한다.",
      location: "취조실",
      logic: "돌쇠가 언제 어디서 다쳤는지 확인하면, 점순과 헤어진 뒤의 행적을 더 따져볼 수 있다.",
      relatedSuspects: ["돌쇠"],
      contradiction: "돌쇠가 다친 시점을 흐리면 피 묻은 붕대와 밤 이동 진술을 함께 압박할 수 있다.",
      img: "/samunmong/assets/evidence-transparent/evidence-dolsoe-work-cut-v3.png"
    },
    "도망 보따리": {
      note: "돌쇠의 처소에서 발견된 베이지색 보따리. 짚바구니와 크기가 다른 옷가지가 틈 사이로 보인다.",
      location: "돌쇠 처소",
      logic: "갈색 매듭끈을 풀어 안의 옷·식량 수량을 직접 확인하고 한 사람 짐인지 두 사람 짐인지 판단한다.",
      relatedSuspects: ["돌쇠", "무덕", "춘월"],
      contradiction: "도망 계획을 숨긴 돌쇠의 진술은 약속 편지와 무덕의 일기 기록으로 압박할 수 있다.",
      img: "/samunmong/assets/evidence-transparent/evidence-escape-bundle.webp",
      tool: "먼지털이 붓",
      toolResult: "크기가 다른 옷 두 벌과 두 끼분 식량, 함께 쓸 노잣돈과 빗이 나온다. 돌쇠 혼자 떠날 짐은 아닌 것 같다.",
      toolResultAsset: "/samunmong/assets/interactions/bundle-canonical-puzzle/state-2.png"
    },
    "작은 발자국": {
      note: "뒷문 마당에 자연스럽게 이어진 짧고 좁은 신발 자국.",
      location: "뒷문 마당",
      logic: "짧고 좁은 신발 자국이다. 진흙 묻은 짚신과 크기를 대조하기 전에는 주인을 단정할 수 없다.",
      relatedSuspects: ["춘월", "무덕"],
      contradiction: "돌쇠만 뒷문을 오갔다는 추정과 맞지 않는 이동 흔적이다.",
      img: "/samunmong/assets/evidence-transparent/evidence-small-footprints-v2.png",
      tool: "발자국 실측줄",
      toolResult: "짚신을 포개자 발자국이 훨씬 짧고 좁다. 이 자국의 주인은 다른 사람일까?",
      toolResultAsset: "/samunmong/assets/evidence-transparent/evidence-small-footprints-v2.png"
    },
    "끊어진 호패끈": {
      note: "뒷문 마당에서 발견된 짙은 붉은 꼰끈. 한쪽에는 매듭과 술이 남고, 반대쪽 끝은 거칠게 끊겨 있다.",
      location: "뒷문 마당",
      logic: "실제 끊어진 끝을 현장 호패의 구멍에 직접 대어 굵기와 오래된 마찰 홈이 맞는지 확인한다.",
      relatedSuspects: ["유문석", "춘월"],
      contradiction: "호패와 끈이 맞고 호패가 사랑방의 빈 함에도 맞으면, 유문석이 현장에서 자연히 흘렸다는 추정이 흔들린다.",
      img: "/samunmong/assets/evidence-transparent/evidence-cut-hopae-cord-v2.png"
    },
    "찢어진 약속 편지": {
      note: "점순의 손에서 발견된 찢어진 약속 편지. '오늘 밤 창고에서 기다리시오, 함께 떠납시다'라는 정중한 문장이 남아 있으나 글쓴이는 아직 알 수 없다.",
      location: "유문석 집 앞",
      logic: "점순은 돌쇠가 보낸 쪽지라고 믿고 창고로 향했다. 돌쇠에게 직접 제시해 약속 장소와 평소 말투를 대조해야 하며, 그의 부정도 우선은 진술로 기록한다.",
      relatedSuspects: ["돌쇠", "춘월", "무덕"],
      contradiction: "편지는 창고와 정중한 말투를 쓰지만 돌쇠는 뒷문 약속과 투박한 말을 주장한다. 차이가 확인되면 누군가 실제 도망 계획을 이용해 점순을 다른 곳으로 불렀을 가능성이 생긴다.",
      img: "/samunmong/assets/evidence-transparent/evidence-torn-letter-master-v6.png",
      reverseImg: "/samunmong/assets/interactions/evidence-reverse/torn-promise-letter-back-v2.png",
      tool: "문서 맞춤판",
      toolResult: "찢긴 가장자리를 맞추자 ‘오늘 밤 창고에서 기다리시오, 함께 떠납시다’라는 문장이 온전히 이어진다.",
      toolResultAsset: "/samunmong/assets/interactions/evidence-tools/expanded/result-document-reconstruction.png",
      followUpTools: [{
        tool: "먹빛 시험석",
        result: "편지 전체의 먹빛과 필압은 한 번에 이어진 듯하다. 나중에 고친 흔적은 없지만, 누가 썼는지는 아직 알 수 없다.",
        asset: "/samunmong/assets/interactions/evidence-tools/secondary/result-ink-diffusion.png"
      }]
    },
    "긁힌 팔 흔적": {
      note: "심문 중 소매 아래에서 확인한 긁힌 흔적. 점순이 마지막 순간 저항하며 남긴 상처일 수 있다.",
      location: "취조실",
      logic: "점순의 손톱 검안 기록과 팔의 얕은 긁힘을 함께 놓아 직접 접촉 가능성을 살핀다. 상처가 생긴 시점은 진술로 확인해야 한다.",
      relatedSuspects: ["춘월"],
      contradiction: "춘월이 점순을 가까이 만난 적 없다고 하면, 긁힌 팔 흔적과 찢어진 옷고름이 진술을 흔든다.",
      img: "/samunmong/assets/evidence-transparent/evidence-scratched-arm.webp"
    }
  }
};
