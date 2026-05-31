import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertCircle, Phone, Flame, Ambulance, Home, Zap, Users, Baby, Wind } from 'lucide-react';

// ── Data ──────────────────────────────────────────────────────────────────────

interface HelpLine {
  dept: string;
  num: string;
  icon: React.ElementType;
  color: string;
  emoji: string;
  category: 'emergency' | 'civic';
  badge?: string;
}

const HELPLINE_NUMBERS: HelpLine[] = [
  // Emergency Category
  { dept: 'Police',          num: '100',           icon: AlertCircle, color: '#e5604f', emoji: '🚓', category: 'emergency' },
  { dept: 'Fire & Rescue',   num: '101',           icon: Flame,       color: '#f97316', emoji: '🚒', category: 'emergency' },
  { dept: 'Ambulance',       num: '108',           icon: Ambulance,   color: '#ef4444', emoji: '🚑', category: 'emergency' },
  { dept: 'Women Helpline',  num: '1091',          icon: Users,       color: '#a855f7', emoji: '👩', category: 'emergency' },
  { dept: 'Child Helpline',  num: '1098',          icon: Baby,        color: '#ec4899', emoji: '👶', category: 'emergency' },
  // Civic Services Category
  { dept: 'Municipal',       num: '1800-123-4567', icon: Home,        color: '#2293b5', emoji: '🏛️', category: 'civic', badge: '24×7' },
  { dept: 'Water & Power',   num: '1800-123-4568', icon: Zap,         color: '#f2aa4b', emoji: '⚡', category: 'civic', badge: '24×7' },
  { dept: 'Gas Leak',        num: '1906',          icon: Wind,        color: '#22c55e', emoji: '🔥', category: 'civic' },
];

const EMERGENCY_NUMS = new Set(['100', '101', '108', '1091', '1098']);

// ── Phone Popup ───────────────────────────────────────────────────────────────

interface PhonePopupProps {
  line: HelpLine;
  onClose: () => void;
  onCall: () => void;
}

