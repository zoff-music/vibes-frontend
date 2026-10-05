/// <reference types="vite/client" />

declare module '*.js?no-inline&url' {
  const url: string;
  export default url;
}
