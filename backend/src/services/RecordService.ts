import { RecordRepository, RecordFilters } from '../repositories/RecordRepository';
import { Role } from '../models/enums';
import { IFinancialRecord } from '../models/FinancialRecord.model';

export class RecordService {
  constructor(private recordRepository: RecordRepository) {}

  async createRecord(userId: string, data: Partial<IFinancialRecord>) {
    return this.recordRepository.create({ ...data, userId } as any);
  }

  async getRecords(userId: string, userRole: Role, filters: { page?: string | number; limit?: string | number; userId?: string; type?: string; category?: string; search?: string }) {
    const isAdminOrAnalyst = userRole === Role.Admin || userRole === Role.Analyst;
    
    // Logic: 
    // Admin/Analyst can filter by any userId if filters.userId is provided.
    // If not provided, they see all records (undefined targetUserId).
    // Viewers always see only their own records.
    let targetUserId: string | undefined = userId;
    if (isAdminOrAnalyst) {
      targetUserId = filters.userId;
    }

    const parsedFilters: RecordFilters = {
      ...filters,
      userId: targetUserId,
      page: typeof filters.page === 'string' ? parseInt(filters.page) : (filters.page || 1),
      limit: typeof filters.limit === 'string' ? parseInt(filters.limit) : (filters.limit || 10),
    };

    return this.recordRepository.findWithFilters(parsedFilters);
  }

  async updateRecord(id: string, userId: string, userRole: Role, data: Partial<IFinancialRecord>) {
    const record = await this.recordRepository.findById(id);
    if (!record) {
      const error = new Error('Record not found');
      (error as any).statusCode = 404;
      throw error;
    }

    // Role Enforcement: Only owner or Admin can update. 
    // Analysts can ONLY view/analyze, not update records.
    if (record.userId.toString() !== userId && userRole !== Role.Admin) {
      const error = new Error('Forbidden: You do not have permission to update this record');
      (error as any).statusCode = 403;
      throw error;
    }

    return this.recordRepository.update(id, data);
  }

  async deleteRecord(id: string, userId: string, userRole: Role) {
    const record = await this.recordRepository.findById(id);
    if (!record) {
      const error = new Error('Record not found');
      (error as any).statusCode = 404;
      throw error;
    }

    // Role Enforcement: Only owner or Admin can delete.
    if (record.userId.toString() !== userId && userRole !== Role.Admin) {
      const error = new Error('Forbidden: You do not have permission to delete this record');
      (error as any).statusCode = 403;
      throw error;
    }

    await this.recordRepository.softDelete(id);
  }
}
