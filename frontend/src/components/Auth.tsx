import React, { useState } from 'react';
import { User, Mail, Lock, Phone, MapPin, ArrowRight, CheckCircle } from 'lucide-react';
import { i18n } from '../services/i18n';

interface AuthProps {
  onLogin: (user: any) => void;
}

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const FloatingInput: React.FC<{ label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; icon?: React.ReactNode }> = ({ label, type = 'text', value, onChange, placeholder, required, icon }) => (
  <div>
    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-faint)' }}>{icon}</div>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="input-field"
        style={{ paddingLeft: icon ? '40px' : undefined }}
      />
    </div>
  </div>
);

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', phoneNumber: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { apiService } = await import('../services/api');
      if (isLogin) {
        const response = await apiService.login(formData.email, formData.password);
        localStorage.setItem('civicUser', JSON.stringify(response.user));
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('currentUser', response.user.username);
        onLogin(response.user);
      } else {
        const response = await apiService.register({ username: formData.username, email: formData.email, password: formData.password, phoneNumber: formData.phoneNumber, address: formData.address, role: 'citizen' });
        localStorage.setItem('civicUser', JSON.stringify(response.user));
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('currentUser', response.user.username);
        onLogin(response.user);
      }
    } catch (error: any) {
      const msg = error?.message || '';
      if (msg.includes('pending approval')) setError('Account pending approval. Contact an administrator.');
      else if (msg.includes('Invalid credentials')) setError('Invalid email or password. Please try again.');
      else if (msg.includes('User already exists')) setError('Account already exists. Please sign in.');
      else setError('Authentication failed: ' + msg);
    } finally { setLoading(false); }
  };

  const handleGoogleLogin = () => {
    window.location.href = `/auth/google`;
  };

  const featureList = [
    'Report municipal issues in seconds',
    'Track real-time resolution status',
    'Community voting & prioritization',
    'AI-powered category detection',
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>

      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 xl:w-1/2 relative overflow-hidden p-12" style={{ background: 'var(--bg-panel)', borderRight: '1px solid var(--border)' }}>
        {/* Glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute" style={{ width: '70%', height: '70%', top: '-20%', left: '-20%', background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 60%)', borderRadius: '50%', filter: 'blur(50px)', animation: 'mesh-drift 18s ease-in-out infinite' }} />
          <div className="absolute" style={{ width: '60%', height: '60%', bottom: '-20%', right: '-10%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 60%)', borderRadius: '50%', filter: 'blur(60px)', animation: 'mesh-drift 22s ease-in-out infinite reverse' }} />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <MapPin className="w-4 h-4" style={{ color: '#0d0f14' }} />
          </div>
          <span className="text-base font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            LokSetu<span style={{ color: 'var(--accent)' }}>.</span>
          </span>
        </div>

        {/* Main copy */}
        <div className="relative">
          <div className="badge badge-amber mb-4 inline-flex">🇮🇳 Civic Intelligence Platform</div>
          <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            Your city issues,<br />resolved faster.
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-muted)' }}>
            Join thousands of citizens using LokSetu to report and track municipal issues across India.
          </p>
          <div className="space-y-3">
            {featureList.map((f, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent-green)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative">
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Government of India — Digital India Initiative</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-fade-up">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <MapPin className="w-3.5 h-3.5" style={{ color: '#0d0f14' }} />
            </div>
            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>LokSetu<span style={{ color: 'var(--accent)' }}>.</span></span>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            {isLogin ? 'Sign in to your LokSetu account' : 'Start reporting civic issues today'}
          </p>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium mb-5 transition-all duration-200"
            style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-panel)')}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>or with email</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--accent-red-subtle)', color: 'var(--accent-red)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <FloatingInput label="Username" value={formData.username} onChange={v => setFormData(p => ({ ...p, username: v }))} placeholder="Choose a username" required={!isLogin} icon={<User className="w-4 h-4" />} />
            )}
            <FloatingInput label="Email" type="email" value={formData.email} onChange={v => setFormData(p => ({ ...p, email: v }))} placeholder="you@example.com" required icon={<Mail className="w-4 h-4" />} />
            <FloatingInput label="Password" type="password" value={formData.password} onChange={v => setFormData(p => ({ ...p, password: v }))} placeholder="••••••••" required icon={<Lock className="w-4 h-4" />} />
            {!isLogin && (
              <>
                <FloatingInput label="Phone Number" type="tel" value={formData.phoneNumber} onChange={v => setFormData(p => ({ ...p, phoneNumber: v }))} placeholder="+91 98765 43210" icon={<Phone className="w-4 h-4" />} />
                <FloatingInput label="Address" value={formData.address} onChange={v => setFormData(p => ({ ...p, address: v }))} placeholder="Your city, state" icon={<MapPin className="w-4 h-4" />} />
              </>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center" style={{ padding: '12px', fontSize: '15px', marginTop: '8px' }}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full" style={{ animation: 'spin 0.7s linear infinite' }} />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: 'var(--text-muted)' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="font-semibold transition-colors" style={{ color: 'var(--accent)' }}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;