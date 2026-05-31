import React, { useState, useEffect, useRef } from 'react';
import {
  User, Mail, Lock, Phone, MapPin, ArrowRight, CheckCircle,
  Eye, EyeOff, ShieldCheck, AlertCircle, Info, X, RefreshCw, Sparkles, Zap
} from 'lucide-react';
import IsometricCity from './IsometricCity';

interface AuthProps { onLogin: (user: any) => void; }

/* ────────────────────────── Google Icon ────────────────────── */
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, flexShrink: 0 }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

/* ────────────────────────── Password strength ──────────────── */
function getPasswordStrength(pw: string) {
  if (!pw) return { score: 0, label: '', color: 'transparent' };
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score: s, label: 'Weak',   color: '#ef4444' };
  if (s <= 2) return { score: s, label: 'Fair',   color: '#f59e0b' };
  if (s <= 3) return { score: s, label: 'Good',   color: '#60a5fa' };
  return              { score: s, label: 'Strong', color: '#22c55e' };
}

/* ────────────────────────── All CSS ────────────────────────── */
const CSS = `
@keyframes a-slide-in {
  from { opacity:0; transform:translateX(32px) scale(0.97); }
  to   { opacity:1; transform:translateX(0)    scale(1);    }
}
@keyframes a-fade-up {
  from { opacity:0; transform:translateY(16px); }
  to   { opacity:1; transform:translateY(0);    }
}
@keyframes a-logo-float {
  0%,100% { transform:translateY(0); }
  50%     { transform:translateY(-5px); }
}
@keyframes a-live-dot {
  0%,100% { opacity:1; transform:scale(1); }
  50%     { opacity:0.35; transform:scale(0.7); }
}
@keyframes a-shimmer {
  0%   { background-position:200% center; }
  100% { background-position:-200% center; }
}
@keyframes a-border-flow {
  0%   { background-position:0% 50%; }
  50%  { background-position:100% 50%; }
  100% { background-position:0% 50%; }
}
@keyframes a-glow-btn {
  0%,100% { box-shadow:0 6px 24px rgba(217,75,56,0.5), 0 2px 8px rgba(217,75,56,0.3); }
  50%     { box-shadow:0 8px 32px rgba(217,75,56,0.7), 0 4px 14px rgba(217,75,56,0.45); }
}
@keyframes a-spin { to { transform:rotate(360deg); } }
@keyframes a-check-pop {
  0%   { transform:scale(0); opacity:0; }
  60%  { transform:scale(1.18); opacity:1; }
  100% { transform:scale(1); opacity:1; }
}
@keyframes a-feature-in {
  from { opacity:0; transform:translateX(-14px); }
  to   { opacity:1; transform:translateX(0); }
}

/* ── Page root ── */
.ap-root {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #010916;
  font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
}

/* ── Overlay ── */
.ap-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background:
    linear-gradient(to right,
      rgba(1,9,22,0.05) 0%,
      rgba(1,9,22,0.40) 42%,
      rgba(1,9,22,0.85) 62%,
      rgba(1,9,22,0.97) 100%
    ),
    linear-gradient(to bottom,
      rgba(1,9,22,0.55) 0%,
      transparent 20%,
      transparent 80%,
      rgba(1,9,22,0.7) 100%
    );
}

/* ── Left brand panel ── */
.ap-left {
  display: none;
  position: absolute;
  top: 0; left: 0; bottom: 0;
  /* Stops before the form panel */
  right: 468px;
  z-index: 5;
  flex-direction: column;
  padding: 36px 40px 32px 48px;
}
@media (min-width: 1024px) { .ap-left { display: flex; } }

/* ── Right form column ── */
.ap-right {
  position: absolute;
  top: 0; right: 0; bottom: 0;
  width: 100%;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  /* subtle dark right backdrop so card always readable */
  background: linear-gradient(to left, rgba(1,9,22,0.96) 0%, rgba(1,9,22,0.7) 70%, transparent 100%);
}
@media (min-width: 1024px) {
  .ap-right {
    width: 468px;
    padding: 20px 24px 20px 12px;
  }
}

/* ── Glass card ── */
.ap-card {
  position: relative;
  width: 100%;
  max-width: 424px;
  background: rgba(5, 13, 32, 0.92);
  border: 1px solid rgba(255,255,255,0.11);
  border-radius: 24px;
  padding: 28px 26px 24px;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.04) inset,
    0 40px 80px rgba(0,0,0,0.75),
    0 8px 24px rgba(0,0,0,0.5);
  max-height: 95vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.10) transparent;
  animation: a-slide-in 0.55s cubic-bezier(0.16,1,0.3,1) both;
}
.ap-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 24px;
  background: linear-gradient(135deg,
    rgba(217,75,56,0.08) 0%,
    rgba(91,224,255,0.04) 50%,
    rgba(217,75,56,0.04) 100%);
  pointer-events: none;
}
/* Animated top edge */
.ap-card-top-line {
  position: absolute;
  top: 0; left: 28px; right: 28px;
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(217,75,56,0.7) 30%,
    rgba(91,200,255,0.5) 60%,
    rgba(217,75,56,0.5) 80%,
    transparent 100%);
  background-size: 200% 100%;
  animation: a-border-flow 4s ease infinite;
  border-radius: 100px;
}

/* ── Card scrollbar ── */
.ap-card::-webkit-scrollbar { width: 3px; }
.ap-card::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.10); border-radius: 4px; }

/* ── Tabs ── */
.ap-tabs {
  display: flex;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 13px;
  padding: 3px;
  margin-bottom: 20px;
  gap: 2px;
}
.ap-tab {
  flex: 1;
  padding: 9px 8px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  letter-spacing: 0.01em;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16,1,0.3,1);
}
.ap-tab-active {
  background: rgba(255,255,255,0.13);
  color: #ffffff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08);
}
.ap-tab-inactive {
  background: transparent;
  color: rgba(255,255,255,0.35);
}
.ap-tab-inactive:hover { color: rgba(255,255,255,0.62); background: rgba(255,255,255,0.05); }

/* ── Labels ── */
.ap-label {
  display: block;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.40);
  margin-bottom: 6px;
}
.ap-label-err { color: rgba(248,113,113,0.9); }

/* ── Input wrapper ── */
.ap-field { margin-bottom: 12px; }
.ap-wrap { position: relative; }
.ap-icon {
  position: absolute;
  left: 12px; top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: rgba(255,255,255,0.28);
  display: flex; align-items: center;
}
.ap-right-el {
  position: absolute;
  right: 11px; top: 50%;
  transform: translateY(-50%);
}

/* ── Inputs ── */
.ap-input {
  width: 100%;
  padding: 11px 14px 11px 40px;
  background: rgba(255,255,255,0.065);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 11px;
  font-size: 14px;
  font-family: inherit;
  color: #fff;
  outline: none;
  transition: border-color 0.18s, background 0.18s, box-shadow 0.22s;
  caret-color: #d94b38;
}
.ap-input::placeholder { color: rgba(255,255,255,0.22); }
.ap-input:hover {
  border-color: rgba(255,255,255,0.22);
  background: rgba(255,255,255,0.085);
}
.ap-input:focus {
  border-color: rgba(217,75,56,0.7);
  background: rgba(255,255,255,0.09);
  box-shadow: 0 0 0 3px rgba(217,75,56,0.18), 0 2px 12px rgba(0,0,0,0.3);
}
.ap-input-err {
  border-color: rgba(248,113,113,0.55) !important;
  box-shadow: 0 0 0 2.5px rgba(248,113,113,0.12) !important;
}
.ap-input-bare { padding-left: 14px; }

/* ── Eye toggle ── */
.ap-eye {
  background: none; border: none; cursor: pointer; padding: 2px;
  color: rgba(255,255,255,0.30); display: flex; align-items: center;
  transition: color 0.15s;
}
.ap-eye:hover { color: rgba(255,255,255,0.7); }

/* ── Field error / hint ── */
.ap-ferr {
  display: flex; align-items: center; gap: 4px;
  margin-top: 5px; font-size: 11px; color: #fca5a5;
}
.ap-fhint { color: rgba(255,255,255,0.28); }

/* ── Google button ── */
.ap-google {
  width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 11px 16px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.16);
  border-radius: 11px;
  color: rgba(255,255,255,0.88);
  font-size: 14px; font-weight: 600; font-family: inherit;
  cursor: pointer;
  transition: background 0.18s, border-color 0.18s, transform 0.15s;
  margin-bottom: 14px;
}
.ap-google:hover {
  background: rgba(255,255,255,0.12);
  border-color: rgba(255,255,255,0.28);
  transform: translateY(-1px);
}

/* ── Divider ── */
.ap-divider {
  display: flex; align-items: center; gap: 10px;
  margin: 0 0 14px;
}
.ap-divider-line { flex:1; height:1px; background:rgba(255,255,255,0.09); }
.ap-divider-text {
  font-size: 10.5px; font-weight: 600;
  color: rgba(255,255,255,0.25);
  letter-spacing: 0.07em; text-transform: uppercase;
}

/* ── Global error banner ── */
.ap-err-banner {
  display: flex; align-items: flex-start; gap: 9px;
  padding: 11px 13px;
  background: rgba(239,68,68,0.11);
  border: 1px solid rgba(239,68,68,0.22);
  border-radius: 11px;
  color: #fca5a5;
  font-size: 13px;
  margin-bottom: 13px;
  animation: a-fade-up 0.3s ease both;
}

/* ── Submit button ── */
.ap-submit {
  width: 100%; padding: 13px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  background: linear-gradient(135deg, #e05a45, #c53420);
  border: none; border-radius: 12px;
  color: #fff; font-size: 15px; font-weight: 700; font-family: inherit;
  letter-spacing: 0.025em;
  cursor: pointer;
  position: relative; overflow: hidden;
  transition: transform 0.18s cubic-bezier(0.16,1,0.3,1), filter 0.18s;
  animation: a-glow-btn 3s ease-in-out infinite;
}
.ap-submit::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(105deg,
    transparent 0%, transparent 35%,
    rgba(255,255,255,0.13) 50%,
    transparent 65%, transparent 100%);
  background-size: 300% 100%;
  animation: a-shimmer 3.5s linear infinite;
}
.ap-submit:hover { transform: translateY(-2px) scale(1.015); filter: brightness(1.1); }
.ap-submit:active { transform: translateY(0) scale(0.98); transition-duration: 0.06s; }
.ap-submit:disabled { opacity:0.6; cursor:not-allowed; transform:none; animation:none; filter:none; }

/* ── Checkbox ── */
.ap-check {
  appearance: none; -webkit-appearance: none;
  width: 15px; height: 15px;
  border: 1.5px solid rgba(255,255,255,0.22);
  border-radius: 4px;
  background: rgba(255,255,255,0.06);
  cursor: pointer; flex-shrink: 0;
  transition: all 0.15s; position: relative; margin-top: 1px;
}
.ap-check:checked { background: #d94b38; border-color: #d94b38; }
.ap-check:checked::after {
  content: '';
  position: absolute; left: 3px; top: 0px;
  width: 5px; height: 9px;
  border: 2px solid white; border-top: none; border-left: none;
  transform: rotate(42deg);
}

/* ── Strength bar ── */
.ap-sbar {
  flex: 1; height: 3px; border-radius: 100px;
  transition: background 0.3s;
}

/* ── Remember/forgot row ── */
.ap-rf-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
}
.ap-remember {
  display: flex; align-items: center; gap: 7px;
  font-size: 12.5px; color: rgba(255,255,255,0.45);
  cursor: pointer; user-select: none;
}
.ap-forgot {
  background: none; border: none; padding: 0; cursor: pointer;
  font-size: 12.5px; font-weight: 600; font-family: inherit;
  color: #e07060; transition: color 0.15s;
}
.ap-forgot:hover { color: #d94b38; text-decoration: underline; }

/* ── Brand panel card ── */
.ap-brand-card {
  background: rgba(2,8,22,0.65);
  backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 22px;
  padding: 26px 28px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
  position: relative; overflow: hidden;
  max-width: 440px;
}
.ap-brand-card::before {
  content: '';
  position: absolute; top: 0; left: 24px; right: 24px; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(217,75,56,0.55), transparent);
}

/* ── Trust badge ── */
.ap-trust {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 10px; font-weight: 600; letter-spacing: 0.03em;
  padding: 4px 10px; border-radius: 20px;
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.35);
  border: 1px solid rgba(255,255,255,0.08);
}

/* ── Forgot password back ── */
.ap-back {
  background: none; border: none; cursor: pointer; padding: 0;
  font-size: 12.5px; font-weight: 600; font-family: inherit;
  color: rgba(255,255,255,0.40);
  display: flex; align-items: center; gap: 5px;
  margin-bottom: 22px;
  transition: color 0.15s;
}
.ap-back:hover { color: rgba(255,255,255,0.82); }

/* ── Footer note ── */
.ap-footer {
  display: flex; align-items: center; justify-content: center; gap: 5px;
  margin-top: 16px;
  font-size: 10.5px; color: rgba(255,255,255,0.20);
  text-align: center;
}

/* ── Mobile logo ── */
.ap-mobile-logo {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 20px;
}
@media(min-width:1024px) { .ap-mobile-logo { display: none; } }

/* ── Form fade animation ── */
.ap-form-in { animation: a-fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both; }
`;

