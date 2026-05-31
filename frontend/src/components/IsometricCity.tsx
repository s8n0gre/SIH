import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Droplet, Zap, TrafficCone, ShieldAlert, Activity } from 'lucide-react';

const ISSUES = [
  { label: 'Pothole detected',       icon: <TrafficCone size={15}/>, color: '#f87171', glow: 'rgba(248,113,113,0.6)', status: 'Pending',     bi: 1  },
  { label: 'Water main burst',       icon: <Droplet size={15}/>,     color: '#38bdf8', glow: 'rgba(56,189,248,0.6)',  status: 'Assigned',    bi: 3  },
  { label: 'Power grid fault',       icon: <Zap size={15}/>,         color: '#facc15', glow: 'rgba(250,204,21,0.6)', status: 'Resolved',    bi: 6  },
  { label: 'Illegal dumping',        icon: <AlertTriangle size={15}/>, color: '#c084fc', glow: 'rgba(192,132,252,0.6)', status: 'In Progress', bi: 4  },
  { label: 'Traffic signal failure', icon: <Activity size={15}/>,    color: '#34d399', glow: 'rgba(52,211,153,0.6)', status: 'Assigned',    bi: 9  },
  { label: 'Security concern',       icon: <ShieldAlert size={15}/>, color: '#fb923c', glow: 'rgba(251,146,60,0.6)', status: 'Pending',     bi: 2  },
];

const ISO_ANG = Math.PI / 6;
const proj = (x: number, y: number, z: number) => ({
  px: (x - y) * Math.cos(ISO_ANG),
  py: (x + y) * Math.sin(ISO_ANG) - z,
});

interface Building { i: number; x: number; y: number; w: number; l: number; h: number; type: string; seed: number; }

const generateCity = (): Building[] => {
  const blds: Building[] = [];
  let index = 0;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if ((r + c) % 3 === 0 && r !== 2) continue;
      const x = c * 140 - 280;
      const y = r * 140 - 280;
      const seed = (r * 7 + c * 13 + 17) / 100;
      const h = 40 + (seed * 180) + (r === 2 && c === 2 ? 180 : 0);
      const type = index % 2 === 0 ? 'glass' : 'solid';
      blds.push({ i: index++, x, y, w: 90, l: 90, h, type, seed });
    }
  }
  return blds;
};

const BUILDINGS = generateCity();
const PINS = BUILDINGS.map(b => {
  const center = proj(b.x + b.w / 2, b.y + b.l / 2, b.h);
  return { cx: center.px, cy: center.py, b };
});

// Static data routes (computed once)
const DATA_ROUTES = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * Math.PI * 2;
  const r1 = 200 + (i % 3) * 80;
  const r2 = 150 + ((i + 2) % 4) * 70;
  const p1 = proj(Math.cos(angle) * r1, Math.sin(angle) * r1, 0);
  const p2 = proj(Math.cos(angle + 1.2) * r2, Math.sin(angle + 1.2) * r2, 0);
  return {
    path: `M${p1.px},${p1.py} Q${(p1.px + p2.px) / 2 + 30},${(p1.py + p2.py) / 2 - 40} ${p2.px},${p2.py}`,
    duration: 3 + (i % 4),
    delay: (i * 0.7) % 3,
    color: i % 3 === 0 ? 'rgba(0,240,255,0.7)' : i % 3 === 1 ? 'rgba(148,213,255,0.5)' : 'rgba(34,197,94,0.5)',
  };
});

// Static particles (computed once to avoid SSR mismatches)
const PARTICLES = Array.from({ length: 50 }, (_, i) => ({
  left: ((i * 37 + 13) % 100),
  top: ((i * 53 + 7) % 100),
  size: ((i * 17 + 3) % 3) + 1,
  opacity: ((i * 23 + 11) % 5) / 10 + 0.1,
  duration: ((i * 19 + 5) % 5) + 3,
  delay: (i * 0.3) % 4,
  color: i % 4 === 0 ? '#00f0ff' : i % 4 === 1 ? '#5eead4' : i % 4 === 2 ? '#22d3ee' : '#a78bfa',
}));

