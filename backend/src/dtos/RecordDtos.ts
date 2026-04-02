import { z } from 'zod';
import { RecordType, RecordCategory } from '../models/enums';

export const CreateRecordSchema = z.object({
  amount: z.number().positive(),
  type: z.nativeEnum(RecordType),
  category: z.nativeEnum(RecordCategory),
  date: z.string().transform((str) => new Date(str)),
  notes: z.string().nullable().optional(),
});

export const UpdateRecordSchema = z.object({
  amount: z.number().positive().optional(),
  type: z.nativeEnum(RecordType).optional(),
  category: z.nativeEnum(RecordCategory).optional(),
  date: z.string().transform((str) => new Date(str)).optional(),
  notes: z.string().nullable().optional(),
});
