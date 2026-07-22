/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow cross-origin requests from Replit dev preview iframe
  allowedDevOrigins: [
    '127.0.0.1',
    'localhost',
    ...(process.env.REPLIT_DEV_DOMAIN ? [process.env.REPLIT_DEV_DOMAIN] : []),
    ...(process.env.REPLIT_DOMAINS ? process.env.REPLIT_DOMAINS.split(',') : []),
    '*.replit.dev',
    '*.replit.app',
    '*.pike.replit.dev',
    '*.repl.co',
  ],

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // X-Frame-Options removed — it blocks the Replit preview iframe.
          // frame-ancestors in CSP handles embedding security instead.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://cdn.discordapp.com",
              "connect-src 'self' wss: ws:",
              // allow embedding in Replit preview and any parent
              "frame-ancestors *",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