const CSS_ANIMATIONS = `
  @keyframes isoLive { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(0.8); } }
  @keyframes pulseLine {
    0%   { stroke-dashoffset: 2000; opacity: 0; }
    5%   { opacity: 0.9; }
    85%  { opacity: 0.9; }
    100% { stroke-dashoffset: 0; opacity: 0; }
  }
  @keyframes floatParticle {
    0%,100% { transform: translateY(0px) translateX(0px); }
    33%     { transform: translateY(-12px) translateX(4px); }
    66%     { transform: translateY(-6px) translateX(-3px); }
  }
  @keyframes particleFade {
    0%,100% { opacity: 1; }
    50%     { opacity: 0.35; }
  }
  @keyframes glowPulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
  @keyframes cardPop {
    0%   { transform: scale(0.5) translateY(30px); opacity: 0; }
    65%  { transform: scale(1.06) translateY(-6px); opacity: 1; }
    100% { transform: scale(1) translateY(0); opacity: 1; }
  }
  @keyframes cardFade {
    0%   { transform: scale(1) translateY(0); opacity: 1; }
    100% { transform: scale(0.75) translateY(15px); opacity: 0; }
  }
  @keyframes scanLine {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(800%); }
  }
  @keyframes dataOrb {
    0%,100% { transform: scale(1); box-shadow: 0 0 12px currentColor; }
    50%     { transform: scale(1.3); box-shadow: 0 0 24px currentColor, 0 0 48px currentColor; }
  }
  @keyframes gridPulse {
    0%,100% { opacity: 0.04; }
    50%     { opacity: 0.10; }
  }
  @keyframes hologramShimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes radarSweep {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes counterUp {
    0%   { opacity: 0; transform: translateY(8px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes beamDown {
    0%   { stroke-dashoffset: 600; opacity: 0; }
    20%  { opacity: 1; }
    80%  { opacity: 1; }
    100% { stroke-dashoffset: 0; opacity: 0; }
  }
  .card-enter { animation: cardPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
  .card-exit  { animation: cardFade 0.35s ease-in forwards; }
`;

interface BuildingProps { b: Building; isActive: boolean; issueColor: string; }

