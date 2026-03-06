import React, { useState } from 'react';
import { Lock, Download, Filter, Search, ChevronDown, Activity, Terminal, Code2 } from 'lucide-react';
import { RoleBadge, UserRole } from './RBACManager';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AuditEntry {
    id: string;
    timestamp: string;
    actor: string;
    actorRole: UserRole;
    action: string;
    entity: 'complaint' | 'user' | 'work-order' | 'routing-rule' | 'system';
    entityId: string;
    entityTitle?: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    ipAddress?: string;
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_ENTRIES: AuditEntry[] = [
    { id: 'a1', timestamp: '2026-03-02T18:32:00Z', actor: 'Arjun Mehta', actorRole: 'super-admin', action: 'ROLE_CHANGED', entity: 'user', entityId: 'u3', entityTitle: 'Dinesh Oraon', before: { role: 'field-worker' }, after: { role: 'ward-officer' }, ipAddress: '192.168.1.10' },
    { id: 'a2', timestamp: '2026-03-02T17:15:00Z', actor: 'Seema Nayak', actorRole: 'dept-head', action: 'STATUS_CHANGED', entity: 'complaint', entityId: 'rpt-104', entityTitle: 'Pothole near Lalpur', before: { status: 'open' }, after: { status: 'in_progress' }, ipAddress: '192.168.1.12' },
    { id: 'a3', timestamp: '2026-03-02T16:04:00Z', actor: 'Ranjit Kumar', actorRole: 'field-worker', action: 'PROOF_UPLOADED', entity: 'work-order', entityId: 'wo1', entityTitle: 'Pothole Repair — Lalpur Market', ipAddress: '10.10.5.22' },
    { id: 'a4', timestamp: '2026-03-02T14:20:00Z', actor: 'Seema Nayak', actorRole: 'dept-head', action: 'SLA_OVERRIDDEN', entity: 'complaint', entityId: 'rpt-99', entityTitle: 'Water pipe burst', before: { slaHours: 24 }, after: { slaHours: 8 }, ipAddress: '192.168.1.12' },
    { id: 'a5', timestamp: '2026-03-02T11:00:00Z', actor: 'System', actorRole: 'super-admin', action: 'SLA_ESCALATED', entity: 'complaint', entityId: 'rpt-88', entityTitle: 'Street light failure', after: { escalatedTo: 'Dept Head', reason: 'SLA exceeded by 6h' }, ipAddress: 'system' },
    { id: 'a6', timestamp: '2026-03-02T09:42:00Z', actor: 'Arjun Mehta', actorRole: 'super-admin', action: 'RULE_CREATED', entity: 'routing-rule', entityId: 'rule-3', entityTitle: 'Water Crisis Alert', after: { conditions: ['category=Water'], actions: ['dept=JUIDCO'] }, ipAddress: '192.168.1.10' },
    { id: 'a7', timestamp: '2026-03-01T22:10:00Z', actor: 'CAG Inspector', actorRole: 'auditor', action: 'AUDIT_EXPORT', entity: 'system', entityId: 'export-1', entityTitle: 'Full audit log export Feb 2026', ipAddress: '10.0.0.5' },
    { id: 'a8', timestamp: '2026-03-01T15:00:00Z', actor: 'Priya Sharma', actorRole: 'citizen', action: 'SURVEY_SUBMITTED', entity: 'complaint', entityId: 'rpt-72', entityTitle: 'Garbage collection delay', after: { rating: 2, reopen: true }, ipAddress: '49.36.12.4' },
];

const ACTION_COLOR: Record<string, string> = {
    ROLE_CHANGED: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    STATUS_CHANGED: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    PROOF_UPLOADED: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    SLA_OVERRIDDEN: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    SLA_ESCALATED: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    RULE_CREATED: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    AUDIT_EXPORT: 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20',
    SURVEY_SUBMITTED: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
};

// ─── Entry Row ────────────────────────────────────────────────────────────────
const AuditEntryRow: React.FC<{ entry: AuditEntry }> = ({ entry }) => {
    const [expanded, setExpanded] = useState(false);
    const actionColor = ACTION_COLOR[entry.action] || 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    const hasDiff = entry.before || entry.after;

    return (
        <>
            <tr className={`cursor-pointer transition-colors border-b last:border-0 ${expanded ? 'bg-black/5 dark:bg-white/5' : 'hover:bg-black/5 dark:hover:bg-white/5'}`} style={{ borderColor: 'var(--border)' }} onClick={() => setExpanded(!expanded)}>
                {/* Timestamp */}
                <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 opacity-40 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                        <span className="text-xs font-mono font-medium" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(entry.timestamp).toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </td>

                {/* Actor */}
                <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{entry.actor}</span>
                        <RoleBadge role={entry.actorRole} />
                    </div>
                </td>

                {/* Event Type */}
                <td className="px-4 py-3">
                    <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${actionColor}`}>
                        {entry.action.replace(/_/g, ' ')}
                    </span>
                </td>

                {/* Resource Context */}
                <td className="px-4 py-3 max-w-[200px]">
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{entry.entityTitle || entry.entityId}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-faint)' }}>{entry.entity}</span>
                        </div>
                    </div>
                </td>

                {/* Network / Origin */}
                <td className="px-4 py-3">
                    <span className="text-[10.5px] font-mono px-2 py-1 rounded bg-black/5 dark:bg-white/5 border" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
                        {entry.ipAddress}
                    </span>
                </td>

                {/* Toggle Icon */}
                <td className="px-4 py-3 text-right">
                    {hasDiff ? (
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${expanded ? 'bg-black/10 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
                        </div>
                    ) : (
                        <span className="w-8 h-8 inline-block" /> // Spacer
                    )}
                </td>
            </tr>

            {/* Expanded JSON Diff Viewer */}
            {expanded && hasDiff && (
                <tr className="bg-black/5 dark:bg-black/20 border-b shadow-inner" style={{ borderColor: 'var(--border)' }}>
                    <td colSpan={6} className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Code2 className="w-4 h-4 text-purple-500" />
                            <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>State Mutation Diff</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            {entry.before && (
                                <div className="rounded-lg overflow-hidden border border-red-500/20 bg-[#2d1111] dark:bg-[#1a0a0a]">
                                    <div className="bg-red-500/10 px-3 py-1.5 flex items-center justify-between border-b border-red-500/20">
                                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Previous State</span>
                                        <Terminal className="w-3 h-3 text-red-500/50" />
                                    </div>
                                    <pre className="p-3 text-[11px] font-mono text-red-400 overflow-x-auto whitespace-pre-wrap leading-relaxed outline-none">
                                        {JSON.stringify(entry.before, null, 2)}
                                    </pre>
                                </div>
                            )}
                            {entry.after && (
                                <div className="rounded-lg overflow-hidden border border-green-500/20 bg-[#0f2411] dark:bg-[#071308]">
                                    <div className="bg-green-500/10 px-3 py-1.5 flex items-center justify-between border-b border-green-500/20">
                                        <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">New State</span>
                                        <Terminal className="w-3 h-3 text-green-500/50" />
                                    </div>
                                    <pre className="p-3 text-[11px] font-mono text-green-400 overflow-x-auto whitespace-pre-wrap leading-relaxed outline-none">
                                        {JSON.stringify(entry.after, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AuditLog: React.FC = () => {
    const [entries] = useState<AuditEntry[]>(DEMO_ENTRIES);
    const [search, setSearch] = useState('');
    const [filterAction, setFilterAction] = useState('all');

    const uniqueActions = Array.from(new Set(entries.map(e => e.action)));

    const filtered = entries.filter(e => {
        const matchSearch = !search || [e.actor, e.entityTitle, e.action, e.entityId].some(s => s?.toLowerCase().includes(search.toLowerCase()));
        const matchAction = filterAction === 'all' || e.action === filterAction;
        return matchSearch && matchAction;
    });

    const exportCSV = () => {
        const header = 'Timestamp,Actor,Role,Action,Entity,EntityTitle,IP\n';
        const rows = filtered.map(e => `"${e.timestamp}","${e.actor}","${e.actorRole}","${e.action}","${e.entity}","${e.entityTitle || e.entityId}","${e.ipAddress}"`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `audit_log_${Date.now()}.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
                <div>
                    <h2 className="text-xl font-bold tracking-tight mb-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Lock className="w-5 h-5 text-red-500" /> System Audit Log
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Immutable ledger of all critical system mutations and access</p>
                </div>
                <button onClick={exportCSV} className="btn-secondary px-5 text-sm flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export CSV Record
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-3 w-4 h-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search UUID, actor, resource..."
                        className="input-field w-full pl-9 py-2 text-sm font-medium bg-white dark:bg-gray-800"
                    />
                </div>
                <div className="relative min-w-[180px]">
                    <Filter className="absolute left-3 top-3 w-4 h-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
                    <select
                        value={filterAction}
                        onChange={e => setFilterAction(e.target.value)}
                        className="input-field w-full pl-9 py-2 pr-8 text-sm font-medium appearance-none bg-white dark:bg-gray-800 cursor-pointer"
                    >
                        <option value="all">All Events</option>
                        {uniqueActions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 w-3 h-3 pointer-events-none opacity-50" />
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-black/40 border-b" style={{ borderColor: 'var(--border)' }}>
                                {['Timestamp', 'Identity', 'Event Type', 'Resource Target', 'Network Origin', ''].map((h, i) => (
                                    <th key={i} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-transparent">
                            {filtered.map(entry => <AuditEntryRow key={entry.id} entry={entry} />)}

                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-16">
                                        <div className="flex flex-col items-center justify-center">
                                            <Terminal className="w-10 h-10 mb-3 opacity-20" style={{ color: 'var(--text-primary)' }} />
                                            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>No events found</p>
                                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>The active filters do not match any records.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditLog;
