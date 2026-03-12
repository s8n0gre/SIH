import React, { useState } from 'react';
import { Shield, User, Edit2, Save, X, ChevronDown, Check, Search, Lock } from 'lucide-react';

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

const ROLE_CONFIG: Record<UserRole, { label: string; colorClass: string; permissions: string[] }> = {
    'super-admin': { label: 'Super Admin', colorClass: 'badge-error', permissions: ['All access', 'Role management', 'System config', 'Bypass SLAs'] },
    'dept-head': { label: 'Dept. Head', colorClass: 'badge-info', permissions: ['Department reports', 'Staff assignment', 'SLA override', 'Budget view'] },
    'ward-officer': { label: 'Ward Officer', colorClass: 'badge-success', permissions: ['Ward complaints', 'Status updates', 'Field assignment', 'Escalate issues'] },
    'field-worker': { label: 'Field Worker', colorClass: 'badge-warning', permissions: ['Assigned tasks', 'Progress upload', 'Proof photos'] },
    'contractor': { label: 'Contractor', colorClass: 'badge-neutral', permissions: ['Assigned work orders', 'Invoice upload', 'Completion proof'] },
    'auditor': { label: 'Auditor', colorClass: 'badge-neutral text-purple-600 bg-purple-500/10 border-purple-500/20', permissions: ['Read-only all data', 'Audit log export', 'SLA reports'] },
    'citizen': { label: 'Citizen', colorClass: 'badge-neutral', permissions: ['Submit complaints', 'Track own reports', 'Rate resolution'] },
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
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-max ${cfg.colorClass}`}>
            <Shield className="w-3 h-3" />
            {cfg.label}
        </span>
    );
};

// ─── User Row ─────────────────────────────────────────────────────────────────
const UserRow: React.FC<{ user: ManagedUser; onSave: (u: ManagedUser) => void }> = ({ user, onSave }) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState<ManagedUser>(user);

    const handleSave = () => { onSave(draft); setEditing(false); };
    const handleCancel = () => { setDraft(user); setEditing(false); };

    return (
        <div className={`flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 border-b transition-colors ${!user.active ? 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0' : 'hover:bg-black/5 dark:hover:bg-white/5'}`} style={{ borderColor: 'var(--border)' }}>

            {/* Avatar & Basic Info */}
            <div className="flex items-center gap-3 w-64 flex-shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold shadow-sm" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' }}>
                    {user.name[0]}
                </div>
                <div className="min-w-0">
                    {editing ? (
                        <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className="input-field text-sm font-bold w-full py-1 px-2" />
                    ) : (
                        <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                    )}

                    {editing ? (
                        <input value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })} className="input-field text-xs w-full py-1 px-2 mt-1" />
                    ) : (
                        <p className="text-xs truncate font-medium" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                    )}
                </div>
            </div>

            {/* Context (Dept/Ward) & Role */}
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    {editing ? (
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <select value={draft.role} onChange={e => setDraft({ ...draft, role: e.target.value as UserRole })} className="input-field text-xs py-1.5 w-full appearance-none bg-white dark:bg-gray-800 font-semibold">
                                    {Object.entries(ROLE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                </select>
                                <ChevronDown className="absolute right-2 top-2 w-3.5 h-3.5 pointer-events-none opacity-50" />
                            </div>
                            {(draft.role === 'dept-head' || draft.role === 'field-worker') && (
                                <input value={draft.department || ''} onChange={e => setDraft({ ...draft, department: e.target.value })} placeholder="Dept" className="input-field text-xs py-1.5 w-full" />
                            )}
                            {draft.role === 'ward-officer' && (
                                <input value={draft.ward || ''} onChange={e => setDraft({ ...draft, ward: e.target.value })} placeholder="Ward" className="input-field text-xs py-1.5 w-full" />
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <RoleBadge role={user.role} />
                            {(user.department || user.ward) && (
                                <span className="text-xs font-mono font-semibold px-2 py-1 rounded-md bg-black/5 dark:bg-white/5 border" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
                                    {user.department || user.ward}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="hidden md:block w-32 text-right">
                    <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-faint)' }}>Last Login</p>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 w-20 flex-shrink-0">
                {editing ? (
                    <>
                        <button onClick={handleSave} className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 transition-colors"><Save className="w-4 h-4" /></button>
                        <button onClick={handleCancel} className="p-1.5 rounded-lg bg-gray-500/10 hover:bg-gray-500/20 text-gray-600 dark:text-gray-400 transition-colors"><X className="w-4 h-4" /></button>
                    </>
                ) : (
                    <>
                        <button onClick={() => { setDraft(user); setEditing(true); }} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors" style={{ color: 'var(--text-muted)' }}><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => onSave({ ...user, active: !user.active })} className={`p-2 rounded-lg transition-colors ${user.active ? 'hover:bg-red-500/10 text-red-500' : 'hover:bg-green-500/10 text-green-500'}`}>
                            {user.active ? <Lock className="w-4 h-4" /> : <Check className="w-4 h-4" />}
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
    const [search, setSearch] = useState('');

    const filtered = users.filter(u =>
        (filterRole === 'all' || u.role === filterRole) &&
        (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold tracking-tight mb-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Shield className="w-5 h-5 text-purple-500" /> Access Control
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Manage user identities, roles, and scope permissions</p>
                </div>
                <button className="btn-primary px-5 text-sm bg-purple-600 hover:bg-purple-700 text-white border-transparent shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                    <User className="w-4 h-4 mr-2" /> Invite User
                </button>
            </div>

            {/* Role permission matrix (Grid) */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
                {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
                    <div
                        key={role}
                        onClick={() => setFilterRole(filterRole === role as UserRole ? 'all' : role as UserRole)}
                        className={`card p-4 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[140px] hover:-translate-y-1 ${filterRole === role ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-900 shadow-purple-500/20' : 'hover:border-purple-500/30'
                            }`}
                    >
                        <RoleBadge role={role as UserRole} />
                        <ul className="mt-4 space-y-1.5 flex-1">
                            {cfg.permissions.map((p, i) => (
                                <li key={i} className="text-[10px] font-bold tracking-wide leading-tight flex items-start gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                                    <Check className="w-3 h-3 text-green-500 flex-shrink-0 opacity-80" /> {p}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Controls & Table */}
            <div className="card overflow-hidden">
                <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50/50 dark:bg-black/20" style={{ borderColor: 'var(--border)' }}>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-field w-full pl-9 py-2 text-sm bg-white dark:bg-gray-800"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold px-3 py-1.5 rounded-md bg-black/5 dark:bg-white/5" style={{ color: 'var(--text-secondary)' }}>
                            {filtered.length} Users Found
                        </span>
                        <select value={filterRole} onChange={e => setFilterRole(e.target.value as any)} className="input-field text-sm py-2 appearance-none bg-white dark:bg-gray-800 font-semibold cursor-pointer">
                            <option value="all">All Roles</option>
                            {Object.entries(ROLE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                    </div>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-800/50 bg-white dark:bg-gray-900">
                    {filtered.map(u => (
                        <UserRow key={u.id} user={u} onSave={updated => setUsers(prev => prev.map(x => x.id === updated.id ? updated : x))} />
                    ))}
                    {filtered.length === 0 && (
                        <div className="p-12 text-center flex flex-col items-center justify-center">
                            <Shield className="w-10 h-10 mb-3 opacity-20" />
                            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>No users found</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RBACManager;
