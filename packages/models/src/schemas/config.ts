import * as z from 'zod/mini';
import { sourceTypeSchema } from './playlist';

export const providersSchema = /* @__PURE__ */ z.compile(
  z.array(sourceTypeSchema),
);

export type Providers = z.infer<typeof providersSchema>;
