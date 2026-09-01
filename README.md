# 🕵️삼운몽 : 세 개의 꿈

다양한 테마를 배경으로 꿈속에서 사건을 해결하는 추리 게임입니다.

플레이어는 사건 현장에서 증거를 수집하고, 취조실에서 용의자를 심문하여 범인을 추리합니다.

## 🎮 게임 플레이

[삼운몽: 세 개의 꿈 바로가기](https://cluver-naversprint.vercel.app)

- 팀원은 Vercel 대시보드 링크가 아니라 위 공개 게임 링크로 접속하면 됩니다.
- GitHub에 머지된 내용은 Vercel 자동 배포 후 공개 게임 링크에 반영됩니다.
- Vercel 관리자 화면은 권한이 없으면 404처럼 보일 수 있습니다.

### 바로 확인 링크

- [메인 화면](https://cluver-naversprint.vercel.app)
- [우주정거장 의문사 사건 브리핑](https://cluver-naversprint.vercel.app/?start=briefingScreen&theme=spaceStation)

## 프로젝트 목표

- 추리 게임을 통해 **몰입감**과 **성취감**을 제공
- 증거 수집과 심문을 활용한 **추리 경험** 구현
- **Next.js** 기반 웹 게임 개발

## 주요 기능

- 사건 현장 탐색
- 증거 수집
- 용의자 심문
- 수사 노트
- 범인 추리
- 난이도 선택

## 기술 스택

- Next.js
- React
- TypeScript
- GitHub
- GitHub Projects
- GitHub Actions

## 배포 환경 변수

- `GAME_STATE_SECRET`: 진행 기록과 최종 판정을 서명하는 서버 전용 비밀값입니다. Vercel Production, Preview, Development 환경에 같은 값을 등록합니다.
- `OPENAI_API_KEY` 또는 `MISTRAL_API_KEY`: 취조 답변을 생성할 AI 제공자의 서버 전용 키입니다.

`GAME_STATE_SECRET`은 최소 32바이트의 무작위 문자열을 사용하고 클라이언트 환경 변수(`NEXT_PUBLIC_*`)로 노출하지 않습니다. 이 값을 바꾸면 기존 플레이어의 서명된 진행 기록은 초기화됩니다.
AI 제공자 키는 진행 기록 서명에 재사용되지 않습니다. 배포 환경에 `GAME_STATE_SECRET`이 없으면 진행 기록 API가 오류를 반환하도록 분리되어 있습니다.

## 품질 검사

- `pnpm lint`: Next.js와 TypeScript 코드 규칙 검사
- `pnpm typecheck`: TypeScript 타입 검사
- `pnpm test:e2e`: 결과 화면 보호, 증거 수집 확인표, 숨김 패널 브라우저 검사
- `pnpm check`: 위 검사를 순서대로 모두 실행

## 프로젝트 구조

- app/          : 페이지
- components/   : 공통 컴포넌트
- assets/       : 이미지 및 참고 자료
- public/       : 정적 파일
- lib/          : 게임 데이터

## 팀원
| 이름 | 역할 |
|------|------|
| 천시영 | MC |
| 강성주 | API 대장 |
| 이채희 | UI/UX 대장 |
| 노경섭 | 개발 대장 |
| 이지혜 | PM |
