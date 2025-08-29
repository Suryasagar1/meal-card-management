import { Role, User } from '../types';
import { dbClient } from './database';

export const mockLogin = async (credentials: { email?: string, name?: string }, role: Role): Promise<User | null> => {
  const user = await dbClient.users.findOne({ ...credentials, role });
  return user;
};

export const mockLogout = (): void => {
  // In a real app, this would invalidate a token.
  // Here, we don't need to do anything as state is managed in AuthContext.
};