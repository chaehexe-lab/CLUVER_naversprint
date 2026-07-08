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
    "호패 조각": { note: "점순 옆에서 발견된 신분 단서. 일부 글자가 긁혀 있다.", img: "/samunmong/assets/evidence-wooden-tag.png", tool: "돋보기", toolResult: "긁힌 글자 주변에 억지로 문지른 흔적이 보인다." },
    "돌쇠의 그림": { note: "춘월의 방에서 발견된 초상화. 춘월과 돌쇠의 관계를 추적할 단서다.", img: "/samunmong/assets/evidence-portrait.png", tool: "촛불 비추기", toolResult: "그림 뒤쪽에 접힌 종이 자국이 희미하게 보인다." },
    "사라진 노리개": { note: "장식 고리가 느슨해진 노리개. 누가 떨어뜨렸는지 확인해야 한다.", img: "/samunmong/assets/evidence-transparent/evidence-norigae-transparent.png", tool: "돋보기", toolResult: "고리 부분에 급히 잡아당긴 듯한 흠집이 있다." },
    "나무 상자": { note: "사랑방에서 확인한 작은 나무 상자. 안에 무엇이 있었는지 확인해야 한다.", img: "/samunmong/assets/evidence-transparent/evidence-wooden-box-transparent.png", tool: "문서칼", toolResult: "상자 안쪽에 잘게 부서진 종이 가루가 남아 있다." },
    "무덕의 번진 일기": { note: "먹이 번져 읽기 어려운 일기. 숨긴 문장을 추적할 수 있다.", img: "/samunmong/assets/mudeok-interaction/evidence-mudeok-smeared-diary.png", tool: "먹물 테스트 천", toolResult: "최근 젖은 흔적처럼 먹이 번져 있다." },
    "진흙 묻은 짚신": { note: "문밖의 젖은 길과 같은 진흙이 묻은 짚신.", img: "/samunmong/assets/mudeok-interaction/evidence-mudeok-muddy-straw-shoes.png", tool: "먼지털이 붓", toolResult: "짚신 바닥의 흙 결이 현장 발자국과 비슷하다." },
    "찢어진 옷고름": { note: "거칠게 끊어진 옷고름. 급한 몸싸움의 흔적일 수 있다.", img: "/samunmong/assets/mudeok-interaction/evidence-torn-collar-tie.png", tool: "돋보기", toolResult: "천 올이 한 방향으로 잡아당겨져 있다." },
    "손톱 밑 실타래": { note: "작은 실타래 표본. 옷감이나 끈과 대조할 수 있다.", img: "/samunmong/assets/mudeok-interaction/evidence-fingernail-thread-sample.png", tool: "돋보기", toolResult: "찢어진 옷고름의 섬유와 비슷한 꼬임이 보인다." },
    "점순 목 검안 종이": { note: "점순의 목 주변을 살핀 기록지. 직접적인 결론은 없지만 중요한 단서다.", img: "/samunmong/assets/mudeok-interaction/evidence-jeomsun-neck-exam-paper.png", tool: "촛불 비추기", toolResult: "종이 위에 눌린 선이 희미하게 드러난다." },
    "빈 호패 주머니": { note: "호패가 빠진 주머니. 호패 조각과 함께 봐야 한다.", img: "/samunmong/assets/evidence-transparent/evidence-empty-hopae-holder.png", tool: "돋보기", toolResult: "안쪽 가장자리에 끊어진 실의 마찰 흔적이 있다." },
    "하인 장부": { note: "하인들의 출입과 심부름 기록을 적은 장부.", img: "/samunmong/assets/evidence-transparent/evidence-servant-ledger.png", tool: "문서칼", toolResult: "붙어 있던 장부장을 벌리자 빈 줄 하나가 드러난다." },
    "종이칼": { note: "사랑방 책상에 놓인 종이칼. 문서 조각과 절단면을 비교할 수 있다.", img: "/samunmong/assets/evidence-transparent/evidence-paper-knife.png", tool: "돋보기", toolResult: "칼끝에 아주 작은 종이 섬유가 붙어 있다." },
    "먹가루": { note: "책상 주변에 흩어진 먹가루. 문서가 급히 지워졌는지 확인할 수 있다.", img: "/samunmong/assets/evidence-transparent/evidence-ink-powder.png", tool: "먹물 테스트 천", toolResult: "천에 묻은 가루가 물기와 닿자 짙은 먹빛으로 번진다." },
    "혼서 조각": { note: "혼례와 관련 있어 보이는 문서 조각.", img: "/samunmong/assets/evidence-transparent/evidence-marriage-letter.png", tool: "촛불 비추기", toolResult: "붉은 인장 아래 흐린 이름 자국이 보인다." },
    "낡은 칼": { note: "돌쇠 처소에서 확인한 오래된 칼. 직접 증거보다 사용 흔적을 조사해야 한다.", img: "/samunmong/assets/evidence-transparent/evidence-axe-knife.png", tool: "먹물 테스트 천", toolResult: "칼 가장자리에 오래된 얼룩과 새 얼룩이 섞여 있다." },
    "피 묻은 붕대": { note: "피로 보이는 얼룩이 남은 붕대. 상처의 흔적과 연결될 수 있다.", img: "/samunmong/assets/evidence-transparent/evidence-bloodied-bandage.png", tool: "먹물 테스트 천", toolResult: "천을 적시자 얼룩이 아직 짙게 번진다." },
    "도망 보따리": { note: "급히 싼 보따리. 누군가 떠날 준비를 했는지 확인해야 한다.", img: "/samunmong/assets/evidence-transparent/evidence-escape-bundle.png", tool: "문서칼", toolResult: "묶음 안쪽에 접힌 종이 조각이 끼어 있다." },
    "작은 발자국": { note: "뒷문 마당과 현장 주변에 남은 작은 발자국.", img: "/samunmong/assets/evidence-transparent/evidence-small-footprints.png", tool: "촛불 비추기", toolResult: "촛불을 낮게 비추자 발자국의 폭과 앞코 모양이 드러났다. 남성의 짚신이 아니라 여성의 고급 신발 자국으로 보인다." },
    "끊어진 호패끈": { note: "호패가 연결되어 있었을 법한 끊어진 끈.", img: "/samunmong/assets/evidence-transparent/evidence-cut-hopae-cord.png", tool: "돋보기", toolResult: "끊어진 단면이 칼로 잘린 부분과 거칠게 찢긴 부분으로 나뉜다." },
    "맞물리는 종이 조각": { note: "다른 문서 조각과 맞물릴 수 있는 종이 조각.", img: "/samunmong/assets/evidence-transparent/evidence-matching-paper-scraps.png", tool: "문서칼", toolResult: "가장자리를 맞추자 찢어진 결이 이어진다." },
    "찢어진 문서 조각": { note: "찢겨 나간 문서의 일부. 숨긴 말이 남아 있을 수 있다.", img: "/samunmong/assets/evidence-transparent/evidence-torn-letter-transparent.png", tool: "촛불 비추기", toolResult: "종이 뒷면에 흐릿한 먹 자국이 보인다." }
  }
};
