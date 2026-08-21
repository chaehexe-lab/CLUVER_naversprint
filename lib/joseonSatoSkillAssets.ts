const root = "/samunmong/assets/interactions/sato-skills";

export const joseonSatoCommandLauncher = `${root}/launcher/sato-command-launcher.png`;

export const joseonAjeonAssets = {
  neutral: `${root}/ajeon/neutral.png`,
  bowing: `${root}/ajeon/bowing.png`,
  holdingSearchPlaque: `${root}/ajeon/holding-search-plaque.png`,
  carryingRegisters: `${root}/ajeon/carrying-registers.png`,
  removingChestSeal: `${root}/ajeon/removing-chest-seal.png`,
  openingDoor: `${root}/ajeon/opening-door.png`,
  discoveringEvidence: `${root}/ajeon/discovering-evidence.png`,
  presentingReport: `${root}/ajeon/presenting-report.png`,
  portraits: {
    listening: `${root}/ajeon/portraits/listening.png`,
    greeting: `${root}/ajeon/portraits/greeting.png`,
    officialReport: `${root}/ajeon/portraits/official-report.png`,
    warning: `${root}/ajeon/portraits/warning.png`,
    surprised: `${root}/ajeon/portraits/surprised.png`,
    confirmed: `${root}/ajeon/portraits/confirmed.png`,
    mismatchConcern: `${root}/ajeon/portraits/mismatch-concern.png`,
    urgentDiscovery: `${root}/ajeon/portraits/urgent-discovery.png`,
  },
} as const;

export const joseonSatoSkillTokens = {
  searchBasic: `${root}/skill-tokens/search-basic.png`,
  searchActive: `${root}/skill-tokens/search-active.png`,
  registryBasic: `${root}/skill-tokens/registry-basic.png`,
  registryActive: `${root}/skill-tokens/registry-active.png`,
  sealBasic: `${root}/skill-tokens/seal-basic.png`,
  sealReady: `${root}/skill-tokens/seal-ready.png`,
  locked: `${root}/skill-tokens/locked.png`,
  completed: `${root}/skill-tokens/completed.png`,
} as const;

export const joseonInteractionFeedbackAssets = {
  slotEmpty: `${root}/interaction-feedback/slot-empty.png`,
  slotValid: `${root}/interaction-feedback/slot-valid.png`,
  slotInvalid: `${root}/interaction-feedback/slot-invalid.png`,
  slotLocked: `${root}/interaction-feedback/slot-locked.png`,
  comparisonCord: `${root}/interaction-feedback/comparison-cord.png`,
  investigating: `${root}/interaction-feedback/investigating.png`,
  hintShimmer: `${root}/interaction-feedback/hint-shimmer.png`,
  evidenceNew: `${root}/interaction-feedback/evidence-new.png`,
} as const;

export const joseonCommandStatusAssets = {
  commandIssued: `${root}/command-status/command-issued.png`,
  ajeonDispatched: `${root}/command-status/ajeon-dispatched.png`,
  sealRemoving: `${root}/command-status/seal-removing.png`,
  searchComplete: `${root}/command-status/search-complete.png`,
  registryChecking: `${root}/command-status/registry-checking.png`,
  registryVerified: `${root}/command-status/registry-verified.png`,
  registryConflict: `${root}/command-status/registry-conflict.png`,
  verdictConfirmed: `${root}/command-status/verdict-confirmed.png`,
} as const;

export const joseonEvidencePresentationAssets = {
  trayEmpty: `${root}/evidence-presentation/tray-empty.png`,
  trayLoaded: `${root}/evidence-presentation/tray-loaded.png`,
  presentationMat: `${root}/evidence-presentation/presentation-mat.png`,
  evidenceReturned: `${root}/evidence-presentation/evidence-returned.png`,
  testimonyAgrees: `${root}/evidence-presentation/testimony-agrees.png`,
  contradiction: `${root}/evidence-presentation/contradiction.png`,
  evasiveResponse: `${root}/evidence-presentation/evasive-response.png`,
  testimonyUnlocked: `${root}/evidence-presentation/testimony-unlocked.png`,
} as const;

export const joseonAccusationBoardAssets = {
  suspectEmpty: `${root}/accusation-board/suspect-empty.png`,
  suspectSelected: `${root}/accusation-board/suspect-selected.png`,
  suspectExcluded: `${root}/accusation-board/suspect-excluded.png`,
  suspectReview: `${root}/accusation-board/suspect-review.png`,
  evidenceBundle: `${root}/accusation-board/evidence-bundle.png`,
  reasoningChain: `${root}/accusation-board/reasoning-chain.png`,
  accusationPlaque: `${root}/accusation-board/accusation-plaque.png`,
  accusationReady: `${root}/accusation-board/accusation-ready.png`,
} as const;

export const joseonEvidenceActionAssets = {
  pickUp: `${root}/evidence-actions/pick-up.png`,
  flip: `${root}/evidence-actions/flip.png`,
  rotate: `${root}/evidence-actions/rotate.png`,
  inspectClose: `${root}/evidence-actions/inspect-close.png`,
  rubbing: `${root}/evidence-actions/rubbing.png`,
  backlight: `${root}/evidence-actions/backlight.png`,
  combine: `${root}/evidence-actions/combine.png`,
  compare: `${root}/evidence-actions/compare.png`,
} as const;

export const joseonInventoryStateAssets = {
  basic: `${root}/inventory-states/basic.png`,
  new: `${root}/inventory-states/new.png`,
  selected: `${root}/inventory-states/selected.png`,
  inUse: `${root}/inventory-states/in-use.png`,
  combinable: `${root}/inventory-states/combinable.png`,
  resolved: `${root}/inventory-states/resolved.png`,
  locked: `${root}/inventory-states/locked.png`,
  keyEvidence: `${root}/inventory-states/key-evidence.png`,
} as const;

export const joseonSatoSkillAssets = {
  searchWarrant: {
    name: "압수수색패",
    commandPlaque: `${root}/tools/search-command-plaque.png`,
    warrant: `${root}/tools/warrant-rolled.png`,
    states: ["chest-sealed", "chest-unsealed", "chest-open", "hidden-tray", "door-sealed", "door-unsealed", "door-open", "evidence-key"].map(
      (file) => `${root}/search-warrant/${file}.png`,
    ),
  },
  registryLookup: {
    name: "호적조회령",
    commandPlaque: `${root}/tools/registry-lookup-plaque.png`,
    workbench: `${root}/registry-lookup/workbench-v1.webp`,
    objects: ["register-closed", "register-open", "hopae-rubbing", "household-record-slip", "lookup-marker", "rubbing-kit", "match-result", "mismatch-result"].map(
      (file) => `${root}/registry-lookup/objects/${file}.png`,
    ),
  },
  officialSeal: {
    name: "관인 확정",
    workbench: `${root}/official-seal/workbench-v1.webp`,
    inkPad: `${root}/tools/cinnabar-ink-pad.png`,
    objects: ["seal-dry", "seal-inked", "seal-hovering", "seal-pressed", "verdict-rolled", "verdict-open", "verdict-confirmed", "seal-imprint"].map(
      (file) => `${root}/official-seal/objects/${file}.png`,
    ),
  },
} as const;
