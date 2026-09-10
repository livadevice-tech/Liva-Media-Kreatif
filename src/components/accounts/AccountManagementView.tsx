import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  UserCheck, 
  Briefcase, 
  Key, 
  CheckCircle2, 
  XCircle, 
  Edit2, 
  Trash2, 
  Plus,
  Crown,
  Sparkles,
  Bell
} from 'lucide-react';
import { UserAccount, UserRole } from '../../types/app';
import { AccountInspectorPanel } from './AccountInspectorPanel';

interface AccountManagementViewProps {
  accounts: UserAccount[];
  onSaveAccount: (account: Partial<UserAccount>) => Promise<void>;
  onDeleteAccount: (id: string) => Promise<void>;
}

export const AccountManagementView: React.FC<AccountManagementViewProps> = ({
  accounts,
  onSaveAccount,
  onDeleteAccount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Partial<UserAccount> | null>(null);

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      if (selectedRoleFilter !== 'all' && acc.role !== selectedRoleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = acc.full_name?.toLowerCase().includes(q);
        const matchUser = acc.username?.toLowerCase().includes(q);
        const matchPos = acc.position?.toLowerCase().includes(q);
        if (!matchName && !matchUser && !matchPos) return false;
      }
      return true;
    });
  }, [accounts, selectedRoleFilter, searchQuery]);

  // Role stats
  const stats = useMemo(() => {
    return {
      total: accounts.length,
      masterAdmin: accounts.filter((a) => a.role === 'Master Admin').length,
      admin: accounts.filter((a) => a.role === 'Admin').length,
      staff: accounts.filter((a) => a.role === 'Staff').length,
    };
  }, [accounts]);

  const handleOpenNewAccount = () => {
    setEditingAccount(null);
    setIsInspectorOpen(true);
  };

  const handleEditAccount = (acc: UserAccount) => {
    setEditingAccount(acc);
    setIsInspectorOpen(true);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'Master Admin':
        return {
          badge: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: <Crown className="w-3 h-3 text-purple-600" />,
        };
      case 'Admin':
        return {
          badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: <ShieldCheck className="w-3 h-3 text-indigo-600" />,
        };
      default:
        return {
          badge: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <UserCheck className="w-3 h-3 text-slate-600" />,
        };
    }
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-white">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Header Bar */}
        <div className="h-16 px-6 border-b border-slate-200/80 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Manajemen Akun
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {accounts.length} total akun
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleOpenNewAccount}
              className="bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Tambah Akun</span>
            </button>

            <button className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors relative">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="h-14 px-6 border-b border-slate-200/80 flex items-center justify-between bg-white shrink-0 gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama lengkap, username, atau posisi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setSelectedRoleFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedRoleFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({stats.total})
            </button>
            <button
              onClick={() => setSelectedRoleFilter('Master Admin')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedRoleFilter === 'Master Admin'
                  ? 'bg-white text-purple-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Master Admin ({stats.masterAdmin})
            </button>
            <button
              onClick={() => setSelectedRoleFilter('Admin')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedRoleFilter === 'Admin'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin ({stats.admin})
            </button>
            <button
              onClick={() => setSelectedRoleFilter('Staff')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedRoleFilter === 'Staff'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Staff ({stats.staff})
            </button>
          </div>
        </div>

        {/* Content Table / Cards */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar">
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-3.5 pl-5">Pengguna & Username</th>
                  <th className="p-3.5">Posisi / Jabatan</th>
                  <th className="p-3.5">Role Akun</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right pr-5">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      Tidak ada akun pengguna yang sesuai kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((acc) => {
                    const roleInfo = getRoleBadge(acc.role);
                    const initials = acc.full_name
                      ? acc.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
                      : 'US';

                    return (
                      <tr
                        key={acc.id}
                        onClick={() => handleEditAccount(acc)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors group"
                      >
                        {/* Avatar & Name */}
                        <td className="p-3.5 pl-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-2xs ${
                              acc.role === 'Master Admin'
                                ? 'bg-purple-100 text-purple-800'
                                : acc.role === 'Admin'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}>
                              {initials}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                {acc.full_name}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                @{acc.username}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Posisi */}
                        <td className="p-3.5">
                          <span className="font-medium text-slate-700">
                            {acc.position}
                          </span>
                        </td>

                        {/* Role */}
                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${roleInfo.badge}`}>
                            {roleInfo.icon}
                            <span>{acc.role}</span>
                          </span>
                        </td>

                        {/* Status */}
                        <td className="p-3.5">
                          {acc.is_active ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                              <span className="w-2 h-2 rounded-full bg-slate-400" />
                              Non-aktif
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right pr-5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAccount(acc);
                            }}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Yakin ingin menghapus akun @${acc.username}?`)) {
                                onDeleteAccount(acc.id);
                              }
                            }}
                            className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:underline"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Account Inspector Panel (Right Drawer) */}
      <AccountInspectorPanel
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        onSave={onSaveAccount}
        onDelete={onDeleteAccount}
        account={editingAccount}
      />
    </div>
  );
};
