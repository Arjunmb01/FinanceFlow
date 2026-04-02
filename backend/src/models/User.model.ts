import mongoose, { Schema, Document } from 'mongoose';
import { Role } from './enums';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: Object.values(Role), default: Role.Viewer },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const UserModel = mongoose.model<IUser>('User', UserSchema);
