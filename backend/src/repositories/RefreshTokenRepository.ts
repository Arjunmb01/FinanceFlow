import { RefreshTokenModel, IRefreshToken } from '../models/RefreshToken.model';

export class RefreshTokenRepository {
  async saveToken(userId: string, token: string, expiresAt: Date): Promise<IRefreshToken> {
    const rToken = new RefreshTokenModel({ userId, token, expiresAt });
    return rToken.save();
  }

  async findToken(token: string): Promise<IRefreshToken | null> {
    return RefreshTokenModel.findOne({ token, isRevoked: false });
  }

  async revokeToken(token: string): Promise<void> {
    await RefreshTokenModel.updateOne({ token }, { isRevoked: true });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await RefreshTokenModel.updateMany({ userId }, { isRevoked: true });
  }
}