/* ────────────────────────── FloatingInput ──────────────────── */
interface FIProps {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; onBlur?: () => void;
  placeholder?: string; required?: boolean;
  icon?: React.ReactNode; error?: string; hint?: string;
  disabled?: boolean; rightEl?: React.ReactNode; noIcon?: boolean;
}
const FI: React.FC<FIProps> = ({
  id, label, type='text', value, onChange, onBlur,
  placeholder, required, icon, error, hint, disabled, rightEl, noIcon
}) => (
  <div className="ap-field">
    <label htmlFor={id} className={`ap-label${error ? ' ap-label-err' : ''}`}>
      {label}{required && <span style={{ color:'#d94b38', marginLeft:2 }}>*</span>}
    </label>
    <div className="ap-wrap">
      {icon && <div className="ap-icon">{icon}</div>}
      <input
        id={id} type={type} value={value} disabled={disabled}
        onChange={e => onChange(e.target.value)} onBlur={onBlur}
        placeholder={placeholder} required={required}
        aria-invalid={!!error}
        className={`ap-input${noIcon ? ' ap-input-bare' : ''}${error ? ' ap-input-err' : ''}`}
        style={{ paddingRight: rightEl ? '42px' : undefined }}
      />
      {rightEl && <div className="ap-right-el">{rightEl}</div>}
    </div>
    {error && <p role="alert" className="ap-ferr"><AlertCircle style={{width:11,height:11,flexShrink:0}}/> {error}</p>}
    {hint && !error && <p className="ap-ferr ap-fhint"><Info style={{width:11,height:11,flexShrink:0}}/> {hint}</p>}
  </div>
);

