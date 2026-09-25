import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, User, CheckCircle, Ban, ArrowUpDown } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminUsers({
        query: query.trim() || undefined,
        role: roleFilter !== 'All' ? roleFilter : undefined,
      });
      setUsers(data || []);
    } catch (err) {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadUsers();
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = !user.is_active;
    const actionLabel = nextStatus ? 'activate' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${actionLabel} ${user.name}'s account?`)) return;

    try {
      await api.updateUserStatus(user.id, { is_active: nextStatus });
      showToast(`Account ${nextStatus ? 'activated' : 'suspended'} successfully`, 'success');
      loadUsers();
    } catch (err) {
      showToast(err.message || 'Failed to update user status', 'error');
    }
  };

  const handleToggleRole = async (user) => {
    const nextRole = user.role === 'admin' ? 'listener' : 'admin';
    if (!window.confirm(`Change ${user.name}'s role to ${nextRole.toUpperCase()}?`)) return;

    try {
      await api.updateUserStatus(user.id, { role: nextRole });
      showToast(`User role updated to ${nextRole}`, 'success');
      loadUsers();
    } catch (err) {
      showToast(err.message || 'Failed to update role', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-black text-white flex items-center space-x-2.5">
          <Users className="w-7 h-7 text-purple-400" />
          <span>Registered User Accounts</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor listener demographics, manage user accounts, and enforce role-based access control.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="p-4 rounded-2xl bg-[#11131e]/90 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#181b2a] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
          />
        </form>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-slate-400">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#181b2a] border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="All">All Roles</option>
            <option value="listener">Listeners</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-[#11131e]/90 border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/5 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Age & Cohort</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Preferred Genres</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    No users found matching the query.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-200">{u.age} yrs</span>
                      <div className="text-[10px] text-cyan-400 font-medium">{u.age_group || 'Young Adult'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          u.role === 'admin'
                            ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/50'
                            : 'bg-purple-950/80 text-purple-300 border border-purple-800/50'
                        }`}
                      >
                        {u.role === 'admin' ? <Shield className="w-3 h-3 mr-0.5" /> : <User className="w-3 h-3 mr-0.5" />}
                        <span className="capitalize">{u.role}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.is_active
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                            : 'bg-rose-950/80 text-rose-300 border border-rose-800/50'
                        }`}
                      >
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {u.preference?.preferred_genres?.slice(0, 3).map((g) => (
                          <span key={g} className="px-1.5 py-0.2 rounded bg-white/5 text-[10px] text-slate-300">
                            {g}
                          </span>
                        ))}
                        {(u.preference?.preferred_genres?.length || 0) > 3 && (
                          <span className="text-[10px] text-slate-500">
                            +{u.preference.preferred_genres.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleRole(u)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-medium transition"
                        title="Change user role"
                      >
                        {u.role === 'admin' ? 'Demote' : 'Promote Admin'}
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                          u.is_active
                            ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {u.is_active ? 'Suspend' : 'Activate'}
                      </button>
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
}
