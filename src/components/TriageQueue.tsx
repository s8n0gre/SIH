import React, { useState } from 'react';
import { CheckSquare, Square, X, Merge, ArrowRight, User, MapPin, AlertTriangle, Flag } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface TriageComplaint {
    id: string;
    title: string;
    category: string;
    status: string;
    location: string;
    submittedBy: string;
    submittedAt: string;
    votes: number;
    duplicateGroupId?: string;
    misroutedTo?: string;
    correctDepartment?: string;
    similarity?: number;
}

interface TriageQueueProps {
    complaints?: TriageComplaint[];
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_COMPLAINTS: TriageComplaint[] = [
    { id: 'tc1', title: 'Pothole near Lalpur Market — dangerous', category: 'Roads', status: 'open', location: 'Lalpur, Ward 12', submittedBy: 'Ravi Kumar', submittedAt: '2026-03-01', votes: 14, duplicateGroupId: 'grp-1', similarity: 0.87 },
    { id: 'tc2', title: 'Large pothole on Lalpur road causing accidents', category: 'Roads', status: 'open', location: 'Lalpur Road', submittedBy: 'Sunita Devi', submittedAt: '2026-03-01', votes: 6, duplicateGroupId: 'grp-1', similarity: 0.87 },
    { id: 'tc3', title: 'Road damaged outside Lalpur junction', category: 'Roads', status: 'open', location: 'Lalpur Junction', submittedBy: 'Amit Singh', submittedAt: '2026-03-02', votes: 3, duplicateGroupId: 'grp-1', similarity: 0.74 },
    { id: 'tc4', title: 'Street light not working near school', category: 'Electricity', status: 'assigned', location: 'Model Road, Ward 5', submittedBy: 'Priya Sharma', submittedAt: '2026-02-28', votes: 9, misroutedTo: 'Roads Dept', correctDepartment: 'Electricity Board' },
    { id: 'tc5', title: 'Garbage not collected for 5 days', category: 'Waste', status: 'open', location: 'Harmu Colony', submittedBy: 'Gulab Yadav', submittedAt: '2026-03-02', votes: 22, misroutedTo: 'Parks Dept', correctDepartment: 'Waste Management' },
];

// ─── Group duplicates ─────────────────────────────────────────────────────────
function groupDuplicates(complaints: TriageComplaint[]) {
    const groups: Record<string, TriageComplaint[]> = {};
    const ungrouped: TriageComplaint[] = [];
    for (const c of complaints) {
        if (c.duplicateGroupId) {
            groups[c.duplicateGroupId] = groups[c.duplicateGroupId] || [];
            groups[c.duplicateGroupId].push(c);
        } else {
            ungrouped.push(c);
        }
    }
    return { groups, ungrouped };
}

// ─── Duplicate Group Card ─────────────────────────────────────────────────────
const DuplicateGroup: React.FC<{
    groupId: string;
    items: TriageComplaint[];
    onMerge: (primary: string, dupes: string[]) => void;
    onDismiss: (ids: string[]) => void;
}> = ({ groupId, items, onMerge, onDismiss }) => {
    const [primaryId, setPrimaryId] = useState(items[0]?.id || '');

    const handleMerge = () => {
        const dupes = items.filter(i => i.id !== primaryId).map(i => i.id);
        onMerge(primaryId, dupes);
    };

    return (
        <div className="card border-l-4 border-l-amber-500 overflow-hidden relative group">
            <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="flex items-center gap-3 p-4 border-b border-amber-500/10">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                    <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                    <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Duplicate Cluster Detected</h4>
                    <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>{items.length} Reports · Category: {items[0]?.category}</p>
                </div>
                <div className="ml-auto text-right">
                    <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
                        {Math.round((items[0]?.similarity || 0) * 100)}% Match
                    </span>
                </div>
            </div>

            <div className="p-4 space-y-3 bg-black/5 dark:bg-white/5">
                {items.map(c => (
                    <div key={c.id}
                        className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer border-2 ${primaryId === c.id
                                ? 'border-green-500 bg-green-500/10 shadow-sm'
                                : 'border-transparent bg-white dark:bg-gray-800 hover:border-amber-500/30'
                            }`}
                        onClick={() => setPrimaryId(c.id)}>
                        <div className="mt-1">
                            {primaryId === c.id
                                ? <CheckSquare className="w-5 h-5 text-green-500" />
                                : <Square className="w-5 h-5 text-gray-400 opacity-50" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                {primaryId === c.id && <span className="text-[9px] font-bold tracking-wider uppercase bg-green-500 text-white px-1.5 py-0.5 rounded">Primary</span>}
                                <p className="text-sm font-bold truncate transition-colors" style={{ color: primaryId === c.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                    {c.title}
                                </p>
                            </div>
                            <div className="flex gap-4 mt-1.5 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 opacity-70" />{c.location}</span>
                                <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 opacity-70" />{c.submittedBy}</span>
                                <span className="flex items-center gap-1.5 font-bold" style={{ color: 'var(--accent-amber)' }}>▲ {c.votes}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 border-t border-amber-500/10">
                <button onClick={handleMerge} className="btn-primary bg-amber-500 hover:bg-amber-600 text-white border-transparent px-5 py-2 text-xs">
                    <Merge className="w-4 h-4 mr-2" /> Merge & Keep Primary
                </button>
                <button onClick={() => onDismiss(items.map(i => i.id))} className="btn-secondary px-5 py-2 text-xs">
                    <X className="w-4 h-4 mr-2" /> Dismiss
                </button>
            </div>
        </div>
    );
};

// ─── Misrouted Card ───────────────────────────────────────────────────────────
const MisroutedCard: React.FC<{ complaint: TriageComplaint; onReroute: (id: string, dept: string) => void; onDismiss: (id: string) => void }> = ({ complaint, onReroute, onDismiss }) => {
    const [target, setTarget] = useState(complaint.correctDepartment || '');
    const departments = ['Roads & Infrastructure', 'Water Services', 'Electricity', 'Waste Management', 'Parks & Recreation', 'Public Safety'];

    return (
        <div className="card border-l-4 border-l-red-500 overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-red-500/10">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                    <Flag className="w-4 h-4" />
                </div>
                <div>
                    <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Misrouted Report</h4>
                    <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>Re-assignment Required</p>
                </div>
            </div>

            <div className="p-5">
                <p className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{complaint.title}</p>

                <div className="flex items-center gap-4 text-xs font-bold mb-5 p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                    <div className="flex-1 text-center text-red-500">
                        <span className="block text-[9px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-faint)' }}>Current</span>
                        {complaint.misroutedTo}
                    </div>
                    <ArrowRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <div className="flex-1 text-center text-green-500">
                        <span className="block text-[9px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-faint)' }}>Suggested</span>
                        {complaint.correctDepartment}
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <select value={target} onChange={e => setTarget(e.target.value)} className="input-field w-full text-xs font-bold appearance-none bg-white dark:bg-gray-800">
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <button onClick={() => onReroute(complaint.id, target)} className="btn-primary px-4 text-xs bg-blue-600 hover:bg-blue-700 border-transparent text-white">
                        <ArrowRight className="w-4 h-4 mr-2" /> Reroute
                    </button>
                    <button onClick={() => onDismiss(complaint.id)} className="btn-secondary px-3">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const TriageQueue: React.FC<TriageQueueProps> = ({ complaints = DEMO_COMPLAINTS }) => {
    const [items, setItems] = useState<TriageComplaint[]>(complaints);
    const [tab, setTab] = useState<'duplicates' | 'misrouted'>('duplicates');

    const { groups, ungrouped: misrouted } = groupDuplicates(items);
    const misroutedItems = items.filter(c => !!c.misroutedTo);
    const dupCount = Object.keys(groups).length;
    const misCount = misroutedItems.length;

    const handleMerge = (primaryId: string, dupeIds: string[]) => {
        setItems(prev => prev.map(c => dupeIds.includes(c.id) ? { ...c, status: 'merged', duplicateGroupId: undefined } : c));
    };
    const handleDismiss = (ids: string[]) => {
        setItems(prev => prev.map(c => ids.includes(c.id) ? { ...c, duplicateGroupId: undefined } : c));
    };
    const handleReroute = (id: string, dept: string) => {
        setItems(prev => prev.map(c => c.id === id ? { ...c, misroutedTo: undefined, correctDepartment: dept } : c));
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>Triage Queue</h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Merge AI-detected duplicate clusters and reassign misrouted reports</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-gray-100/50 dark:bg-gray-800/30 rounded-xl w-fit border" style={{ borderColor: 'var(--border)' }}>
                {[
                    { key: 'duplicates', label: `Duplicate Clusters (${dupCount})` },
                    { key: 'misrouted', label: `Misrouted (${misCount})` },
                ].map(({ key, label }) => (
                    <button key={key} onClick={() => setTab(key as any)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${tab === key ? 'bg-white shadow-sm dark:bg-gray-700/50' : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70'
                            }`} style={{ color: tab === key ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="animate-fade-up">
                {tab === 'duplicates' && (
                    <div className="space-y-4">
                        {Object.entries(groups).map(([gid, items]) => (
                            <DuplicateGroup key={gid} groupId={gid} items={items} onMerge={handleMerge} onDismiss={handleDismiss} />
                        ))}
                        {Object.keys(groups).length === 0 && (
                            <div className="card p-12 text-center flex flex-col items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                                    <CheckSquare className="w-8 h-8 text-green-500" />
                                </div>
                                <h4 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>All clear</h4>
                                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No duplicate groups detected by the AI.</p>
                            </div>
                        )}
                    </div>
                )}

                {tab === 'misrouted' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {misroutedItems.filter(c => !!c.misroutedTo).map(c => (
                            <MisroutedCard key={c.id} complaint={c} onReroute={handleReroute} onDismiss={id => setItems(prev => prev.map(x => x.id === id ? { ...x, misroutedTo: undefined } : x))} />
                        ))}
                        {misroutedItems.length === 0 && (
                            <div className="card p-12 text-center flex flex-col items-center justify-center col-span-1 md:col-span-2">
                                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                                    <CheckSquare className="w-8 h-8 text-green-500" />
                                </div>
                                <h4 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>All clean</h4>
                                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No misrouted complaints requiring attention.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TriageQueue;
