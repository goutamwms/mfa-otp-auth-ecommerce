import { useAuthStore } from '../context/AuthContext';

export function useAuth() {
  const { user, pendingEmail, setUser, setPendingEmail, clearPendingEmail } = useAuthStore();

  return {
    user,
    pendingEmail,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    setUser,
    setPendingEmail,
    clearPendingEmail,
  };
}
