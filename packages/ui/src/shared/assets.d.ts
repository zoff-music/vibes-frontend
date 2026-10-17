declare module '*.js?no-inline&url' {
  const url: string;
  export default url;
}

declare module '*.js?raw' {
  const source: string;
  export default source;
}
