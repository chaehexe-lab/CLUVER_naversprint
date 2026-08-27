"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type SceneObject = {
  id: string;
  label: string;
  message: string;
  x: string;
  y: string;
  width: string;
  height: string;
  clipPath: string;
};

const SCENE_OBJECTS: Record<string, readonly SceneObject[]> = {
  fieldOne: [
    { id: "front-gate", label: "관아 대문", message: "관아로 이어지는 문이다. 밤새 드나든 흔적은 뚜렷하지 않다.", x: "50.5%", y: "5%", width: "30%", height: "53%", clipPath: "polygon(18% 2%, 96% 1%, 98% 91%, 54% 100%, 5% 81%)" },
    { id: "gate-lantern", label: "대문의 등불", message: "기름이 아직 남아 있다. 밤에도 불을 밝혔던 듯하다.", x: "56.7%", y: "18.5%", width: "5.8%", height: "17%", clipPath: "polygon(34% 2%, 70% 2%, 91% 32%, 79% 96%, 20% 96%, 8% 31%)" },
    { id: "wet-road", label: "젖은 돌길", message: "비에 젖은 돌길이다. 여러 발자국이 겹쳐 방향을 알아보기 어렵다.", x: "7%", y: "49%", width: "39%", height: "41%", clipPath: "polygon(28% 1%, 75% 5%, 100% 100%, 0 100%)" },
    { id: "fallen-jeomsun", label: "쓰러진 점순", message: "차가운 돌길 위에 점순이 쓰러져 있다. 미동조차 느껴지지 않는다.", x: "43%", y: "57%", width: "31%", height: "29%", clipPath: "polygon(2% 32%, 18% 13%, 50% 4%, 72% 17%, 89% 42%, 99% 75%, 88% 96%, 49% 87%, 27% 70%, 5% 67%)" }
  ],
  chunwolRoom: [
    { id: "writing-desk", label: "춘월의 서안", message: "먹이 아직 마르지 않았다. 조금 전까지 글을 쓴 듯하다.", x: "9%", y: "57%", width: "40%", height: "31%", clipPath: "polygon(13% 10%, 91% 1%, 100% 55%, 87% 100%, 4% 91%)" },
    { id: "silk-bedding", label: "비단 이불", message: "비단 이불이 흐트러져 있다. 편히 잠든 흔적은 보이지 않는다.", x: "61%", y: "62%", width: "28%", height: "34%", clipPath: "polygon(23% 4%, 96% 17%, 100% 100%, 1% 100%, 8% 35%)" },
    { id: "lacquer-cabinet", label: "자개 장식장", message: "장식장의 서랍은 모두 단단히 닫혀 있다.", x: "37%", y: "17%", width: "15%", height: "41%", clipPath: "polygon(9% 1%, 91% 1%, 100% 95%, 1% 100%)" }
  ],
  mudeokServantRoom: [
    { id: "servant-bed", label: "무덕의 잠자리", message: "얇고 낡은 잠자리다. 오래 뒤척인 흔적이 남아 있다.", x: "7%", y: "49%", width: "45%", height: "29%", clipPath: "polygon(12% 14%, 76% 1%, 100% 35%, 84% 98%, 4% 100%)" },
    { id: "wooden-shelf", label: "낡은 선반", message: "생활에 필요한 물건만 남아 있다. 값나가는 물건은 보이지 않는다.", x: "37%", y: "15%", width: "16%", height: "40%", clipPath: "polygon(4% 1%, 96% 1%, 100% 98%, 1% 98%)" },
    { id: "open-door", label: "열린 방문", message: "문이 열려 있다. 축축한 밤바람이 방 안으로 들어온다.", x: "59%", y: "0%", width: "24%", height: "58%", clipPath: "polygon(4% 1%, 96% 1%, 91% 100%, 1% 93%)" }
  ],
  yoomunseokSarangbang: [
    { id: "document-shelf", label: "문서 책장", message: "문서가 지나치게 가지런하다. 누군가 급히 뒤진 흔적은 없다.", x: "15%", y: "0%", width: "25%", height: "58%", clipPath: "polygon(2% 1%, 98% 1%, 100% 100%, 1% 99%)" },
    { id: "landscape-screen", label: "산수 병풍", message: "먹으로 그린 산수화다. 병풍 뒤에는 아무것도 없다.", x: "40%", y: "7%", width: "31%", height: "44%", clipPath: "polygon(1% 1%, 99% 1%, 96% 100%, 3% 100%)" },
    { id: "inkstone", label: "사랑방 벼루", message: "벼루의 먹이 굳어 있다. 오늘 사용한 것은 아닌 듯하다.", x: "67%", y: "66%", width: "15%", height: "13%", clipPath: "ellipse(49% 43% at 50% 51%)" }
  ],
  dolsoeQuarters: [
    { id: "axe", label: "장작 도끼", message: "돌쇠가 나무를 팰 때 주로 사용하는 도끼다. 손잡이가 오래 닳아 있다.", x: "71.8%", y: "66.2%", width: "17.5%", height: "31.5%", clipPath: "polygon(38% 1%, 76% 3%, 86% 31%, 65% 49%, 60% 100%, 47% 100%, 50% 51%, 17% 36%)" },
    { id: "tools", label: "벽의 농기구", message: "낫과 농기구가 가지런히 걸려 있다. 모두 오래 손에 익은 물건들이다.", x: "82.5%", y: "20.5%", width: "16.8%", height: "49.5%", clipPath: "polygon(9% 4%, 91% 1%, 98% 94%, 4% 100%)" },
    { id: "firewood", label: "쌓아 둔 장작", message: "며칠은 버틸 만큼 장작을 가지런히 쌓아 두었다.", x: "59.7%", y: "27.3%", width: "13.8%", height: "39%", clipPath: "polygon(19% 1%, 81% 2%, 98% 90%, 5% 99%)" },
    { id: "bed", label: "돌쇠의 잠자리", message: "자리를 급히 정리한 흔적이 보인다. 제대로 잠든 것 같지는 않다.", x: "7.2%", y: "47.5%", width: "34.5%", height: "20.5%", clipPath: "polygon(3% 27%, 55% 3%, 98% 22%, 96% 89%, 9% 99%)" }
  ],
  backGateCourtyard: [
    { id: "storage-jars", label: "마당의 장독", message: "평범한 장독들이다. 뚜껑은 모두 단단히 닫혀 있다.", x: "0%", y: "48%", width: "27%", height: "29%", clipPath: "polygon(4% 32%, 18% 4%, 73% 1%, 99% 42%, 91% 100%, 1% 98%)" },
    { id: "back-gate", label: "열린 뒷문", message: "빗장이 풀려 있다. 문은 안쪽으로 열린 채 멈춰 있다.", x: "41%", y: "22%", width: "28%", height: "39%", clipPath: "polygon(4% 2%, 99% 1%, 93% 100%, 1% 96%)" },
    { id: "yard-broom", label: "마당 빗자루", message: "최근 사용한 빗자루다. 끝에 젖은 흙이 묻어 있다.", x: "83%", y: "40%", width: "14%", height: "44%", clipPath: "polygon(28% 1%, 66% 1%, 98% 98%, 2% 99%)" }
  ]
};

type ObjectHitboxStyle = CSSProperties & { "--object-hit-clip": string };

export default function SceneObjectComments({ sceneId }: { sceneId: string }) {
  const objects = SCENE_OBJECTS[sceneId] ?? [];
  const [message, setMessage] = useState("");
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  if (objects.length === 0) return null;

  const inspect = (object: SceneObject) => {
    setMessage(object.message);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setMessage(""), 2600);
  };

  return (
    <>
      <div className="scene-object-comment-layer" aria-label="살펴볼 수 있는 장면 사물">
        {objects.map((object) => (
          <button
            key={object.id}
            className="scene-object-comment-hitbox"
            type="button"
            aria-label={`${object.label} 살펴보기`}
            style={{
              left: object.x,
              top: object.y,
              width: object.width,
              height: object.height,
              "--object-hit-clip": object.clipPath
            } as ObjectHitboxStyle}
            onClick={() => inspect(object)}
          />
        ))}
      </div>
      <p className={`scene-object-comment${message ? " show" : ""}`} aria-live="polite">
        {message}
      </p>
    </>
  );
}
