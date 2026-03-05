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
        <div className="border-2 border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/10 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/20">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    Duplicate Group ({items.length} complaints) · {items[0]?.category}
                </span>
                <span className="ml-auto text-xs text-amber-600 dark:text-amber-400 bg-amber-200 dark:bg-amber-800/40 px-2 py-0.5 rounded-full">
                    {Math.round((items[0]?.similarity || 0) * 100)}% similar
                </span>
            </div>
            <div className="p-3 space-y-2">
                {items.map(c => (
                    <div key={c.id} className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer border ${primaryId === c.id ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
                        onClick={() => setPrimaryId(c.id)}>
                        {primaryId === c.id
                            ? <CheckSquare className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            : <Square className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1">{c.title}</p>
                            <div className="flex gap-3 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.location}</span>
                                <span className="flex items-center gap-1"><User className="w-3 h-3" />{c.submittedBy}</span>
                                <span>👍 {c.votes}</span>
                            </div>
                        </div>
                        {primaryId === c.id && (
                            <span className="text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded flex-shrink-0">PRIMARY</span>
                        )}
                    </div>
                ))}
            </div>
            <div className="flex gap-2 px-3 pb-3">
                <button onClick={handleMerge} className="flex items-center gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-xl font-semibold transition-colors">
                    <Merge className="w-3.5 h-3.5" /> Merge → Keep Primary
                </button>
                <button onClick={() => onDismiss(items.map(i => i.id))} className="flex items-center gap-1.5 text-xs border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <X className="w-3.5 h-3.5" /> Not Duplicates
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
        <div className="border-2 border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/10 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/20">
                <Flag className="w-4 h-4 text-red-600" />
                <span className="text-sm font-semibold text-red-800 dark:text-red-300">Misrouted Complaint</span>
            </div>
            <div className="p-3">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">{complaint.title}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span>Currently at: <span className="text-red-600 font-medium">{complaint.misroutedTo}</span></span>
                    <ArrowRight className="w-3 h-3" />
                    <span>Should go to: <span className="text-green-600 font-medium">{complaint.correctDepartment}</span></span>
                </div>
                <div className="flex gap-2">
                    <select value={target} onChange={e => setTarget(e.target.value)} className="flex-1 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1.5">
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <button onClick={() => onReroute(complaint.id, target)} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1 transition-colors">
                        <ArrowRight className="w-3 h-3" /> Reroute
                    </button>
                    <button onClick={() => onDismiss(complaint.id)} className="text-xs border border-gray-200 dark:border-gray-600 text-gray-500 px-2 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <X className="w-3 h-3" />
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
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Triage Queue</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Merge duplicate complaints and reassign misrouted ones</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
                {[
                    { key: 'duplicates', label: `Duplicates (${dupCount})` },
                    { key: 'misrouted', label: `Misrouted (${misCount})` },
                ].map(({ key, label }) => (
                    <button key={key} onClick={() => setTab(key as any)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === key ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {tab === 'duplicates' && (
                <div className="space-y-3">
                    {Object.entries(groups).map(([gid, items]) => (
                        <DuplicateGroup key={gid} groupId={gid} items={items} onMerge={handleMerge} onDismiss={handleDismiss} />
                    ))}
                    {Object.keys(groups).length === 0 && (
                        <div className="text-center py-10 text-gray-400">
                            <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No duplicate groups detected</p>
                        </div>
                    )}
                </div>
            )}

            {tab === 'misrouted' && (
                <div className="space-y-3">
                    {misroutedItems.filter(c => !!c.misroutedTo).map(c => (
                        <MisroutedCard key={c.id} complaint={c} onReroute={handleReroute} onDismiss={id => setItems(prev => prev.map(x => x.id === id ? { ...x, misroutedTo: undefined } : x))} />
                    ))}
                    {misroutedItems.length === 0 && (
                        <div className="text-center py-10 text-gray-400">
                            <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No misrouted complaints</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TriageQueue;
