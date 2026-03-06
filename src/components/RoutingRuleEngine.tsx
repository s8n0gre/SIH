import React, { useState } from 'react';
import { Plus, Trash2, Play, CheckCircle, AlertCircle, MapPin, Tag, Zap, Save, GripVertical } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type RoutingConditionType = 'keyword' | 'category' | 'geo' | 'severity';
type RoutingAction = 'assign-department' | 'assign-officer' | 'set-priority' | 'set-sla';
type Priority = 'low' | 'medium' | 'high' | 'critical';

interface RoutingCondition {
    id: string;
    type: RoutingConditionType;
    value: string;
}

interface RoutingAction_ {
    id: string;
    action: RoutingAction;
    value: string;
}

interface RoutingRule {
    id: string;
    name: string;
    description?: string;
    active: boolean;
    priority: number;
    conditions: RoutingCondition[];
    actions: RoutingAction_[];
    matchCount?: number;
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_RULES: RoutingRule[] = [
    {
        id: '1', name: 'Pothole Fast Track', active: true, priority: 1, matchCount: 47,
        description: 'High-severity pothole complaints go directly to Ward Engineer',
        conditions: [
            { id: 'c1', type: 'keyword', value: 'pothole' },
            { id: 'c2', type: 'severity', value: 'high' },
        ],
        actions: [
            { id: 'a1', action: 'assign-department', value: 'Roads & Infrastructure' },
            { id: 'a2', action: 'set-sla', value: '48' },
        ],
    },
    {
        id: '2', name: 'Water Crisis Alert', active: true, priority: 2, matchCount: 21,
        description: 'Category-based routing for water service failures',
        conditions: [
            { id: 'c3', type: 'category', value: 'Water Services' },
        ],
        actions: [
            { id: 'a3', action: 'assign-department', value: 'JUIDCO / Water Board' },
            { id: 'a4', action: 'set-priority', value: 'high' },
            { id: 'a5', action: 'set-sla', value: '24' },
        ],
    },
];

const DEPARTMENTS = [
    // Core Infrastructure
    'Roads & Infrastructure', 'Water Services', 'Electricity Services',
    // Sanitation
    'Waste Management',
    // Transport
    'Public Transport', 'Parking Admin',
    // Other
    'Parks & Recreation', 'Public Safety'
];

const CONDITION_TYPES: { value: RoutingConditionType; label: string; icon: React.ReactNode }[] = [
    { value: 'keyword', label: 'Keyword Match', icon: <Tag className="w-3.5 h-3.5" /> },
    { value: 'category', label: 'Report Category', icon: <Tag className="w-3.5 h-3.5" /> },
    { value: 'geo', label: 'Geofence / Ward', icon: <MapPin className="w-3.5 h-3.5" /> },
    { value: 'severity', label: 'AI Severity', icon: <AlertCircle className="w-3.5 h-3.5" /> },
];

const uid = () => Math.random().toString(36).slice(2, 8);

// ─── Custom Toggle Component ──────────────────────────────────────────────────
const Toggle: React.FC<{ active: boolean; onChange: () => void }> = ({ active, onChange }) => (
    <button
        onClick={onChange}
        className={`w-12 h-6 rounded-full flex-shrink-0 transition-all duration-300 relative border-2 ${active
                ? 'bg-blue-500 border-blue-500 shadow-inner'
                : 'bg-gray-200 dark:bg-gray-700 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
            }`}
    >
        <span
            className={`absolute top-0.5 bottom-0.5 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ease-spring ${active ? 'left-[2px] translate-x-[22px]' : 'left-[2px] translate-x-0'
                }`}
        />
    </button>
);

// ─── Rule Editor ─────────────────────────────────────────────────────────────
const RuleEditor: React.FC<{ rule: RoutingRule; onChange: (r: RoutingRule) => void; onDelete: () => void }> = ({ rule, onChange, onDelete }) => {
    const addCondition = () => onChange({ ...rule, conditions: [...rule.conditions, { id: uid(), type: 'keyword', value: '' }] });
    const addAction = () => onChange({ ...rule, actions: [...rule.actions, { id: uid(), action: 'assign-department', value: '' }] });

    return (
        <div className={`card overflow-hidden transition-all duration-300 border-l-[6px] ${rule.active ? 'border-l-blue-500 dark:border-l-blue-500 shadow-lg shadow-blue-500/5' : 'border-l-gray-300 dark:border-l-gray-600 opacity-60'
            }`}>
            {/* Rule Header */}
            <div className="flex items-center gap-4 px-5 py-4 bg-gray-50/50 dark:bg-black/20 border-b" style={{ borderColor: 'var(--border)' }}>
                <GripVertical className="w-5 h-5 text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600 transition-colors" />
                <Toggle active={rule.active} onChange={() => onChange({ ...rule, active: !rule.active })} />

                <div className="flex-1 min-w-0 flex items-center gap-3">
                    <input
                        value={rule.name}
                        onChange={e => onChange({ ...rule, name: e.target.value })}
                        className="bg-transparent border-none font-bold text-lg focus:ring-0 p-0 w-64 placeholder-gray-400"
                        style={{ color: 'var(--text-primary)' }}
                        placeholder="Automation Name..."
                    />
                    {rule.matchCount !== undefined && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                            {rule.matchCount} Executions
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-faint)' }}>Execution Order</p>
                        <p className="text-sm font-mono font-bold" style={{ color: 'var(--text-secondary)' }}>Priority {rule.priority}</p>
                    </div>
                    <button onClick={onDelete} className="p-2 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Rule Body (No-Code Style) */}
            <div className="p-5 flex flex-col md:flex-row gap-6 relative">

                {/* Visual Connector Line for Desktop */}
                <div className="hidden md:block absolute left-1/2 top-8 bottom-8 w-px bg-gray-200 dark:bg-gray-700 -ml-px z-0 pointer-events-none" />

                {/* Conditions Block */}
                <div className="flex-1 relative z-10">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                <Zap className="w-3.5 h-3.5 text-indigo-500" />
                            </div>
                            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>TRIGGER WHEN</p>
                        </div>
                        <button onClick={addCondition} className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 px-2 py-1 rounded transition-colors flex items-center gap-1">
                            <Plus className="w-3 h-3" /> Add
                        </button>
                    </div>

                    <div className="space-y-3">
                        {rule.conditions.map((c, i) => (
                            <div key={c.id} className="relative">
                                {/* Visual AND connector */}
                                {i > 0 && <div className="absolute -top-3 left-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">AND</div>}

                                <div className="flex gap-2 p-1.5 rounded-lg border bg-white dark:bg-gray-800 shadow-sm" style={{ borderColor: 'var(--border)' }}>
                                    <div className="relative w-1/3">
                                        <select
                                            value={c.type}
                                            onChange={e => onChange({ ...rule, conditions: rule.conditions.map(x => x.id === c.id ? { ...x, type: e.target.value as RoutingConditionType } : x) })}
                                            className="w-full text-xs font-semibold bg-gray-50 dark:bg-gray-900 border-none rounded-md px-2 py-2 appearance-none focus:ring-1 focus:ring-indigo-500"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {CONDITION_TYPES.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex-1 relative">
                                        <input
                                            value={c.value}
                                            onChange={e => onChange({ ...rule, conditions: rule.conditions.map(x => x.id === c.id ? { ...x, value: e.target.value } : x) })}
                                            placeholder={c.type === 'severity' ? 'high/critical...' : 'Value matches...'}
                                            className="w-full text-xs font-mono bg-transparent border-none rounded-md px-2 py-2 focus:ring-1 focus:ring-indigo-500"
                                            style={{ color: 'var(--text-primary)' }}
                                        />
                                    </div>
                                    <button onClick={() => onChange({ ...rule, conditions: rule.conditions.filter(x => x.id !== c.id) })} className="px-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {rule.conditions.length === 0 && (
                            <div className="p-3 border border-dashed rounded-lg text-center" style={{ borderColor: 'var(--border)' }}>
                                <p className="text-xs font-medium italic" style={{ color: 'var(--text-faint)' }}>Matches every incoming report (Catch-all)</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions Block */}
                <div className="flex-1 relative z-10">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center border border-green-500/30">
                                <Play className="w-3.5 h-3.5 text-green-500" />
                            </div>
                            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>THEN DO</p>
                        </div>
                        <button onClick={addAction} className="text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400 hover:bg-green-500/10 px-2 py-1 rounded transition-colors flex items-center gap-1">
                            <Plus className="w-3 h-3" /> Add
                        </button>
                    </div>

                    <div className="space-y-3">
                        {rule.actions.map((a, i) => (
                            <div key={a.id} className="relative">
                                {/* Visual step connector */}
                                {i > 0 && <div className="absolute -top-3 left-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">THEN</div>}

                                <div className="flex gap-2 p-1.5 rounded-lg border bg-white dark:bg-gray-800 shadow-sm" style={{ borderColor: 'var(--border)' }}>
                                    <div className="relative w-1/3 text-xs bg-gray-50 dark:bg-gray-900 rounded-md">
                                        <select
                                            value={a.action}
                                            onChange={e => onChange({ ...rule, actions: rule.actions.map(x => x.id === a.id ? { ...x, action: e.target.value as RoutingAction } : x) })}
                                            className="w-full h-full font-semibold bg-transparent border-none appearance-none px-2 py-2 focus:ring-1 focus:ring-green-500"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            <option value="assign-department">Assign Dept</option>
                                            <option value="assign-officer">Assign User</option>
                                            <option value="set-priority">Set Priority</option>
                                            <option value="set-sla">Set SLA</option>
                                        </select>
                                    </div>
                                    <div className="flex-1 relative text-xs font-mono">
                                        {a.action === 'assign-department' ? (
                                            <select
                                                value={a.value}
                                                onChange={e => onChange({ ...rule, actions: rule.actions.map(x => x.id === a.id ? { ...x, value: e.target.value } : x) })}
                                                className="w-full bg-transparent border-none rounded-md px-2 py-2 focus:ring-1 focus:ring-green-500 appearance-none"
                                            >
                                                <option value="" disabled>Select department...</option>
                                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        ) : a.action === 'set-priority' ? (
                                            <select
                                                value={a.value}
                                                onChange={e => onChange({ ...rule, actions: rule.actions.map(x => x.id === a.id ? { ...x, value: e.target.value } : x) })}
                                                className="w-full bg-transparent border-none rounded-md px-2 py-2 focus:ring-1 focus:ring-green-500 appearance-none"
                                            >
                                                {(['low', 'medium', 'high', 'critical'] as Priority[]).map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        ) : (
                                            <input
                                                value={a.value}
                                                onChange={e => onChange({ ...rule, actions: rule.actions.map(x => x.id === a.id ? { ...x, value: e.target.value } : x) })}
                                                placeholder={a.action === 'set-sla' ? 'Hours to resolve' : 'Officer UUID/Email'}
                                                className="w-full bg-transparent border-none rounded-md px-2 py-2 focus:ring-1 focus:ring-green-500"
                                            />
                                        )}
                                    </div>
                                    <button onClick={() => onChange({ ...rule, actions: rule.actions.filter(x => x.id !== a.id) })} className="px-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {rule.actions.length === 0 && (
                            <div className="p-3 border border-dashed rounded-lg text-center bg-red-500/5" style={{ borderColor: 'var(--border)' }}>
                                <p className="text-xs font-bold text-red-500">Missing action block</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

// ─── Test Panel ───────────────────────────────────────────────────────────────
const TestPanel: React.FC<{ rules: RoutingRule[] }> = ({ rules }) => {
    const [testTitle, setTestTitle] = useState('Water pipe burst near Lalpur');
    const [testCategory, setTestCategory] = useState('Water Services');
    const [testSeverity, setTestSeverity] = useState('high');
    const [testResult, setTestResult] = useState<{ rule: string; actions: string[] } | null>(null);

    const runTest = () => {
        for (const rule of [...rules].sort((a, b) => a.priority - b.priority)) {
            if (!rule.active) continue;
            const matches = rule.conditions.every(c => {
                if (c.type === 'keyword') return testTitle.toLowerCase().includes(c.value.toLowerCase());
                if (c.type === 'category') return testCategory === c.value;
                if (c.type === 'severity') return testSeverity === c.value;
                return true;
            });
            if (matches || rule.conditions.length === 0) {
                setTestResult({
                    rule: rule.name,
                    actions: rule.actions.map(a => `${a.action}: ${a.value}`),
                });
                return;
            }
        }
        setTestResult({ rule: '(No matching rule — default routing applies)', actions: [] });
    };

    return (
        <div className="card p-5 mt-6 border-transparent bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <Play className="w-3 h-3 text-indigo-500 translate-x-px" />
                </div>
                <div>
                    <p className="font-bold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>Dry Run Simulator</p>
                    <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>Test your automation logic</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3 mb-4">
                <input value={testTitle} onChange={e => setTestTitle(e.target.value)} placeholder="Simulated Title" className="input-field w-full text-xs font-semibold" />
                <select value={testCategory} onChange={e => setTestCategory(e.target.value)} className="input-field w-full text-xs font-semibold appearance-none bg-white dark:bg-gray-800">
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={testSeverity} onChange={e => setTestSeverity(e.target.value)} className="input-field w-full text-xs font-semibold appearance-none bg-white dark:bg-gray-800 uppercase tracking-wider">
                    {['low', 'medium', 'high', 'critical'].map(s => <option key={s} value={s}>{s} Severity</option>)}
                </select>
            </div>

            <div className="flex items-center gap-4">
                <button onClick={runTest} className="btn-primary flex items-center gap-2 px-5 py-2 text-xs bg-indigo-500 hover:bg-indigo-600 border-none text-white shadow-indigo-500/20 shadow-lg">
                    <Play className="w-3 h-3 fill-current" /> Execute Test
                </button>

                {testResult && (
                    <div className="flex-1 flex items-center gap-3 px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border animate-fade-in" style={{ borderColor: testResult.actions.length > 0 ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)' }}>
                        {testResult.actions.length > 0 ? (
                            <>
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <div className="text-xs">
                                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Matched: {testResult.rule}</span>
                                    <span className="mx-2 text-gray-300 dark:text-gray-700">|</span>
                                    <span className="font-mono text-green-600 dark:text-green-400">
                                        {testResult.actions.join(' → ')}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{testResult.rule}</span>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const RoutingRuleEngine: React.FC = () => {
    const [rules, setRules] = useState<RoutingRule[]>(DEMO_RULES);
    const [saved, setSaved] = useState(false);

    const addRule = () => setRules(prev => [...prev, {
        id: uid(), name: 'New Automation Rule', active: true, priority: prev.length + 1,
        conditions: [{ id: uid(), type: 'category', value: '' }], actions: [{ id: uid(), action: 'assign-department', value: '' }],
    }]);

    const handleSave = () => {
        localStorage.setItem('routingRules', JSON.stringify(rules));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold tracking-tight mb-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Zap className="w-5 h-5 text-indigo-500" /> Auto-Routing Engine
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Visual workflow builder for complaint classification and assignment</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={addRule} className="btn-secondary px-5 text-sm border-dashed hover:border-solid">
                        <Plus className="w-4 h-4 mr-1.5" /> New Automation
                    </button>
                    <button onClick={handleSave} className={`btn-primary px-6 text-sm flex items-center gap-2 transition-all shadow-lg ${saved ? 'bg-green-500 border-green-500 text-white shadow-green-500/20' : 'bg-blue-600 border-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'}`}>
                        {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saved ? 'Saved!' : 'Publish Automations'}
                    </button>
                </div>
            </div>

            {/* Active rules */}
            <div className="space-y-4 animate-fade-up">
                {rules.map(rule => (
                    <RuleEditor
                        key={rule.id}
                        rule={rule}
                        onChange={updated => setRules(prev => prev.map(r => r.id === updated.id ? updated : r))}
                        onDelete={() => setRules(prev => prev.filter(r => r.id !== rule.id))}
                    />
                ))}

                {rules.length === 0 && (
                    <div className="card p-12 text-center flex flex-col items-center justify-center border-dashed border-2">
                        <div className="w-16 h-16 rounded-full bg-gray-500/10 flex items-center justify-center mb-4">
                            <Zap className="w-8 h-8 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>No active automations</h4>
                        <p className="text-sm font-medium mb-4" style={{ color: 'var(--text-muted)' }}>All reports are currently being routed to the default inbox.</p>
                        <button onClick={addRule} className="btn-primary bg-indigo-500 border-transparent text-white shadow-indigo-500/20 shadow-lg px-6">
                            Create first rule
                        </button>
                    </div>
                )}
            </div>

            {/* Simulator */}
            <TestPanel rules={rules} />
        </div>
    );
};

export default RoutingRuleEngine;
