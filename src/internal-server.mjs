/**
 * Internal HTTP micro-server for dashboard → bot real-time control.
 * Runs on port 3001 (localhost only). Never exposed to the internet.
 */
import http from 'http';
import logger from './utils/logger.mjs';

// Registry of all active Discord.js Client instances
const registry = new Set();

export function registerClient(client) {
  registry.add(client);
}

export function unregisterClient(client) {
  registry.delete(client);
}

/**
 * Apply a presence to every registered client instantly.
 * @param {{ status: string, activityType: number, activityName: string, streamingUrl?: string }} data
 */
export function applyPresenceNow(data) {
  let applied = 0;
  for (const client of registry) {
    try {
      if (!client?.user) continue;
      const activity = {
        name: data.activityName || 'Enjoy Every Moment :)',
        type: data.activityType ?? 4,
        ...(data.activityType === 1 && data.streamingUrl ? { url: data.streamingUrl } : {}),
      };
      client.user.setPresence({
        activities: [activity],
        status: data.status || 'online',
      });
      applied++;
    } catch (e) {
      logger(`Presence apply error: ${e.message}`.yellow);
    }
  }
  return applied;
}

/** Start the internal API server */
export function startInternalServer() {
  const server = http.createServer((req, res) => {
    const send = (status, data) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };

    // Health check
    if (req.method === 'GET' && req.url === '/internal/health') {
      return send(200, { ok: true, clients: registry.size });
    }

    // Instant presence update
    if (req.method === 'POST' && req.url === '/internal/presence') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const applied = applyPresenceNow(data);
          logger(`Presence pushed instantly to ${applied} client(s): ${data.status} — ${data.activityName}`.cyan);
          send(200, { ok: true, applied });
        } catch (e) {
          send(400, { error: 'Invalid JSON' });
        }
      });
      return;
    }

    send(404, { error: 'Not found' });
  });

  server.listen(3001, '127.0.0.1', () => {
    logger(`Internal API server listening on :3001`.green.bold);
  });

  server.on('error', err => {
    // Port already in use is fine (another bot instance)
    if (err.code !== 'EADDRINUSE') {
      logger(`Internal server error: ${err.message}`.yellow);
    }
  });

  return server;
}
