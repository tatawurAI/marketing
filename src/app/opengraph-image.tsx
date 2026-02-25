import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';
export const alt =
  'Tatawur AI — Evolving the Built Environment Through Intelligent Automation';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const logoData = readFileSync(join(process.cwd(), 'public/logo-full.svg'));
  const logoBase64 = `data:image/svg+xml;base64,${logoData.toString(
    'base64',
  )}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0B0E0F',
          padding: 24,
        }}
      >
        <img
          src={logoBase64}
          style={{
            width: '100%',
            objectFit: 'contain',
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
