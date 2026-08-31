export type GameTheme = "joseon" | "magicSchool" | "spaceStation";

export type VerdictOutcome = "success" | "failure";

export type VerdictReason = "correct" | "incorrect-suspect" | "insufficient-evidence";

export type VerifiedAccusation = {
  suspectId: string;
  outcome: VerdictOutcome;
  reason: VerdictReason;
  accusedAt: number;
};

export type GameProgress = {
  version: 1;
  theme: GameTheme;
  currentScreen: string;
  visitedScreens: string[];
  collectedEvidenceNames: string[];
  analyzedEvidenceNames: string[];
  knownFactIds: string[];
  accusation?: VerifiedAccusation;
  updatedAt: number;
};
