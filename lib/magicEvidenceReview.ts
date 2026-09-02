import type { SceneHotspot } from "./gameTypes";

export type MagicEvidenceReviewId = `M${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`;

export type MagicEvidenceBounds = Pick<
  SceneHotspot,
  "x" | "y" | "w" | "h" | "clipPath" | "radius" | "rot"
>;

export type MagicEvidenceReviewItem = {
  id: MagicEvidenceReviewId;
  sceneId: string;
  sceneLabel: string;
  evidenceName: string;
  category: "도구" | "경보" | "기록" | "잔해" | "문서";
  cutout: string;
  visible: MagicEvidenceBounds;
  reviewNote: string;
};

export const magicEvidenceReviewItems: readonly MagicEvidenceReviewItem[] = [
  {
    id: "M1",
    sceneId: "magicAlchemyLab",
    sceneLabel: "제1 연금술 실습실",
    evidenceName: "부러진 지팡이",
    category: "도구",
    cutout: "/samunmong/assets/magic-school/evidence-cutouts/broken-wand.webp",
    visible: {
      x: "60.1%",
      y: "81.7%",
      w: "16.9%",
      h: "7.1%",
      clipPath: "ellipse(49% 42% at 50% 50%)",
      radius: "999px",
      rot: "19.9deg"
    },
    reviewNote: "바닥에 나란히 놓인 두 개의 긴 지팡이 조각 전체"
  },
  {
    id: "M2",
    sceneId: "magicAlchemyLab",
    sceneLabel: "제1 연금술 실습실",
    evidenceName: "화염 감지 룬스톤",
    category: "경보",
    cutout: "/samunmong/assets/magic-school/evidence-cutouts/fire-rune-stone.webp",
    visible: {
      x: "25.5%",
      y: "66.8%",
      w: "22.6%",
      h: "19.6%",
      clipPath: "ellipse(49% 47% at 50% 52%)",
      radius: "999px",
      rot: "0deg"
    },
    reviewNote: "왼쪽 바닥의 푸른 원형 룬스톤과 깨진 바깥 테두리 전체"
  },
  {
    id: "M3",
    sceneId: "magicAlchemyLab",
    sceneLabel: "제1 연금술 실습실",
    evidenceName: "기록의 수정구",
    category: "기록",
    cutout: "/samunmong/assets/magic-school/evidence-cutouts/record-crystal.webp",
    visible: {
      x: "76.8%",
      y: "78.2%",
      w: "7.6%",
      h: "13.0%",
      clipPath: "ellipse(47% 49% at 50% 50%)",
      radius: "999px",
      rot: "0deg"
    },
    reviewNote: "오른쪽 바닥의 둥근 보라색 병 몸체와 목 부분"
  },
  {
    id: "M4",
    sceneId: "magicCleaningCloset",
    sceneLabel: "청소도구함",
    evidenceName: "금지된 마법 담배 재",
    category: "잔해",
    cutout: "/samunmong/assets/magic-school/evidence-cutouts/magic-cigarette-ash.webp",
    visible: {
      x: "52.0%",
      y: "61.8%",
      w: "13.0%",
      h: "8.8%",
      clipPath: "ellipse(48% 40% at 50% 52%)",
      radius: "999px",
      rot: "0deg"
    },
    reviewNote: "연기는 제외하고 바닥의 재, 잎, 꽁초만 포함"
  },
  {
    id: "M5",
    sceneId: "magicLibrary",
    sceneLabel: "도서관",
    evidenceName: "도서관 대출 기록부",
    category: "문서",
    cutout: "/samunmong/assets/magic-school/evidence-cutouts/library-loan-ledger.webp",
    visible: {
      x: "22.8%",
      y: "76.1%",
      w: "41.6%",
      h: "31.3%",
      clipPath: "ellipse(49% 45% at 50% 51%)",
      radius: "999px",
      rot: "-7.5deg"
    },
    reviewNote: "전경 책상 위 펼쳐진 기록부의 양쪽 페이지와 제본부 전체"
  },
  {
    id: "M6",
    sceneId: "magicLibrary",
    sceneLabel: "도서관",
    evidenceName: "빙결 흔적이 남은 반납 도서",
    category: "문서",
    cutout: "/samunmong/assets/magic-school/evidence-cutouts/frost-returned-book.webp",
    visible: {
      x: "61.2%",
      y: "75.4%",
      w: "19.5%",
      h: "18.2%",
      clipPath: "ellipse(48% 45% at 50% 50%)",
      radius: "999px",
      rot: "-4deg"
    },
    reviewNote: "푸른 냉기가 맺힌 닫힌 책과 모서리의 성에"
  },
  {
    id: "M7",
    sceneId: "magicRecordCrystalRoom",
    sceneLabel: "기록 수정구실",
    evidenceName: "조작된 기록 수정구",
    category: "기록",
    cutout: "/samunmong/assets/magic-school/evidence-cutouts/record-crystal.webp",
    visible: {
      x: "52.0%",
      y: "35.2%",
      w: "25.0%",
      h: "39.0%",
      clipPath: "ellipse(47% 47% at 50% 50%)",
      radius: "999px",
      rot: "0deg"
    },
    reviewNote: "중앙 대형 수정구의 유리 구체만 포함하고 황동 고리는 제외"
  },
  {
    id: "M8",
    sceneId: "magicDormHallway",
    sceneLabel: "학생들 기숙사",
    evidenceName: "버려진 지팡이 조각",
    category: "도구",
    cutout: "/samunmong/assets/magic-school/evidence-cutouts/discarded-wand-shard.webp",
    visible: {
      x: "59.2%",
      y: "82.0%",
      w: "15.6%",
      h: "7.0%",
      clipPath: "ellipse(49% 39% at 50% 50%)",
      radius: "999px",
      rot: "-4deg"
    },
    reviewNote: "복도 바닥의 가느다란 지팡이 조각과 붉은 끝부분"
  }
] as const;

export const magicEvidenceOrder = magicEvidenceReviewItems.map((item) => item.evidenceName);

export function getMagicEvidenceReviewItems(sceneId: string) {
  return magicEvidenceReviewItems.filter((item) => item.sceneId === sceneId);
}

export function getMagicEvidenceReviewId(evidenceName: string | undefined) {
  return magicEvidenceReviewItems.find((item) => item.evidenceName === evidenceName)?.id;
}
