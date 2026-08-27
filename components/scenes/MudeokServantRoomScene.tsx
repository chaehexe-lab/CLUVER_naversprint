import { mudeokServantRoomScene } from "@/lib/gameData";
import InvestigationScene from "./InvestigationScene";

export default function MudeokServantRoomScene() {
  return <InvestigationScene scene={mudeokServantRoomScene} dockAriaLabel="무덕의 하인방 메뉴" backgroundStates={[
    { state: "all", image: "/samunmong/assets/scene-motion/mudeok-servant-room-all-evidence-motion-clean-v2.png" },
    { state: "diary-shoes", image: "/samunmong/assets/scene-motion/mudeok-diary-shoes-motion-clean-v1.png" },
    { state: "diary-tie", image: "/samunmong/assets/scene-motion/mudeok-diary-tie-motion-clean-v1.png" },
    { state: "shoes-tie", image: "/samunmong/assets/scene-motion/mudeok-shoes-tie-motion-clean-v1.png" },
    { state: "diary-only", image: "/samunmong/assets/scene-motion/mudeok-diary-only-motion-clean-v1.png" },
    { state: "shoes-only", image: "/samunmong/assets/scene-motion/mudeok-shoes-only-motion-clean-v1.png" },
    { state: "tie-only", image: "/samunmong/assets/scene-motion/mudeok-tie-only-motion-clean-v1.png" },
    { state: "none", image: "/samunmong/assets/scene-motion/mudeok-none-motion-clean-v1.png" }
  ]} />;
}
