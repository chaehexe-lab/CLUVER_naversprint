import { briefing } from "@/lib/gameData";

export default function BriefingScreen() {
  return (
    <section className="screen briefing-screen" id="briefingScreen">
      <article className="hud briefing-card" data-briefing-step="0">
        <p className="briefing-kicker">사건기록</p>
        <h2>{briefing.title}</h2>

        <div className="briefing-step active" data-briefing-panel="0">
          <p className="briefing-caption strong">점순이는 어떻게 숨졌는가</p>
          <div className="briefing-death-layout">
            <div className="briefing-evidence-stack">
              <figure className="briefing-evidence-photo">
                <img src="/samunmong/assets/mudeok-interaction/evidence-jeomsun-neck-exam-paper.png" alt="점순 초기 검안 기록" draggable={false} />
                <figcaption>기록: 초기 검안 기록</figcaption>
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

        <div className="briefing-actions">
          <button className="button primary briefing-start" id="startCase" type="button">
            {briefing.startLabel}
          </button>
        </div>
      </article>
    </section>
  );
}
