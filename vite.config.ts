import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';

// Load env variables
dotenv.config({ path: '.env.local' });
dotenv.config();

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'netlify-functions-dev',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && req.url.startsWith('/.netlify/functions/')) {
              try {
                const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
                
                // Extract the handler name (e.g. chat, leads, projects)
                const functionName = url.pathname.replace('/.netlify/functions/', '').split('/')[0].split('?')[0];

                // Read request body in chunks
                let body = '';
                await new Promise<void>((resolve) => {
                  req.on('data', chunk => {
                    body += chunk;
                  });
                  req.on('end', resolve);
                });

                // Dynamically import/load the Netlify TS Handler file
                const functionPath = path.resolve(__dirname, `netlify/functions/${functionName}.ts`);
                const { handler } = await server.ssrLoadModule(functionPath);

                // Reconstruct query parameters
                const queryParams: Record<string, string> = {};
                url.searchParams.forEach((val, key) => {
                  queryParams[key] = val;
                });

                const event = {
                  httpMethod: req.method || 'GET',
                  path: url.pathname,
                  queryStringParameters: queryParams,
                  headers: req.headers as Record<string, string>,
                  body,
                };

                const result = await handler(event, {});

                res.statusCode = result.statusCode || 200;
                if (result.headers) {
                  Object.entries(result.headers).forEach(([k, v]) => {
                    res.setHeader(k, v as string);
                  });
                }
                res.end(result.body || '');
              } catch (err: any) {
                console.error('Local Netlify Function Error:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message || String(err) }));
              }
              return;
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: {
      'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL || ''),
      'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''),
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
