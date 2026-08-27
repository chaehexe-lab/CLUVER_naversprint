import { chunwolRoomScene } from "@/lib/gameData";
import InvestigationScene from "./InvestigationScene";

export default function ChunwolRoomScene() {
  return <InvestigationScene scene={chunwolRoomScene} dockAriaLabel="춘월의 방 메뉴" backgroundStates={[
    { state: "all", image: "/samunmong/assets/scene-motion/chunwol-room-all-evidence-flame-clean-v2.png" },
    { state: "norigae-only", image: "/samunmong/assets/scene-motion/chunwol-norigae-only-motion-clean-v1.png" },
    { state: "portrait-only", image: "/samunmong/assets/scene-motion/chunwol-portrait-only-motion-clean-v1.png" },
    { state: "none", image: "/samunmong/assets/scene-motion/chunwol-none-motion-clean-v1.png" }
  ]} />;
}
