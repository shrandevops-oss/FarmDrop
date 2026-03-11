import { COLORS as C } from '@/utils/theme';

/**
 * LiveMap – animated SVG delivery map
 * @param {number} progress  0 → 1 (delivery progress)
 * @param {'customer'|'agent'} mode
 */
export default function LiveMap({ progress = 0, mode = 'customer' }) {
  const rx = 40 + progress * 348;
  const ry = 200 - progress * 124 + Math.sin(progress * Math.PI * 5) * 7;
  const isAgent = mode === 'agent';
  const accent = isAgent ? C.orange : C.grain;

  return (
    <div style={{
      margin: '0 16px 16px',
      borderRadius: 18,
      overflow: 'hidden',
      position: 'relative',
      height: 220,
      background: '#1a2a1a',
    }}>
      <svg width="100%" height="220" viewBox="0 0 398 220" preserveAspectRatio="xMidYMid slice">
        <rect width="398" height="220" fill="#141a14"/>
        <path d="M0 190 Q80 178 180 162 Q280 146 398 128" stroke="#1e2a1e" strokeWidth="22" fill="none"/>
        <path d="M0 110 Q140 104 280 118 Q360 126 398 122" stroke="#1e2a1e" strokeWidth="16" fill="none"/>
        <path d="M110 0 L116 220" stroke="#1e2a1e" strokeWidth="14" fill="none"/>
        <path d="M290 0 L294 220" stroke="#1e2a1e" strokeWidth="12" fill="none"/>
        {/* dashed lane markings */}
        <path d="M0 190 Q80 178 180 162 Q280 146 398 128" stroke="#2a3a2a" strokeWidth="2" fill="none" strokeDasharray="14 9"/>
        {/* Route */}
        <path d="M 40 200 Q 140 165 230 140 Q 320 116 388 82"
          stroke={accent} strokeWidth="2.5" fill="none" strokeDasharray="8 5" opacity=".85"/>
        {/* Farmer origin */}
        <circle cx="40" cy="200" r="15" fill="#3A6B35" stroke="white" strokeWidth="2.5"/>
        <text x="40" y="205" textAnchor="middle" fontSize="13">🌾</text>
        {/* Customer dest */}
        <circle cx="388" cy="82" r="15" fill="#C0392B" stroke="white" strokeWidth="2.5"/>
        <text x="388" y="87" textAnchor="middle" fontSize="13">🏠</text>
        {/* Rider */}
        <circle cx={rx} cy={ry} r="18" fill={accent} stroke="white" strokeWidth="2.5"/>
        <text x={rx} y={ry + 5} textAnchor="middle" fontSize="14">🛵</text>
        {/* Pulse ring */}
        <circle cx={rx} cy={ry} r="24" fill="none" stroke={accent} strokeWidth="2" opacity="0">
          <animate attributeName="r" values="18;30;18" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite"/>
        </circle>
        {/* Labels */}
        <rect x="8" y="216" width="64" height="16" rx="8" fill="rgba(0,0,0,.6)"/>
        <text x="40" y="228" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">FARMER</text>
        <rect x="358" y="63" width="58" height="16" rx="8" fill="rgba(0,0,0,.6)"/>
        <text x="387" y="75" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">YOU</text>
      </svg>

      {/* Overlay info bar */}
      <div style={{
        position: 'absolute', bottom: 10, left: 10, right: 10,
        background: 'rgba(10,6,2,.88)', backdropFilter: 'blur(6px)',
        borderRadius: 12, padding: '9px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: isAgent ? C.offwhite : C.husk }}>
            🛵 Rajan is on the way
          </div>
          <div style={{ fontSize: 11, color: '#777', marginTop: 1 }}>6.4 km · Route via NH 45</div>
        </div>
        <div style={{
          background: accent, color: isAgent ? C.agentBg : C.earth,
          fontSize: 12, fontWeight: 800, padding: '5px 13px', borderRadius: 20,
        }}>
          ~{Math.max(1, Math.round(30 - progress * 29))} min
        </div>
      </div>
    </div>
  );
}
