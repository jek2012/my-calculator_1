import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json({ limit: '20mb' }));

const DATA_FILE = path.resolve(__dirname, 'price_base_storage.json');

// API: Get prices and config from server
app.get('/api/prices', (req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(content);
      return res.json({ success: true, data });
    }
    return res.json({ success: true, data: null });
  } catch (err: any) {
    console.error('Error reading price file:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// API: Save prices and config to server
app.post('/api/prices', (req, res) => {
  try {
    const data = req.body;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return res.json({ success: true, message: 'Прайс-лист успешно зафиксирован на сервере' });
  } catch (err: any) {
    console.error('Error saving price file:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server started on http://0.0.0.0:${port}`);
  });
}

startServer();