const PhonePopup: React.FC<PhonePopupProps> = ({ line, onClose, onCall }) => {
  const [displayed, setDisplayed]   = useState('');
  const [cursorOn, setCursorOn]     = useState(true);
  const [dialPhase, setDialPhase]   = useState<'typing' | 'ringing' | 'calling'>('typing');
  const [show, setShow]             = useState(false);
  const timerRef                    = useRef<number | null>(null);

  // Slide-in on mount
  useEffect(() => { requestAnimationFrame(() => setShow(true)); }, []);

  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cursor blink
  useEffect(() => {
    const id = setInterval(() => setCursorOn(v => !v), 530);
    return () => clearInterval(id);
  }, []);

  // Type out the number digit by digit
  useEffect(() => {
    let i = 0;
    const full = line.num;
    const startId = window.setTimeout(() => {
      timerRef.current = window.setInterval(() => {
        i++;
        setDisplayed(full.slice(0, i));
        if (i >= full.length) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => setDialPhase('ringing'), 300);
        }
      }, 120);
    }, 600);
    return () => {
      clearTimeout(startId);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [line.num]);

  const handleClose = useCallback(() => {
    setShow(false);
    setTimeout(onClose, 320);
  }, [onClose]);

  const handleCall = useCallback(() => {
    setDialPhase('calling');
    setTimeout(() => { onCall(); handleClose(); }, 1400);
  }, [onCall, handleClose]);

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const isEmergency = EMERGENCY_NUMS.has(line.num);

  // Status bar color by phase
  const statusBarColor = dialPhase === 'typing' ? '#6b7280' : dialPhase === 'ringing' ? '#f2aa4b' : '#22c55e';

  return (
    <>
      <style>{`
        @keyframes qd-ring-expand {
          0%   { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        @keyframes qd-glow-pulse {
          0%, 100% { box-shadow: 0 0 0 0 ${line.color}55, 0 0 20px ${line.color}22; }
          50%       { box-shadow: 0 0 0 18px ${line.color}00, 0 0 40px ${line.color}44; }
        }
        @keyframes qd-call-btn-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.6), 0 4px 20px rgba(34,197,94,0.3); }
          50%       { box-shadow: 0 0 0 16px rgba(34,197,94,0), 0 4px 20px rgba(34,197,94,0.5); }
        }
        @keyframes qd-phone-shake {
          0%,100% { transform: rotate(0deg) translateX(0); }
          20%      { transform: rotate(-8deg) translateX(-3px); }
          40%      { transform: rotate(8deg) translateX(3px); }
          60%      { transform: rotate(-5deg) translateX(-2px); }
          80%      { transform: rotate(5deg) translateX(2px); }
        }
        @keyframes qd-slide-up {
          from { transform: translateY(80px) scale(0.95); opacity: 0; }
          to   { transform: translateY(0) scale(1);       opacity: 1; }
        }
        @keyframes qd-slide-down {
          from { transform: translateY(0) scale(1);       opacity: 1; }
          to   { transform: translateY(80px) scale(0.95); opacity: 0; }
        }
        @keyframes qd-backdrop-in {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to   { opacity: 1; backdrop-filter: blur(8px); }
        }
        @keyframes qd-calling-bounce {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes qd-wave-bar {
          0%, 100% { transform: scaleY(0.3); }
          50%       { transform: scaleY(1); }
        }
        @keyframes qd-status-bar-fill {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes qd-digit-pop {
          0%   { transform: scale(0.5) translateY(8px); opacity: 0; }
          70%  { transform: scale(1.1) translateY(-2px); opacity: 1; }
          100% { transform: scale(1) translateY(0); }
        }
        @keyframes qd-ping-dot {
          0%   { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
        .qd-popup {
          animation: qd-slide-up 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .qd-popup.hide {
          animation: qd-slide-down 0.28s ease forwards;
        }
        .qd-ring {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid;
          pointer-events: none;
        }
        .qd-ring-1 { animation: qd-ring-expand 1.4s ease-out 0s infinite; }
        .qd-ring-2 { animation: qd-ring-expand 1.4s ease-out 0.47s infinite; }
        .qd-ring-3 { animation: qd-ring-expand 1.4s ease-out 0.94s infinite; }
        .qd-phone-icon-ringing {
          animation: qd-phone-shake 0.55s ease-in-out infinite;
        }
        .qd-call-btn {
          animation: qd-call-btn-pulse 1.2s ease-in-out infinite;
        }
        .qd-calling-text {
          animation: qd-calling-bounce 0.55s ease-in-out infinite;
        }
        .qd-wave-bar-1 { animation: qd-wave-bar 0.6s ease-in-out 0s infinite; }
        .qd-wave-bar-2 { animation: qd-wave-bar 0.6s ease-in-out 0.1s infinite; }
        .qd-wave-bar-3 { animation: qd-wave-bar 0.6s ease-in-out 0.2s infinite; }
        .qd-wave-bar-4 { animation: qd-wave-bar 0.6s ease-in-out 0.3s infinite; }
        .qd-wave-bar-5 { animation: qd-wave-bar 0.6s ease-in-out 0.4s infinite; }
        .qd-glow {
          animation: qd-glow-pulse 1.5s ease-in-out infinite;
        }
        .qd-status-bar-fill {
          animation: qd-status-bar-fill 2s linear forwards;
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={handleBackdrop}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          animation: 'qd-backdrop-in 0.3s ease',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* Phone frame */}
        <div
          className={`qd-popup${show ? '' : ' hide'}`}
          style={{
            width: '320px',
            borderRadius: '40px',
            overflow: 'hidden',
            background: 'var(--bg-panel)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: `1px solid ${line.color}33`,
            boxShadow: `0 40px 100px rgba(0,0,0,0.45), 0 0 0 1px ${line.color}20, inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.1)`,
            fontFamily: "'DM Sans', sans-serif",
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Status progress bar (top) */}
          <div style={{ height: '3px', background: 'var(--bg-subtle)', position: 'relative', overflow: 'hidden' }}>
            <div
              key={dialPhase}
              className="qd-status-bar-fill"
              style={{
                position: 'absolute', left: 0, top: 0, height: '100%',
                background: `linear-gradient(90deg, ${statusBarColor}aa, ${statusBarColor})`,
                borderRadius: '0 2px 2px 0',
              }}
            />
          </div>

          {/* Notch / Status bar */}
          <div style={{
            background: 'var(--bg-subtle)',
            height: '46px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderBottom: '1px solid var(--border)',
            position: 'relative',
          }}>
            {/* Pill notch */}
            <div style={{
              width: '96px', height: '22px', borderRadius: '100px',
              background: 'var(--bg-base)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 10px',
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-faint)' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--text-faint)', opacity: 0.5 }} />
            </div>

            {/* Close X */}
            <button
              onClick={handleClose}
              style={{
                position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                background: 'var(--bg-base)', border: '1px solid var(--border)',
                color: 'var(--text-muted)', width: '28px', height: '28px',
                borderRadius: '50%', cursor: 'pointer', fontSize: '13px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, transition: 'all 0.15s',
              }}
            >✕</button>
          </div>

          {/* Screen content */}
          <div style={{
            padding: '28px 24px 26px',
            minHeight: '360px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            background: `radial-gradient(ellipse at top, ${line.color}12 0%, transparent 65%)`,
          }}>

            {/* Emoji + dept name */}
            <p style={{ fontSize: '36px', marginBottom: '6px', lineHeight: 1 }}>{line.emoji}</p>
            <p style={{
              fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '28px',
            }}>{line.dept}</p>

            {/* Phone icon with rings */}
            <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '28px' }}>
              {dialPhase === 'ringing' && (
                <>
                  <div className="qd-ring qd-ring-1" style={{ inset: 0, borderColor: line.color + '55' }} />
                  <div className="qd-ring qd-ring-2" style={{ inset: 0, borderColor: line.color + '44' }} />
                  <div className="qd-ring qd-ring-3" style={{ inset: 0, borderColor: line.color + '33' }} />
                </>
              )}
              <div
                className={dialPhase === 'ringing' ? 'qd-glow' : ''}
                style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${line.color}28, ${line.color}10)`,
                  border: `2px solid ${line.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', zIndex: 1,
                  transition: 'box-shadow 0.3s ease',
                }}
              >
                <Phone
                  className={dialPhase === 'ringing' ? 'qd-phone-icon-ringing' : ''}
                  style={{ color: line.color, width: '30px', height: '30px' }}
                />
              </div>
            </div>

            {/* Number display */}
            <div style={{
              width: '100%',
              background: 'var(--bg-base)',
              borderRadius: '16px',
              border: `1.5px solid ${dialPhase !== 'typing' ? line.color + '55' : 'var(--border)'}`,
              padding: '14px 18px',
              marginBottom: '10px',
              minHeight: '58px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'border-color 0.4s ease',
              boxShadow: dialPhase !== 'typing' ? `0 0 0 4px ${line.color}15, inset 0 1px 0 rgba(255,255,255,0.05)` : 'none',
            }}>
              <span style={{
                fontFamily: "'DM Mono', 'DM Sans', monospace",
                fontVariantNumeric: 'tabular-nums',
                fontSize: '30px', fontWeight: 700,
                letterSpacing: '0.06em',
                color: 'var(--text-primary)',
              }}>
                {displayed}
                <span style={{
                  display: 'inline-block', width: '2px', height: '30px',
                  background: line.color,
                  marginLeft: '2px', verticalAlign: 'middle',
                  opacity: cursorOn && dialPhase === 'typing' ? 1 : 0,
                  borderRadius: '2px',
                  transition: 'opacity 0.1s',
                }} />
              </span>
            </div>

            {/* Status label + wave animation */}
            <div style={{ height: '32px', display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              {dialPhase === 'typing' && (
                <p style={{ fontSize: '12px', color: 'var(--text-faint)', letterSpacing: '0.06em' }}>Dialling…</p>
              )}
              {dialPhase === 'ringing' && (
                <p style={{ fontSize: '12px', color: '#f2aa4b', letterSpacing: '0.06em', fontWeight: 600 }}>Ready to call</p>
              )}
              {dialPhase === 'calling' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Audio wave bars */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '20px' }}>
                    {[1,2,3,4,5].map(i => (
                      <div
                        key={i}
                        className={`qd-wave-bar-${i}`}
                        style={{
                          width: '3px', height: '100%', borderRadius: '2px',
                          background: line.color,
                          transformOrigin: 'center bottom',
                        }}
                      />
                    ))}
                  </div>
                  <span className="qd-calling-text" style={{ color: '#22c55e', fontWeight: 700, fontSize: '13px', letterSpacing: '0.06em' }}>
                    Connecting…
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <button
                onClick={handleClose}
                style={{
                  flex: 1, height: '50px', borderRadius: '16px',
                  border: '1.5px solid var(--border-strong)', background: 'var(--bg-subtle)',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                  transition: 'all 0.15s ease',
                }}
              >Cancel</button>

              <button
                className={dialPhase === 'ringing' ? 'qd-call-btn' : ''}
                onClick={handleCall}
                disabled={dialPhase === 'typing'}
                style={{
                  flex: 2, height: '50px', borderRadius: '16px', border: 'none',
                  background: dialPhase === 'calling'
                    ? 'linear-gradient(135deg, #16a34a, #15803d)'
                    : dialPhase === 'ringing'
                    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                    : 'var(--bg-elevated)',
                  color: dialPhase === 'typing' ? 'var(--text-faint)' : '#fff',
                  cursor: dialPhase === 'typing' ? 'default' : 'pointer',
                  fontSize: '15px', fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '0.03em',
                  transition: 'background 0.4s ease, color 0.3s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                <Phone style={{ width: '16px', height: '16px' }} />
                {dialPhase === 'calling' ? 'Calling…' : 'Call Now'}
              </button>
            </div>

            {isEmergency && (
              <p style={{
                marginTop: '16px', fontSize: '10px', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: '#ef4444', opacity: 0.75,
              }}>
                ⚠ Emergency line — use responsibly
              </p>
            )}
          </div>

          {/* Home bar */}
          <div style={{
            height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-subtle)', borderTop: '1px solid var(--border)',
          }}>
            <div style={{ width: '90px', height: '4px', borderRadius: '100px', background: 'var(--border-strong)' }} />
          </div>
        </div>
      </div>
    </>
  );
};

// ── Section Header ─────────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px',
  }}>
    <div style={{ width: '12px', height: '2px', borderRadius: '2px', background: color, flexShrink: 0 }} />
    <span style={{
      fontSize: '9px', fontWeight: 800, letterSpacing: '0.14em',
      textTransform: 'uppercase', color: 'var(--text-faint)',
      fontFamily: "'DM Sans', sans-serif",
    }}>{label}</span>
    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
  </div>
);

// ── Dial Button ────────────────────────────────────────────────────────────────

const DialButton: React.FC<{ line: HelpLine; onClick: () => void; isEmergency: boolean }> = ({ line, onClick, isEmergency }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '11px 12px 11px 0',
        borderRadius: '14px',
        border: `1px solid ${hovered ? line.color + '44' : 'var(--border)'}`,
        background: hovered ? `${line.color}0d` : 'var(--bg-panel)',
        boxShadow: hovered
          ? `0 4px 20px ${line.color}22, var(--shadow-sm)`
          : 'var(--shadow-sm)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Left color accent bar */}
      <div style={{
        width: '4px', height: '100%',
        position: 'absolute', left: 0, top: 0,
        background: `linear-gradient(180deg, ${line.color}, ${line.color}88)`,
        borderRadius: '4px 0 0 4px',
        opacity: hovered ? 1 : 0.5,
        transition: 'opacity 0.2s',
      }} />

      {/* Icon */}
      <div style={{
        width: '38px', height: '38px', borderRadius: '12px',
        background: `linear-gradient(135deg, ${line.color}28, ${line.color}14)`,
        border: `1.5px solid ${line.color}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginLeft: '14px',
        transform: hovered ? 'scale(1.08)' : 'scale(1)',
        transition: 'transform 0.2s ease',
      }}>
        <line.icon style={{ color: line.color, width: '16px', height: '16px' }} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600,
          color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase',
          marginBottom: '2px',
        }}>
          {line.dept}
        </p>
        <p style={{
          fontFamily: "'DM Mono', 'DM Sans', monospace", fontSize: '16px', fontWeight: 700,
          color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em',
        }}>
          {line.num}
        </p>
      </div>

      {/* Right indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingRight: '4px', flexShrink: 0 }}>
        {isEmergency && (
          <div style={{ position: 'relative', width: '8px', height: '8px' }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: '#ef4444',
              animation: 'qd-ping 1.5s ease-out infinite',
            }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
          </div>
        )}
        {line.badge && !isEmergency && (
          <span style={{
            fontSize: '9px', fontWeight: 700, padding: '2px 6px',
            borderRadius: '100px', letterSpacing: '0.06em',
            background: `${line.color}18`, color: line.color,
            border: `1px solid ${line.color}33`,
          }}>{line.badge}</span>
        )}
        <div style={{
          width: '26px', height: '26px', borderRadius: '50%',
          background: hovered ? `${line.color}20` : 'var(--bg-subtle)',
          border: `1px solid ${hovered ? line.color + '44' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
          flexShrink: 0,
        }}>
          <Phone style={{ width: '11px', height: '11px', color: hovered ? line.color : 'var(--text-faint)' }} />
        </div>
      </div>
    </button>
  );
};

// ── Quick Dial Panel ──────────────────────────────────────────────────────────

const QuickDialPhone: React.FC = () => {
  const [activeLine, setActiveLine] = useState<HelpLine | null>(null);
  const [pingAnim, setPingAnim] = useState(false);

  useEffect(() => {
    // Inject ping keyframe
    const style = document.createElement('style');
    style.textContent = `
      @keyframes qd-ping {
        0%   { transform: scale(1); opacity: 1; }
        75%, 100% { transform: scale(2.4); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    // Subtle attention animation on mount
    const t = setTimeout(() => setPingAnim(true), 1000);
    return () => { clearTimeout(t); document.head.removeChild(style); };
  }, []);

  const handleOpen  = (line: HelpLine) => setActiveLine(line);
  const handleClose = () => setActiveLine(null);
  const handleCall  = () => {
    if (activeLine) window.open(`tel:${activeLine.num}`, '_self');
  };

  const emergencyLines = HELPLINE_NUMBERS.filter(l => l.category === 'emergency');
  const civicLines     = HELPLINE_NUMBERS.filter(l => l.category === 'civic');
  const NATIONAL_EMERGENCY: HelpLine = { dept: 'National Emergency', num: '112', icon: AlertCircle, color: '#ef4444', emoji: '🆘', category: 'emergency' };

  return (
    <>
      {/* ── Desktop panel ── */}
      <div className="space-y-4 hidden sm:block">

        {/* Panel header card */}
        <div style={{
          background: 'var(--bg-panel)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '20px',
          border: '1px solid var(--border)',
          padding: '16px 18px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '1.35rem', fontWeight: 400, color: 'var(--text-primary)',
              margin: 0, lineHeight: 1.2,
            }}>Quick Dial</h2>
            <p style={{ fontSize: '10px', color: 'var(--text-faint)', margin: '3px 0 0', letterSpacing: '0.04em' }}>
              Emergency &amp; Civic Services
            </p>
          </div>
          {/* LIVE badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 10px', borderRadius: '100px',
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
          }}>
            <div style={{ position: 'relative', width: '8px', height: '8px' }}>
              {pingAnim && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: '#22c55e',
                  animation: 'qd-ping 1.8s ease-out infinite',
                }} />
              )}
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: '#22c55e', textTransform: 'uppercase' }}>
              24 / 7
            </span>
          </div>
        </div>

        {/* Main list card */}
        <div className="card p-4">
          {/* Emergency section */}
          <SectionHeader label="Emergency" color="#ef4444" />
          <div className="space-y-2" style={{ marginBottom: '16px' }}>
            {emergencyLines.map((line, idx) => (
              <DialButton key={idx} line={line} onClick={() => handleOpen(line)} isEmergency={true} />
            ))}
          </div>

          {/* Civic section */}
          <SectionHeader label="Civic Services" color="#2293b5" />
          <div className="space-y-2" style={{ marginBottom: '16px' }}>
            {civicLines.map((line, idx) => (
              <DialButton key={idx} line={line} onClick={() => handleOpen(line)} isEmergency={false} />
            ))}
          </div>

          {/* National Emergency 112 CTA */}
          <button
            onClick={() => handleOpen(NATIONAL_EMERGENCY)}
            style={{
              width: '100%', padding: '11px 16px',
              borderRadius: '14px', border: '1.5px dashed rgba(239,68,68,0.45)',
              background: 'rgba(239,68,68,0.07)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.14)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.7)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.07)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.45)';
            }}
          >
            <span style={{ fontSize: '14px' }}>🆘</span>
            <span style={{
              fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#ef4444',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Severe Emergency — Dial 112
            </span>
          </button>
        </div>
      </div>

      {/* ── Mobile 2-column grid ── */}
      <div className="sm:hidden space-y-4">
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '1.3rem', fontWeight: 400, color: 'var(--text-primary)',
          }}>Quick Dial</h2>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '4px 9px', borderRadius: '100px',
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#22c55e', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Live</span>
          </div>
        </div>

        {/* Emergency grid */}
        <div>
          <SectionHeader label="Emergency" color="#ef4444" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {emergencyLines.map((line, idx) => (
              <button
                key={idx}
                onClick={() => handleOpen(line)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  padding: '14px 10px',
                  borderRadius: '16px', border: `1.5px solid ${line.color}33`,
                  background: `linear-gradient(135deg, ${line.color}10, ${line.color}05)`,
                  cursor: 'pointer', textAlign: 'center',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.18s ease',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <div style={{ fontSize: '28px', lineHeight: 1 }}>{line.emoji}</div>
                  <div style={{
                    position: 'absolute', top: -2, right: -2,
                    width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444',
                    animation: 'qd-ping 2s ease-out infinite',
                  }} />
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                  {line.dept}
                </p>
                <p style={{ fontFamily: "'DM Mono', 'DM Sans', monospace", fontSize: '17px', fontWeight: 800, color: line.color, margin: 0, letterSpacing: '0.04em' }}>
                  {line.num}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Civic grid */}
        <div>
          <SectionHeader label="Civic Services" color="#2293b5" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {civicLines.map((line, idx) => (
              <button
                key={idx}
                onClick={() => handleOpen(line)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  padding: '14px 10px',
                  borderRadius: '16px', border: `1.5px solid ${line.color}33`,
                  background: `linear-gradient(135deg, ${line.color}10, ${line.color}05)`,
                  cursor: 'pointer', textAlign: 'center',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.18s ease',
                }}
              >
                <div style={{ fontSize: '28px', lineHeight: 1 }}>{line.emoji}</div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                  {line.dept}
                </p>
                <p style={{ fontFamily: "'DM Mono', 'DM Sans', monospace", fontSize: '16px', fontWeight: 800, color: line.color, margin: 0, letterSpacing: '0.04em' }}>
                  {line.num}
                </p>
                {line.badge && (
                  <span style={{
                    fontSize: '8px', fontWeight: 700, padding: '1px 6px',
                    borderRadius: '100px', background: `${line.color}18`, color: line.color,
                    letterSpacing: '0.06em',
                  }}>{line.badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 112 full-width CTA */}
        <button
          onClick={() => handleOpen(NATIONAL_EMERGENCY)}
          style={{
            width: '100%', padding: '13px',
            borderRadius: '16px', border: '1.5px dashed rgba(239,68,68,0.5)',
            background: 'rgba(239,68,68,0.08)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          <span style={{ fontSize: '16px' }}>🆘</span>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#ef4444', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif" }}>
            Dial 112 — National Emergency
          </span>
        </button>
      </div>

      {/* ── Phone popup portal ── */}
      {activeLine && (
        <PhonePopup
          line={activeLine}
          onClose={handleClose}
          onCall={handleCall}
        />
      )}
    </>
  );
};

export default QuickDialPhone;
