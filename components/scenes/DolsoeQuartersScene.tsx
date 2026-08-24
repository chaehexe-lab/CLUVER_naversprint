import { dolsoeQuartersScene } from "@/lib/gameData";
import InvestigationScene from "./InvestigationScene";

export default function DolsoeQuartersScene() {
  return <InvestigationScene scene={dolsoeQuartersScene} dockAriaLabel="돌쇠 처소 메뉴" backgroundStates={[
    { state: "all", image: "/samunmong/assets/scenes-integrated/scene-dolsoe-quarters-all-evidence-v4.png" },
    { state: "bandage-only", image: "/samunmong/assets/scenes-integrated/scene-dolsoe-quarters-bandage-only-v4.png" },
    { state: "bundle-only", image: "/samunmong/assets/scenes-integrated/scene-dolsoe-quarters-bundle-only-v4.png" },
    { state: "none", image: "/samunmong/assets/scenes-integrated/scene-dolsoe-quarters-clean-v3.png" }
  ]} />;
}
