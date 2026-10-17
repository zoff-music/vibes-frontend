export function documentPreloads(stylesUrl: string, fontUrls: string[]) {
  return [
    ...fontUrls.map(
      (url) => `<${url}>; rel=preload; as=font; type="font/woff2"; crossorigin`,
    ),
    `<${stylesUrl}>; rel=preload; as=style`,
  ];
}

export function assetBase(origin: string | undefined, base: string) {
  if (!origin) return base;

  const url = new URL(origin);

  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error('ASSET_ORIGIN must be an HTTPS origin without a path');
  }

  return `${url.origin}${base}`;
}
