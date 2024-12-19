import { DocumentData } from 'firebase-admin/firestore';

export interface User {
  user_id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  refresh_token: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export const UserDocument = (data: DocumentData): User => {
  return {
    user_id: data.user_id,
    email: data.email,
    password: data.password,
    name: data.name,
    phone: data.phone,
    address: data.address,
    status: data.status,
    refresh_token: data.refresh_token,
    created_at: data.created_at,
    updated_at: data.updated_at,
    deleted_at: data.deleted_at,
  };
};
