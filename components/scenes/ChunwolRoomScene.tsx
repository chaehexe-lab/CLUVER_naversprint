import { chunwolRoomScene } from "@/lib/gameData";
import InvestigationScene from "./InvestigationScene";

export default function ChunwolRoomScene() {
  return <InvestigationScene scene={chunwolRoomScene} dockAriaLabel="춘월의 방 메뉴" backgroundStates={[
    { state: "all", image: "/samunmong/assets/scenes-integrated/scene-chunwol-room-all-evidence-v4.png" },
    { state: "norigae-only", image: "/samunmong/assets/scenes-integrated/scene-chunwol-room-norigae-only-v4.png" },
    { state: "portrait-only", image: "/samunmong/assets/scenes-integrated/scene-chunwol-room-portrait-only-v4.png" },
    { state: "none", image: "/samunmong/assets/scenes-integrated/scene-chunwol-room-clean-v3.png" }
  ]} />;
}