/* ────────────────────────── EyeToggle ─────────────────────── */
const EyeBtn = ({ show, onToggle, id }: { show:boolean; onToggle:()=>void; id:string }) => (
  <button type="button" id={id} aria-label={show?'Hide password':'Show password'}
    onClick={onToggle} className="ap-eye">
    {show ? <EyeOff style={{width:15,height:15}}/> : <Eye style={{width:15,height:15}}/>}
  </button>
);

/* ────────────────────────── ForgotPassword ────────────────── */
const ForgotPassword: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [email, setEmail]       = useState('');
  const [done, setDone]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [cd, setCd]             = useState(0);
  const t = useRef<ReturnType<typeof setInterval>|null>(null);

  const start = () => { setCd(60); t.current = setInterval(() => setCd(c => { if(c<=1){clearInterval(t.current!);return 0;} return c-1; }), 1000); };
  useEffect(() => () => { if(t.current) clearInterval(t.current); }, []);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Enter your email.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email.'); return; }
    setError(''); setLoading(true);
    try { const {apiService} = await import('../services/api'); await (apiService as any).forgotPassword?.(email); }
    catch { /* silent */ }
    finally { setLoading(false); setDone(true); start(); }
  };

  return (
    <div className="ap-form-in">
      <button onClick={onBack} className="ap-back">← Back to sign in</button>
      {done ? (
        <div style={{ textAlign:'center' }}>
          <div style={{
            width:56, height:56, borderRadius:18,
            background:'rgba(34,197,94,0.13)', border:'1px solid rgba(34,197,94,0.28)',
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 16px', animation:'a-check-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both'
          }}>
            <CheckCircle style={{width:26,height:26,color:'#22c55e'}}/>
          </div>
          <h2 style={{fontSize:22,fontWeight:800,color:'#fff',fontFamily:"'DM Serif Display',serif",fontStyle:'italic',letterSpacing:'-0.02em',marginBottom:8}}>
            Check your inbox
          </h2>
          <p style={{fontSize:13,color:'rgba(255,255,255,0.45)',marginBottom:20,lineHeight:1.6}}>
            If <strong style={{color:'rgba(255,255,255,0.82)'}}>{email}</strong> is linked to a LokSetu account, a reset link is on its way.
          </p>
          <button onClick={() => { if(cd>0||loading)return; setLoading(true); import('../services/api').then(({apiService})=>(apiService as any).forgotPassword?.(email)).catch(()=>{}).finally(()=>{setLoading(false);start();}); }}
            disabled={cd>0||loading}
            style={{
              width:'100%',padding:'11px',background:'rgba(255,255,255,0.07)',
              border:'1px solid rgba(255,255,255,0.13)',borderRadius:11,
              color:cd>0?'rgba(255,255,255,0.28)':'rgba(255,255,255,0.78)',
              fontSize:13,fontWeight:600,fontFamily:'inherit',
              display:'flex',alignItems:'center',justifyContent:'center',gap:7,
              cursor:cd>0?'not-allowed':'pointer',
            }}>
            <RefreshCw style={{width:13,height:13,animation:loading?'a-spin 0.7s linear infinite':'none'}}/>
            {cd>0?`Resend in ${cd}s`:'Resend email'}
          </button>
          <p style={{fontSize:10.5,color:'rgba(255,255,255,0.20)',marginTop:11}}>Didn't get it? Check spam.</p>
        </div>
      ) : (
        <>
          <div style={{width:46,height:46,borderRadius:14,background:'rgba(217,75,56,0.13)',border:'1px solid rgba(217,75,56,0.28)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
            <ShieldCheck style={{width:21,height:21,color:'#d94b38'}}/>
          </div>
          <h2 style={{fontSize:22,fontWeight:800,color:'#fff',fontFamily:"'DM Serif Display',serif",fontStyle:'italic',letterSpacing:'-0.02em',marginBottom:5}}>
            Reset password
          </h2>
          <p style={{fontSize:13,color:'rgba(255,255,255,0.42)',marginBottom:20}}>
            Enter your email and we'll send a reset link.
          </p>
          {error && <div className="ap-err-banner"><AlertCircle style={{width:15,height:15,flexShrink:0,marginTop:1}}/><span>{error}</span></div>}
          <form onSubmit={send}>
            <FI id="fp-email" label="Email" type="email" value={email}
              onChange={setEmail} placeholder="you@example.com" required
              icon={<Mail style={{width:14,height:14}}/>}/>
            <button type="submit" disabled={loading} className="ap-submit" style={{marginTop:4}}>
              {loading
                ? <span style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:15,height:15,border:'2px solid rgba(255,255,255,0.35)',borderTopColor:'#fff',borderRadius:'50%',animation:'a-spin 0.7s linear infinite'}}/> Sending…</span>
                : <><ArrowRight style={{width:15,height:15}}/> Send reset link</>
              }
            </button>
          </form>
        </>
      )}
    </div>
  );
};

