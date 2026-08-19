import { fieldOneScene } from "@/lib/gameData";
import InvestigationScene from "./InvestigationScene";

export default function FieldOneScene() {
  return (
    <InvestigationScene scene={fieldOneScene} dockAriaLabel="현장 메뉴" propClassName="field-evidence-prop">
      <div className="field-onboarding" id="fieldOnboarding" data-guide-step="map-click" hidden>
        <article className="hud field-guide-card" aria-live="polite">
          <div className="field-guide-panel active" data-field-guide-panel="map-click">
            <h2>먼저, 사건 현장의 위치를 파악하십시오</h2>
            <p>
              마을 지도에서 현재 위치와 이동할 수 있는 장소를 확인할 수 있습니다.
              <br />
              버튼을 눌러 지도를 펼쳐 보십시오.
            </p>
          </div>
          <div className="field-guide-panel" data-field-guide-panel="map-open" aria-hidden="true">
            <p className="field-guide-kicker">현재 위치</p>
            <h2>첫 현장: 유문석 집 앞</h2>
            <p>지도에서 붉게 빛나는 곳이 현재 위치입니다. 이후 다른 장소로 이동할 때도 이 지도에서 위치를 확인할 수 있습니다.</p>
          </div>
          <div className="field-guide-panel" data-field-guide-panel="room" aria-hidden="true">
            <h2>용의자에게 사건에 대해 질문해 보십시오</h2>
            <p>
              취조실에서 <strong>용의자</strong>를 불러 신문할 수 있습니다.
              <br />
              수집한 <strong>증거를 함께 제시</strong>하며 질문할 수도 있습니다.
            </p>
          </div>
          <div className="field-guide-panel" data-field-guide-panel="suspects" aria-hidden="true">
            <h2>용의자는 총 4명입니다</h2>
            <div className="field-guide-suspects" aria-label="용의자 4명">
              <figure>
                <img src="/samunmong/assets/suspects/dolsoe-seated.webp" alt="돌쇠" />
                <figcaption>돌쇠</figcaption>
              </figure>
              <figure>
                <img src="/samunmong/assets/suspects/chunwol-seated.webp" alt="최춘월" />
                <figcaption>최춘월</figcaption>
              </figure>
              <figure>
                <img src="/samunmong/assets/suspects/yoomunseok-seated.webp" alt="유문석" />
                <figcaption>유문석</figcaption>
              </figure>
              <figure>
                <img src="/samunmong/assets/suspects/mudeok-seated.webp" alt="무덕" />
                <figcaption>무덕</figcaption>
              </figure>
            </div>
          </div>
          <div className="field-guide-panel" data-field-guide-panel="tools" aria-hidden="true">
            <h2>네 가지 도구를 함께 활용하십시오</h2>
            <ul>
              <li><strong>사건일지</strong> : 처음 전달받은 사건 내용을 다시 확인합니다.</li>
              <li><strong>기록장</strong> : 용의자별 질문과 답변을 대화처럼 남깁니다.</li>
              <li><strong>보따리</strong> : 수집한 증거를 다시 확인합니다.</li>
              <li><strong>도구</strong> : 돋보기와 붓으로 증거를 더 자세히 봅니다.</li>
            </ul>
          </div>
          <div className="field-guide-actions">
            <button className="field-guide-next" id="nextFieldGuide" type="button" hidden>다음</button>
          </div>
        </article>
      </div>
    </InvestigationScene>
  );
}
