import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0a0a0a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* 글로우 ring */}
        <div
          style={{
            position: 'absolute',
            width: 152,
            height: 152,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(163,230,53,0.25) 0%, rgba(163,230,53,0) 70%)',
          }}
        />
        {/* 라임 원 */}
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: '#a3e635',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: '#0a0a0a',
              letterSpacing: '-0.06em',
              lineHeight: 1,
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            TT
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 11,
              fontWeight: 700,
              color: '#0a0a0a',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            COACH
          </div>
        </div>
      </div>
    ),
    size
  );
}
