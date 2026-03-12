import React, { useState } from 'react';
import { Plus, CheckCircle, Clock, Wrench, User, MapPin, Calendar, Trash2, Camera, ChevronDown, AlertCircle } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type WorkOrderStatus = 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
type WorkOrderPriority = 'low' | 'medium' | 'high' | 'critical';

interface Material {
    name: string;
    qty: number;
    unit: string;
}

interface WorkOrder {
    id: string;
    complaintId?: string;
    title: string;
    description: string;
    category: string;
    location: string;
    assignedTo?: string;
    crew?: string[];
    status: WorkOrderStatus;
    priority: WorkOrderPriority;
    scheduledDate?: string;
    estimatedHours?: number;
    materials?: Material[];
    completionNotes?: string;
    createdAt: string;
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_WORK_ORDERS: WorkOrder[] = [
    {
        id: 'wo1', title: 'Pothole Repair — Lalpur Market', description: 'Fill 3 potholes using hot mix asphalt. Area ~6 sqm.', category: 'Roads', location: 'Lalpur Market, Ward 12',
        assignedTo: 'Ranjit Kumar', crew: ['Deepak', 'Suresh'], status: 'in-progress', priority: 'high',
        scheduledDate: '2026-03-04', estimatedHours: 8, materials: [{ name: 'Hot Mix Asphalt', qty: 2, unit: 'tonnes' }, { name: 'Cones', qty: 8, unit: 'pcs' }],
        createdAt: '2026-03-02T10:00:00Z',
    },
    {
        id: 'wo2', title: 'Street Light Replacement — Model Road', description: 'Replace 4 faulty sodium vapor lamps with LED.', category: 'Electricity', location: 'Model Road, Ward 5',
        assignedTo: 'Infra Corp Ltd', status: 'pending', priority: 'medium', scheduledDate: '2026-03-05', estimatedHours: 4,
        materials: [{ name: 'LED Lamp 150W', qty: 4, unit: 'pcs' }], createdAt: '2026-03-01T08:00:00Z',
    },
    {
        id: 'wo3', title: 'Drain Cleaning — Harmu Colony', description: 'Desilt storm drain, ~50 metres.', category: 'Waste', location: 'Harmu Colony',
        assignedTo: 'JUIDCO Team', status: 'completed', priority: 'high', scheduledDate: '2026-03-01', estimatedHours: 6,
        completionNotes: 'Drain cleared. Photo proof uploaded.', createdAt: '2026-02-28T07:00:00Z',
    },
];

const STATUS_CONFIG: Record<WorkOrderStatus, { label: string; colorClass: string; icon: React.ReactNode }> = {
    pending: { label: 'Pending', colorClass: 'badge-neutral', icon: <Clock className="w-3.5 h-3.5" /> },
    assigned: { label: 'Assigned', colorClass: 'badge-info', icon: <User className="w-3.5 h-3.5" /> },
    'in-progress': { label: 'In Progress', colorClass: 'badge-warning', icon: <Wrench className="w-3.5 h-3.5" /> },
    completed: { label: 'Completed', colorClass: 'badge-success', icon: <CheckCircle className="w-3.5 h-3.5" /> },
    cancelled: { label: 'Cancelled', colorClass: 'badge-error', icon: <Trash2 className="w-3.5 h-3.5" /> },
};

const PRIORITY_CONFIG: Record<WorkOrderPriority, { color: string }> = {
    low: { color: 'var(--text-muted)' },
    medium: { color: '#f59e0b' },
    high: { color: '#f97316' },
    critical: { color: '#ef4444' },
};

const uid = () => Math.random().toString(36).slice(2, 8);

// ─── Work Order Card ──────────────────────────────────────────────────────────
const WorkOrderCard: React.FC<{ wo: WorkOrder; onStatusChange: (id: string, s: WorkOrderStatus) => void; onDelete: (id: string) => void }> = ({ wo, onStatusChange, onDelete }) => {
    const [expanded, setExpanded] = useState(false);
    const st = STATUS_CONFIG[wo.status];
    const pr = PRIORITY_CONFIG[wo.priority];

    return (
        <div className="card transition-all duration-300 overflow-hidden group hover:border-amber-500/30">
            {/* Card header */}
            <div className="flex items-start gap-4 p-5 cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${st.colorClass}`}>
                    {st.icon}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                        <p className="text-base font-bold truncate" style={{ color: 'var(--text-primary)' }}>{wo.title}</p>
                        <span className="text-[10px] font-bold uppercase tracking-wider flex-shrink-0 px-2 py-0.5 rounded" style={{ color: pr.color, border: `1px solid ${pr.color}30`, backgroundColor: `${pr.color}10` }}>
                            {wo.priority}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium flex-wrap" style={{ color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 opacity-70" />{wo.location}</span>
                        {wo.assignedTo && <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 opacity-70" />{wo.assignedTo}</span>}
                        {wo.scheduledDate && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 opacity-70" />{new Date(wo.scheduledDate).toLocaleDateString()}</span>}
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${st.colorClass}`}>
                        {st.label}
                    </span>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
                    </div>
                </div>
            </div>

            {/* Expanded details */}
            <div className={`grid transition-all duration-300 ease-in-out ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="px-5 pb-5 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>{wo.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                            {/* Materials */}
                            {wo.materials && wo.materials.length > 0 && (
                                <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                                    <p className="text-[10px] uppercase font-bold tracking-wider mb-2" style={{ color: 'var(--text-faint)' }}>Bill of Materials</p>
                                    <div className="flex flex-wrap gap-2">
                                        {wo.materials.map((m, i) => (
                                            <span key={i} className="text-xs font-mono font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded border border-blue-500/20">
                                                {m.qty} {m.unit} <span className="opacity-50 mx-1">×</span> {m.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Crew */}
                            {wo.crew && wo.crew.length > 0 && (
                                <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                                    <p className="text-[10px] uppercase font-bold tracking-wider mb-2" style={{ color: 'var(--text-faint)' }}>Assigned Crew</p>
                                    <div className="flex flex-wrap gap-2">
                                        {wo.crew.map((m, i) => (
                                            <span key={i} className="text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-500/20 flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> {m}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Completion notes */}
                        {wo.completionNotes && (
                            <div className="mb-5 p-3 rounded-xl border border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400 text-sm flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-70 mb-0.5">Execution Notes</p>
                                    <p className="font-medium">{wo.completionNotes}</p>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                            {wo.status !== 'completed' && (
                                <>
                                    {wo.status === 'pending' && <button onClick={() => onStatusChange(wo.id, 'assigned')} className="btn-primary text-xs px-4 bg-blue-600 hover:bg-blue-700 border-none text-white">Mark Assigned</button>}
                                    {wo.status === 'assigned' && <button onClick={() => onStatusChange(wo.id, 'in-progress')} className="btn-primary text-xs px-4 bg-amber-500 hover:bg-amber-600 border-none text-white shadow-amber-500/20 shadow-lg">Start Work</button>}
                                    {wo.status === 'in-progress' && (
                                        <>
                                            <button onClick={() => onStatusChange(wo.id, 'completed')} className="btn-primary text-xs px-4 bg-green-500 hover:bg-green-600 border-none text-white shadow-green-500/20 shadow-lg">
                                                <CheckCircle className="w-4 h-4 mr-1.5" /> Mark Complete
                                            </button>
                                            <button className="btn-secondary text-xs px-4">
                                                <Camera className="w-4 h-4 mr-1.5" /> Field Proof
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                            <button onClick={() => onDelete(wo.id)} className="btn-secondary text-xs px-4 ml-auto text-red-500 hover:text-red-600 hover:bg-red-500/10 hover:border-red-500/30">
                                Delete Order
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── New Work Order Form ──────────────────────────────────────────────────────
const NewWorkOrderForm: React.FC<{ onAdd: (wo: WorkOrder) => void; onClose: () => void }> = ({ onAdd, onClose }) => {
    const [form, setForm] = useState({ title: '', description: '', category: 'Roads', location: '', assignedTo: '', priority: 'medium' as WorkOrderPriority, scheduledDate: '', estimatedHours: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({ ...form, id: `wo-${uid()}`, status: 'pending', crew: [], materials: [], createdAt: new Date().toISOString(), estimatedHours: Number(form.estimatedHours) || undefined });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="card p-6 border-l-4 border-l-blue-500 shadow-xl relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Dispatch New Work Order</h3>
                    <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>Fill details to generate job card</p>
                </div>
                <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                </button>
            </div>

            <div className="space-y-4 relative z-10">
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Work order title" className="input-field w-full font-semibold" />
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Description / scope of work" className="input-field w-full resize-none" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field w-full appearance-none bg-transparent">
                            {['Roads', 'Electricity', 'Water', 'Waste', 'Parks', 'Safety'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <div className="relative">
                        <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as WorkOrderPriority })} className="input-field w-full appearance-none bg-transparent">
                            {['low', 'medium', 'high', 'critical'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)} Priority</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                    </div>
                </div>

                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Location / address" className="input-field w-full" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} placeholder="Assign to (name/team)" className="input-field w-full" />
                    <input type="date" value={form.scheduledDate} onChange={e => setForm({ ...form, scheduledDate: e.target.value })} className="input-field w-full" />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="btn-secondary px-6">Cancel</button>
                    <button type="submit" className="btn-primary bg-blue-600 hover:bg-blue-700 text-white border-transparent px-8 shadow-blue-500/25 shadow-lg">Generate Job</button>
                </div>
            </div>
        </form>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const WorkOrderManager: React.FC = () => {
    const [orders, setOrders] = useState<WorkOrder[]>(DEMO_WORK_ORDERS);
    const [showForm, setShowForm] = useState(false);
    const [filterStatus, setFilterStatus] = useState<WorkOrderStatus | 'all'>('all');

    const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);

    const counts = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        inProgress: orders.filter(o => o.status === 'in-progress').length,
        completed: orders.filter(o => o.status === 'completed').length,
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>Work Orders</h2>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Dispatch, assign, and track field operations</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn-primary px-5 text-sm bg-blue-600 hover:bg-blue-700 text-white border-transparent shadow-blue-500/20 shadow-lg">
                    <Plus className="w-4 h-4 mr-1.5" /> Dispatch Order
                </button>
            </div>

            {/* Form Inject */}
            {showForm && <NewWorkOrderForm onAdd={wo => setOrders(prev => [wo, ...prev])} onClose={() => setShowForm(false)} />}

            {/* Filters */}
            <div className="flex gap-2 p-1.5 bg-gray-100/50 dark:bg-gray-800/30 rounded-xl w-fit border overflow-x-auto max-w-full" style={{ borderColor: 'var(--border)' }}>
                {[
                    { label: 'All Jobs', val: counts.total, key: 'all' },
                    { label: 'Pending', val: counts.pending, key: 'pending' },
                    { label: 'Active', val: counts.inProgress, key: 'in-progress' },
                    { label: 'Completed', val: counts.completed, key: 'completed' },
                ].map(({ label, val, key }) => (
                    <button key={key} onClick={() => setFilterStatus(key as any)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${filterStatus === key ? 'bg-white shadow-sm dark:bg-gray-700/50' : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70'
                            }`} style={{ color: filterStatus === key ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {label}
                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${filterStatus === key ? 'bg-blue-500/10 text-blue-500' : 'bg-black/10 dark:bg-white/10'}`}>
                            {val}
                        </span>
                    </button>
                ))}
            </div>

            {/* Orders Stack */}
            <div className="space-y-4 animate-fade-up">
                {filtered.map(wo => (
                    <WorkOrderCard
                        key={wo.id}
                        wo={wo}
                        onStatusChange={(id, s) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status: s } : o))}
                        onDelete={id => setOrders(prev => prev.filter(o => o.id !== id))}
                    />
                ))}

                {filtered.length === 0 && (
                    <div className="card p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-blue-500" />
                        </div>
                        <h4 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Queue empty</h4>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No work orders match the current filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkOrderManager;