/* ────────────────────────── Brand features ─────────────────── */
const FEATURES = [
  { text: 'Report municipal issues in seconds',   icon: <Zap size={12}/>, color: '#facc15' },
  { text: 'Track real-time resolution status',    icon: <CheckCircle size={12}/>, color: '#34d399' },
  { text: 'Community voting & prioritization',    icon: <CheckCircle size={12}/>, color: '#34d399' },
  { text: 'AI-powered category detection',        icon: <Sparkles size={12}/>, color: '#a78bfa' },
];

/* ────────────────────────── Main Auth ──────────────────────── */
const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode]         = useState<'login'|'register'|'forgot'>('login');
  const [form, setForm]         = useState({ username:'', email:'', password:'', confirm:'', phoneNumber:'', address:'' });
  const [showPw, setShowPw]     = useState(false);
  const [showCf, setShowCf]     = useState(false);
  const [remember, setRemember] = useState(false);
  const [agreed, setAgreed]     = useState(false);
  const [errors, setErrors]     = useState<Record<string,string>>({});
  const [gErr, setGErr]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [touched, setTouched]   = useState<Record<string,boolean>>({});

  const isLogin = mode === 'login';
  const strength = getPasswordStrength(form.password);

  useEffect(() => {
    const s = localStorage.getItem('rememberedEmail');
    if (s) { setForm(p => ({...p, email:s})); setRemember(true); }
  }, []);

  const validate = (d: typeof form, lm: boolean) => {
    const e: Record<string,string> = {};
    if (!lm && d.username.trim().length < 3) e.username = 'At least 3 characters.';
    if (!d.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) e.email = 'Enter a valid email.';
    if (d.password.length < 8) e.password = 'At least 8 characters.';
    if (!lm && d.password !== d.confirm) e.confirm = 'Passwords do not match.';
    if (!lm && d.phoneNumber && !/^\+?[0-9\s\-()]{7,15}$/.test(d.phoneNumber)) e.phoneNumber = 'Enter a valid phone number.';
    if (!lm && !agreed) e.terms = 'Accept the Terms & Privacy Policy.';
    return e;
  };

  const blur = (field: string) => {
    setTouched(p => ({...p,[field]:true}));
    setErrors(validate(form, isLogin));
  };

  const upd = (field: string, value: string) => {
    const next = {...form,[field]:value};
    setForm(next);
    if (touched[field]) setErrors(validate(next, isLogin));
  };

  const switchMode = (m: 'login'|'register') => {
    setMode(m); setErrors({}); setGErr(''); setTouched({});
    setForm({ username:'', email:'', password:'', confirm:'', phoneNumber:'', address:'' });
    setShowPw(false); setShowCf(false); setAgreed(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fields = isLogin ? ['email','password'] : ['username','email','password','confirm','phoneNumber','terms'];
    setTouched(Object.fromEntries(fields.map(f=>[f,true])));
    const errs = validate(form, isLogin);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setGErr(''); setLoading(true);
    try {
      const {apiService} = await import('../services/api');
      if (isLogin) {
        if (remember) localStorage.setItem('rememberedEmail', form.email);
        else localStorage.removeItem('rememberedEmail');
        const r = await apiService.login(form.email, form.password);
        localStorage.setItem('civicUser', JSON.stringify(r.user));
        localStorage.setItem('authToken', r.token);
        localStorage.setItem('currentUser', r.user.username);
        onLogin(r.user);
      } else {
        const r = await apiService.register({ username:form.username, email:form.email, password:form.password, phoneNumber:form.phoneNumber, address:form.address, role:'citizen' });
        localStorage.setItem('civicUser', JSON.stringify(r.user));
        localStorage.setItem('authToken', r.token);
        localStorage.setItem('currentUser', r.user.username);
        onLogin(r.user);
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('pending approval')) setGErr('Account pending admin approval.');
      else if (msg.includes('Invalid credentials')) setGErr('Invalid email or password.');
      else if (msg.includes('User already exists')) setGErr('An account with this email already exists.');
      else setGErr('Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  const logoEl = (size: number, r: number) => (
    <div style={{
      width:size, height:size, borderRadius:r, flexShrink:0,
      background:'linear-gradient(135deg,#d94b38,#b82e1e)',
      display:'flex', alignItems:'center', justifyContent:'center',
      boxShadow:'0 0 22px rgba(217,75,56,0.5)',
      animation:'a-logo-float 3.5s ease-in-out infinite',
    }}>
      <MapPin style={{width:size*0.45,height:size*0.45,color:'#fff'}}/>
    </div>
  );

  return (
    <div className="ap-root">
      <style>{CSS}</style>

      {/* ── Animated city ── */}
      <div style={{ position:'absolute', inset:0, zIndex:1 }}>
        <IsometricCity />
      </div>

      {/* ── Overlay gradient ── */}
      <div className="ap-overlay" />

      {/* ─────────────────── LEFT BRAND PANEL ─────────────────── */}
      <div className="ap-left">
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, animation:'a-fade-up 0.4s ease both', animationDelay:'0.05s' }}>
          {logoEl(38, 11)}
          <span style={{ fontSize:19, fontWeight:800, color:'#fff', letterSpacing:'-0.01em', fontFamily:"'Plus Jakarta Sans',sans-serif", textShadow:'0 2px 14px rgba(0,0,0,0.6)' }}>
            LokSetu<span style={{color:'#d94b38'}}>.</span>
          </span>
        </div>

        {/* Live indicator */}
        <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:7, animation:'a-fade-up 0.4s ease both', animationDelay:'0.12s' }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 10px rgba(34,197,94,0.9)', animation:'a-live-dot 1.6s ease-in-out infinite' }}/>
          <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.10em', textTransform:'uppercase', color:'rgba(255,255,255,0.40)' }}>Live Civic Reports</span>
        </div>

        <div style={{flex:1}}/>

        {/* Glass brand card */}
        <div className="ap-brand-card" style={{ animation:'a-fade-up 0.5s ease both', animationDelay:'0.2s' }}>
          {/* Platform badge */}
          <div style={{
            display:'inline-flex', alignItems:'center', gap:6,
            fontSize:10.5, fontWeight:700, letterSpacing:'0.05em', color:'#FBBF24',
            background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.28)',
            borderRadius:20, padding:'3px 11px', marginBottom:14,
          }}>
            <Sparkles style={{width:10,height:10}}/> 🇮🇳 Civic Intelligence Platform
          </div>

          <h2 style={{
            fontSize:28, fontWeight:800, color:'#fff', letterSpacing:'-0.025em',
            lineHeight:1.18, fontFamily:"'DM Serif Display',serif", fontStyle:'italic',
            margin:'0 0 18px', textShadow:'0 2px 20px rgba(0,0,0,0.55)',
          }}>
            Your city issues,<br/>resolved <span style={{color:'#d94b38'}}>faster.</span>
          </h2>

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:11,
                animation:'a-feature-in 0.5s ease both',
                animationDelay:`${0.28 + i * 0.07}s`
              }}>
                <div style={{
                  width:22, height:22, borderRadius:'50%', flexShrink:0,
                  background:`${f.color}18`, border:`1px solid ${f.color}40`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color: f.color,
                }}>
                  {f.icon}
                </div>
                <span style={{ fontSize:13, color:'rgba(255,255,255,0.75)' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginTop:14, animation:'a-fade-up 0.5s ease both', animationDelay:'0.42s' }}>
          {['ISO 27001','Digital India','DPDP Act'].map(b => (
            <span key={b} className="ap-trust">
              <ShieldCheck style={{width:10,height:10,color:'#22c55e'}}/> {b}
            </span>
          ))}
        </div>

        <p style={{ fontSize:10, color:'rgba(255,255,255,0.18)', marginTop:10, letterSpacing:'0.02em', animation:'a-fade-up 0.5s ease both', animationDelay:'0.48s' }}>
          Government of India — Digital India Initiative
        </p>
      </div>

      {/* ─────────────────── RIGHT FORM PANEL ─────────────────── */}
      <div className="ap-right">
        <div className="ap-card ap-card-scroll">
          {/* Animated top border */}
          <div className="ap-card-top-line"/>

          {/* Mobile logo */}
          <div className="ap-mobile-logo">
            {logoEl(32, 9)}
            <span style={{ fontSize:16, fontWeight:800, color:'#fff' }}>
              LokSetu<span style={{color:'#d94b38'}}>.</span>
            </span>
          </div>

          {/* ── FORGOT PASSWORD ── */}
          {mode === 'forgot' ? (
            <ForgotPassword onBack={() => setMode('login')} />
          ) : (
            <div key={mode} className="ap-form-in">

              {/* Tabs */}
              <div className="ap-tabs">
                {(['login','register'] as const).map(m => (
                  <button key={m} type="button" id={`tab-${m}`}
                    onClick={() => switchMode(m)}
                    className={`ap-tab ${mode===m?'ap-tab-active':'ap-tab-inactive'}`}>
                    {m==='login' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>

              {/* Heading */}
              <h1 style={{
                fontSize:24, fontWeight:800, color:'#fff', letterSpacing:'-0.015em',
                lineHeight:1.2, fontFamily:"'DM Serif Display',serif", fontStyle:'italic',
                marginBottom:4,
              }}>
                {isLogin ? 'Welcome back 👋' : 'Join LokSetu'}
              </h1>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.40)', marginBottom:18 }}>
                {isLogin ? 'Sign in to your LokSetu account' : 'Start reporting civic issues today'}
              </p>

              {/* Google SSO */}
              <button type="button" id="google-login-btn"
                className="ap-google"
                onClick={() => { window.location.href = `/auth/google`; }}>
                <GoogleIcon/> Continue with Google
              </button>

              {/* Divider */}
              <div className="ap-divider">
                <div className="ap-divider-line"/>
                <span className="ap-divider-text">or with email</span>
                <div className="ap-divider-line"/>
              </div>

              {/* Global error */}
              {gErr && (
                <div className="ap-err-banner">
                  <AlertCircle style={{width:15,height:15,flexShrink:0,marginTop:1}}/>
                  <span style={{flex:1}}>{gErr}</span>
                  <button onClick={()=>setGErr('')} style={{background:'none',border:'none',cursor:'pointer',padding:0,color:'inherit',display:'flex',alignItems:'center'}}>
                    <X style={{width:13,height:13}}/>
                  </button>
                </div>
              )}

              {/* ── FORM ── */}
              <form onSubmit={submit} noValidate>

                {!isLogin && (
                  <FI id="reg-user" label="Username" value={form.username}
                    onChange={v=>upd('username',v)} onBlur={()=>blur('username')}
                    placeholder="Choose a username" required={!isLogin}
                    icon={<User style={{width:14,height:14}}/>}
                    error={touched.username?errors.username:''}/>
                )}

                <FI id="auth-email" label="Email" type="email" value={form.email}
                  onChange={v=>upd('email',v)} onBlur={()=>blur('email')}
                  placeholder="you@example.com" required
                  icon={<Mail style={{width:14,height:14}}/>}
                  error={touched.email?errors.email:''}/>

                <FI id="auth-pw" label="Password"
                  type={showPw?'text':'password'} value={form.password}
                  onChange={v=>upd('password',v)} onBlur={()=>blur('password')}
                  placeholder="••••••••" required
                  icon={<Lock style={{width:14,height:14}}/>}
                  error={touched.password?errors.password:''}
                  hint={!isLogin&&!form.password?'Min 8 chars, uppercase, numbers & symbols.':''}
                  rightEl={<EyeBtn id="eye-pw" show={showPw} onToggle={()=>setShowPw(v=>!v)}/>}/>

                {/* Strength */}
                {!isLogin && form.password && (
                  <div style={{marginBottom:12,marginTop:-4}}>
                    <div style={{display:'flex',gap:3,marginBottom:4}}>
                      {[1,2,3,4,5].map(i=>(
                        <div key={i} className="ap-sbar"
                          style={{background:i<=strength.score?strength.color:'rgba(255,255,255,0.09)'}}/>
                      ))}
                    </div>
                    <span style={{fontSize:11,fontWeight:600,color:strength.color}}>{strength.label} password</span>
                  </div>
                )}

                {!isLogin && (
                  <FI id="reg-cf" label="Confirm Password"
                    type={showCf?'text':'password'} value={form.confirm}
                    onChange={v=>upd('confirm',v)} onBlur={()=>blur('confirm')}
                    placeholder="••••••••" required
                    icon={<Lock style={{width:14,height:14}}/>}
                    error={touched.confirm?errors.confirm:''}
                    rightEl={<EyeBtn id="eye-cf" show={showCf} onToggle={()=>setShowCf(v=>!v)}/>}/>
                )}

                {!isLogin && (
                  <>
                    <FI id="reg-phone" label="Phone Number" type="tel" value={form.phoneNumber}
                      onChange={v=>upd('phoneNumber',v)} onBlur={()=>blur('phoneNumber')}
                      placeholder="+91 98765 43210"
                      icon={<Phone style={{width:14,height:14}}/>}
                      error={touched.phoneNumber?errors.phoneNumber:''}/>
                    <FI id="reg-addr" label="City / Address" value={form.address}
                      onChange={v=>upd('address',v)} placeholder="Your city, state"
                      icon={<MapPin style={{width:14,height:14}}/>}/>
                  </>
                )}

                {/* Remember / Forgot */}
                {isLogin && (
                  <div className="ap-rf-row">
                    <label className="ap-remember">
                      <input id="remember-me" type="checkbox" className="ap-check"
                        checked={remember} onChange={e=>setRemember(e.target.checked)}/>
                      Remember me
                    </label>
                    <button type="button" id="forgot-pw-link" className="ap-forgot"
                      onClick={()=>setMode('forgot')}>
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Terms */}
                {!isLogin && (
                  <div style={{marginBottom:14}}>
                    <label style={{display:'flex',alignItems:'flex-start',gap:8,cursor:'pointer',userSelect:'none'}}>
                      <input id="terms-agree" type="checkbox" className="ap-check"
                        checked={agreed}
                        onChange={e=>{ setAgreed(e.target.checked); if(e.target.checked) setErrors(p=>({...p,terms:''})); }}/>
                      <span style={{fontSize:12.5,color:'rgba(255,255,255,0.42)',lineHeight:1.5}}>
                        I agree to the{' '}
                        <a href="/terms" target="_blank" rel="noopener noreferrer" style={{color:'#d94b38',fontWeight:700}}>Terms of Service</a>
                        {' '}and{' '}
                        <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{color:'#d94b38',fontWeight:700}}>Privacy Policy</a>
                      </span>
                    </label>
                    {touched.terms && errors.terms && (
                      <p role="alert" className="ap-ferr"><AlertCircle style={{width:11,height:11,flexShrink:0}}/> {errors.terms}</p>
                    )}
                  </div>
                )}

                {/* Submit */}
                <button type="submit" id="auth-submit-btn" disabled={loading} className="ap-submit">
                  {loading
                    ? <span style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{width:15,height:15,border:'2px solid rgba(255,255,255,0.35)',borderTopColor:'#fff',borderRadius:'50%',animation:'a-spin 0.7s linear infinite'}}/>
                        {isLogin?'Signing in…':'Creating account…'}
                      </span>
                    : <>{isLogin?'Sign In':'Create Account'}<ArrowRight style={{width:15,height:15}}/></>
                  }
                </button>
              </form>

              {/* Footer */}
              <div className="ap-footer">
                <ShieldCheck style={{width:11,height:11,color:'#22c55e'}}/>
                Protected under India's DPDP Act, 2023
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
