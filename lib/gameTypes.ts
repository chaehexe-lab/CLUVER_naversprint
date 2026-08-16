export type DreamOption = {
  id?: string;
  state: string;
  kicker: string;
  title: string;
  description: string;
  meta: string;
  image: string;
  disabled: boolean;
  ariaLabel?: string;
};

export type SceneHotspot = {
  id?: string;
  className?: string;
  evidenceName?: string;
  ariaLabel: string;
  x: string;
  y: string;
  w: string;
  h: string;
  clipPath?: string;
  radius?: string;
  rot?: string;
};

export type SceneDockAction = {
  id?: string;
  className: string;
  ariaLabel: string;
  image: string;
  label: string;
  goTo?: string;
};

export type SceneProp = {
  image: string;
  alt: string;
  className?: string;
  x: string;
  y: string;
  w: string;
  rot?: string;
};

export type SceneInspect = {
  id: string;
  image: string;
  title: string;
  text: string;
  buttonId?: string;
  buttonLabel?: string;
  closeButtonId?: string;
  closeButtonLabel?: string;
};

export type InvestigationSceneData = {
  id: string;
  image: string;
  alt: string;
  props: readonly SceneProp[];
  hotspots: readonly SceneHotspot[];
  dock: readonly SceneDockAction[];
  inspect?: SceneInspect;
};
