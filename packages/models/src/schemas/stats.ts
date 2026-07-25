import * as yup from 'yup';

export const statsSchema = yup.object({
  totalListeners: yup.number().integer().min(0).required(),
});

export type Stats = yup.InferType<typeof statsSchema>;
