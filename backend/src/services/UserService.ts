import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/UserRepository';
import { Role } from '../models/enums';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async createUser(data: { name: string; email: string; password?: string; role?: Role }) {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      const error = new Error('Email already in use');
      (error as any).statusCode = 400;
      throw error;
    }

    const passwordHash = await bcrypt.hash(data.password || 'TemporaryPassword123!', 10);
    const user = await this.userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role || Role.Viewer,
      isActive: true,
    });

    return { 
      id: user._id.toString(), 
      email: user.email, 
      name: user.name, 
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    };
  }

  async getAllUsers(filters: { page?: string | number; limit?: string | number; search?: string }) {
    const page = typeof filters.page === 'string' ? parseInt(filters.page) : (filters.page || 1);
    const limit = typeof filters.limit === 'string' ? parseInt(filters.limit) : (filters.limit || 10);
    const search = filters.search;

    const { data, total } = await this.userRepository.findPaginated(page, limit, search);
    
    return {
      data: data.map(u => ({ 
        id: u._id.toString(), 
        email: u.email, 
        name: u.name, 
        role: u.role, 
        isActive: u.isActive,
        createdAt: u.createdAt
      })),
      total
    };
  }

  async updateUserStatus(id: string, isActive: boolean) {
    const user = await this.userRepository.update(id, { isActive });
    if (!user) {
      const error = new Error('User not found');
      (error as any).statusCode = 404;
      throw error;
    }
    return {
      id: user._id.toString(),
      email: user.email,
      isActive: user.isActive
    };
  }
}
