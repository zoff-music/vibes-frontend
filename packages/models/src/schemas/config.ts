import * as v from 'valibot';
import { sourceTypeSchema } from './playlist';

export const providersSchema = /* @__PURE__ */ v.array(sourceTypeSchema);

export type Providers = v.InferOutput<typeof providersSchema>;
