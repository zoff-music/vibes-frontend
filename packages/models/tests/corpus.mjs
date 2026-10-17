// JSON-safe fixture markers keep dates distinct from API string timestamps.
export function revive(value) {
  if (value?.$date) return new Date(value.$date);
  if (Array.isArray(value)) return value.map(revive);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, revive(item)]),
    );
  }

  return value;
}

const boundaries = [
  undefined,
  null,
  false,
  true,
  0,
  -1,
  1.5,
  NaN,
  Infinity,
  -Infinity,
  Number.MAX_SAFE_INTEGER,
  Number.MAX_SAFE_INTEGER + 1,
  '',
  ' ',
  ' x ',
  '1',
  'Infinity',
  'x'.repeat(101),
  'x'.repeat(501),
  [],
  {},
  new Date('invalid'),
];

// Canonical values avoid V8's different packed/holey array representations.
// Preserve undefined properties, dates, and negative zero, not just JSON output.
export function fingerprint(value) {
  if (value === undefined) return 'undefined';
  if (Object.is(value, -0)) return '-0';
  if (value instanceof Date) return `date:${value.getTime()}`;
  if (Array.isArray(value)) return `[${value.map(fingerprint).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${fingerprint(value[key])}`)
      .join(',')}}`;
  }

  return JSON.stringify(value);
}

export function* cases(input, label = 'root') {
  yield [label, input];
  for (const value of boundaries) yield [`${label}: ${String(value)}`, value];
  if (!input || typeof input !== 'object' || input instanceof Date) return;

  if (!Array.isArray(input)) {
    yield [`${label}: strip unknown`, { ...input, unknownProperty: 'discard' }];
  }

  for (const key of Object.keys(input)) {
    const omitted = Array.isArray(input) ? [...input] : { ...input };
    delete omitted[key];
    yield [`${label}.${key}: omitted`, omitted];

    for (const [description, value] of cases(input[key], `${label}.${key}`)) {
      const changed = Array.isArray(input) ? [...input] : { ...input };
      changed[key] = value;
      yield [description, changed];
    }
  }
}