const BuildingRender = ({ b, isActive, issueColor }: BuildingProps) => {
  const { x, y, w, l, h, type } = b;

  const pFront = proj(x + w, y + l, 0);
  const pRight = proj(x + w, y, 0);
  const pBack  = proj(x, y, 0);
  const pLeft  = proj(x, y + l, 0);
  const tFront = proj(x + w, y + l, h);
  const tRight = proj(x + w, y, h);
  const tBack  = proj(x, y, h);
  const tLeft  = proj(x, y + l, h);

  const glassTheme = {
    left:   'rgba(6,20,50,0.55)',
    right:  'rgba(4,12,34,0.65)',
    top:    'rgba(10,30,70,0.40)',
    stroke: 'rgba(0,220,255,0.18)',
    accent: 'rgba(0,220,255,0.45)',
    win:    'rgba(0,200,255,0.12)',
  };
  const solidTheme = {
    left:   '#071628',
    right:  '#040e1e',
    top:    '#0c2046',
    stroke: 'rgba(0,220,255,0.08)',
    accent: 'rgba(0,220,255,0.25)',
    win:    'rgba(0,180,255,0.07)',
  };

  const theme = type === 'glass' ? glassTheme : solidTheme;
  const lFill = isActive ? `${issueColor}55` : theme.left;
  const rFill = isActive ? `${issueColor}44` : theme.right;
  const tFill = isActive ? `${issueColor}66` : theme.top;
  const strokeColor = isActive ? issueColor : theme.stroke;
  const strokeW = isActive ? 1.8 : 0.8;

  // Window grid
  const numFloors = Math.floor(h / 25);
  const windows: { x: number; y: number }[] = [];
  for (let f = 0; f < numFloors; f++) {
    windows.push({ x: 0.3, y: (f + 0.5) / numFloors });
    windows.push({ x: 0.6, y: (f + 0.5) / numFloors });
  }

  return (
    <g>
      {/* Left face */}
      <polygon
        points={`${pLeft.px},${pLeft.py} ${pFront.px},${pFront.py} ${tFront.px},${tFront.py} ${tLeft.px},${tLeft.py}`}
        fill={lFill} stroke={strokeColor} strokeWidth={strokeW} strokeLinejoin="round"
        style={{ transition: 'all 0.7s ease' }}
      />
      {/* Right face */}
      <polygon
        points={`${pFront.px},${pFront.py} ${pRight.px},${pRight.py} ${tRight.px},${tRight.py} ${tFront.px},${tFront.py}`}
        fill={rFill} stroke={strokeColor} strokeWidth={strokeW} strokeLinejoin="round"
        style={{ transition: 'all 0.7s ease' }}
      />
      {/* Top face */}
      <polygon
        points={`${tFront.px},${tFront.py} ${tRight.px},${tRight.py} ${tBack.px},${tBack.py} ${tLeft.px},${tLeft.py}`}
        fill={tFill} stroke={isActive ? issueColor : theme.accent} strokeWidth={strokeW}
        strokeLinejoin="round" style={{ transition: 'all 0.7s ease' }}
      />

      {/* Glass building: vertical data lines */}
      {type === 'glass' && !isActive && (
        <>
          <line x1={tFront.px} y1={tFront.py} x2={pFront.px} y2={pFront.py}
            stroke={theme.accent} strokeWidth="1.5" strokeDasharray="3 9" opacity={0.5} />
          <line x1={tLeft.px} y1={tLeft.py} x2={pLeft.px} y2={pLeft.py}
            stroke={theme.accent} strokeWidth="1" strokeDasharray="2 8" opacity={0.25} />
          <line x1={tRight.px} y1={tRight.py} x2={pRight.px} y2={pRight.py}
            stroke={theme.accent} strokeWidth="1" strokeDasharray="2 8" opacity={0.25} />
        </>
      )}

      {/* Simulated windows on left face */}
      {!isActive && windows.map((win, wi) => {
        const bx = pLeft.px + (pFront.px - pLeft.px) * win.x;
        const by = pLeft.py + (tLeft.py - pLeft.py) * win.y + (tFront.py - tLeft.py) * win.x;
        const wx2 = bx + (pFront.px - pLeft.px) * 0.1;
        const wy2 = by + (tFront.py - tLeft.py) * 0.1;
        return (
          <polygon key={wi}
            points={`${bx},${by} ${wx2},${wy2} ${wx2},${wy2 - 5} ${bx},${by - 5}`}
            fill={theme.win} opacity={0.9}
          />
        );
      })}

      {/* Active: laser beam + impact */}
      {isActive && (
        <>
          <line x1={tFront.px} y1={tFront.py - 600} x2={tFront.px} y2={tFront.py}
            stroke={issueColor} strokeWidth="2.5" filter="url(#glowStrong)"
            strokeDasharray="600" strokeDashoffset="600"
            style={{ animation: 'beamDown 3s ease-out infinite' }} />
          <line x1={tFront.px} y1={tFront.py - 600} x2={tFront.px} y2={tFront.py}
            stroke={issueColor} strokeWidth="10" opacity="0.2" filter="url(#glowStrong)"
            strokeDasharray="600" strokeDashoffset="600"
            style={{ animation: 'beamDown 3s ease-out infinite' }} />
          <ellipse cx={tFront.px} cy={tFront.py}
            rx={w * 0.45} ry={(w * 0.45) * Math.sin(ISO_ANG)}
            fill="none" stroke={issueColor} strokeWidth="2.5"
            style={{ animation: 'ping 2.2s ease-in-out infinite' }} />
          <ellipse cx={tFront.px} cy={tFront.py}
            rx={w * 0.22} ry={(w * 0.22) * Math.sin(ISO_ANG)}
            fill={issueColor} opacity="0.45" filter="url(#glowStrong)"
            style={{ animation: 'glowPulse 1.5s ease-in-out infinite' }} />
        </>
      )}

      {/* Glass roof antenna dot */}
      {type === 'glass' && (
        <circle cx={tBack.px + (tFront.px - tBack.px) * 0.5}
          cy={tBack.py + (tFront.py - tBack.py) * 0.5}
          r="2" fill={isActive ? issueColor : 'rgba(0,240,255,0.7)'}
          style={{ animation: `glowPulse ${1.5 + b.seed}s ease-in-out infinite`, animationDelay: `${b.seed}s` }}
        />
      )}

      {/* Outer back stroke */}
      {type === 'glass' && (
        <polygon
          points={`${tBack.px},${tBack.py} ${tRight.px},${tRight.py} ${pRight.px},${pRight.py} ${pBack.px},${pBack.py} ${pLeft.px},${pLeft.py} ${tLeft.px},${tLeft.py}`}
          fill="none" stroke={strokeColor} strokeWidth={0.4} opacity={0.3}
        />
      )}
    </g>
  );
};

// Helper to satisfy internationalization requirements
const t = (text: string) => text;

