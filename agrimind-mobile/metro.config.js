const { getDefaultConfig } = require('expo/metro-config');
const http = require('http');

const config = getDefaultConfig(__dirname);

// Backend target for Expo Web development proxy
const BACKEND_TARGET = {
  host: 'localhost',
  port: 3000,
};

const PROXY_PREFIX = '/agrimind-api';

config.server = config.server || {};
const originalEnhanceMiddleware = config.server.enhanceMiddleware;

config.server.enhanceMiddleware = (metroMiddleware, server) => {
  const enhanced = originalEnhanceMiddleware
    ? originalEnhanceMiddleware(metroMiddleware, server)
    : metroMiddleware;

  return (req, res, next) => {
    // ONLY intercept requests that strictly start with PROXY_PREFIX.
    // NEVER intercept Metro bundles (index.bundle), assets, HMR, or internal routes.
    if (req.url && req.url.startsWith(PROXY_PREFIX)) {
      const targetPath = req.url.slice(PROXY_PREFIX.length) || '/';

      const headers = { ...req.headers };
      headers.host = `${BACKEND_TARGET.host}:${BACKEND_TARGET.port}`;

      const options = {
        hostname: BACKEND_TARGET.host,
        port: BACKEND_TARGET.port,
        path: targetPath,
        method: req.method,
        headers: headers,
      };

      const proxyReq = http.request(options, (proxyRes) => {
        res.statusCode = proxyRes.statusCode;

        // Forward response headers and rewrite Location redirects if needed
        Object.keys(proxyRes.headers).forEach((key) => {
          let value = proxyRes.headers[key];
          if (key.toLowerCase() === 'location' && typeof value === 'string') {
            if (value.startsWith(`http://${BACKEND_TARGET.host}:${BACKEND_TARGET.port}`)) {
              value = value.replace(
                `http://${BACKEND_TARGET.host}:${BACKEND_TARGET.port}`,
                PROXY_PREFIX
              );
            } else if (value.startsWith('/')) {
              value = `${PROXY_PREFIX}${value}`;
            }
          }
          res.setHeader(key, value);
        });

        proxyRes.pipe(res);
      });

      proxyReq.on('error', (err) => {
        console.error(`[AgriMind Proxy] Error forwarding ${req.method} ${targetPath}:`, err.message);
        if (!res.headersSent) {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              error: 'Bad Gateway: AgriMind backend at localhost:3000 is unreachable.',
              details: err.message,
            })
          );
        }
      });

      req.pipe(proxyReq);
      return;
    }

    return enhanced(req, res, next);
  };
};

module.exports = config;

