import { backGateCourtyardScene } from "@/lib/gameData";
import InvestigationScene from "./InvestigationScene";

export default function BackGateCourtyardScene() {
  return <InvestigationScene scene={backGateCourtyardScene} dockAriaLabel="뒷문 마당 메뉴" />;
}
