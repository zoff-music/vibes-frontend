import { z } from 'zod';
import { sourceTypeSchema } from './playlist';

export const providersSchema = z.compile(z.array(sourceTypeSchema));
export type Providers = z.infer<typeof providersSchema>;
