import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import InterpretationScreen from "@/components/result/InterpretationScreen";
import { finalCulpritId } from "@/lib/persona";
import { getProgressCookieName, verifyGameProgressToken } from "@/lib/server/gameProgress";

export default async function InterpretationPage() {
  const cookieStore = await cookies();
  const progress = await verifyGameProgressToken(
    cookieStore.get(getProgressCookieName("joseon"))?.value,
    "joseon"
  );
  const accusation = progress?.accusation;

  if (!accusation || accusation.outcome !== "success" || accusation.suspectId !== finalCulpritId) {
    redirect("/result?theme=joseon");
  }

  return <InterpretationScreen />;
}
