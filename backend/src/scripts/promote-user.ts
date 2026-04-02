import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { UserModel } from '../models/User.model';
import { Role } from '../models/enums';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function promoteUser(email: string, role: string) {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance';
  
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    if (!Object.values(Role).includes(role as Role)) {
      console.error(`Invalid role: ${role}. Valid roles are: ${Object.values(Role).join(', ')}`);
      process.exit(1);
    }

    const user = await UserModel.findOneAndUpdate(
      { email },
      { role: role as Role },
      { new: true }
    );

    if (!user) {
      console.error(`User with email ${email} not found.`);
    } else {
      console.log(`Successfully updated user ${user.email} to role: ${user.role}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

const email = process.argv[2];
const role = process.argv[3] || 'analyst';

if (!email) {
  console.log('Usage: npx ts-node -r tsconfig-paths/register src/scripts/promote-user.ts <email> [role]');
  process.exit(1);
}

promoteUser(email, role);
