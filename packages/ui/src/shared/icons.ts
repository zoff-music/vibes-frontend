export interface IconDefinition {
  paths: readonly string[];
  viewBox: string;
}

const squareViewBox = '0 0 24 24';

export const arrowLeftIcon = {
  viewBox: squareViewBox,
  paths: [
    'M10 4h4v3h-2v2h-2v2H8v2h2v2h2v2h2v3h-4v-2H8v-2H6v-2H4v-4h2V8h2V6h2z',
  ],
} satisfies IconDefinition;

export const arrowRightIcon = {
  viewBox: squareViewBox,
  paths: [
    'M10 4h4v2h2v2h2v2h2v4h-2v2h-2v2h-2v2h-4v-3h2v-2h2v-1H4v-4h10v-1h-2V7h-2z',
  ],
} satisfies IconDefinition;

export const caretIcon = {
  viewBox: squareViewBox,
  paths: ['M4 8h4v2h2v2h4v-2h2V8h4v4h-2v2h-2v2h-2v2h-4v-2H8v-2H6v-2H4z'],
} satisfies IconDefinition;

export const sunIcon = {
  viewBox: squareViewBox,
  paths: [
    'M10 2h4v4h-4zM10 18h4v4h-4zM2 10h4v4H2zM18 10h4v4h-4zM4 4h3v2h2v3H6V7H4zM17 4h3v3h-2v2h-3V6h2zM4 17h2v-2h3v3H7v2H4zM15 15h3v2h2v3h-3v-2h-2zM9 8h6v2h2v6h-2v2H9v-2H7v-6h2zm2 3v4h4v-4z',
  ],
} satisfies IconDefinition;

export const moonIcon = {
  viewBox: squareViewBox,
  paths: [
    'M9 2h7v3h-3v2h-2v4h2v2h4v-2h3v7h-2v2h-3v2H9v-2H6v-2H4v-3H2V9h2V6h2V4h3z',
  ],
} satisfies IconDefinition;

export const shareIcon = {
  viewBox: squareViewBox,
  paths: [
    'M16 2h6v6h-6z',
    'M2 9h6v6H2z',
    'M16 16h6v6h-6z',
    'M8 10h3V8h2V6h3v3h-2v2h-3v2H8z',
    'M8 13h3v2h3v2h2v3h-3v-2h-2v-2H8z',
  ],
} satisfies IconDefinition;

export const settingsIcon = {
  viewBox: squareViewBox,
  paths: [
    'M9 1h6v3h3v2h2v3h3v6h-3v3h-2v2h-3v3H9v-3H6v-2H4v-3H1V9h3V6h2V4h3zm1 7H8v2H6v4h2v2h2v2h4v-2h2v-2h2v-4h-2V8h-2V6h-4zm1 2h2v1h1v2h-1v1h-2v-1h-1v-2h1z',
  ],
} satisfies IconDefinition;

export const closeIcon = {
  viewBox: squareViewBox,
  paths: [
    'M4 3h4v4h2v2h4V7h2V3h4v5h-2v2h-2v4h2v2h2v5h-4v-4h-2v-2h-4v2H8v4H4v-5h2v-2h2v-4H6V8H4z',
  ],
} satisfies IconDefinition;

export const searchIcon = {
  viewBox: squareViewBox,
  paths: [
    'M6 2h8v2h3v3h2v7h-2v2h2v2h2v4h-4v-2h-2v-2h-2v1H6v-2H3v-3H1V7h2V4h3zm1 4H5v8h2v2h6v-2h2V7h-2V5H7z',
  ],
} satisfies IconDefinition;

export const sparklesIcon = {
  viewBox: squareViewBox,
  paths: [
    'M10 1h4v4h2v2h4v4h-4v2h-2v4h-4v-4H8v-2H4V7h4V5h2zm1 7v2h2V8zm7 6h3v2h2v3h-2v2h-3v-2h-2v-3h2zM3 14h3v3h3v3H6v3H3v-3H0v-3h3z',
  ],
} satisfies IconDefinition;

export const infoIcon = {
  viewBox: squareViewBox,
  paths: [
    'M8 2h8v2h3v3h2v10h-2v3h-3v2H8v-2H5v-3H3V7h2V4h3zm2 4v4h4V6zm0 6v6h4v-6z',
  ],
} satisfies IconDefinition;

export const alertIcon = {
  viewBox: squareViewBox,
  paths: [
    'M9 1h6v2h2v4h2v4h2v8h-2v2H5v-2H3v-8h2V7h2V3h2zm1 6v7h4V7zm0 9v3h4v-3z',
  ],
} satisfies IconDefinition;

