export type AuthProviderKind = 'password' | 'google.com';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  preferredCityId: string;
  preferredLanguages: string[];
  authProvider: AuthProviderKind;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileUpdateInput {
  displayName: string;
  phone?: string;
  preferredCityId: string;
  preferredLanguages: string[];
}
