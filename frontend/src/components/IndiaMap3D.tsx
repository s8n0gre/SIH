import React, { useState, useEffect, useRef } from 'react';

/* ── 3D India Map — improved outline + 3D extrusion effect ──── */

// ViewBox 0 0 310 430  |  coordinates derived from geo lat/lon
// Key improvements: Saurashtra peninsula, proper Kashmir notch, NE bulge, smoother curves
const MAIN_PATH =
  'M 15,215 C 26,202 34,193 40,185 C 52,168 63,130 70,105 ' +
  'C 74,98 79,97 82,97 L 90,80 C 88,72 86,69 84,68 ' +
  'C 90,66 96,65 100,66 C 108,67 114,67 118,68 ' +
  'C 115,88 112,103 110,113 C 117,117 122,120 126,122 ' +
  'C 140,134 151,145 160,155 C 180,158 196,159 210,160 ' +
  'C 228,161 241,162 250,164 C 257,172 262,178 265,182 ' +
  'C 262,192 257,202 252,208 C 243,219 232,227 220,234 ' +
  'C 208,242 197,248 186,254 C 176,265 168,277 160,288 ' +
  'C 150,296 138,304 126,310 C 125,330 125,349 125,365 ' +
  'C 117,385 110,400 103,413 C 100,410 98,409 97,408 ' +
  'C 95,400 93,395 91,390 C 89,381 87,378 86,374 ' +
  'C 83,364 80,359 77,354 C 73,341 70,332 68,324 ' +
  'C 67,317 66,314 65,312 C 62,302 60,296 59,290 ' +
  'C 58,282 57,277 57,273 C 55,263 54,258 53,254 ' +
  'L 53,248 C 50,242 47,238 46,235 C 44,231 42,228 42,226 ' +
  'C 38,225 35,223 38,222 C 36,219 25,216 15,215 Z';

// Saurashtra (Kathiawar) peninsula — the distinctive west-coast bulge
const SAU_PATH =
  'M 53,254 C 50,252 46,251 43,249 ' +
  'C 36,248 30,250 24,255 ' +
  'C 17,261 12,268 12,275 ' +
  'C 16,278 21,279 26,276 ' +
  'C 30,272 33,269 38,268 ' +
  'C 33,274 28,280 26,286 ' +
  'C 32,285 39,282 45,278 ' +
  'C 48,270 50,262 53,254 Z';

// City data — (cx,cy) mapped to the improved viewBox
const CITIES = [
  { name:'Delhi',     cx:100, cy:128, color:'#FF6B6B', issue:'Road repair needed',      status:'In Progress' },
  { name:'Mumbai',    cx: 50, cy:240, color:'#FBBF24', issue:'Water logging reported',  status:'Resolved'    },
  { name:'Bangalore', cx: 97, cy:345, color:'#38BDF8', issue:'Street light outage',    status:'Assigned'    },
  { name:'Chennai',   cx:122, cy:342, color:'#A78BFA', issue:'Garbage pile-up',        status:'Resolved'    },
  { name:'Kolkata',   cx:200, cy:197, color:'#FF6B6B', issue:'Pothole on main road',   status:'Resolved'    },
  { name:'Hyderabad', cx:108, cy:278, color:'#FBBF24', issue:'Power outage reported',  status:'In Progress' },
  { name:'Ahmedabad', cx: 48, cy:205, color:'#38BDF8', issue:'Broken footpath',        status:'Assigned'    },
  { name:'Jaipur',    cx: 79, cy:153, color:'#FF6B6B', issue:'Traffic signal fault',   status:'Resolved'    },
  { name:'Lucknow',   cx:131, cy:155, color:'#FBBF24', issue:'Drain overflow',         status:'In Progress' },
  { name:'Pune',      cx: 60, cy:260, color:'#38BDF8', issue:'Park maintenance needed',status:'Assigned'    },
];

const STATUS_CLR: Record<string, string> = {
  'Resolved':    '#22c55e',
  'In Progress': '#FBBF24',
  'Assigned':    '#38BDF8',
};

// Extrusion depth: 5 layers, each a bit lighter/higher
const EXTRUDE = [
  { dx:8, dy:13, fill:'#04111e' },
  { dx:6, dy:10, fill:'#061929' },
  { dx:4, dy: 7, fill:'#082034' },
  { dx:2, dy: 4, fill:'#0a2840' },
  { dx:1, dy: 2, fill:'#0d2f4a' },
];

