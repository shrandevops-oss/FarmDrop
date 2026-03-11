import { COLORS as C } from '@/utils/theme';

/**
 * TimerCircle – SVG countdown ring
 * @param {number} secs     – current seconds remaining
 * @param {number} total    – total seconds (default 1800)
 * @param {'warm'|'dark'} theme
 */
export default function TimerCircle({ secs, total = 1800, theme = 'warm' }) {
  const r = 67, circ = 2 * Math.PI * r;
  const frac = Math.max(0, secs / total);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  const trackColor = theme === 'dark' ? '#2A2A2A' : C.creamDark;
  const progressColor = frac > 0.45 ? C.field : C.grain;
  const textColor = theme === 'dark' ? C.offwhite : C.earth;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '22px 20px 14px' }}>
      <div style={{ width: 155, height: 155, position: 'relative' }}>
        <svg width="155" height="155" viewBox="0 0 155 155" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="77.5" cy="77.5" r={r} fill="none" stroke={trackColor} strokeWidth="9"/>
          <circle
            cx="77.5" cy="77.5" r={r} fill="none"
            stroke={progressColor} strokeWidth="9"
            strokeDasharray={`${circ * frac} ${circ}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s linear, stroke .5s' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 38, fontWeight: 900, color: textColor, lineHeight: 1,
          }}>
            {m}:{String(s).padStart(2, '0')}
          </div>
          <div style={{
            fontSize: 10, color: theme === 'dark' ? '#777' : C.smoke,
            fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginTop: 4,
          }}>
            remaining
          </div>
        </div>
      </div>
    </div>
  );
}
