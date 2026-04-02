import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../services/UserService';

export class UserController {
  constructor(private userService: UserService) {
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.userService.getAllUsers(req.query);
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      await this.userService.updateUserStatus(req.params.id as string, req.body.isActive);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
