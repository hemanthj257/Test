import { badImplementationException } from './apiErrorHandler';
import jwt from 'jsonwebtoken';

export const encodeJwt = (
  payload: string | Record<string, unknown> | Buffer,
  expiresIn: string | number,
  secret: 'refresh' | 'access' | 'default' = 'default',
) => {
  try {
    const SECRET =
      secret === 'refresh'
        ? process.env.JWT_REFRESH_SECRET
        : secret === 'access'
        ? process.env.JWT_ACCESS_SECRET
        : process.env.JWT_SECRET;
    if (!SECRET) throw badImplementationException('SECRET is not defined on env file');

    
    const token = jwt.sign(payload, SECRET, { expiresIn });
    return token;

    return;
  } catch (err: any) {
    throw err;
  }
};

export const decodeJwt = (jwtoken: string, secret: 'refresh' | 'access' | 'default' = 'default') => {
  try {
    const SECRET =
      secret === 'refresh'
        ? process.env.JWT_REFRESH_SECRET
        : secret === 'access'
        ? process.env.JWT_ACCESS_SECRET
        : process.env.JWT_SECRET;
    if (!SECRET) throw badImplementationException('SECRET is not defined on env file');

    
    const decoded = jwt.verify(jwtoken, SECRET);
    return decoded;

    return;
  } catch (err: any) {
    throw err;
  }
};
