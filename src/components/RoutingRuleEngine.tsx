import React, { useState } from 'react';
import { Plus, Trash2, Play, CheckCircle, AlertCircle, MapPin, Tag, Zap, Save } from 'lucide-react';

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
    // Core Infrastructure Services
    'Roads & Infrastructure',
    'Water Services',
    'Electricity Services',
    // Sanitation and Environmental Services
    'Waste Management',
    // Transport and Urban Mobility
    'Public Transport Operations',
    'Parking Administration',
    // Urban Planning and Asset Administration
    'Estate and Land Management',
    'Procurement and Stores',
    'Mechanical and Workshop Services',
    // Governance, Citizen Interface and Administration
    'Public Grievance Redressal',
    'Internal Audit',
    // Social and Community Development
    'Parks & Recreation',
    'Gender and Child Development',
    // Public Safety and Regulatory Enforcement
    'Public Safety',
];
const CONDITION_TYPES: { value: RoutingConditionType; label: string; icon: React.ReactNode }[] = [
    { value: 'keyword', label: 'Keyword', icon: <Tag className="w-3 h-3" /> },
    { value: 'category', label: 'Category', icon: <Tag className="w-3 h-3" /> },
    { value: 'geo', label: 'Geo (ward)', icon: <MapPin className="w-3 h-3" /> },
    { value: 'severity', label: 'Severity', icon: <AlertCircle className="w-3 h-3" /> },
];

const uid = () => Math.random().toString(36).slice(2, 8);

