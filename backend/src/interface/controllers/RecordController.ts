import { Request, Response, NextFunction } from 'express';
import { RecordService } from '../../services/RecordService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Role } from '../../models/enums';

export class RecordController {
  constructor(private recordService: RecordService) {
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const record = await this.recordService.createRecord(req.user!.userId, req.body);
      res.status(201).json(record);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const records = await this.recordService.getRecords(
        req.user!.userId, 
        req.user!.role as Role, 
        req.query
      );
      res.status(200).json(records);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const record = await this.recordService.updateRecord(
        req.params.id as string, 
        req.user!.userId, 
        req.user!.role as Role, 
        req.body
      );
      res.status(200).json(record);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await this.recordService.deleteRecord(
        req.params.id as string, 
        req.user!.userId, 
        req.user!.role as Role
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
