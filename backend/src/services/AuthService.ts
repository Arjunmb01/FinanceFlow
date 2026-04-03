import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';

import { Role } from '../models/enums';

export interface TokenPayload {
  userId: string;
  role: Role;
  isActive: boolean;
}

export class AuthService {
  private accessSecret: string;
  private refreshSecret: string;

  constructor(
    private userRepository: UserRepository
  ) {
    this.accessSecret = process.env.JWT_SECRET || 'access_secret';
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
  }

  generateTokens(payload: TokenPayload) {
    const accessToken = jwt.sign(payload, this.accessSecret, { expiresIn: '1h' });
    const refreshToken = jwt.sign(payload, this.refreshSecret, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, this.accessSecret) as TokenPayload;
  }

  verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, this.refreshSecret) as TokenPayload;
  }

  async signup(name: string, email: string, passwordPlain: string, role: Role = Role.Viewer) {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await this.userRepository.findByEmail(normalizedEmail);
    if (existing) throw new Error('Email already in use');

    const passwordHash = await bcrypt.hash(passwordPlain, 10);
    const user = await this.userRepository.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
      isActive: true,
    });

    const payload: TokenPayload = { userId: user._id.toString(), role: user.role, isActive: user.isActive };
    const { accessToken, refreshToken } = this.generateTokens(payload);

    return {
      accessToken,
      refreshToken,
      user: { id: user._id.toString(), email: user.email, name: user.name, role: user.role }
    };
  }

  async login(email: string, passwordPlain: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      console.log(`[AuthService] Login failed: User not found (${normalizedEmail})`);
      throw new Error('Invalid credentials');
    }
    if (!user.isActive) throw new Error('Account inactive');

    const isValid = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isValid) {
      console.log(`[AuthService] Login failed: Password mismatch for ${normalizedEmail}`);
      throw new Error('Invalid credentials');
    }

    const payload: TokenPayload = { userId: user._id.toString(), role: user.role, isActive: user.isActive };
    const { accessToken, refreshToken } = this.generateTokens(payload);

    return {
      accessToken,
      refreshToken,
      user: { id: user._id.toString(), email: user.email, name: user.name, role: user.role }
    };
  }

  async refreshTokens(oldRefreshToken: string) {
    try {
      const payload = this.verifyRefreshToken(oldRefreshToken);
      
      const newPayload: TokenPayload = { 
        userId: payload.userId, 
        role: payload.role, 
        isActive: payload.isActive 
      };
      
      const { accessToken, refreshToken } = this.generateTokens(newPayload);

      return { accessToken, refreshToken };
    } catch (e) {
      throw new Error('Invalid refresh token');
    }
  }

  async logout(_refreshToken: string) {
    // With stateless JWT, server-side logout is a no-op.
    // The client/controller must clear the cookie.
  }
}
