import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Globe, Crown, ShieldCheck, Clock, Settings, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export const Profile: React.FC = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      <div className="relative h-36 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
        <div className="absolute -bottom-8 left-6 flex items-end gap-4">
          <div className="w-24 h-24 bg-zinc-900 border-4 border-black rounded-2xl flex items-center justify-center text-3xl font-black shadow-2xl">
            {userData?.name?.[0]?.toUpperCase()}
          </div>
          <div className="pb-3 space-y-0.5">
            <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-lg">{userData?.name}</h1>
            <div className="flex items-center gap-1.5 text-white/80 font-medium text-xs">
              <Mail className="w-3.5 h-3.5" />
              {userData?.email}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 pt-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              Account Details
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Role</span>
                <p className="font-bold text-zinc-200 capitalize text-sm">{userData?.role}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Country</span>
                <div className="flex items-center gap-1.5 font-bold text-zinc-200 text-sm">
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  {userData?.country}
                </div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Member Since</span>
                <div className="flex items-center gap-1.5 font-bold text-zinc-200 text-sm">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              Subscription Status
            </h2>

            <div className={cn(
              "p-4 rounded-xl border flex items-center justify-between",
              userData?.subscription_status === 'active' 
                ? "bg-blue-500/10 border-blue-500/50" 
                : "bg-zinc-800/50 border-zinc-700"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shadow-lg",
                  userData?.subscription_status === 'active' ? "bg-blue-600 shadow-blue-500/20" : "bg-zinc-700"
                )}>
                  {userData?.subscription_status === 'active' ? <ShieldCheck className="w-5 h-5 text-white" /> : <Crown className="w-5 h-5 text-zinc-500" />}
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {userData?.subscription_status === 'active' ? 'Premium Active' : 'Free Plan'}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {userData?.subscription_status === 'active' 
                      ? 'You have full access to all anime' 
                      : 'Upgrade to watch premium content'}
                  </p>
                </div>
              </div>
              {userData?.subscription_status !== 'active' && (
                <button 
                  onClick={() => navigate('/premium')}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-1.5 rounded-lg font-bold transition-all active:scale-95 text-xs"
                >
                  Upgrade
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-zinc-400 text-[10px] uppercase tracking-widest">Quick Actions</h3>
            <div className="space-y-1.5">
              <button className="w-full flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-zinc-800 transition-colors text-xs font-medium">
                <Settings className="w-3.5 h-3.5" /> Account Settings
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors text-xs font-medium"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
