import { z } from 'zod';
import { sourceTypeSchema } from './songs';

export const providersSchema = z.compile(z.array(sourceTypeSchema));
export type Providers = z.infer<typeof providersSchema>;
