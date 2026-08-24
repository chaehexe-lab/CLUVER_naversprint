import { mudeokServantRoomScene } from "@/lib/gameData";
import InvestigationScene from "./InvestigationScene";

export default function MudeokServantRoomScene() {
  return <InvestigationScene scene={mudeokServantRoomScene} dockAriaLabel="무덕의 하인방 메뉴" backgroundStates={[
    { state: "all", image: "/samunmong/assets/scenes-integrated/scene-mudeok-servant-room-all-evidence-v4.png" },
    { state: "diary-shoes", image: "/samunmong/assets/scenes-integrated/scene-mudeok-diary-shoes-v4.png" },
    { state: "diary-tie", image: "/samunmong/assets/scenes-integrated/scene-mudeok-diary-tie-v4.png" },
    { state: "shoes-tie", image: "/samunmong/assets/scenes-integrated/scene-mudeok-shoes-tie-v4.png" },
    { state: "diary-only", image: "/samunmong/assets/scenes-integrated/scene-mudeok-diary-only-v4.png" },
    { state: "shoes-only", image: "/samunmong/assets/scenes-integrated/scene-mudeok-shoes-only-v4.png" },
    { state: "tie-only", image: "/samunmong/assets/scenes-integrated/scene-mudeok-tie-only-v4.png" },
    { state: "none", image: "/samunmong/assets/scenes-integrated/scene-mudeok-servant-room-clean-v3.png" }
  ]} />;
}
