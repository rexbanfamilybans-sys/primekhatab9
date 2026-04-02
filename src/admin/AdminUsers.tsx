import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { 
  Users, 
  Search, 
  Crown, 
  UserX, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Mail, 
  Calendar,
  Shield,
  MoreVertical,
  Ban
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface UserData {
  id: string;
  email: string;
  displayName?: string;
  role: string;
  subscription_status?: string;
  subscription_expiry?: any;
  createdAt?: any;
  photoURL?: string;
}

export const AdminUsers: React.FC = () => {
  const { user: currentUser, userData: currentUserData } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'premium' | 'free' | 'admin'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const isAdmin = currentUserData?.role === 'admin' || currentUser?.email === 'mrkhatab112@gmail.com';
    if (!isAdmin) return;

    fetchUsers();
  }, [currentUser, currentUserData]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersSnap = await getDocs(query(collection(db, 'users'), orderBy('email')));
      const usersData = usersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserData[];
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (userId: string) => {
    if (!window.confirm("Are you sure you want to cancel this user's premium subscription?")) return;

    try {
      setUpdatingId(userId);
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        subscription_status: 'none',
        subscription_expiry: null
      });
      
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, subscription_status: 'none', subscription_expiry: null } : u
      ));
      
      toast.success("Subscription cancelled successfully");
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("Failed to cancel subscription");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleAdmin = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to make this user a ${newRole}?`)) return;

    try {
      setUpdatingId(userId);
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: newRole
      });
      
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update user role");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (u.displayName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'premium') return matchesSearch && u.subscription_status === 'active';
    if (filter === 'free') return matchesSearch && (!u.subscription_status || u.subscription_status === 'none');
    if (filter === 'admin') return matchesSearch && u.role === 'admin';
    return matchesSearch;
  });

  return (
    <div className="space-y-8 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">User Management</h1>
          <p className="text-zinc-500">Manage user accounts and subscriptions</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm"
            />
          </div>
          <select
            value={filter}
            onChange={(e: any) => setFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm"
          >
            <option value="all">All Users</option>
            <option value="premium">Premium Only</option>
            <option value="free">Free Only</option>
            <option value="admin">Admins Only</option>
          </select>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-500">User</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-500">Role</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-500">Subscription</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-500">Joined</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                    <p className="mt-2 text-zinc-500 font-medium">Loading users...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Users className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                    <p className="text-zinc-500 font-medium">No users found</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 border border-zinc-700">
                          {u.photoURL ? (
                            <img src={u.photoURL} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-5 h-5 text-zinc-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-200 truncate">{u.displayName || 'Anonymous'}</p>
                          <p className="text-xs text-zinc-500 truncate flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                        u.role === 'admin' 
                          ? "bg-purple-500/10 text-purple-500 border-purple-500/20" 
                          : "bg-zinc-800 text-zinc-400 border-zinc-700"
                      )}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {u.subscription_status === 'active' ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            <Crown className="w-3 h-3" />
                            Premium
                          </div>
                        ) : (
                          <div className="px-2.5 py-1 bg-zinc-800 text-zinc-500 border border-zinc-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            Free
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {u.subscription_status === 'active' && (
                          <button
                            onClick={() => handleCancelSubscription(u.id)}
                            disabled={updatingId === u.id}
                            className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                            title="Cancel Premium"
                          >
                            {updatingId === u.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Ban className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleAdmin(u.id, u.role)}
                          disabled={updatingId === u.id || u.email === 'mrkhatab112@gmail.com'}
                          className={cn(
                            "p-2 rounded-xl transition-all",
                            u.role === 'admin'
                              ? "text-purple-500 hover:bg-purple-500/10"
                              : "text-zinc-500 hover:text-purple-500 hover:bg-purple-500/10"
                          )}
                          title={u.role === 'admin' ? "Remove Admin" : "Make Admin"}
                        >
                          {updatingId === u.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Shield className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
