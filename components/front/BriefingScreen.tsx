import { briefing } from "@/lib/gameData";

const suspectTags = [
  { name: "돌쇠", role: "머슴", image: "/samunmong/assets/suspects/dolsoe-seated.png" },
  { name: "최춘월", role: "아씨", image: "/samunmong/assets/suspects/chunwol-seated.png" },
  { name: "유문석", role: "양반", image: "/samunmong/assets/suspects/yoomunseok-seated.png" },
  { name: "무덕", role: "하인", image: "/samunmong/assets/suspects/mudeok-seated.png" }
] as const;

export default function BriefingScreen() {
  return (
    <section className="screen briefing-screen" id="briefingScreen">
      <article className="hud briefing-card" data-briefing-step="0">
        <p className="briefing-kicker">사건기록</p>
        <h2>{briefing.title}</h2>

        <div className="briefing-step active" data-briefing-panel="0">
          <div className="briefing-copy" id="briefingCopy" aria-live="polite" />
        </div>

        <div className="briefing-step" data-briefing-panel="1" aria-hidden="true">
          <p className="briefing-caption strong">점순이는 어떻게 숨졌는가</p>
          <div className="briefing-death-layout">
            <div className="briefing-evidence-stack">
              <figure className="briefing-evidence-photo">
                <img src="/samunmong/assets/mudeok-interaction/evidence-jeomsun-neck-exam-paper.png" alt="점순 목 검안 종이" draggable={false} />
                <figcaption>증거: 점순 목 검안 종이</figcaption>
              </figure>
              <figure className="briefing-evidence-photo briefing-evidence-photo-small">
                <img src="/samunmong/assets/mudeok-interaction/evidence-jeomsun-hand-exam-paper.png" alt="점순이 손끝 밑 살점 검안 종이" draggable={false} />
                <figcaption>증거: 손끝 검안 종이</figcaption>
              </figure>
            </div>
            <div className="briefing-death-copy">
              <p>사또님, 검안 종이를 살피니 날붙이 상처보다 <strong>목 주변의 희미한 압박 흔적</strong>이 먼저 보입니다.</p>
              <p>또한 점순이의 손끝 밑에는 <strong>살점으로 보이는 흔적</strong>이 남아 있었습니다.</p>
              <p>이는 단순 사고나 칼부림이 아니라, 누군가 천으로 점순의 목을 조른 정황으로 보입니다.</p>
            </div>
          </div>
        </div>

        <div className="briefing-step" data-briefing-panel="2" aria-hidden="true">
          <p className="briefing-caption strong">이 네 명의 혐의자들을 살펴야 합니다, 사또님.</p>
          <div className="briefing-suspect-tags">
            {suspectTags.map((suspect) => (
              <section className="briefing-suspect-tag" data-suspect={suspect.name} key={suspect.name}>
                <img src={suspect.image} alt="" draggable={false} />
                <span className="hopae-string" aria-hidden="true" />
                <div>
                  <strong>{suspect.name}</strong>
                  <span>{suspect.role}</span>
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="briefing-actions">
          <button className="briefing-nav" id="briefingPrev" type="button">
            이전
          </button>
          <button className="briefing-nav primary" id="briefingNext" type="button">
            다음
          </button>
          <button className="button primary briefing-start" id="startCase" type="button">
            {briefing.startLabel}
          </button>
        </div>
      </article>
    </section>
  );
}
