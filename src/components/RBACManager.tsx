import React, { useState } from 'react';
import { Shield, User, Edit2, Save, X, ChevronDown, Check } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
export type UserRole = 'super-admin' | 'dept-head' | 'ward-officer' | 'field-worker' | 'contractor' | 'auditor' | 'citizen';

export interface ManagedUser {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    department?: string;
    ward?: string;
    active: boolean;
    lastLogin?: string;
}

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bg: string; permissions: string[] }> = {
    'super-admin': { label: 'Super Admin', color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-100 dark:bg-purple-900/40', permissions: ['All access', 'Role management', 'System config'] },
    'dept-head': { label: 'Dept. Head', color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900/40', permissions: ['Department reports', 'Staff assignment', 'SLA override'] },
    'ward-officer': { label: 'Ward Officer', color: 'text-green-700 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-900/40', permissions: ['Ward complaints', 'Status updates', 'Field assignment'] },
    'field-worker': { label: 'Field Worker', color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-100 dark:bg-orange-900/40', permissions: ['Assigned tasks', 'Progress upload', 'Proof photos'] },
    'contractor': { label: 'Contractor', color: 'text-cyan-700 dark:text-cyan-300', bg: 'bg-cyan-100 dark:bg-cyan-900/40', permissions: ['Assigned work orders', 'Invoice upload', 'Completion proof'] },
    'auditor': { label: 'Auditor', color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/40', permissions: ['Read-only all data', 'Audit log export', 'SLA reports'] },
    'citizen': { label: 'Citizen', color: 'text-gray-700 dark:text-gray-300', bg: 'bg-gray-100 dark:bg-gray-700', permissions: ['Submit complaints', 'Track own reports', 'Rate resolution'] },
};

const DEMO_USERS: ManagedUser[] = [
    { id: 'u1', name: 'Arjun Mehta', email: 'arjun@jmc.gov.in', role: 'super-admin', active: true, lastLogin: '2026-03-02T18:00:00Z' },
    { id: 'u2', name: 'Seema Nayak', email: 'seema@jmc.gov.in', role: 'dept-head', department: 'Roads & Infrastructure', active: true, lastLogin: '2026-03-02T14:00:00Z' },
    { id: 'u3', name: 'Dinesh Oraon', email: 'dinesh@jmc.gov.in', role: 'ward-officer', ward: 'Ward 12', active: true, lastLogin: '2026-03-01T09:00:00Z' },
    { id: 'u4', name: 'Ranjit Kumar', email: 'ranjit@build.in', role: 'field-worker', department: 'Roads', active: true, lastLogin: '2026-03-02T08:00:00Z' },
    { id: 'u5', name: 'Infra Corp Ltd', email: 'ops@infracorp.in', role: 'contractor', active: true, lastLogin: '2026-02-28T12:00:00Z' },
    { id: 'u6', name: 'CAG Inspector', email: 'audit@cag.gov.in', role: 'auditor', active: true, lastLogin: '2026-02-25T10:00:00Z' },
];

// ─── Role Badge ───────────────────────────────────────────────────────────────
export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
    const cfg = ROLE_CONFIG[role];
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color} ${cfg.bg}`}>
            <Shield className="w-3 h-3" />
            {cfg.label}
        </span>
    );
};

// ─── User Row ─────────────────────────────────────────────────────────────────
const UserRow: React.FC<{ user: ManagedUser; onSave: (u: ManagedUser) => void }> = ({ user, onSave }) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState<ManagedUser>(user);
    const roleCfg = ROLE_CONFIG[user.role];

    const handleSave = () => { onSave(draft); setEditing(false); };
    const handleCancel = () => { setDraft(user); setEditing(false); };

    return (
        <div className={`flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${!user.active ? 'opacity-50' : ''}`}>
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
                {user.name[0]}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                {editing ? (
                    <div className="flex gap-2 flex-wrap">
                        <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className="text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1 w-40" />
                        <input value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })} className="text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1 w-48" />
                        {(draft.role === 'dept-head' || draft.role === 'field-worker') && (
                            <input value={draft.department || ''} onChange={e => setDraft({ ...draft, department: e.target.value })} placeholder="Department" className="text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1 w-32" />
                        )}
                        {draft.role === 'ward-officer' && (
                            <input value={draft.ward || ''} onChange={e => setDraft({ ...draft, ward: e.target.value })} placeholder="Ward" className="text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1 w-24" />
                        )}
                    </div>
                ) : (
                    <>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}{user.department && ` · ${user.department}`}{user.ward && ` · ${user.ward}`}</p>
                    </>
                )}
            </div>

            {/* Role selector */}
            <div className="flex-shrink-0">
                {editing ? (
                    <div className="relative">
                        <select
                            value={draft.role}
                            onChange={e => setDraft({ ...draft, role: e.target.value as UserRole })}
                            className="appearance-none text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg pl-2 pr-6 py-1"
                        >
                            {Object.entries(ROLE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1.5 w-3 h-3 text-gray-400 pointer-events-none" />
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <RoleBadge role={user.role} />
                        <div className="text-[10px] text-gray-400">
                            {user.lastLogin && `Login: ${new Date(user.lastLogin).toLocaleDateString()}`}
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
                {editing ? (
                    <>
                        <button onClick={handleSave} className="p-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-colors"><Save className="w-3.5 h-3.5" /></button>
                        <button onClick={handleCancel} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 transition-colors"><X className="w-3.5 h-3.5" /></button>
                    </>
                ) : (
                    <>
                        <button onClick={() => { setDraft(user); setEditing(true); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => onSave({ ...user, active: !user.active })} className={`p-1.5 rounded-lg transition-colors ${user.active ? 'hover:bg-red-50 text-red-400' : 'hover:bg-green-50 text-green-500'}`}>
                            {user.active ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const RBACManager: React.FC = () => {
    const [users, setUsers] = useState<ManagedUser[]>(DEMO_USERS);
    const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

    const filtered = filterRole === 'all' ? users : users.filter(u => u.role === filterRole);

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><Shield className="w-5 h-5 text-purple-500" /> Role & Access Management</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage user roles and permissions</p>
            </div>

            {/* Role permission matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
                {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
                    <button
                        key={role}
                        onClick={() => setSelectedRole(selectedRole === role as UserRole ? null : role as UserRole)}
                        className={`text-left p-2 rounded-xl border-2 transition-all ${selectedRole === role ? `border-current ${cfg.bg}` : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                    >
                        <RoleBadge role={role as UserRole} />
                        {selectedRole === role && (
                            <ul className="mt-2 space-y-1">
                                {cfg.permissions.map(p => (
                                    <li key={p} className="text-[10px] text-gray-600 dark:text-gray-300 flex items-start gap-1">
                                        <Check className="w-2.5 h-2.5 text-green-500 flex-shrink-0 mt-0.5" />{p}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </button>
                ))}
            </div>

            {/* Filter + Users table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{filtered.length} Users</span>
                    </div>
                    <select value={filterRole} onChange={e => setFilterRole(e.target.value as any)} className="text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1">
                        <option value="all">All roles</option>
                        {Object.entries(ROLE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                </div>
                {filtered.map(u => (
                    <UserRow key={u.id} user={u} onSave={updated => setUsers(prev => prev.map(x => x.id === updated.id ? updated : x))} />
                ))}
            </div>
        </div>
    );
};

export default RBACManager;
