import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Globe, Clock, Save, CheckCircle } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface NotificationPrefs {
    // Channels
    inApp: boolean;
    email: boolean;
    sms: boolean;
    whatsapp: boolean;

    // Language for notifications
    language: 'en' | 'hi' | 'bn' | 'or' | 'sa';

    // Frequency / digest
    frequency: 'instant' | 'daily' | 'weekly';

    // Which complaint lifecycle stages to notify
    stages: {
        submitted: boolean;
        acknowledged: boolean;
        inProgress: boolean;
        resolved: boolean;
        escalated: boolean;
    };

    // Quiet hours
    quietHoursEnabled: boolean;
    quietFrom: string; // "HH:MM"
    quietTo: string;   // "HH:MM"
}

const DEFAULT_PREFS: NotificationPrefs = {
    inApp: true,
    email: true,
    sms: false,
    whatsapp: false,
    language: 'en',
    frequency: 'instant',
    stages: {
        submitted: true,
        acknowledged: true,
        inProgress: true,
        resolved: true,
        escalated: true,
    },
    quietHoursEnabled: false,
    quietFrom: '22:00',
    quietTo: '07:00',
};

const PREFS_KEY = 'civicNotifPrefs';

export function loadPrefs(): NotificationPrefs {
    try {
        const saved = localStorage.getItem(PREFS_KEY);
        return saved ? { ...DEFAULT_PREFS, ...JSON.parse(saved) } : DEFAULT_PREFS;
    } catch {
        return DEFAULT_PREFS;
    }
}

function savePrefs(p: NotificationPrefs) {
    localStorage.setItem(PREFS_KEY, JSON.stringify(p));
}

