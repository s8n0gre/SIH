import React from 'react';

// ── Social Icon SVGs ──────────────────────────────────────────────────────────
const TwitterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.631L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  </svg>
);
const LinkedInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const FOOTER_LINKS = [
  {
    heading: 'Quick Access',
    links: [
      { label: 'Report an Issue', href: '#' },
      { label: 'Track My Report', href: '#' },
      { label: 'Community Feed', href: '#' },
      { label: 'Live Map', href: '#' },
      { label: 'Emergency Services', href: '#' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'How It Works', href: '#' },
      { label: 'Citizen Rights & RTI', href: '#' },
      { label: 'Government Schemes', href: '#' },
      { label: 'Department Directory', href: '#' },
      { label: 'Weekly Digest', href: '#' },
    ],
  },
  {
    heading: 'Emergency Lines',
    links: [
      { label: 'Police — 100', href: 'tel:100' },
      { label: 'Fire & Rescue — 101', href: 'tel:101' },
      { label: 'Ambulance — 108', href: 'tel:108' },
      { label: 'Women Helpline — 1091', href: 'tel:1091' },
      { label: 'National Emergency — 112', href: 'tel:112' },
    ],
    accent: true,
  },
  {
    heading: 'About LokSetu',
    links: [
      { label: 'Our Mission', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Contact Us', href: '#' },
      { label: 'Open Source', href: '#' },
    ],
  },
];

const Footer: React.FC = () => {
  return (
    <footer
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Ambient glow backdrop */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(217,75,56,0.1) 0%, transparent 70%), ' +
            'radial-gradient(ellipse 50% 50% at 10% 50%, rgba(19,111,138,0.08) 0%, transparent 60%), ' +
            'radial-gradient(ellipse 40% 40% at 90% 20%, rgba(229,154,47,0.07) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* Glass panel */}
      <div
        style={{
          position: 'relative',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          background: 'rgba(255,255,255,0.04)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* ── Main content ─────────────────────── */}
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '56px 24px 32px',
          }}
        >
          {/* Brand row */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              marginBottom: '48px',
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '28px 32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
              {/* Logo + tagline */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  {/* Emblem */}
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, var(--accent) 0%, #e59a2f 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      boxShadow: '0 4px 16px rgba(217,75,56,0.35)',
                      flexShrink: 0,
                    }}
                  >
                    🪷
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: "'DM Serif Display', serif",
                        fontSize: '22px',
                        fontWeight: 400,
                        color: 'var(--text-primary)',
                        lineHeight: 1,
                        margin: 0,
                      }}
                    >
                      LokSetu
                    </p>
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--accent)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        margin: 0,
                      }}
                    >
                      Civic Heritage Platform
                    </p>
                  </div>
                </div>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    maxWidth: '340px',
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  Bridging citizens and city authorities through transparent, technology-driven civic reporting. Built for Bharat. 🇮🇳
                </p>
              </div>

              {/* Social + badge */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '14px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[
                    { icon: <TwitterIcon />, label: 'Twitter' },
                    { icon: <LinkedInIcon />, label: 'LinkedIn' },
                    { icon: <GithubIcon />, label: 'GitHub' },
                  ].map(({ icon, label }) => (
                    <a
                      key={label}
                      href="#"
                      aria-label={label}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)',
                        transition: 'all 0.2s ease',
                        textDecoration: 'none',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(217,75,56,0.15)';
                        (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)';
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(217,75,56,0.3)';
                        (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.06)';
                        (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)';
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.1)';
                        (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                      }}
                    >
                      {icon}
                    </a>
                  ))}
                </div>
                {/* Made in India badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '100px',
                    background: 'rgba(255,153,51,0.12)',
                    border: '1px solid rgba(255,153,51,0.25)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }}
                >
                  <span style={{ fontSize: '14px' }}>🇮🇳</span>
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#ff9933',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Made in India
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 -8px' }} />

            {/* Stat chips */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { label: 'Government Backed', icon: '🏛️' },
                { label: 'ISO 27001 Secure', icon: '🔒' },
                { label: 'Digital India Initiative', icon: '💡' },
                { label: 'RTI Compliant', icon: '⚖️' },
              ].map(item => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '100px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <span style={{ fontSize: '13px' }}>{item.icon}</span>
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--text-faint)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Link columns ───────────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '36px',
              marginBottom: '48px',
            }}
          >
            {FOOTER_LINKS.map(col => (
              <div key={col.heading}>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: col.accent ? 'var(--accent-red)' : 'var(--accent)',
                    marginBottom: '16px',
                    margin: '0 0 16px 0',
                  }}
                >
                  {col.heading}
                </p>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {col.links.map(link => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '13px',
                          fontWeight: 400,
                          color: col.accent ? 'var(--accent-red)' : 'var(--text-muted)',
                          textDecoration: 'none',
                          transition: 'color 0.15s ease',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          opacity: col.accent ? 0.9 : 1,
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLAnchorElement).style.color = col.accent
                            ? 'var(--accent-red)'
                            : 'var(--text-primary)';
                          (e.currentTarget as HTMLAnchorElement).style.opacity = '1';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLAnchorElement).style.color = col.accent
                            ? 'var(--accent-red)'
                            : 'var(--text-muted)';
                          (e.currentTarget as HTMLAnchorElement).style.opacity = col.accent ? '0.9' : '1';
                        }}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* ── Bottom bar ─────────────────────── */}
          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.07)',
              paddingTop: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '12px',
                color: 'var(--text-faint)',
                margin: 0,
              }}
            >
              © 2026 LokSetu · Ministry of Electronics & Information Technology, Government of India
            </p>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {['Privacy Policy', 'Terms of Service', 'Grievance Officer', 'Site Map'].map(item => (
                <a
                  key={item}
                  href="#"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--text-faint)',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                    letterSpacing: '0.02em',
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-faint)')}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
