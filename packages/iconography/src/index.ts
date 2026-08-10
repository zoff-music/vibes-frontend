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

export const trashIcon = {
  viewBox: squareViewBox,
  paths: ['M8 1h8v3h5v4h-2v14H5V8H3V4h5zm1 3h6V3H9zm0 5v9h2V9zm4 0v9h2V9z'],
} satisfies IconDefinition;

export const voteIcon = {
  viewBox: squareViewBox,
  paths: ['M2 10h4v11H2zm6-2h2V3h4v2h2v5h5v3h-2v6h-2v2H8z'],
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
    'M8 2h8v2h3v3h2v10h-2v3h-3v2H8v-2H5v-3H3V7h2V4h3zm4 4H8v2H6v8h2v2h4z',
  ],
} satisfies IconDefinition;

export const diceIcon = {
  viewBox: squareViewBox,
  paths: [
    'M5 2h14v2h3v15h-3v3H5v-3H2V5h3zm2 4v3h3V6zm7 0v3h3V6zm-4 6v3h4v-3zm-3 5v3h3v-3zm7 0v3h3v-3z',
  ],
} satisfies IconDefinition;
