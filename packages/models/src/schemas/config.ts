import * as yup from 'yup';
import { sourceTypeSchema } from './songs';

export const providersSchema = yup
  .array(sourceTypeSchema.required())
  .required();
export type Providers = yup.InferType<typeof providersSchema>;