export const copyIcon = {
  viewBox: squareViewBox,
  paths: ['M3 2h13v4h5v16H8v-4H3zm3 4v10h2V6zm5 3v10h7V9z'],
} satisfies IconDefinition;

export const checkIcon = {
  viewBox: squareViewBox,
  paths: [
    'M2 10h4v3h2v2h2v-2h2v-2h2V9h2V7h2V5h4v4h-2v2h-2v2h-2v2h-2v2h-2v2H8v-2H6v-2H4v-2H2z',
  ],
} satisfies IconDefinition;

export const checkCircleIcon = {
  viewBox: squareViewBox,
  paths: [
    'M8 2h8v2h3v3h2v10h-2v3h-3v2H8v-2H5v-3H3V7h2V4h3zm1 8H7v4h2v2h4v-2h2v-2h2V8h-4v2h-2v2H9z',
  ],
} satisfies IconDefinition;

export const trashIcon = {
  viewBox: squareViewBox,
  paths: ['M8 1h8v3h5v4h-2v14H5V8H3V4h5zm1 3h6V3H9zm0 5v9h2V9zm4 0v9h2V9z'],
} satisfies IconDefinition;

export const voteIcon = {
  viewBox: squareViewBox,
  paths: ['M2 10h4v11H2zm6-2h2V3h4v2h2v5h5v3h-2v6h-2v2H8z'],
} satisfies IconDefinition;

export const homeIcon = {
  viewBox: squareViewBox,
  paths: [
    'M10 2h4v2h2v2h2v2h2v14h-7v-6h-2v6H4V8h2V6h2V4h2zm0 5H8v2H6v10h3v-6h6v6h3V9h-2V7h-2V5h-4z',
  ],
} satisfies IconDefinition;

export const queueIcon = {
  viewBox: squareViewBox,
  paths: ['M3 3h18v5H3zm0 7h18v5H3zm0 7h12v5H3zm14 0h4v5h-4z'],
} satisfies IconDefinition;

export const playIcon = {
  viewBox: squareViewBox,
  paths: ['M5 3h5v2h3v2h3v2h3v2h2v2h-2v2h-3v2h-3v2h-3v2H5z'],
} satisfies IconDefinition;

export const pauseIcon = {
  viewBox: squareViewBox,
  paths: ['M4 3h6v18H4zM14 3h6v18h-6z'],
} satisfies IconDefinition;

export const skipIcon = {
  viewBox: squareViewBox,
  paths: ['M2 3h4v3h3v3h3v2h2V3h4v3h2v3h2v6h-2v3h-2v3h-4v-8h-2v2H9v3H6v3H2z'],
} satisfies IconDefinition;

export const resetIcon = {
  viewBox: squareViewBox,
  paths: [
    'M5 3h4v2h8v2h2v2h2v8h-2v2h-2v2H7v-2H5v-2H3v-4h4v2h2v2h6v-2h2V9h-2V7H9v2H7v2H3V3z',
  ],
} satisfies IconDefinition;

export const volumeIcon = {
  viewBox: squareViewBox,
  paths: [
    'M3 9h4V7h2V5h2V3h3v18h-3v-2H9v-2H7v-2H3zm13-2h3v2h2v6h-2v2h-3v-3h1v-4h-1z',
  ],
} satisfies IconDefinition;

export const volumeMutedIcon = {
  viewBox: squareViewBox,
  paths: [
    'M3 9h4V7h2V5h2V3h3v18h-3v-2H9v-2H7v-2H3zM17 8h3v3h2v3h-2v3h-3v-3h-2v-3h2z',
  ],
} satisfies IconDefinition;

export const spinnerIcon = {
  viewBox: squareViewBox,
  paths: [
    'M8 2h8v2h3v3h2v4h-4V9h-2V7H9v2H7v6h2v2h4v4H8v-2H5v-3H3V8h2V5h3zM15 15h4v2h-2v2h-2z',
  ],
} satisfies IconDefinition;

export const externalLinkIcon = {
  viewBox: squareViewBox,
  paths: [
    'M13 2h9v9h-4V8h-2v2h-2v2h-2v2H8v-4h2V8h2V6h1zM3 5h8v4H7v10h10v-4h4v8H3z',
  ],
} satisfies IconDefinition;

export const castIcon = {
  viewBox: squareViewBox,
  paths: [
    'M2 2h20v18h-8v-4h4V6H6v4H2zM2 13h3v2H2zm0 4h3v2h2v3H2zm7 5v-2H7v-3H5v-2h4v2h2v5z',
  ],
} satisfies IconDefinition;

