import { UserRepository } from '../repositories/UserRepository';
import { RecordRepository } from '../repositories/RecordRepository';

import { AuthService } from '../services/AuthService';
import { UserService } from '../services/UserService';
import { RecordService } from '../services/RecordService';
import { DashboardService } from '../services/DashboardService';

import { AuthController } from '../interface/controllers/AuthController';
import { UserController } from '../interface/controllers/UserController';
import { RecordController } from '../interface/controllers/RecordController';
import { DashboardController } from '../interface/controllers/DashboardController';

export const setupDependencies = () => {
  // 1. Repositories
  const userRepository = new UserRepository();
  const recordRepository = new RecordRepository();
  const authService = new AuthService(userRepository);
  const userService = new UserService(userRepository);
  const recordService = new RecordService(recordRepository);
  const dashboardService = new DashboardService(recordRepository);

  // 3. Controllers
  const authController = new AuthController(authService);
  const userController = new UserController(userService);
  const recordController = new RecordController(recordService);
  const dashboardController = new DashboardController(dashboardService);

  return {
    authService,
    controllers: {
      authController,
      userController,
      recordController,
      dashboardController
    }
  };
};
