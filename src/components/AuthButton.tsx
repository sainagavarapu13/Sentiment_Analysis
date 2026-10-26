import React, { useState, useEffect } from 'react';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, User } from '../services/firebase';
import { LogIn, LogOut, UserCheck } from 'lucide-react';

interface AuthButtonProps {
  onUserChange?: (user: User | null) => void;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ onUserChange }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (onUserChange) onUserChange(currentUser);
    });
    return () => unsubscribe();
  }, [onUserChange]);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-in Error:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Sign Out Error:', err);
    }
  };

  if (loading) {
    return <div className="h-8 w-20 bg-white/5 rounded-lg animate-pulse border border-white/5" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-violet-500/20 shadow-xs">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'User'} className="w-5 h-5 rounded-full ring-1 ring-violet-400" />
          ) : (
            <UserCheck className="w-4 h-4 text-cyan-400" />
          )}
          <span className="text-xs text-slate-200 font-medium max-w-[100px] truncate hidden sm:inline">
            {user.displayName?.split(' ')[0] || 'User'}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 hover:border-violet-400/40 shadow-xs transition duration-200 cursor-pointer"
    >
      <LogIn className="w-3.5 h-3.5 text-cyan-400" />
      <span>Sign In</span>
    </button>
  );
};
