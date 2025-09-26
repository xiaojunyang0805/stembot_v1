// Mock auth utilities for UI-only components
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export const mockUser: AuthUser = {
  id: 'mock-user-id',
  email: 'demo@example.com',
  name: 'Demo User'
};

export const signIn = async (email: string, password: string) => {
  // Mock sign in for UI demo
  return { user: mockUser, error: null };
};

export const signUp = async (email: string, password: string) => {
  // Mock sign up for UI demo
  return { user: mockUser, error: null };
};

export const signOut = async () => {
  // Mock sign out for UI demo
  return { error: null };
};

export const createSupabaseClient = () => {
  return null;
};

export const getCurrentSession = async () => {
  return null;
};

export const getUserProfile = async () => {
  return null;
};

export type AuthSession = any;
export type UserProfile = any;