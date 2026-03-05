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
    { name: 'Very Satisfied', value: 38, color: '#22c55e' },
    { name: 'Satisfied', value: 29, color: '#84cc16' },
    { name: 'Neutral', value: 16, color: '#eab308' },
    { name: 'Unsatisfied', value: 11, color: '#f97316' },
    { name: 'Very Unsatisfied', value: 6, color: '#ef4444' },
];

const WARD_DATA = [
    { ward: 'Ward 1', complaints: 32, resolved: 28, breach: 2 },
    { ward: 'Ward 5', complaints: 47, resolved: 38, breach: 5 },
    { ward: 'Ward 12', complaints: 61, resolved: 44, breach: 9 },
    { ward: 'Ward 18', complaints: 23, resolved: 22, breach: 1 },
    { ward: 'Ward 24', complaints: 38, resolved: 31, breach: 4 },
];

const DEPT_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

// ─── KPI tile ─────────────────────────────────────────────────────────────────
const KPITile: React.FC<{ label: string; value: string | number; sub?: string; color?: string; icon: React.ReactNode }> = ({ label, value, sub, color = 'text-blue-600', icon }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
            <div className={`${color} opacity-80`}>{icon}</div>
        </div>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
);

// ─── Heatmap (SVG grid substitute — no native Leaflet in Vite easily) ─────────
const WardHeatmap: React.FC = () => {
    const maxCount = Math.max(...WARD_DATA.map(w => w.complaints));
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ward-level Complaint Density</h3>
            <div className="grid grid-cols-5 gap-2">
                {WARD_DATA.map(w => {
                    const intensity = w.complaints / maxCount;
                    const bg = intensity > 0.8 ? 'bg-red-600' : intensity > 0.6 ? 'bg-orange-500' : intensity > 0.4 ? 'bg-yellow-400' : intensity > 0.2 ? 'bg-green-400' : 'bg-blue-300';
                    return (
                        <div key={w.ward} className={`relative ${bg} rounded-xl p-3 text-white cursor-pointer hover:scale-105 transition-transform`} style={{ opacity: 0.6 + intensity * 0.4 }}>
                            <p className="text-[10px] font-semibold">{w.ward}</p>
                            <p className="text-lg font-bold">{w.complaints}</p>
                            <p className="text-[10px]">{w.resolved} resolved</p>
                            {w.breach > 0 && <span className="absolute top-1 right-1 text-[9px] bg-white/30 rounded px-1">{w.breach}⚠️</span>}
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-300 block" /> Low</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-400 block" /> Medium</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500 block" /> High</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-600 block" /> Critical</span>
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
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><BarChart2 className="w-5 h-5 text-blue-500" /> Analytics Dashboard</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Department SLA, CSI, ward heatmap, and resolution trends</p>
                </div>
                <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 px-3 py-2 rounded-xl font-medium transition-colors hover:bg-gray-700 dark:hover:bg-gray-300">
                    <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KPITile label="Total Complaints" value={totalComplaints} sub="Last 6 months" color="text-blue-600" icon={<BarChart2 className="w-5 h-5" />} />
                <KPITile label="Resolution Rate" value={`${resolutionRate}%`} sub={`${totalResolved} of ${totalComplaints}`} color="text-green-600" icon={<CheckCircle className="w-5 h-5" />} />
                <KPITile label="CSI Score" value={csi.toFixed(2)} sub="Citizen Satisfaction (max 5)" color="text-yellow-600" icon={<Star className="w-5 h-5" />} />
                <KPITile label="SLA Breaches" value={SLA_DATA.reduce((s, d) => s + d.breach, 0)} sub="All departments" color="text-red-600" icon={<AlertTriangle className="w-5 h-5" />} />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 flex-wrap">
                {[
                    { key: 'overview', label: '📈 Trends' },
                    { key: 'sla', label: '⏱️ Dept SLA' },
                    { key: 'csi', label: '⭐ CSI' },
                    { key: 'ward', label: '🗺️ Ward Map' },
                ].map(({ key, label }) => (
                    <button key={key} onClick={() => setActiveTab(key as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === key ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === 'overview' && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Monthly Complaint Volume & Resolution</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={TREND_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gSubmit" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gResolve" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Area type="monotone" dataKey="submitted" name="Submitted" stroke="#3b82f6" fill="url(#gSubmit)" strokeWidth={2} />
                            <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#22c55e" fill="url(#gResolve)" strokeWidth={2} />
                            <Line type="monotone" dataKey="escalated" name="Escalated" stroke="#ef4444" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="4 2" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {activeTab === 'sla' && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Department SLA Performance (hours)</p>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={SLA_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="dept" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="p50" name="P50 (median)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="p95" name="P95 (95th pct)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="target" name="SLA Target" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                    {/* Breach table */}
                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead><tr className="border-b border-gray-100 dark:border-gray-700">{['Department', 'Target', 'P50', 'P95', 'Breaches'].map(h => <th key={h} className="text-left py-2 px-2 text-gray-500 font-medium">{h}</th>)}</tr></thead>
                            <tbody>
                                {SLA_DATA.map((d, i) => (
                                    <tr key={d.dept} className="border-b border-gray-50 dark:border-gray-700">
                                        <td className="py-2 px-2 font-medium text-gray-800 dark:text-white">{d.dept}</td>
                                        <td className="py-2 px-2 text-gray-500">{d.target}h</td>
                                        <td className={`py-2 px-2 font-semibold ${d.p50 > d.target ? 'text-red-600' : 'text-green-600'}`}>{d.p50}h</td>
                                        <td className={`py-2 px-2 font-semibold ${d.p95 > d.target ? 'text-orange-600' : 'text-blue-600'}`}>{d.p95}h</td>
                                        <td className={`py-2 px-2 font-bold ${d.breach > 10 ? 'text-red-600' : d.breach > 5 ? 'text-orange-500' : 'text-green-600'}`}>{d.breach}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'csi' && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Citizen Satisfaction Index (CSI)</p>
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <ResponsiveContainer width={240} height={220}>
                            <PieChart>
                                <Pie data={CSI_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
                                    {CSI_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: any) => [`${v}%`]} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2 flex-1">
                            {CSI_DATA.map(d => (
                                <div key={d.name} className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                                    <span className="text-xs text-gray-700 dark:text-gray-300 flex-1">{d.name}</span>
                                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${d.value}%`, background: d.color }} />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-8 text-right">{d.value}%</span>
                                </div>
                            ))}
                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                                <p className="text-xs text-gray-500">Overall CSI: <span className="font-bold text-yellow-600">{csi.toFixed(2)} / 5.00</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'ward' && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                    <WardHeatmap />
                </div>
            )}
        </div>
    );
};

export default AnalyticsDashboard;
