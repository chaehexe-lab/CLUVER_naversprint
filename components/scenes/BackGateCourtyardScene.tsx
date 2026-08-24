import { backGateCourtyardScene } from "@/lib/gameData";
import InvestigationScene from "./InvestigationScene";

export default function BackGateCourtyardScene() {
  return <InvestigationScene scene={backGateCourtyardScene} dockAriaLabel="뒷문 마당 메뉴" backgroundStates={[
    { state: "all", image: "/samunmong/assets/scenes-integrated/scene-back-gate-courtyard-all-evidence-v4.png" },
    { state: "footprints-only", image: "/samunmong/assets/scenes-integrated/scene-back-gate-courtyard-footprints-only-v4.png" },
    { state: "cord-only", image: "/samunmong/assets/scenes-integrated/scene-back-gate-courtyard-cord-only-v4.png" },
    { state: "none", image: "/samunmong/assets/scenes-integrated/scene-back-gate-courtyard-clean-v3.png" }
  ]} />;
}