// ─── Reusable toggle ─────────────────────────────────────────────────────────
const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string; icon?: React.ReactNode }> = ({ checked, onChange, label, icon }) => (
    <label className="flex items-center justify-between cursor-pointer group py-1">
        <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            {icon}
            {label}
        </span>
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative w-10 h-5 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
        >
            <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : ''
                    }`}
            />
        </button>
    </label>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const NotificationPreferences: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
    const [prefs, setPrefs] = useState<NotificationPrefs>(loadPrefs);
    const [saved, setSaved] = useState(false);

    const update = <K extends keyof NotificationPrefs>(key: K, value: NotificationPrefs[K]) => {
        setPrefs(prev => ({ ...prev, [key]: value }));
    };

    const updateStage = (stage: keyof NotificationPrefs['stages'], value: boolean) => {
        setPrefs(prev => ({ ...prev, stages: { ...prev.stages, [stage]: value } }));
    };

    const handleSave = () => {
        savePrefs(prefs);
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            onClose?.();
        }, 1200);
    };

    const channelCount = [prefs.inApp, prefs.email, prefs.sms, prefs.whatsapp].filter(Boolean).length;

    return (
        <div className="w-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    <h3 className="font-bold text-base">Notification Preferences</h3>
                </div>
                <p className="text-blue-100 text-xs mt-0.5">Customize how and when you receive updates</p>
            </div>

            <div className="p-4 space-y-5 max-h-[70vh] overflow-y-auto">

                {/* ── Channels ── */}
                <section>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5" /> Channels
                        <span className="ml-auto text-[10px] font-normal normal-case text-blue-600 dark:text-blue-400">
                            {channelCount} active
                        </span>
                    </h4>
                    <div className="space-y-1 bg-gray-50 dark:bg-gray-700/40 rounded-xl px-3 py-2">
                        <Toggle
                            checked={prefs.inApp}
                            onChange={v => update('inApp', v)}
                            label="In-app notifications"
                            icon={<Bell className="w-4 h-4 text-blue-500" />}
                        />
                        <Toggle
                            checked={prefs.email}
                            onChange={v => update('email', v)}
                            label="Email"
                            icon={<Mail className="w-4 h-4 text-green-500" />}
                        />
                        <Toggle
                            checked={prefs.sms}
                            onChange={v => update('sms', v)}
                            label="SMS"
                            icon={<MessageSquare className="w-4 h-4 text-orange-500" />}
                        />
                        <Toggle
                            checked={prefs.whatsapp}
                            onChange={v => update('whatsapp', v)}
                            label="WhatsApp"
                            icon={<span className="text-green-600 w-4 h-4 text-sm font-bold leading-none flex items-center justify-center">W</span>}
                        />
                    </div>
                </section>

                {/* ── Language ── */}
                <section>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" /> Notification Language
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                        {([
                            { code: 'en', label: 'English', flag: '🇬🇧' },
                            { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
                            { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
                            { code: 'or', label: 'ओड़िया', flag: '🌐' },
                            { code: 'sa', label: 'संताली', flag: '🌐' },
                        ] as const).map(lang => (
                            <button
                                key={lang.code}
                                type="button"
                                onClick={() => update('language', lang.code)}
                                className={`flex flex-col items-center py-2 px-1 rounded-xl border-2 text-center transition-all text-xs font-medium ${prefs.language === lang.code
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-300 bg-white dark:bg-gray-700'
                                    }`}
                            >
                                <span className="text-lg mb-0.5">{lang.flag}</span>
                                <span className="leading-tight">{lang.label}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* ── Frequency ── */}
                <section>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Delivery Frequency
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                        {([
                            { id: 'instant', label: '⚡ Instant', hint: 'Real-time alerts' },
                            { id: 'daily', label: '📅 Daily', hint: 'One digest per day' },
                            { id: 'weekly', label: '📆 Weekly', hint: 'Weekly summary' },
                        ] as const).map(opt => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => update('frequency', opt.id)}
                                className={`flex flex-col items-start p-2.5 rounded-xl border-2 transition-all text-left ${prefs.frequency === opt.id
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-blue-300'
                                    }`}
                            >
                                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{opt.label}</span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{opt.hint}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* ── Lifecycle stages ── */}
                <section>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                        📋 Complaint Lifecycle Alerts
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl px-3 py-2 space-y-1">
                        {([
                            { key: 'submitted', label: '📥 Submitted', color: 'text-blue-500' },
                            { key: 'acknowledged', label: '👁️ Acknowledged', color: 'text-indigo-500' },
                            { key: 'inProgress', label: '🔧 In Progress', color: 'text-orange-500' },
                            { key: 'resolved', label: '✅ Resolved', color: 'text-green-500' },
                            { key: 'escalated', label: '🚨 Escalated (SLA breach)', color: 'text-red-500' },
                        ] as const).map(stage => (
                            <Toggle
                                key={stage.key}
                                checked={prefs.stages[stage.key]}
                                onChange={v => updateStage(stage.key, v)}
                                label={stage.label}
                            />
                        ))}
                    </div>
                </section>

                {/* ── Quiet hours ── */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                            🌙 Quiet Hours
                        </h4>
                        <Toggle
                            checked={prefs.quietHoursEnabled}
                            onChange={v => update('quietHoursEnabled', v)}
                            label=""
                        />
                    </div>
                    {prefs.quietHoursEnabled && (
                        <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl px-3 py-3">
                            <div>
                                <label className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">From</label>
                                <input
                                    type="time"
                                    value={prefs.quietFrom}
                                    onChange={e => update('quietFrom', e.target.value)}
                                    className="w-full mt-1 px-2 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Until</label>
                                <input
                                    type="time"
                                    value={prefs.quietTo}
                                    onChange={e => update('quietTo', e.target.value)}
                                    className="w-full mt-1 px-2 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <p className="col-span-2 text-[11px] text-gray-400 dark:text-gray-500">
                                No push/SMS notifications will be sent during these hours.
                            </p>
                        </div>
                    )}
                </section>
            </div>

            {/* Save button */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                <button
                    type="button"
                    onClick={handleSave}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${saved
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                >
                    {saved ? (
                        <><CheckCircle className="w-4 h-4" /> Preferences Saved!</>
                    ) : (
                        <><Save className="w-4 h-4" /> Save Preferences</>
                    )}
                </button>
            </div>
        </div>
    );
};

export default NotificationPreferences;