// ─── Rule Editor ─────────────────────────────────────────────────────────────
const RuleEditor: React.FC<{ rule: RoutingRule; onChange: (r: RoutingRule) => void; onDelete: () => void }> = ({ rule, onChange, onDelete }) => {
    const addCondition = () => onChange({ ...rule, conditions: [...rule.conditions, { id: uid(), type: 'keyword', value: '' }] });
    const addAction = () => onChange({ ...rule, actions: [...rule.actions, { id: uid(), action: 'assign-department', value: '' }] });

    return (
        <div className={`border-2 rounded-2xl overflow-hidden transition-all ${rule.active ? 'border-blue-300 dark:border-blue-600' : 'border-gray-200 dark:border-gray-700'}`}>
            {/* Rule header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800">
                <button
                    onClick={() => onChange({ ...rule, active: !rule.active })}
                    className={`w-10 h-5 rounded-full flex-shrink-0 transition-colors relative ${rule.active ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${rule.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <input
                    value={rule.name}
                    onChange={e => onChange({ ...rule, name: e.target.value })}
                    className="flex-1 font-semibold text-gray-800 dark:text-white bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none text-sm"
                    placeholder="Rule name..."
                />
                <span className="text-xs text-gray-400 flex-shrink-0">Priority {rule.priority}</span>
                {rule.matchCount !== undefined && (
                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full flex-shrink-0">{rule.matchCount} matches</span>
                )}
                <button onClick={onDelete} className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
            </div>

            <div className="p-4 grid sm:grid-cols-2 gap-4">
                {/* Conditions */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">IF (conditions)</p>
                        <button onClick={addCondition} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus className="w-3 h-3" />Add</button>
                    </div>
                    <div className="space-y-2">
                        {rule.conditions.map(c => (
                            <div key={c.id} className="flex gap-2">
                                <select
                                    value={c.type}
                                    onChange={e => onChange({ ...rule, conditions: rule.conditions.map(x => x.id === c.id ? { ...x, type: e.target.value as RoutingConditionType } : x) })}
                                    className="text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1 flex-shrink-0"
                                >
                                    {CONDITION_TYPES.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
                                </select>
                                <input
                                    value={c.value}
                                    onChange={e => onChange({ ...rule, conditions: rule.conditions.map(x => x.id === c.id ? { ...x, value: e.target.value } : x) })}
                                    placeholder={c.type === 'severity' ? 'low/medium/high/critical' : c.type === 'geo' ? 'ward-01' : 'value...'}
                                    className="flex-1 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1"
                                />
                                <button onClick={() => onChange({ ...rule, conditions: rule.conditions.filter(x => x.id !== c.id) })} className="text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                            </div>
                        ))}
                        {rule.conditions.length === 0 && <p className="text-xs text-gray-400 italic">No conditions — matches all complaints</p>}
                    </div>
                </div>

                {/* Actions */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">THEN (actions)</p>
                        <button onClick={addAction} className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"><Plus className="w-3 h-3" />Add</button>
                    </div>
                    <div className="space-y-2">
                        {rule.actions.map(a => (
                            <div key={a.id} className="flex gap-2">
                                <select
                                    value={a.action}
                                    onChange={e => onChange({ ...rule, actions: rule.actions.map(x => x.id === a.id ? { ...x, action: e.target.value as RoutingAction } : x) })}
                                    className="text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1 flex-shrink-0"
                                >
                                    <option value="assign-department">→ Department</option>
                                    <option value="assign-officer">→ Officer</option>
                                    <option value="set-priority">Set Priority</option>
                                    <option value="set-sla">Set SLA (hrs)</option>
                                </select>
                                {a.action === 'assign-department' ? (
                                    <select
                                        value={a.value}
                                        onChange={e => onChange({ ...rule, actions: rule.actions.map(x => x.id === a.id ? { ...x, value: e.target.value } : x) })}
                                        className="flex-1 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1"
                                    >
                                        <option value="">Select dept...</option>
                                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                ) : a.action === 'set-priority' ? (
                                    <select
                                        value={a.value}
                                        onChange={e => onChange({ ...rule, actions: rule.actions.map(x => x.id === a.id ? { ...x, value: e.target.value } : x) })}
                                        className="flex-1 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1"
                                    >
                                        {(['low', 'medium', 'high', 'critical'] as Priority[]).map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                ) : (
                                    <input
                                        value={a.value}
                                        onChange={e => onChange({ ...rule, actions: rule.actions.map(x => x.id === a.id ? { ...x, value: e.target.value } : x) })}
                                        placeholder={a.action === 'set-sla' ? 'hours' : 'officer name / ID'}
                                        className="flex-1 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1"
                                    />
                                )}
                                <button onClick={() => onChange({ ...rule, actions: rule.actions.filter(x => x.id !== a.id) })} className="text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                            </div>
                        ))}
                        {rule.actions.length === 0 && <p className="text-xs text-gray-400 italic">No actions added yet</p>}
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
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
                <Play className="w-4 h-4 text-green-600" />
                <p className="font-semibold text-gray-800 dark:text-white text-sm">Test Rule Matching</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-2 mb-3">
                <input value={testTitle} onChange={e => setTestTitle(e.target.value)} placeholder="Complaint title..." className="text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1.5" />
                <select value={testCategory} onChange={e => setTestCategory(e.target.value)} className="text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1.5">
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={testSeverity} onChange={e => setTestSeverity(e.target.value)} className="text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1.5">
                    {['low', 'medium', 'high', 'critical'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <button onClick={runTest} className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-2 rounded-xl font-semibold flex items-center gap-1">
                <Play className="w-3 h-3" /> Run Test
            </button>
            {testResult && (
                <div className={`mt-3 p-3 rounded-xl border ${testResult.actions.length > 0 ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700' : 'bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600'}`}>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Matched: {testResult.rule}
                    </p>
                    {testResult.actions.map((a, i) => (
                        <p key={i} className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 ml-5">→ {a}</p>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const RoutingRuleEngine: React.FC = () => {
    const [rules, setRules] = useState<RoutingRule[]>(DEMO_RULES);
    const [saved, setSaved] = useState(false);

    const addRule = () => setRules(prev => [...prev, {
        id: uid(), name: 'New Rule', active: true, priority: prev.length + 1,
        conditions: [], actions: [],
    }]);

    const handleSave = () => {
        localStorage.setItem('routingRules', JSON.stringify(rules));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-500" /> Routing Rule Engine</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Rules are evaluated top-to-bottom by priority. First match wins.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={addRule} className="flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl font-medium transition-colors">
                        <Plus className="w-4 h-4" /> Add Rule
                    </button>
                    <button onClick={handleSave} className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl font-medium transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                        {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saved ? 'Saved!' : 'Save All'}
                    </button>
                </div>
            </div>

            {/* Active rules */}
            <div className="space-y-3">
                {rules.map(rule => (
                    <RuleEditor
                        key={rule.id}
                        rule={rule}
                        onChange={updated => setRules(prev => prev.map(r => r.id === updated.id ? updated : r))}
                        onDelete={() => setRules(prev => prev.filter(r => r.id !== rule.id))}
                    />
                ))}
                {rules.length === 0 && (
                    <div className="text-center py-10 text-gray-400">
                        <Zap className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No routing rules. All complaints go to default inbox.</p>
                    </div>
                )}
            </div>

            {/* Test panel */}
            <TestPanel rules={rules} />
        </div>
    );
};

export default RoutingRuleEngine;