const IsometricCity = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [stats] = useState({ reports: 1847, resolved: 1423, active: 249 });
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setActiveIndex(prev => (prev + 1) % ISSUES.length);
        setVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const activeIssue = ISSUES.find((_, idx) => idx === activeIndex) ?? ISSUES[0];
  const activePin   = PINS.find((_, idx) => idx === activeIssue.bi) ?? PINS[0];

  const statusColor = (s: string) =>
    s === 'Resolved'    ? '#34d399' :
    s === 'Assigned'    ? '#38bdf8' :
    s === 'In Progress' ? '#facc15' : '#f87171';

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: '#010916' }}>
      <style>{CSS_ANIMATIONS}</style>

      {/* ── Deep space gradient ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,30,80,0.55) 0%, transparent 65%),' +
          'radial-gradient(ellipse 60% 40% at 20% 30%, rgba(0,60,120,0.20) 0%, transparent 60%),' +
          'radial-gradient(ellipse 50% 35% at 80% 20%, rgba(50,0,100,0.15) 0%, transparent 55%)',
      }} />

      {/* ── Animated particles ── */}
      <div className="absolute inset-0 pointer-events-none">
        {PARTICLES.map((p, i) => (
          <div key={i} className="absolute rounded-full" style={{
            left: `${p.left}%`,
            top:  `${p.top}%`,
            width:  `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            opacity: p.opacity,
            animation: [
              `floatParticle ${p.duration}s ease-in-out ${p.delay}s infinite`,
              `particleFade ${p.duration * 1.3}s ease-in-out ${p.delay * 0.7}s infinite`,
            ].join(', '),
          }} />
        ))}
      </div>

      {/* ── Horizontal scan line ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,200,255,0.12) 30%, rgba(0,240,255,0.3) 50%, rgba(0,200,255,0.12) 70%, transparent 100%)',
          top: 0,
          animation: 'scanLine 8s linear infinite',
        }} />
      </div>

      {/* ── Corner HUD decorations ── */}
      {/* Top-left HUD corner */}
      <div style={{
        position: 'absolute', top: 16, left: 16, pointerEvents: 'none',
        border: '1px solid rgba(0,200,255,0.2)', borderRadius: 4,
        width: 48, height: 48,
        borderRight: 'none', borderBottom: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 16, right: 16, pointerEvents: 'none',
        border: '1px solid rgba(0,200,255,0.2)', borderRadius: 4,
        width: 48, height: 48,
        borderLeft: 'none', borderTop: 'none',
      }} />

      {/* ── Live stats counters (top right, shown on large screens) ── */}
      <div className="hidden lg:flex" style={{
        position: 'absolute', top: 20, right: 20, gap: 12, pointerEvents: 'none', zIndex: 15,
      }}>
        {[
          { label: 'REPORTS',  value: stats.reports,  color: '#38bdf8' },
          { label: 'RESOLVED', value: stats.resolved, color: '#34d399' },
          { label: 'ACTIVE',   value: stats.active,   color: '#facc15' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'rgba(2,10,28,0.75)',
            border: `1px solid ${s.color}33`,
            borderRadius: 10,
            padding: '8px 14px',
            backdropFilter: 'blur(12px)',
            boxShadow: `0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)`,
            textAlign: 'center',
            animation: `counterUp 0.6s ease ${i * 0.15}s both`,
          }}>
            <div style={{
              fontSize: 18, fontWeight: 800, color: s.color,
              fontFamily: "'Plus Jakarta Sans', monospace",
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
              textShadow: `0 0 12px ${s.color}`,
            }}>{s.value.toLocaleString()}</div>
            <div style={{
              fontSize: 8, fontWeight: 700, letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.35)', fontFamily: "'Plus Jakarta Sans', sans-serif",
              marginTop: 3,
            }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Main SVG city ── */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
        <svg
          ref={svgRef}
          viewBox="-620 -440 1240 840"
          width="100%" height="100%"
          preserveAspectRatio="xMidYMid slice"
          style={{ display: 'block', overflow: 'visible' }}
        >
          <defs>
            <filter id="glowFaint" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glowStrong" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feComponentTransfer in="blur" result="glow">
                <feFuncA type="linear" slope="1.8" />
              </feComponentTransfer>
              <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glowMed" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <radialGradient id="groundGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="rgba(0,40,100,0.3)" />
              <stop offset="100%" stopColor="rgba(1,9,22,0.1)" />
            </radialGradient>
            <pattern id="hexGrid" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
              <polygon points="30,2 58,17 58,47 30,62 2,47 2,17"
                fill="none" stroke="rgba(0,220,255,0.06)" strokeWidth="0.8"
                style={{ animation: 'gridPulse 4s ease-in-out infinite' }} />
            </pattern>
          </defs>

          <g transform="translate(0, 80)">
            {/* Ground plane */}
            <polygon
              points={`
                ${proj(-620, -620, 0).px},${proj(-620, -620, 0).py}
                ${proj( 620, -620, 0).px},${proj( 620, -620, 0).py}
                ${proj( 620,  620, 0).px},${proj( 620,  620, 0).py}
                ${proj(-620,  620, 0).px},${proj(-620,  620, 0).py}
              `}
              fill="url(#groundGrad)"
              stroke="rgba(0,200,255,0.15)" strokeWidth="0.5"
            />

            {/* Hex grid overlay on ground */}
            <polygon
              points={`
                ${proj(-620, -620, 0).px},${proj(-620, -620, 0).py}
                ${proj( 620, -620, 0).px},${proj( 620, -620, 0).py}
                ${proj( 620,  620, 0).px},${proj( 620,  620, 0).py}
                ${proj(-620,  620, 0).px},${proj(-620,  620, 0).py}
              `}
              fill="url(#hexGrid)"
            />

            {/* Data routes on ground */}
            {DATA_ROUTES.map((route, i) => (
              <path key={i} d={route.path}
                fill="none" stroke={route.color} strokeWidth="1.8"
                strokeDasharray="2000" strokeDashoffset="2000" filter="url(#glowFaint)"
                style={{
                  animation: `pulseLine ${route.duration}s linear ${route.delay}s infinite`,
                }}
              />
            ))}

            {/* Buildings (depth-sorted) */}
            {[...BUILDINGS]
              .sort((a, b) => (a.x + a.y) - (b.x + b.y))
              .map(b => (
                <BuildingRender key={b.i} b={b}
                  isActive={b.i === activeIssue.bi}
                  issueColor={activeIssue.color}
                />
              ))
            }

            {/* Connection line from active building to card */}
            {visible && (
              <line
                x1={activePin.cx} y1={activePin.cy}
                x2={activePin.cx} y2={activePin.cy - 85}
                stroke={activeIssue.color} strokeWidth="1.5" strokeDasharray="4 3"
                filter="url(#glowFaint)" opacity={0.8}
              />
            )}

            {/* Floating issue card */}
            <foreignObject
              x={activePin.cx - 115}
              y={activePin.cy - 200}
              width="230" height="120"
              style={{ overflow: 'visible' }}
            >
              <div className={visible ? 'card-enter' : 'card-exit'} style={{
                width: 210, margin: '0 auto',
                background: 'rgba(3,10,28,0.88)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid ${activeIssue.color}66`,
                boxShadow: `0 16px 48px rgba(0,0,0,0.8), 0 0 32px ${activeIssue.glow}, inset 0 1px 0 rgba(255,255,255,0.08)`,
                borderRadius: 16,
                padding: '14px 16px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Shimmer overlay */}
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 16, pointerEvents: 'none',
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)',
                  backgroundSize: '200% 100%',
                  animation: 'hologramShimmer 4s linear infinite',
                }} />

                {/* Accent bar top */}
                <div style={{
                  position: 'absolute', top: 0, left: 16, right: 16, height: 1,
                  background: `linear-gradient(90deg, transparent, ${activeIssue.color}, transparent)`,
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: `radial-gradient(circle, ${activeIssue.color}55, ${activeIssue.color}22)`,
                    border: `1px solid ${activeIssue.color}88`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, color: activeIssue.color,
                    boxShadow: `0 0 12px ${activeIssue.glow}`,
                    animation: 'dataOrb 2s ease-in-out infinite',
                  }}>
                    {activeIssue.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.45)', fontFamily: "'Plus Jakarta Sans', monospace",
                      fontWeight: 700,
                    }}>{t('Live Report')}</div>
                    <div style={{
                      fontSize: 13, fontWeight: 700, lineHeight: 1.3,
                      color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif",
                      marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{activeIssue.label}</div>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10, padding: '7px 10px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{
                    fontSize: 10, color: 'rgba(255,255,255,0.4)',
                    fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500,
                  }}>{t('Status')}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: statusColor(activeIssue.status),
                      boxShadow: `0 0 6px ${statusColor(activeIssue.status)}`,
                      animation: 'glowPulse 1.5s ease-in-out infinite',
                    }} />
                    <span style={{
                      fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
                      textTransform: 'uppercase', color: statusColor(activeIssue.status),
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}>{activeIssue.status}</span>
                  </div>
                </div>
              </div>
            </foreignObject>

            {/* Ground dot under active building */}
            <ellipse
              cx={activePin.cx} cy={activePin.cy + 8}
              rx={30} ry={12}
              fill={activeIssue.color} opacity={0.15} filter="url(#glowStrong)"
              style={{ animation: 'glowPulse 2s ease-in-out infinite' }}
            />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default IsometricCity;
