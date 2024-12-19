import { Request, Response, NextFunction } from 'express';
import { logger } from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { decodeJwt, encodeJwt } from '../../../utils/jwt';
import * as service from './auth.service';
import { getCurrentJST } from '../../../utils/dayjs';
import {
  badImplementationException,
  dataNotExistException,
  unauthorizedException,
} from '../../../utils/apiErrorHandler';
import { getUser, getUserByEmail, updateUserFields } from '../../../models/user';
import { User } from '../../../models/user/user.entity';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, phone, address } = req.body;

    await service.createUser(email, password, name, phone, address);
    res.status(200).json();
  } catch (err: any) {
    logger.error(err);
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id } = req.user;
    if (!user_id) throw badImplementationException('user_id is not set properly');

    const { ACCESS_TOKEN_EXPIRED_IN, REFRESH_TOKEN_EXPIRED_IN } = process.env;

    const accessToken = encodeJwt({ id: user_id }, ACCESS_TOKEN_EXPIRED_IN || '1m', 'access');
    const refreshToken = encodeJwt({ id: user_id }, REFRESH_TOKEN_EXPIRED_IN || '2m', 'refresh');

    // Update refresh token
    const userRef = admin.firestore().collection('users').doc(user_id);
    await userRef.update({
      refreshToken,
      updated_at: new Date().toISOString(),
    });

    // Call updateUserFields function
    await updateUserFields(user_id, { refreshToken });

    res.status(200).json({ accessToken, refreshToken });
  } catch (err: any) {
    logger.error(err);
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id } = req.user;
    if (!user_id) throw badImplementationException('user_id is not set properly');

    // Update user to make the refresh token null
    await updateUserFields(user_id, { refresh_token: null });

    res.status(200).json();
  } catch (err) {
    logger.error(err);
    next(err);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    // Get user details by email
    const user = await getUserByEmail(email);
    if (!user) throw dataNotExistException('Email does not register');
    if (user.status !== 'active') throw unauthorizedException('This user is unauthorized.');

    // Call service to handle forgot password logic
    await service.forgotPassword(user as User);

    res.status(200).json();
  } catch (err: any) {
    logger.error(err);
    next(err);
  }
};

export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password, tokenId } = req.body;

    await service.updatePassword(password, tokenId);

    res.status(200).json();
  } catch (err: any) {
    logger.error(err);
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    const decoded = decodeJwt(refreshToken, 'refresh');

    // Get user by id
    if (!decoded) throw unauthorizedException('Invalid refresh token');
    if (typeof decoded === 'string' || !decoded.payload) throw unauthorizedException('Invalid token format');
    const user = await getUser(decoded.payload.id);
    if (!user) throw unauthorizedException('User does not exist');
    if (user.status !== 'active') throw unauthorizedException('This user is not active');
    if (user.refresh_token !== refreshToken) throw unauthorizedException('Refresh token is not valid');

    const { ACCESS_TOKEN_EXPIRED_IN, REFRESH_TOKEN_EXPIRED_IN } = process.env;

    const accessToken = encodeJwt({ id: user.user_id }, ACCESS_TOKEN_EXPIRED_IN || '5m', 'access');
    const newRefreshToken = encodeJwt({ id: user.user_id }, REFRESH_TOKEN_EXPIRED_IN || '30d', 'refresh');

    // Update refresh token
    await updateUserFields(user.user_id, { refresh_token: newRefreshToken });

    res.status(200).json({ accessToken, refreshToken: newRefreshToken });
  } catch (err: any) {
    logger.error(err);
    next(err);
  }
};
