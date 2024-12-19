import { validationResult } from 'express-validator';
import admin from 'firebase-admin'; // Import firebase-admin
import { Request, Response } from 'express';

export const updateAccount = async (req: Request, res: Response) => {
  const { userId } = req.user as unknown as { userId: string }; // Assume userId is extracted from a verified JWT token
  const { name, phone, address } = req.body;

  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Update user account in Firestore
    const userRef = admin.firestore().collection('users').doc(userId);
    await userRef.update({
      name,
      phone,
      address,
      updated_at: new Date().toISOString(),
    });

    return res.status(200).json({ message: 'Account updated successfully.' });
  } catch (error) {
    console.error('Error updating account:', error);
    return res.status(500).json({ message: 'Failed to update account.' });
  }
};



export const updatePassword = async (req: Request, res: Response) => {
  const { user_id: userId } = req.user as unknown as { user_id: string }; // Assume userId is extracted from a verified JWT token
  const { newPassword } = req.body;

  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Update user password in Firebase Authentication
    const user = await admin.auth().getUser(userId);
    await admin.auth().updateUser(userId, {
      password: newPassword,
    });

    return res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json({ message: 'Failed to update password.' });
  }
};
