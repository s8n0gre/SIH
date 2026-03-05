import React, { useState } from 'react';
import { Lock, Download, Filter, Search, ChevronDown } from 'lucide-react';
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
    ROLE_CHANGED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    STATUS_CHANGED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    PROOF_UPLOADED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    SLA_OVERRIDDEN: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    SLA_ESCALATED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    RULE_CREATED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    AUDIT_EXPORT: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    SURVEY_SUBMITTED: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
};

// ─── Entry Row ────────────────────────────────────────────────────────────────
const AuditEntryRow: React.FC<{ entry: AuditEntry }> = ({ entry }) => {
    const [expanded, setExpanded] = useState(false);
    const actionColor = ACTION_COLOR[entry.action] || 'bg-gray-100 text-gray-700';
    const hasDiff = entry.before || entry.after;

    return (
        <>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors" onClick={() => setExpanded(!expanded)}>
                <td className="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap font-mono">
                    {new Date(entry.timestamp).toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-3 py-2.5">
                    <div className="text-xs font-medium text-gray-800 dark:text-white">{entry.actor}</div>
                    <RoleBadge role={entry.actorRole} />
                </td>
                <td className="px-3 py-2.5">
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${actionColor}`}>
                        {entry.action.replace(/_/g, ' ')}
                    </span>
                </td>
                <td className="px-3 py-2.5 text-xs text-gray-700 dark:text-gray-300 max-w-[180px]">
                    <span className="line-clamp-1">{entry.entityTitle || entry.entityId}</span>
                    <span className="text-gray-400 dark:text-gray-500 text-[10px]">{entry.entity}</span>
                </td>
                <td className="px-3 py-2.5 text-[10px] text-gray-400 dark:text-gray-500 font-mono">{entry.ipAddress}</td>
                <td className="px-3 py-2.5">
                    {hasDiff && <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />}
                </td>
            </tr>
            {expanded && hasDiff && (
                <tr className="bg-gray-50 dark:bg-gray-800">
                    <td colSpan={6} className="px-4 py-2">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            {entry.before && (
                                <div>
                                    <p className="text-red-500 font-semibold mb-1">Before</p>
                                    <pre className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-2 text-red-700 dark:text-red-400 overflow-x-auto">
                                        {JSON.stringify(entry.before, null, 2)}
                                    </pre>
                                </div>
                            )}
                            {entry.after && (
                                <div>
                                    <p className="text-green-600 font-semibold mb-1">After</p>
                                    <pre className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-2 text-green-700 dark:text-green-400 overflow-x-auto">
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
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><Lock className="w-5 h-5 text-red-500" /> Immutable Audit Log</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">All actions are recorded and cannot be edited or deleted</p>
                </div>
                <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 px-3 py-2 rounded-xl font-medium transition-colors hover:bg-gray-700 dark:hover:bg-gray-300">
                    <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                <div className="relative flex-1 min-w-36">
                    <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search actor, entity..." className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl" />
                </div>
                <div className="relative">
                    <Filter className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
                    <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className="pl-7 pr-6 py-1.5 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl appearance-none">
                        <option value="all">All actions</option>
                        {uniqueActions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                {['Timestamp', 'Actor', 'Action', 'Entity', 'IP', ''].map(h => (
                                    <th key={h} className="px-3 py-2 text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filtered.map(entry => <AuditEntryRow key={entry.id} entry={entry} />)}
                            {filtered.length === 0 && (
                                <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">No matching audit entries</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditLog;
