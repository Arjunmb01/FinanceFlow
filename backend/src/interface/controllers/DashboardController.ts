import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../../services/DashboardService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Role } from '../../models/enums';

export class DashboardController {
  constructor(private dashboardService: DashboardService) {
    this.getSummary = this.getSummary.bind(this);
    this.getTrends = this.getTrends.bind(this);
    this.getCategoryBreakdown = this.getCategoryBreakdown.bind(this);
  }

  async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const summary = await this.dashboardService.getSummary(
        req.user!.userId,
        req.user!.role as Role,
        req.query.userId as string | undefined
      );
      res.status(200).json(summary);
    } catch (error) {
      next(error);
    }
  }

  async getTrends(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const trends = await this.dashboardService.getTrends(
        req.user!.userId,
        req.user!.role as Role,
        req.query.userId as string | undefined
      );
      res.status(200).json(trends);
    } catch (error) {
      next(error);
    }
  }

  async getCategoryBreakdown(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const breakdown = await this.dashboardService.getCategoryBreakdown(
        req.user!.userId,
        req.user!.role as Role,
        req.query.type as string | undefined,
        req.query.userId as string | undefined
      );
      res.status(200).json(breakdown);
    } catch (error) {
      next(error);
    }
  }
}
