import { logger } from 'firebase-functions/v1';
import bcrypt from 'bcryptjs';
import {
  badImplementationException,
  dataConflictException,
  dataNotExistException,
  HttpException,
  invalidException,
} from '../../../utils/apiErrorHandler';
import { sendMessage } from '../../../utils/sgMailer';
import { hashPassword } from '../../../utils/bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { getAddToCurrentJST, getCurrentJST } from '../../../utils/dayjs';
import { TokenDocument } from '../../../models/token/token.entity';
import { addToken, deleteToken, getToken } from '../../../models/token';
import { MESSAGE_RESET_PASSWORD } from './auth.message';
import { addUser, getUserByEmail, updateUserFields } from '../../../models/user';
import { User } from '../../../models/user/user.entity';


export const createUser = async (email: string, password: string, name: string, phone: string, address: string): Promise<User> => {
  try {
    const user_id = uuidv4();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object
    const user: User = {
      user_id,
      email,
      password: hashedPassword,
      name,
      phone,
      address,
      status: 'active',
      refresh_token: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };

    // Add user to Firestore
    await addUser(user);

    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const forgotPassword = async (user: User) => {
  let error: Error | HttpException | undefined;
  try {
    const newToken: TokenDocument = {
      token_id: uuidv4(),
      user_id: user.user_id,
      token_type: 'resetPassword',
      user_type: 'user',
      created_at: getCurrentJST(),
      expired_at: getAddToCurrentJST(1, 'h'),
    };

    await addToken(newToken);

    const tokenUrl = process.env.FRONTEND_URL + '/user/password/reset/' + newToken.token_id;

    await sendMessage(MESSAGE_RESET_PASSWORD(user.email, tokenUrl));

    return Promise.resolve('success');
  } catch (err) {
    logger.error(err);
    error = err instanceof Error ? err : badImplementationException(err);
    return Promise.reject(error);
  }
};

export const updatePassword = async (password: string, tokenId: string) => {
  let error: Error | HttpException | undefined;
  try {
    const token = await getToken(tokenId);
    if (!token) throw dataNotExistException('Token does not exist');
    if (token.user_type !== 'user') throw invalidException('Token is not valid user type');
    if (token.token_type !== 'resetPassword') throw invalidException('Token is not valid token type');

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await updateUserFields(token.user_id, { password: hashedPassword, updated_at: new Date().toISOString() });

    // Delete the token after password reset
    await deleteToken(tokenId);

    return Promise.resolve();
  } catch (err) {
    console.log(err);
    error = err instanceof Error ? err : badImplementationException(err);
    return Promise.reject(error);
  }
};
