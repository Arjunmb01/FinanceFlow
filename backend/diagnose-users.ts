import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { UserModel } from './src/models/User.model';

dotenv.config();

async function diagnose() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/finance_db');
    console.log('--- User Diagnostic ---');
    const users = await UserModel.find({}, { name: 1, email: 1, role: 1, isActive: 1 });
    console.table(users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      active: u.isActive
    })));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

diagnose();
