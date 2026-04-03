import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../services/AuthService';

export class AuthController {
  constructor(private authService: AuthService) {
    this.signup = this.signup.bind(this);
    this.login = this.login.bind(this);
    this.refresh = this.refresh.bind(this);
    this.logout = this.logout.bind(this);
  }

  private setRefreshTokenCookie(res: Response, role: string, refreshToken: string) {
    const cookieName = `rt_${role}`;
    res.cookie(cookieName, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private clearRefreshTokenCookie(res: Response, role: string) {
    res.clearCookie(`rt_${role}`);
  }

  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      const result = await this.authService.signup(name, email, password);
      
      this.setRefreshTokenCookie(res, result.user.role, result.refreshToken);
      
      const { refreshToken, ...response } = result;
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      
      this.setRefreshTokenCookie(res, result.user.role, result.refreshToken);
      
      const { refreshToken, ...response } = result;
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { role } = req.body; // Frontend must specify which role context to refresh
      if (!role) {
        return res.status(400).json({ error: 'Role context required' });
      }

      const cookieName = `rt_${role}`;
      const refreshToken = req.cookies[cookieName];
      
      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
      }

      const result = await this.authService.refreshTokens(refreshToken);
      
      this.setRefreshTokenCookie(res, role, result.refreshToken);
      
      res.status(200).json({ accessToken: result.accessToken });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { role } = req.body;
      if (role) {
        this.clearRefreshTokenCookie(res, role);
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
