import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ResultScreen from "@/components/result/ResultScreen";
import type { GameProgress, GameTheme } from "@/lib/gameProgressTypes";
import { getProgressCookieName, verifyGameProgressToken } from "@/lib/server/gameProgress";

type ResultPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function asTheme(value: string | string[] | undefined): GameTheme | undefined {
  const theme = Array.isArray(value) ? value[0] : value;
  return theme === "joseon" || theme === "magicSchool" || theme === "spaceStation" ? theme : undefined;
}

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const params = await searchParams;
  const requestedTheme = asTheme(params?.theme);
  const cookieStore = await cookies();
  const themes: GameTheme[] = requestedTheme
    ? [requestedTheme]
    : ["joseon", "magicSchool", "spaceStation"];

  let progress: GameProgress | null = null;
  for (const theme of themes) {
    const candidate = await verifyGameProgressToken(cookieStore.get(getProgressCookieName(theme))?.value, theme);
    if (candidate && (!progress || candidate.updatedAt > progress.updatedAt)) progress = candidate;
  }

  if (!progress) redirect("/?blocked=missing-progress");

  const wantsVerdict = (Array.isArray(params?.verdict) ? params?.verdict[0] : params?.verdict) === "1";
  if (wantsVerdict && !progress.accusation) {
    redirect(`/result?theme=${progress.theme}`);
  }

  return (
    <ResultScreen
      initialTheme={progress.theme}
      collectedEvidenceNames={progress.collectedEvidenceNames}
      analyzedEvidenceNames={progress.analyzedEvidenceNames}
      verifiedVerdict={wantsVerdict ? progress.accusation : undefined}
    />
  );
}
