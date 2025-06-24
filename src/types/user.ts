export interface UserPreferences {
  currency: string;       // Default: 'USD'
  timezone: string;       // For handling multi-device sync
  notifications: {
    billReminders: boolean;
    lowBalance: boolean;
    emailNotifications: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  preferences?: UserPreferences;
  createdAt: Date;
  lastLogin: Date;
}
