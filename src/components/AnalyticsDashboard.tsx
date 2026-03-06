import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { TrendingUp, Download, Star, CheckCircle, AlertTriangle, BarChart2 } from 'lucide-react';

// ─── Demo data ────────────────────────────────────────────────────────────────
const SLA_DATA = [
    { dept: 'Roads', p50: 54, p95: 98, target: 72, breach: 12 },
    { dept: 'Water', p50: 18, p95: 41, target: 24, breach: 3 },
    { dept: 'Electricity', p50: 22, p95: 50, target: 24, breach: 5 },
    { dept: 'Waste', p50: 38, p95: 71, target: 48, breach: 8 },
    { dept: 'Parks', p50: 120, p95: 190, target: 168, breach: 15 },
];

const TREND_DATA = [
    { month: 'Oct', submitted: 120, resolved: 98, escalated: 8 },
    { month: 'Nov', submitted: 145, resolved: 130, escalated: 11 },
    { month: 'Dec', submitted: 98, resolved: 91, escalated: 5 },
    { month: 'Jan', submitted: 163, resolved: 140, escalated: 14 },
    { month: 'Feb', submitted: 134, resolved: 128, escalated: 7 },
    { month: 'Mar', submitted: 87, resolved: 72, escalated: 6 },
];

const CSI_DATA = [
    { name: 'Very Satisfied', value: 38, color: '#f59e0b' },
    { name: 'Satisfied', value: 29, color: '#10b981' },
    { name: 'Neutral', value: 16, color: '#3b82f6' },
    { name: 'Unsatisfied', value: 11, color: '#8b5cf6' },
    { name: 'Very Unsatisfied', value: 6, color: '#ef4444' },
];

const WARD_DATA = [
    { ward: 'Ward 1', complaints: 32, resolved: 28, breach: 2 },
    { ward: 'Ward 5', complaints: 47, resolved: 38, breach: 5 },
    { ward: 'Ward 12', complaints: 61, resolved: 44, breach: 9 },
    { ward: 'Ward 18', complaints: 23, resolved: 22, breach: 1 },
    { ward: 'Ward 24', complaints: 38, resolved: 31, breach: 4 },
];

