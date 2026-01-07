import { UserProfile } from "../types";

// In a real production environment, you would use Firebase Auth or Google Identity Services here.
// For this standalone app, we simulate the OAuth flow to provide the exact UI/UX required.

const MOCK_USER: UserProfile = {
  id: 'user_12345',
  name: 'Pilgrim Guest',
  email: 'guest@example.com',
  photoURL: 'https://picsum.photos/seed/me/100'
};

export const authService = {
  loginWithGoogle: async (): Promise<UserProfile> => {
    // Simulate network delay for production feel
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In production: const result = await signInWithPopup(auth, provider);
    const user = { ...MOCK_USER, name: 'Genna Pilgrim' }; // Simulating a fetched profile
    try {
      localStorage.setItem('genna_user', JSON.stringify(user));
    } catch (e) {
      console.warn("Could not save user to localStorage", e);
    }
    return user;
  },

  logout: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.removeItem('genna_user');
    localStorage.removeItem('genna_score'); 
  },

  getCurrentUser: (): UserProfile | null => {
    try {
      const stored = localStorage.getItem('genna_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error("Failed to parse stored user", e);
      localStorage.removeItem('genna_user');
      return null;
    }
  }
};