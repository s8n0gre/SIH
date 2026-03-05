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

const STATUS_CONFIG: Record<WorkOrderStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    pending: { label: 'Pending', color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-700', icon: <Clock className="w-3 h-3" /> },
    assigned: { label: 'Assigned', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/40', icon: <User className="w-3 h-3" /> },
    'in-progress': { label: 'In Progress', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/40', icon: <Wrench className="w-3 h-3" /> },
    completed: { label: 'Completed', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/40', icon: <CheckCircle className="w-3 h-3" /> },
    cancelled: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/40', icon: <Trash2 className="w-3 h-3" /> },
};

const PRIORITY_CONFIG: Record<WorkOrderPriority, { color: string }> = {
    low: { color: 'text-gray-500' },
    medium: { color: 'text-yellow-600' },
    high: { color: 'text-orange-600' },
    critical: { color: 'text-red-600' },
};

const uid = () => Math.random().toString(36).slice(2, 8);

// ─── Work Order Card ──────────────────────────────────────────────────────────
const WorkOrderCard: React.FC<{ wo: WorkOrder; onStatusChange: (id: string, s: WorkOrderStatus) => void; onDelete: (id: string) => void }> = ({ wo, onStatusChange, onDelete }) => {
    const [expanded, setExpanded] = useState(false);
    const st = STATUS_CONFIG[wo.status];
    const pr = PRIORITY_CONFIG[wo.priority];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Card header */}
            <div className="flex items-start gap-3 p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${st.bg} ${st.color}`}>{st.icon}</div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white line-clamp-1">{wo.title}</p>
                        <span className={`text-[10px] font-bold uppercase flex-shrink-0 ${pr.color}`}>{wo.priority}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{wo.location}</span>
                        {wo.assignedTo && <span className="flex items-center gap-1"><User className="w-3 h-3" />{wo.assignedTo}</span>}
                        {wo.scheduledDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{wo.scheduledDate}</span>}
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${st.color} ${st.bg}`}>
                        {st.icon}{st.label}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {/* Expanded details */}
            {expanded && (
                <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-300">{wo.description}</p>

                    {/* Materials */}
                    {wo.materials && wo.materials.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Materials</p>
                            <div className="flex flex-wrap gap-2">
                                {wo.materials.map((m, i) => (
                                    <span key={i} className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                        {m.name} × {m.qty} {m.unit}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Crew */}
                    {wo.crew && wo.crew.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Crew</p>
                            <div className="flex gap-1">
                                {wo.crew.map((m, i) => (
                                    <span key={i} className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">{m[0]}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Completion notes */}
                    {wo.completionNotes && (
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-xs text-green-700 dark:text-green-400">
                            ✅ {wo.completionNotes}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                        {wo.status !== 'completed' && (
                            <>
                                {wo.status === 'pending' && <button onClick={() => onStatusChange(wo.id, 'assigned')} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl font-medium transition-colors">Mark Assigned</button>}
                                {wo.status === 'assigned' && <button onClick={() => onStatusChange(wo.id, 'in-progress')} className="text-xs bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-xl font-medium transition-colors">Start Work</button>}
                                {wo.status === 'in-progress' && (
                                    <>
                                        <button onClick={() => onStatusChange(wo.id, 'completed')} className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-xl font-medium flex items-center gap-1 transition-colors"><CheckCircle className="w-3 h-3" />Mark Complete</button>
                                        <button className="text-xs border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"><Camera className="w-3 h-3" />Upload Proof</button>
                                    </>
                                )}
                            </>
                        )}
                        <button onClick={() => onDelete(wo.id)} className="text-xs border border-red-200 dark:border-red-800 text-red-500 px-3 py-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-auto">Delete</button>
                    </div>
                </div>
            )}
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
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-blue-300 dark:border-blue-600 p-4 space-y-3">
            <p className="font-semibold text-gray-800 dark:text-white text-sm">New Work Order</p>
            <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Work order title" className="w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-2" />
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Description / scope of work" className="w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-2 resize-none" />
            <div className="grid grid-cols-2 gap-2">
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-2">
                    {['Roads', 'Electricity', 'Water', 'Waste', 'Parks', 'Safety'].map(c => <option key={c}>{c}</option>)}
                </select>
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as WorkOrderPriority })} className="text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-2">
                    {['low', 'medium', 'high', 'critical'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Location / address" className="w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-2" />
            <div className="grid grid-cols-2 gap-2">
                <input value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} placeholder="Assign to (name/team)" className="text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-2" />
                <input type="date" value={form.scheduledDate} onChange={e => setForm({ ...form, scheduledDate: e.target.value })} className="text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-2" />
            </div>
            <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-semibold transition-colors">Create Work Order</button>
                <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
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
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><Wrench className="w-5 h-5 text-orange-500" /> Work Order Manager</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Create, assign, track, and close field work orders</p>
                </div>
                <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl font-medium transition-colors">
                    <Plus className="w-4 h-4" /> New Order
                </button>
            </div>

            {/* Stat pills */}
            <div className="flex gap-2 flex-wrap">
                {[
                    { label: 'All', val: counts.total, key: 'all', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' },
                    { label: 'Pending', val: counts.pending, key: 'pending', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
                    { label: 'In Progress', val: counts.inProgress, key: 'in-progress', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
                    { label: 'Completed', val: counts.completed, key: 'completed', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
                ].map(({ label, val, key, color }) => (
                    <button key={key} onClick={() => setFilterStatus(key as any)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${color} ${filterStatus === key ? 'ring-2 ring-offset-1 ring-blue-500' : 'hover:opacity-80'}`}>
                        {label} ({val})
                    </button>
                ))}
            </div>

            {/* Form */}
            {showForm && <NewWorkOrderForm onAdd={wo => setOrders(prev => [wo, ...prev])} onClose={() => setShowForm(false)} />}

            {/* Orders */}
            <div className="space-y-3">
                {filtered.map(wo => (
                    <WorkOrderCard
                        key={wo.id}
                        wo={wo}
                        onStatusChange={(id, s) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status: s } : o))}
                        onDelete={id => setOrders(prev => prev.filter(o => o.id !== id))}
                    />
                ))}
                {filtered.length === 0 && (
                    <div className="text-center py-10 text-gray-400">
                        <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No work orders found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkOrderManager;
