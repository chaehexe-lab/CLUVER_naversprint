import { yoomunseokSarangbangScene } from "@/lib/gameData";
import InvestigationScene from "./InvestigationScene";

export default function YoomunseokSarangbangScene() {
  return <InvestigationScene scene={yoomunseokSarangbangScene} dockAriaLabel="유문석 사랑방 메뉴" backgroundStates={[
    { state: "all", image: "/samunmong/assets/scene-motion/yoomunseok-sarangbang-all-evidence-flame-clean-v2.png" },
    { state: "holder-ledger", image: "/samunmong/assets/scene-motion/yoomunseok-holder-ledger-motion-clean-v1.png" },
    { state: "holder-marriage", image: "/samunmong/assets/scene-motion/yoomunseok-holder-marriage-motion-clean-v1.png" },
    { state: "ledger-marriage", image: "/samunmong/assets/scene-motion/yoomunseok-ledger-marriage-motion-clean-v1.png" },
    { state: "holder-only", image: "/samunmong/assets/scene-motion/yoomunseok-holder-only-motion-clean-v1.png" },
    { state: "ledger-only", image: "/samunmong/assets/scene-motion/yoomunseok-ledger-only-motion-clean-v1.png" },
    { state: "marriage-only", image: "/samunmong/assets/scene-motion/yoomunseok-marriage-only-motion-clean-v1.png" },
    { state: "none", image: "/samunmong/assets/scene-motion/yoomunseok-none-motion-clean-v1.png" }
  ]} />;
}
