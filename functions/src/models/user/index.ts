import admin from 'firebase-admin';

// Get user by user_id
export const getUser = async (userId: string) => {
  try {
    const userRef = admin.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    return userDoc.data();
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

// Get user by email
export const getUserByEmail = async (email: string) => {
  try {
    const userRef = admin.firestore().collection('users');
    const querySnapshot = await userRef.where('email', '==', email).get();
    if (querySnapshot.empty) {
      throw new Error('User not found');
    }
    return querySnapshot.docs[0].data();
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
};

// Update user fields
export const updateUserFields = async (userId: string, fields: any) => {
  try {
    const userRef = admin.firestore().collection('users').doc(userId);
    await userRef.update({
      ...fields,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating user fields:', error);
    throw error;
  }
};

// Add user
export const addUser = async (user: {
  user_id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
}) => {
  try {
    const userRef = admin.firestore().collection('users').doc(user.user_id);
    await userRef.set({
      ...user,
      refresh_token: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    });
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};