const IndiaMap3D: React.FC = () => {
  const [activeIdx, setActiveIdx]     = useState(0);
  const [cardVisible, setCardVisible] = useState(true);
  const [resolved, setResolved]       = useState(1247);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setCardVisible(false);
      setTimeout(() => {
        setActiveIdx(i => (i + 1) % CITIES.length);
        setResolved(c => c + Math.floor(Math.random() * 3 + 1));
        setCardVisible(true);
      }, 350);
    }, 3000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  const city = CITIES[activeIdx];

  return (
    <div style={{ position:'relative', width:'100%' }}>
      <style>{`
        @keyframes m3dPing1    { 0%{r:5;opacity:.75} 100%{r:20;opacity:0} }
        @keyframes m3dPing2    { 0%{r:5;opacity:.35} 100%{r:32;opacity:0} }
        @keyframes m3dDot      { 0%,100%{opacity:1}  50%{opacity:.5} }
        @keyframes m3dCardIn   { 0%{opacity:0;transform:translateY(8px)}  100%{opacity:1;transform:translateY(0)} }
        @keyframes m3dCardOut  { 0%{opacity:1;transform:translateY(0)}    100%{opacity:0;transform:translateY(-6px)} }
        @keyframes m3dLiveDot  { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.6)} 60%{box-shadow:0 0 0 6px rgba(34,197,94,0)} }
        @keyframes m3dCounter  { 0%{transform:translateY(5px);opacity:0}  100%{transform:translateY(0);opacity:1} }
        @keyframes m3dFloat    { 0%,100%{transform:rotateX(28deg) rotateY(-8deg) rotateZ(2deg) translateY(0px)}
                                 50% {transform:rotateX(28deg) rotateY(-8deg) rotateZ(2deg) translateY(-5px)} }
        @keyframes m3dScan     { 0%{transform:translateY(-60px)} 100%{transform:translateY(440px)} }
      `}</style>

      {/* ── Live header ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
          <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#22c55e', animation:'m3dLiveDot 1.6s ease-in-out infinite' }}/>
          <span style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-muted)', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
            Live Civic Reports
          </span>
        </div>
        <span key={resolved} style={{ fontSize:'11px', fontWeight:600, color:'#22c55e', fontFamily:"'DM Sans',sans-serif", animation:'m3dCounter .4s ease' }}>
          {resolved.toLocaleString()} resolved today
        </span>
      </div>

      {/* ── 3D Map ── */}
      <div style={{ position:'relative' }}>
        {/* CSS perspective creates the 3D tilt */}
        <div style={{ perspective:'950px', perspectiveOrigin:'48% 25%' }}>
          <div style={{ transformStyle:'preserve-3d', animation:'m3dFloat 7s ease-in-out infinite' }}>
            <svg viewBox="0 0 310 430"
              style={{ width:'100%', maxHeight:'215px', height:'auto', overflow:'visible', display:'block' }}>
              <defs>
                {/* Glow filter for city dots */}
                <filter id="m3glow" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="b"/>
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                {/* Top-face — deep ocean blue, lit from top-left */}
                <linearGradient id="m3top" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   stopColor="#1a4a72" stopOpacity="0.97"/>
                  <stop offset="35%"  stopColor="#0d3558" stopOpacity="0.95"/>
                  <stop offset="70%"  stopColor="#092440" stopOpacity="0.92"/>
                  <stop offset="100%" stopColor="#05142a" stopOpacity="0.95"/>
                </linearGradient>
                {/* Shimmer — highlights on top-left edges */}
                <linearGradient id="m3shine" x1="0%" y1="0%" x2="75%" y2="75%">
                  <stop offset="0%"   stopColor="rgba(100,210,255,0.22)"/>
                  <stop offset="60%"  stopColor="rgba(100,210,255,0.05)"/>
                  <stop offset="100%" stopColor="rgba(217,75,56,0.02)"/>
                </linearGradient>
                {/* Edge stroke gradient */}
                <linearGradient id="m3edge" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   stopColor="#5BE0FF" stopOpacity="0.95"/>
                  <stop offset="55%"  stopColor="#4CC9F0" stopOpacity="0.75"/>
                  <stop offset="100%" stopColor="#D94B38" stopOpacity="0.65"/>
                </linearGradient>
              </defs>

              {/* ── DROP SHADOW ── */}
              <path d={MAIN_PATH}  transform="translate(6,18)" fill="rgba(0,0,0,0.4)" style={{ filter:'blur(8px)' }}/>
              <path d={SAU_PATH}   transform="translate(6,18)" fill="rgba(0,0,0,0.4)" style={{ filter:'blur(8px)' }}/>

              {/* ── EXTRUSION LAYERS ── */}
              {EXTRUDE.map(({ dx, dy, fill }, k) => (
                <g key={k}>
                  <path d={MAIN_PATH} transform={`translate(${dx},${dy})`} fill={fill}/>
                  <path d={SAU_PATH}  transform={`translate(${dx},${dy})`} fill={fill}/>
                </g>
              ))}

              {/* ── TOP FACE - main India body ── */}
              <path d={MAIN_PATH}
                fill="url(#m3top)"
                stroke="url(#m3edge)"
                strokeWidth="1.4"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {/* ── TOP FACE - Saurashtra peninsula ── */}
              <path d={SAU_PATH}
                fill="url(#m3top)"
                stroke="url(#m3edge)"
                strokeWidth="1.4"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* ── SHIMMER HIGHLIGHT ── */}
              <path d={MAIN_PATH} fill="url(#m3shine)" opacity="0.9" pointerEvents="none"/>
              <path d={SAU_PATH}  fill="url(#m3shine)" opacity="0.9" pointerEvents="none"/>

              {/* ── TERRAIN GRID (horizontal + vertical scan lines) ── */}
              <g opacity="1" pointerEvents="none">
                {[100,120,140,160,180,200,220,240,260,280,300,320,340,360,380,400].map(y => (
                  <line key={`h${y}`} x1="10" y1={y} x2="270" y2={y}
                    stroke="rgba(91,224,255,0.055)" strokeWidth="0.5"/>
                ))}
                {[40,70,100,130,160,190,220,250].map(x => (
                  <line key={`v${x}`} x1={x} y1="65" x2={x} y2="425"
                    stroke="rgba(91,224,255,0.055)" strokeWidth="0.5"/>
                ))}
              </g>

              {/* ── ANIMATED SCAN LINE ── */}
              <rect x="10" y="0" width="260" height="25"
                fill="rgba(91,224,255,0.045)"
                style={{ animation:'m3dScan 3.5s linear infinite' }}
                pointerEvents="none"
              />

              {/* ── CITY MARKERS ── */}
              {CITIES.map((c, i) => {
                const on = i === activeIdx;
                return (
                  <g key={c.name} filter="url(#m3glow)">
                    {/* Pulse rings when active */}
                    {on && (<>
                      <circle cx={c.cx} cy={c.cy} r="5" fill={c.color} opacity="0.55"
                        style={{ animation:'m3dPing1 1.6s ease-out infinite', transformOrigin:`${c.cx}px ${c.cy}px`}}/>
                      <circle cx={c.cx} cy={c.cy} r="5" fill={c.color} opacity="0.28"
                        style={{ animation:'m3dPing2 1.9s ease-out .35s infinite', transformOrigin:`${c.cx}px ${c.cy}px`}}/>
                    </>)}
                    {/* Outer ring */}
                    <circle cx={c.cx} cy={c.cy} r={on ? 5.5 : 4}
                      fill="none"
                      stroke={c.color}
                      strokeWidth={on ? 1.5 : 0.8}
                      opacity={on ? 1 : 0.4}
                      style={{ transition:'all .3s ease' }}
                    />
                    {/* Core dot */}
                    <circle cx={c.cx} cy={c.cy} r={on ? 3.5 : 2.5}
                      fill={c.color}
                      style={{
                        transition:'r .3s ease',
                        animation: on ? 'm3dDot 1.2s ease-in-out infinite' : undefined,
                        transformOrigin:`${c.cx}px ${c.cy}px`
                      }}
                    />
                    {/* Specular highlight */}
                    <circle cx={c.cx-1} cy={c.cy-1} r={on ? 1.3 : 0.9} fill="rgba(255,255,255,0.75)"/>
                    {/* City name label */}
                    {on && (
                      <text x={c.cx+8} y={c.cy+3.5} fontSize="7.5"
                        fill={c.color}
                        style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700 }}>
                        {c.name}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* ── Floating issue card ── */}
        <div style={{
          position: 'absolute', bottom:'2%', right:0,
          animation: cardVisible ? 'm3dCardIn 0.35s ease forwards' : 'm3dCardOut 0.3s ease forwards',
          background: 'var(--bg-elevated)',
          border: `1px solid ${city.color}44`,
          borderLeft: `3px solid ${city.color}`,
          borderRadius: '10px',
          padding: '8px 12px',
          boxShadow: `0 4px 24px rgba(0,0,0,0.2), 0 0 14px ${city.color}18`,
          maxWidth: '155px',
          pointerEvents: 'none',
        }}>
          <p style={{ fontSize:'9px', color:'var(--text-faint)', fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', margin:'0 0 2px' }}>
            {city.name}
          </p>
          <p style={{ fontSize:'11px', color:'var(--text-secondary)', fontFamily:"'DM Sans',sans-serif", lineHeight:1.35, margin:'0 0 4px' }}>
            {city.issue}
          </p>
          <span style={{ fontSize:'9px', fontWeight:700, color:STATUS_CLR[city.status], fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:'0.04em' }}>
            ● {city.status}
          </span>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div style={{ display:'flex', gap:'8px', marginTop:'10px', flexWrap:'wrap' }}>
        {[{ label:'Cities Active', val:'47' }, { label:'Avg Resolution', val:'2.3 days' }, { label:'Reports Today', val:'318' }].map(s => (
          <div key={s.label} style={{ flex:1, minWidth:'70px', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'8px', padding:'6px 8px', textAlign:'center' }}>
            <p style={{ fontSize:'13px', fontWeight:700, color:'var(--text-primary)', fontFamily:"'Plus Jakarta Sans',sans-serif", margin:0 }}>{s.val}</p>
            <p style={{ fontSize:'9px', color:'var(--text-faint)', fontFamily:"'DM Sans',sans-serif", margin:0, marginTop:'1px' }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IndiaMap3D;