// ─── KPI tile ─────────────────────────────────────────────────────────────────
const KPITile: React.FC<{ label: string; value: string | number; sub?: string; icon: React.ReactNode; trend?: 'up' | 'down' | 'neutral' }> = ({ label, value, sub, icon, trend }) => (
    <div className="card p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500" style={{ color: 'var(--text-primary)' }}>
            {icon}
        </div>
        <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <div className="flex items-end gap-3 mb-1">
                <p className="text-3xl font-mono tracking-tight font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
                {trend && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 mb-1 ${trend === 'up' ? 'bg-green-500/10 text-green-500' : trend === 'down' ? 'bg-red-500/10 text-red-500' : 'bg-gray-500/10 text-gray-500'
                        }`}>
                        {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
                    </span>
                )}
            </div>
            {sub && <p className="text-[10px] font-medium" style={{ color: 'var(--text-faint)' }}>{sub}</p>}
        </div>
    </div>
);

// ─── Heatmap ──────────────────────────────────────────────────────────────────
const WardHeatmap: React.FC = () => {
    const maxCount = Math.max(...WARD_DATA.map(w => w.complaints));
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Ward-level Density Matrix</h3>
            <div className="grid grid-cols-5 gap-3">
                {WARD_DATA.map(w => {
                    const intensity = w.complaints / maxCount;
                    // Using amber/orange scale for premium look
                    const scale = intensity > 0.8 ? 500 : intensity > 0.6 ? 400 : intensity > 0.4 ? 300 : intensity > 0.2 ? 200 : 100;
                    return (
                        <div key={w.ward} className="relative rounded-xl p-3 cursor-pointer hover:scale-105 transition-all duration-300 border border-transparent hover:border-amber-500/30 overflow-hidden group" style={{ background: 'var(--bg-elevated)' }}>
                            <div className="absolute inset-0 opacity-20 transition-opacity group-hover:opacity-40" style={{ backgroundColor: `var(--amber-${scale})` }} />
                            <div className="relative z-10">
                                <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>{w.ward}</p>
                                <p className="text-xl font-bold font-mono my-1" style={{ color: 'var(--text-primary)' }}>{w.complaints}</p>
                                <p className="text-[10px] font-medium" style={{ color: 'var(--text-faint)' }}>{w.resolved} resolved</p>
                            </div>
                            {w.breach > 0 && <span className="absolute top-2 right-2 text-[10px] font-bold bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded">{w.breach}</span>}
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-amber-500/20 border border-amber-500/30 block" /> Low</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-amber-500/50 border border-amber-500/60 block" /> Medium</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-amber-500 border border-amber-400 block" /> Critical</span>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AnalyticsDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'sla' | 'csi' | 'ward'>('overview');

    const csi = (CSI_DATA[0].value * 5 + CSI_DATA[1].value * 4 + CSI_DATA[2].value * 3 + CSI_DATA[3].value * 2 + CSI_DATA[4].value * 1) / 100;
    const totalComplaints = TREND_DATA.reduce((s, d) => s + d.submitted, 0);
    const totalResolved = TREND_DATA.reduce((s, d) => s + d.resolved, 0);
    const resolutionRate = Math.round((totalResolved / totalComplaints) * 100);

    const exportCSV = () => {
        const header = 'Department,P50 (hrs),P95 (hrs),Target SLA,Breaches\n';
        const rows = SLA_DATA.map(d => `${d.dept},${d.p50},${d.p95},${d.target},${d.breach}`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'analytics_export.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>Analytics & Metrics</h2>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>System-wide performance, SLA, and CSI tracking</p>
                </div>
                <button onClick={exportCSV} className="btn-secondary px-4 py-2 text-xs font-semibold">
                    <Download className="w-3.5 h-3.5 mr-1.5" /> Export Data CSV
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
                <KPITile label="Total Active" value={totalComplaints} sub="System-wide volume" icon={<BarChart2 className="w-6 h-6" />} trend="up" />
                <KPITile label="Resolution Rate" value={`${resolutionRate}%`} sub="Across all wards" icon={<CheckCircle className="w-6 h-6" />} trend="up" />
                <KPITile label="CSI Index" value={csi.toFixed(2)} sub="Satisfaction (Max 5.0)" icon={<Star className="w-6 h-6" />} trend="neutral" />
                <KPITile label="SLA Breaches" value={SLA_DATA.reduce((s, d) => s + d.breach, 0)} sub="Requires attention" icon={<AlertTriangle className="w-6 h-6" />} trend="down" />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-gray-100/50 dark:bg-gray-800/30 rounded-xl w-fit border" style={{ borderColor: 'var(--border)' }}>
                {[
                    { key: 'overview', label: 'Volume Trends' },
                    { key: 'sla', label: 'SLA Performance' },
                    { key: 'csi', label: 'Satisfaction Map' },
                    { key: 'ward', label: 'Density Matrix' },
                ].map(({ key, label }) => (
                    <button key={key} onClick={() => setActiveTab(key as any)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${activeTab === key ? 'bg-white shadow-sm dark:bg-gray-700/50' : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70'
                            }`} style={{ color: activeTab === key ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="card p-6 animate-fade-up">
                {activeTab === 'overview' && (
                    <div>
                        <p className="text-sm font-bold tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>Volume Progression (6mo)</p>
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={TREND_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gSubmit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gResolve" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }} />
                                <Legend wrapperStyle={{ fontSize: 11, fontWeight: 'bold', color: 'var(--text-muted)' }} />
                                <Area type="monotone" dataKey="submitted" name="Net Opened" stroke="#f59e0b" fill="url(#gSubmit)" strokeWidth={3} />
                                <Area type="monotone" dataKey="resolved" name="Net Resolved" stroke="#10b981" fill="url(#gResolve)" strokeWidth={3} />
                                <Line type="monotone" dataKey="escalated" name="Escalations" stroke="#ef4444" strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} strokeDasharray="4 4" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {activeTab === 'sla' && (
                    <div>
                        <p className="text-sm font-bold tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>SLA Delivery Deviation (hrs)</p>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={SLA_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="dept" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'var(--bg-elevated)' }} contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }} />
                                <Legend wrapperStyle={{ fontSize: 11, fontWeight: 'bold' }} />
                                <Bar dataKey="p50" name="Median (P50)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="p95" name="Tail (P95)" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="target" name="SLA Limit" fill="#64748b" radius={[4, 4, 0, 0]} maxBarSize={40} opacity={0.3} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {activeTab === 'csi' && (
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex-1 w-full">
                            <p className="text-sm font-bold tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>Citizen Satisfaction Survey</p>
                            <div className="space-y-4">
                                {CSI_DATA.map(d => (
                                    <div key={d.name} className="flex items-center gap-4">
                                        <span className="text-xs font-bold w-32" style={{ color: 'var(--text-primary)' }}>{d.name}</span>
                                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${d.value}%`, background: d.color }} />
                                        </div>
                                        <span className="text-xs font-mono font-bold w-12 text-right" style={{ color: 'var(--text-secondary)' }}>{d.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-64 h-64 p-4 border rounded-フル hidden md:flex items-center justify-center flex-col relative" style={{ borderColor: 'var(--border)', borderRadius: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%" className="absolute inset-0">
                                <PieChart>
                                    <Pie data={CSI_DATA} cx="50%" cy="50%" innerRadius={70} outerRadius={90} dataKey="value" stroke="none" paddingAngle={2}>
                                        {CSI_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="relative z-10 text-center">
                                <p className="text-3xl font-bold font-mono" style={{ color: 'var(--accent-amber)' }}>{csi.toFixed(2)}</p>
                                <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>Aggregate / 5.0</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'ward' && <WardHeatmap />}
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
