import { yoomunseokSarangbangScene } from "@/lib/gameData";
import InvestigationScene from "./InvestigationScene";

export default function YoomunseokSarangbangScene() {
  return <InvestigationScene scene={yoomunseokSarangbangScene} dockAriaLabel="유문석 사랑방 메뉴" backgroundStates={[
    { state: "all", image: "/samunmong/assets/scenes-integrated/scene-yoomunseok-sarangbang-all-evidence-v4.png" },
    { state: "holder-ledger", image: "/samunmong/assets/scenes-integrated/scene-yoomunseok-holder-ledger-v7.png" },
    { state: "holder-marriage", image: "/samunmong/assets/scenes-integrated/scene-yoomunseok-holder-marriage-v5.png" },
    { state: "ledger-marriage", image: "/samunmong/assets/scenes-integrated/scene-yoomunseok-ledger-marriage-v6.png" },
    { state: "holder-only", image: "/samunmong/assets/scenes-integrated/scene-yoomunseok-holder-only-v5.png" },
    { state: "ledger-only", image: "/samunmong/assets/scenes-integrated/scene-yoomunseok-ledger-only-v6.png" },
    { state: "marriage-only", image: "/samunmong/assets/scenes-integrated/scene-yoomunseok-marriage-only-v6.png" },
    { state: "none", image: "/samunmong/assets/scenes-integrated/scene-yoomunseok-none-v6.png" }
  ]} />;
}
