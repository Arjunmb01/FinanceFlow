import { RecordRepository } from '../repositories/RecordRepository';
import { Role, RecordType } from '../models/enums';

export class DashboardService {
  constructor(private recordRepository: RecordRepository) {}

  private getTargetUserId(userId: string, userRole: Role, filterUserId?: string): string | undefined {
    // Admin and Analyst can see other users' records if filterUserId is provided.
    // If no filterUserId is provided, Admin/Analyst see all records (undefined targetUserId).
    // Viewers always see only their own records.
    if (userRole === Role.Admin || userRole === Role.Analyst) {
      return filterUserId;
    }
    return userId;
  }

  async getSummary(userId: string, userRole: Role, filterUserId?: string) {
    const targetUserId = this.getTargetUserId(userId, userRole, filterUserId);
    return this.recordRepository.getAggregateSummary(targetUserId);
  }

  async getCategoryBreakdown(userId: string, userRole: Role, type: string = RecordType.Expense, filterUserId?: string) {
    const targetUserId = this.getTargetUserId(userId, userRole, filterUserId);
    return this.recordRepository.getCategoryBreakdown(targetUserId, type);
  }

  async getTrends(userId: string, userRole: Role, filterUserId?: string) {
    const targetUserId = this.getTargetUserId(userId, userRole, filterUserId);
    return this.recordRepository.getMonthlyTrends(targetUserId);
  }
}
