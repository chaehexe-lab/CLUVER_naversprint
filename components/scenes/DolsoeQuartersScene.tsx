import { dolsoeQuartersScene } from "@/lib/gameData";
import InvestigationScene from "./InvestigationScene";

export default function DolsoeQuartersScene() {
  return <InvestigationScene scene={dolsoeQuartersScene} dockAriaLabel="돌쇠 처소 메뉴" backgroundStates={[
    { state: "all", image: "/samunmong/assets/scene-motion/dolsoe-quarters-all-evidence-flame-clean-v2.png" },
    { state: "bandage-only", image: "/samunmong/assets/scene-motion/dolsoe-bandage-only-motion-clean-v1.png" },
    { state: "bundle-only", image: "/samunmong/assets/scene-motion/dolsoe-bundle-only-motion-clean-v1.png" },
    { state: "none", image: "/samunmong/assets/scene-motion/dolsoe-none-motion-clean-v1.png" }
  ]} />;
}
