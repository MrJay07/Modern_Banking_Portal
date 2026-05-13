import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

const ACCESS_TOKEN_SECRET = process.env['JWT_SECRET'] || 'access-secret-change-in-production';
const REFRESH_TOKEN_SECRET = process.env['JWT_REFRESH_SECRET'] || 'refresh-secret-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

export const generateRefreshToken = (userId: string): { token: string; tokenId: string } => {
  const tokenId = uuidv4();
  const token = jwt.sign({ userId, tokenId }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
  return { token, tokenId };
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
};

export const getRefreshTokenExpiry = (): Date => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);
  return expiry;
};
