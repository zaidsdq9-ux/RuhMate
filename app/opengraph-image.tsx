import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'RuhMate — Discreet, family-first matrimonial matching';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          background:
            'radial-gradient(120% 90% at 0% 0%, #ffe9f6 0%, #ffffff 60%), radial-gradient(80% 70% at 100% 100%, #f9d9ef 0%, #ffffff 80%)',
          color: '#1a1a1a',
          fontFamily: 'serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: '#cc41b0',
              boxShadow: '0 0 0 6px rgba(204,65,176,0.18)',
            }}
          />
          <span
            style={{
              fontSize: 26,
              letterSpacing: 6,
              textTransform: 'uppercase',
              color: '#7a1d68',
              fontWeight: 600,
            }}
          >
            RuhMate
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h1
            style={{
              fontSize: 92,
              lineHeight: 1.05,
              margin: 0,
              fontWeight: 500,
              letterSpacing: -1.2,
            }}
          >
            Discreet matches.
            <br />
            <span style={{ color: '#cc41b0' }}>Family-first</span> matrimonial.
          </h1>
          <p
            style={{
              fontSize: 30,
              color: '#6b6b6b',
              maxWidth: 980,
              margin: 0,
              lineHeight: 1.35,
              fontFamily: 'sans-serif',
            }}
          >
            Anonymous profiles. AI-ranked matches. Reveal contact only when you find the right one.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 22,
            color: '#9a93a0',
            fontFamily: 'sans-serif',
          }}
        >
          <span>No photos · No chat · Pay-per-reveal</span>
          <span>ruhmate.app</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
