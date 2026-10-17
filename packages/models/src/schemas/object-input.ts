import * as v from 'valibot';

// Valibot objects accept arrays when every property is optional. API object
// payloads must retain the previous rejection of array input before stripping.
export const objectInputSchema = v.custom<Record<string, unknown>>(
  (value) =>
    value !== null && typeof value === 'object' && !Array.isArray(value),
  'Expected an object.',
);
