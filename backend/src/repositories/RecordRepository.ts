import { Types, FilterQuery } from 'mongoose';
import { FinancialRecordModel, IFinancialRecord } from '../models/FinancialRecord.model';
import { RecordType } from '../models/enums';

export interface RecordFilters {
  userId?: string;
  type?: string;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

export class RecordRepository {
  async findById(id: string): Promise<IFinancialRecord | null> {
    return FinancialRecordModel.findOne({ _id: id, deletedAt: null });
  }

  async findWithFilters(filters: RecordFilters): Promise<{ data: IFinancialRecord[], total: number }> {
    const query: FilterQuery<IFinancialRecord> = { deletedAt: null };
    
    if (filters.userId) query.userId = new Types.ObjectId(filters.userId);
    if (filters.type) query.type = filters.type;
    if (filters.category) query.category = filters.category;
    
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = filters.startDate;
      if (filters.endDate) query.date.$lte = filters.endDate;
    }

    if (filters.search) {
      query.$or = [
        { notes: { $regex: filters.search, $options: 'i' } },
        { category: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    // For dashboard cases where we might want all records, we still support limit: -1
    // but the new aggregation methods should be preferred for dashboarding.
    if (filters.limit === -1) {
      const data = await FinancialRecordModel.find(query).sort({ date: -1 });
      return { data, total: data.length };
    }

    const [data, total] = await Promise.all([
      FinancialRecordModel.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      FinancialRecordModel.countDocuments(query)
    ]);

    return { data, total };
  }

  async getAggregateSummary(userId?: string) {
    const match: FilterQuery<IFinancialRecord> = { deletedAt: null };
    if (userId) match.userId = new Types.ObjectId(userId);

    const result = await FinancialRecordModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', RecordType.Income] }, '$amount', 0] }
          },
          totalExpense: {
            $sum: { $cond: [{ $eq: ['$type', RecordType.Expense] }, '$amount', 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalIncome: 1,
          totalExpense: 1,
          balance: { $subtract: ['$totalIncome', '$totalExpense'] }
        }
      }
    ]);

    return result[0] || { totalIncome: 0, totalExpense: 0, balance: 0 };
  }

  async getCategoryBreakdown(userId?: string, type: string = RecordType.Expense) {
    const match: FilterQuery<IFinancialRecord> = { deletedAt: null, type };
    if (userId) match.userId = new Types.ObjectId(userId);

    const result = await FinancialRecordModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Reshape to { categoryName: total }
    return result.reduce((acc, curr) => {
      acc[curr._id] = curr.total;
      return acc;
    }, {} as Record<string, number>);
  }

  async getMonthlyTrends(userId?: string) {
    const match: FilterQuery<IFinancialRecord> = { deletedAt: null };
    if (userId) match.userId = new Types.ObjectId(userId);

    return FinancialRecordModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          income: {
            $sum: { $cond: [{ $eq: ['$type', RecordType.Income] }, '$amount', 0] }
          },
          expense: {
            $sum: { $cond: [{ $eq: ['$type', RecordType.Expense] }, '$amount', 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $toString: '$_id.month' }
            ]
          },
          income: 1,
          expense: 1,
          balance: { $subtract: ['$income', '$expense'] }
        }
      },
      { $sort: { month: 1 } }
    ]);
  }

  async create(data: Partial<IFinancialRecord>): Promise<IFinancialRecord> {
    const record = new FinancialRecordModel(data);
    return record.save();
  }

  async update(id: string, data: Partial<IFinancialRecord>): Promise<IFinancialRecord | null> {
    return FinancialRecordModel.findByIdAndUpdate(id, data, { new: true });
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await FinancialRecordModel.findByIdAndUpdate(id, { deletedAt: new Date() });
    return !!result;
  }
}
