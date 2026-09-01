"use client";

import Link from "next/link";

const evidence = [
  {
    name: "찢어진 약속 편지",
    image: "/samunmong/assets/evidence-transparent/evidence-torn-letter-master-v5.svg",
    text: "돌쇠의 투박한 말투와 달리 지나치게 정중했다. 춘월이 돌쇠인 척 써 점순을 창고로 불러낸 미끼였다."
  },
  {
    name: "찢어진 옷고름",
    image: "/samunmong/assets/mudeok-interaction/evidence-torn-collar-tie.webp",
    text: "비단 옷고름의 폭과 마찰 흔적이 점순의 목에 남은 좁은 압박 자국과 맞아 범행 수법을 드러냈다."
  },
  {
    name: "팔의 긁힌 자국",
    image: "/samunmong/assets/evidence-transparent/evidence-scratched-arm.webp",
    text: "점순은 목이 졸리는 마지막 순간까지 저항했다. 손톱 밑 흔적과 춘월의 상처가 그 몸싸움을 증명했다."
  },
  {
    name: "유문석의 호패",
    image: "/samunmong/assets/evidence-transparent/evidence-wooden-tag-transparent.webp",
    text: "춘월은 미리 가져간 호패의 끈을 잘라 시신 곁에 두었다. 유문석에게 죄를 뒤집어씌우기 위한 거짓 흔적이었다."
  }
] as const;

export default function InterpretationScreen() {
  return (
    <main className="interpretation-screen">
      <div className="interpretation-moon" aria-hidden="true" />
      <article className="interpretation-scroll" aria-labelledby="interpretationTitle">
        <header className="interpretation-header">
          <p>第一夢 · 解夢錄</p>
          <h1 id="interpretationTitle">첫 번째 꿈의 진실</h1>
          <span>점순을 죽인 사람은 춘월이었다</span>
        </header>

        <section className="interpretation-story" aria-labelledby="storyTitle">
          <div className="interpretation-section-title">
            <span>一</span>
            <div>
              <p>사건의 전말</p>
              <h2 id="storyTitle">떠나려던 이와, 붙잡으려던 이</h2>
            </div>
          </div>
          <p>
            점순과 돌쇠는 서로 마음을 나누고 이 집을 떠나 새 삶을 시작하려 했다.
            두 사람이 뒷문에서 도망 약속을 확인한 그 밤, 그 이야기는 무덕의 말실수를 거쳐 춘월의 귀에 들어갔다.
          </p>
          <p>
            춘월은 돌쇠를 마음에 품고 있었다. 방 안에 숨긴 초상화는 우연한 그림이 아니라, 오래 눌러 둔 마음의 흔적이었다.
            그러나 자신에게는 원치 않는 혼인이 다가오고 있었고, 점순마저 돌쇠와 떠난다면 사랑도, 집안의 질서도, 자신의 체면도 모두 무너진다고 여겼다.
            자기 삶조차 뜻대로 고르지 못한다는 두려움은 질투와 집착이 되어 점순을 향했다.
          </p>
          <p>
            춘월은 돌쇠의 이름을 빌려 “오늘 밤 창고에서 기다리시오, 함께 떠납시다”라는 편지를 썼다.
            점순은 마침내 떠날 수 있다는 믿음으로 창고에 갔지만, 그곳에서 기다린 사람은 돌쇠가 아니었다.
            다툼 끝에 춘월은 목끈이나 옷고름으로 점순의 목을 졸랐고, 점순은 춘월의 팔을 긁으며 끝까지 저항했다.
          </p>
          <p>
            범행 뒤 춘월은 유문석의 호패를 시신 곁에 남겼다. 점순을 꾸짖었던 유문석과 몰래 만났던 돌쇠,
            두 사람에게 의심이 머물도록 만든 것이다. 그러나 거짓말은 편지의 말투와 작은 발자국,
            끊어진 호패끈, 그리고 팔에 남은 상처까지 지우지는 못했다.
          </p>
        </section>

        <section className="interpretation-motive" aria-labelledby="motiveTitle">
          <div className="interpretation-section-title">
            <span>二</span>
            <div>
              <p>춘월의 동기</p>
              <h2 id="motiveTitle">사랑이 아니라 소유하려는 마음</h2>
            </div>
          </div>
          <blockquote>
            “그 아이가 돌쇠와 떠난다 들었을 때,
            제게 남은 것마저 빼앗기는 줄 알았습니다.”
          </blockquote>
          <p>
            춘월은 강요된 혼인 앞에서 자신의 삶을 통제할 수 없었다. 혼서 조각은 그 압박을 보여 주고, 돌쇠 초상화는 그가 붙잡고 싶었던 마음을 보여 준다.
            점순을 죽인 까닭은 단순한 질투만이 아니었다. 돌쇠를 빼앗길 두려움, 자신만 선택권이 없다는 분노,
            양반가 아씨로서의 체면과 무너지는 집안 질서를 붙들려는 집착이 한데 얽힌 결과였다.
            하지만 춘월이 받은 억압은 점순의 삶을 빼앗은 일을 결코 정당화하지 못한다.
          </p>
        </section>

        <section className="interpretation-evidence" aria-labelledby="evidenceTitle">
          <div className="interpretation-section-title">
            <span>三</span>
            <div>
              <p>거짓을 깬 흔적</p>
              <h2 id="evidenceTitle">네 가지 결정적 증거</h2>
            </div>
          </div>
          <div className="interpretation-evidence-grid">
            {evidence.map((item, index) => (
              <article key={item.name}>
                <span className="interpretation-evidence-number">증거 {index + 1}</span>
                <img src={item.image} alt="" />
                <h3>{item.name}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="interpretation-footer">
          <div className="interpretation-seal" aria-hidden="true">解夢</div>
          <p>첫 번째 꿈의 진실이 온전히 드러났다.</p>
          <p>그러나 잠에서 깨어나기까지, 아직 두 개의 꿈이 남아 있다.</p>
          <Link className="wood-result-button primary" href="/?start=dreamScreen">
            다음 꿈을 향해
          </Link>
        </footer>
      </article>
    </main>
  );
}
