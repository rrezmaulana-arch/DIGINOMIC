import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { pageMetadata } from './src/pageMetadata';

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: Number(process.env.PORT || 5173),
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4001',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://127.0.0.1:4001',
        changeOrigin: true,
      },
      '/docs': {
        target: 'http://127.0.0.1:4001',
        changeOrigin: true,
      },
      '/openapi.json': {
        target: 'http://127.0.0.1:4001',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'public-page-metadata',
      enforce: 'post',
      generateBundle(_, bundle) {
        const entry = bundle['index.html'];
        if (entry?.type !== 'asset') this.error('HTML beranda tidak ditemukan.');
        const template = String(entry.source);
        const siteUrl = (process.env.VITE_SITE_URL || 'https://diginomic.vercel.app').replace(/\/$/, '');
        for (const [route, [name, description]] of Object.entries(pageMetadata)) {
          if (route === '/') continue;
          const title = name + ' | Digiconomic Fest 2027';
          const pageUrl = `${siteUrl}${route}`;
          const source = template.replace(/<title>.*?<\/title>/, '<title>' + title + '</title>')
            .replace(/(<meta name="description" content=")[^"]*/, '$1' + description)
            .replace(/(<link rel="canonical" href=")[^"]*/, '$1' + pageUrl)
            .replace(/(<meta property="og:url" content=")[^"]*/, '$1' + pageUrl)
            .replace(/(<meta property="og:description" content=")[^"]*/, '$1' + description)
            .replace(/(<meta property="og:title" content=")[^"]*/, '$1' + title)
            .replace(/(<meta name="twitter:description" content=")[^"]*/, '$1' + description)
            .replace(/(<meta name="twitter:title" content=")[^"]*/, '$1' + title);
          this.emitFile({ type: 'asset', fileName: route.slice(1) + '/index.html', source });
        }
      },
    },
  ],
});
