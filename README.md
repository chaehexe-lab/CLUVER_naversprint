# 삼운몽 Next.js 변환본
https://psychic-adventure-v6z2rm5.pages.github.io/

원본 HTML 프로토타입 화면을 최대한 유지하면서 Next.js App Router 구조로 옮긴 프로젝트입니다.

## 폴더 기준

- `app/`: 화면별 Next.js 라우트입니다.
- `components/front/`: 메인, 튜토리얼, 꿈 선택, 배경 설명 화면입니다.
- `components/scenes/`: 사건 현장과 취조실 화면입니다.
- `components/result/`: 결과 화면입니다.
- `lib/gameData.ts`: 배경, 증거, 핫스팟, 이동 버튼 등 수정용 데이터입니다.
- `lib/gameState.ts`: 화면 전환과 라우트별 시작 화면 기준입니다.
- `lib/gameTypes.ts`: 게임 데이터 타입입니다.
- `public/samunmong/assets/`: 게임 이미지, 증거 이미지, 폰트 파일입니다.
- `public/samunmong/content.js`, `public/samunmong/prototype.js`: 원본 프로토타입의 클릭/전환 동작을 보존하기 위한 스크립트입니다.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`으로 확인합니다.

## 수정 위치

증거 물품, 배경, 핫스팟 위치를 바꿀 때는 먼저 `lib/gameData.ts`를 수정합니다. 실제 이미지 파일은 `public/samunmong/assets/` 아래에 둡니다.
