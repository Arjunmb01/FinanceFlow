import { Router } from 'express';
import { setupDependencies } from '../../config/dependencyContainer';
import { createAuthMiddleware, requireRoles } from '../middlewares/authMiddleware';
import { validateDto } from '../middlewares/validateDto';
import { LoginSchema, SignupSchema, CreateUserSchema, UpdateUserStatusSchema } from '../../dtos/AuthDtos';
import { CreateRecordSchema, UpdateRecordSchema } from '../../dtos/RecordDtos';
import { Role } from '../../models/enums';

export const createRouter = () => {
  const router = Router();
  const { authService, controllers } = setupDependencies();
  
  const authMiddleware = createAuthMiddleware(authService);
  const adminOnly = requireRoles([Role.Admin]);
  const adminOrAnalyst = requireRoles([Role.Admin, Role.Analyst]);
  const allRoles = requireRoles([Role.Admin, Role.Analyst, Role.Viewer]);

  // Auth Routes
  router.post('/auth/signup', validateDto(SignupSchema), controllers.authController.signup);
  router.post('/auth/login', validateDto(LoginSchema), controllers.authController.login);
  router.post('/auth/refresh', controllers.authController.refresh);
  router.post('/auth/logout', controllers.authController.logout);

  // User Routes (Admin Operations)
  router.post('/users', authMiddleware, adminOnly, validateDto(CreateUserSchema), controllers.userController.create);
  router.get('/users', authMiddleware, adminOrAnalyst, controllers.userController.getAll);
  router.patch('/users/:id/status', authMiddleware, adminOnly, validateDto(UpdateUserStatusSchema), controllers.userController.updateStatus);

  // Financial Record Routes
  // Strictly enforce: Only ADMIN can create/update/delete.
  router.post('/records', authMiddleware, adminOnly, validateDto(CreateRecordSchema), controllers.recordController.create);
  router.get('/records', authMiddleware, allRoles, controllers.recordController.getAll);
  router.patch('/records/:id', authMiddleware, adminOnly, validateDto(UpdateRecordSchema), controllers.recordController.update);
  router.delete('/records/:id', authMiddleware, adminOnly, controllers.recordController.delete);

  // Dashboard Routes
  // ANALYST and ADMIN can see analytics. VIEWER can also see (but service layer restricts to own data).
  router.get('/dashboard/summary', authMiddleware, allRoles, controllers.dashboardController.getSummary);
  router.get('/dashboard/trends', authMiddleware, allRoles, controllers.dashboardController.getTrends);
  router.get('/dashboard/category-breakdown', authMiddleware, allRoles, controllers.dashboardController.getCategoryBreakdown);

  return router;
};
