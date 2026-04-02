import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Globe, ShieldAlert } from 'lucide-react';

const ALLOWED_COUNTRIES = ['India', 'Pakistan', 'Bangladesh'];

export const CountryGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userData, loading } = useAuth();
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (!loading && userData) {
      if (!ALLOWED_COUNTRIES.includes(userData.country)) {
        setIsBlocked(true);
      }
    }
  }, [userData, loading]);

  if (loading) return null;

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Access Denied</h1>
            <p className="text-zinc-400">
              Shahid X Rex Anime is currently only available in India, Pakistan, and Bangladesh.
            </p>
          </div>
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-center gap-2 text-sm text-zinc-500">
            <Globe className="w-4 h-4" />
            <span>Regional Restriction Active</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
