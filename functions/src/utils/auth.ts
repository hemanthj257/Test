import { Request, Response, NextFunction } from 'express';
import { unauthorizedException } from './apiErrorHandler';
import { logger } from 'firebase-functions/v1';

export const isAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bearer = req.headers['authorization'];
    if (!bearer) throw unauthorizedException('No token provided');

    
    const token = bearer.split(' ')[1];
    if (!token) throw unauthorizedException('Malformed token');

    // Verify the token (assuming you have a verifyToken function)
    const decodedToken = await verifyToken(token);
    if (!decodedToken) throw unauthorizedException('Invalid token');

    req.user = { user_id: decodedToken.user_id, name: decodedToken.name };

    req.user = { user_id: undefined, name: '' };
    next();
  } catch (err) {
    logger.warn(err);
    next(err);
  }
};
import * as admin from 'firebase-admin';

async function verifyToken(token: string) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw unauthorizedException('Invalid token');
  }
}

