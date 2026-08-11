import GameShell from "@/components/GameShell";
import { STARTABLE_SCREENS } from "@/lib/gameState";

type ThemeId = "magicSchool" | "spaceStation";

type HomeProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const start = Array.isArray(params?.start) ? params.start[0] : params?.start;
  const theme = Array.isArray(params?.theme) ? params.theme[0] : params?.theme;
  const initialScreen = start && STARTABLE_SCREENS.has(start) ? start : undefined;
  let initialTheme: ThemeId | undefined;
  if (theme === "spaceStation") {
    initialTheme = "spaceStation";
  } else if (theme === "magicSchool" || initialScreen?.startsWith("magic")) {
    initialTheme = "magicSchool";
  } else if (initialScreen?.startsWith("space")) {
    initialTheme = "spaceStation";
  }

  return <GameShell initialScreen={initialScreen} initialTheme={initialTheme} />;
}
