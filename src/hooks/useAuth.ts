import { useState, useEffect } from 'react';

export interface UserData {
  customer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  age?: number;
  gender?: string;
  nationality?: string;
  phone?: string;
  profile_url?: string;
  created_at?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Load user data from localStorage on mount
    const loadUserData = () => {
      try {
        const userDataString = localStorage.getItem('userData');
        if (userDataString) {
          const userData: UserData = JSON.parse(userDataString);
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    loadUserData();

    // Listen for storage changes (for multi-tab support)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userData') {
        loadUserData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const logout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    localStorage.removeItem('booking_reference_id'); // Clear booking reference on logout
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData: UserData) => {
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  return {
    user,
    isAuthenticated,
    logout,
    updateUser,
  };
};
