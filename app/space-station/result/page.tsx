import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ResultScreen from "@/components/result/ResultScreen";
import { getProgressCookieName, verifyGameProgressToken } from "@/lib/server/gameProgress";

type SpaceStationResultPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SpaceStationResultPage({ searchParams }: SpaceStationResultPageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const progress = await verifyGameProgressToken(
    cookieStore.get(getProgressCookieName("spaceStation"))?.value,
    "spaceStation"
  );

  if (!progress) redirect("/space-station/briefing");

  const wantsVerdict = (Array.isArray(params?.verdict) ? params.verdict[0] : params?.verdict) === "1";
  if (wantsVerdict && !progress.accusation) redirect("/space-station/result");

  return (
    <ResultScreen
      initialTheme="spaceStation"
      collectedEvidenceNames={progress.collectedEvidenceNames}
      analyzedEvidenceNames={progress.analyzedEvidenceNames}
      verifiedVerdict={wantsVerdict ? progress.accusation : undefined}
      backToInterrogationHref="/space-station/interrogation"
      resultBasePath="/space-station/result"
    />
  );
}