export const youTubeProviderIcon = {
  viewBox: squareViewBox,
  paths: [
    'M21.8 7.2c-.2-1-1-1.8-2-2-1.8-.4-7.8-.4-7.8-.4s-6 0-7.8.4c-1 .2-1.8 1-2 2C2 9 2 12 2 12s0 3 .4 4.8c.2 1 1 1.8 2 2 1.8.4 7.8.4 7.8.4s6 0 7.8-.4c1-.2 1.8-1 2-2 .4-1.8.4-4.8.4-4.8s0-3-.4-4.8zM10 15.5v-7l6 3.5-6 3.5z',
  ],
} satisfies IconDefinition;

export const soundCloudProviderIcon = {
  viewBox: squareViewBox,
  paths: [
    'M23.999 14.165c-.052 1.796-1.612 3.169-3.4 3.169h-8.18a.68.68 0 0 1-.675-.683V7.862a.747.747 0 0 1 .452-.724s.75-.513 2.333-.513a5.364 5.364 0 0 1 2.763.755 5.433 5.433 0 0 1 2.57 3.54c.282-.08.574-.121.868-.12.884 0 1.73.358 2.347.992s.948 1.49.922 2.373ZM10.721 8.421c.247 2.98.427 5.697 0 8.672a.264.264 0 0 1-.53 0c-.395-2.946-.22-5.718 0-8.672a.264.264 0 0 1 .53 0ZM9.072 9.448c.285 2.659.37 4.986-.006 7.655a.277.277 0 0 1-.55 0c-.331-2.63-.256-5.02 0-7.655a.277.277 0 0 1 .556 0Zm-1.663-.257c.27 2.726.39 5.171 0 7.904a.266.266 0 0 1-.532 0c-.38-2.69-.257-5.21 0-7.904a.266.266 0 0 1 .532 0Zm-1.647.77a26.108 26.108 0 0 1-.008 7.147.272.272 0 0 1-.542 0 27.955 27.955 0 0 1 0-7.147.275.275 0 0 1 .55 0Zm-1.67 1.769c.421 1.865.228 3.5-.029 5.388a.257.257 0 0 1-.514 0c-.21-1.858-.398-3.549 0-5.389a.272.272 0 0 1 .543 0Zm-1.655-.273c.388 1.897.26 3.508-.01 5.412-.026.28-.514.283-.54 0-.244-1.878-.347-3.54-.01-5.412a.283.283 0 0 1 .56 0Zm-1.668.911c.4 1.268.257 2.292-.026 3.572a.257.257 0 0 1-.514 0c-.241-1.262-.354-2.312-.023-3.572a.283.283 0 0 1 .563 0Z',
  ],
} satisfies IconDefinition;

export const remoteIcon = {
  viewBox: squareViewBox,
  paths: ['M8 1h8v2h2v18h-2v2H8v-2H6V3h2zm0 4v14h8V5zm2 2h4v2h-4zm1 7h2v2h-2z'],
} satisfies IconDefinition;

export const plusIcon = {
  viewBox: squareViewBox,
  paths: ['M10 2h4v8h8v4h-8v8h-4v-8H2v-4h8z'],
} satisfies IconDefinition;

export const autoThemeIcon = {
  viewBox: squareViewBox,
  paths: [
    'M8 2h8v2h3v3h3v10h-3v3h-3v2H8v-2H5v-3H2V7h3V4h3zm4 4H8v2H6v8h2v2h4z',
  ],
} satisfies IconDefinition;

export const diceIcon = {
  viewBox: squareViewBox,
  paths: [
    'M5 2h14v2h3v15h-3v3H5v-3H2V5h3zm2 4v3h3V6zm7 0v3h3V6zm-4 6v3h4v-3zm-3 5v3h3v-3zm7 0v3h3v-3z',
  ],
} satisfies IconDefinition;

export const zoffIconDefinitions = {
  add: plusIcon,
  auto: autoThemeIcon,
  back: arrowLeftIcon,
  caret: caretIcon,
  cast: castIcon,
  check: checkIcon,
  close: closeIcon,
  external: externalLinkIcon,
  home: homeIcon,
  moon: moonIcon,
  pause: pauseIcon,
  play: playIcon,
  player: playIcon,
  remote: remoteIcon,
  reset: resetIcon,
  scan: searchIcon,
  search: searchIcon,
  settings: settingsIcon,
  share: shareIcon,
  skip: skipIcon,
  sparkles: sparklesIcon,
  sun: sunIcon,
  trash: trashIcon,
  vote: voteIcon,
  volume: volumeIcon,
} satisfies Record<string, IconDefinition>;

export type ZoffIconName = keyof typeof zoffIconDefinitions;
