import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminEmail, getSession, isAdminUser, signInWithPassword, signOut, subscribeToAuthChanges } from '../services/authService';
import {
  clearStoredAdminVerification,
  requestAdminVerificationCode,
  validateStoredAdminVerification,
  verifyAdminEmailCode,
} from '../services/adminVerificationService';
import { isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEmailVerifiedAdmin, setIsEmailVerifiedAdmin] = useState(false);
  const [verificationInfo, setVerificationInfo] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function syncSession(nextSession) {
      if (!active) {
        return;
      }

      if (!nextSession?.user) {
        clearStoredAdminVerification();
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setIsEmailVerifiedAdmin(false);
        setVerificationInfo(null);
        setIsAuthLoading(false);
        return;
      }

      const nextUser = nextSession.user;
      const admin = isAdminUser(nextUser);

      if (!admin) {
        await signOut();
        clearStoredAdminVerification();
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setIsEmailVerifiedAdmin(false);
        setVerificationInfo(null);
        setIsAuthLoading(false);
        return;
      }

      setSession(nextSession);
      setUser(nextUser);
      setIsAdmin(true);

      try {
        const verification = await validateStoredAdminVerification({
          userId: nextUser.id,
          email: nextUser.email,
        });

        if (!active) {
          return;
        }

        setIsEmailVerifiedAdmin(Boolean(verification));
        setVerificationInfo(verification);
      } catch (error) {
        if (!active) {
          return;
        }

        console.error('[AuthContext] Failed to resolve admin email verification state.', error);
        setIsEmailVerifiedAdmin(false);
        setVerificationInfo(null);
      } finally {
        if (active) {
          setIsAuthLoading(false);
        }
      }
    }

    async function bootstrap() {
      if (!isSupabaseConfigured) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const existingSession = await getSession();
        await syncSession(existingSession);
      } catch (error) {
        console.error('[AuthContext] Failed to bootstrap auth state.', error);
        if (active) {
          setIsAuthLoading(false);
        }
      }
    }

    bootstrap();

    if (!isSupabaseConfigured) {
      return () => {
        active = false;
      };
    }

    const {
      data: { subscription },
    } = subscribeToAuthChanges((_event, nextSession) => {
      syncSession(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async ({ email, password }) => {
    setIsAuthLoading(true);

    try {
      const authData = await signInWithPassword(email, password);

      if (!authData.user || !isAdminUser(authData.user)) {
        await signOut();
        throw new Error('admin-not-allowed');
      }

      clearStoredAdminVerification();
      setSession(authData.session);
      setUser(authData.user);
      setIsAdmin(true);
      setIsEmailVerifiedAdmin(false);
      setVerificationInfo(null);

      await requestAdminVerificationCode({
        userId: authData.user.id,
        email: authData.user.email,
      });

      return {
        requiresEmailVerification: true,
      };
    } finally {
      setIsAuthLoading(false);
    }
  };

  const resendAdminCode = async () => {
    if (!user?.id || !user?.email) {
      throw new Error('missing-admin-session');
    }

    setIsAuthLoading(true);

    try {
      await requestAdminVerificationCode({
        userId: user.id,
        email: user.email,
      });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const verifyAdminCode = async (code) => {
    if (!user?.id || !user?.email) {
      throw new Error('missing-admin-session');
    }

    setIsAuthLoading(true);

    try {
      const verification = await verifyAdminEmailCode({
        userId: user.id,
        email: user.email,
        code,
      });

      setIsEmailVerifiedAdmin(true);
      setVerificationInfo(verification);
      return verification;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = async (redirectTo = '/') => {
    setIsAuthLoading(true);

    try {
      await signOut();
      clearStoredAdminVerification();
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      setIsEmailVerifiedAdmin(false);
      setVerificationInfo(null);
      navigate(redirectTo, { replace: true });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      session,
      user,
      isAdmin,
      isAuthenticated: Boolean(session?.user),
      isEmailVerifiedAdmin,
      verificationInfo,
      isAuthLoading,
      adminEmail: getAdminEmail(user),
      login,
      logout,
      verifyAdminCode,
      resendAdminCode,
    }),
    [session, user, isAdmin, isEmailVerifiedAdmin, verificationInfo, isAuthLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }

  return context;
}
