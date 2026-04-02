import mongoose, { Schema, Document, Types } from 'mongoose';
import { RecordType, RecordCategory } from './enums';

export interface IFinancialRecord extends Document {
  userId: Types.ObjectId;
  amount: number;
  type: RecordType;
  category: RecordCategory;
  date: Date;
  notes: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const FinancialRecordSchema = new Schema<IFinancialRecord>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: Object.values(RecordType), required: true, index: true },
  category: { type: String, enum: Object.values(RecordCategory), required: true, index: true },
  date: { type: Date, required: true, index: true },
  notes: { type: String, default: null },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

export const FinancialRecordModel = mongoose.model<IFinancialRecord>('FinancialRecord', FinancialRecordSchema);
