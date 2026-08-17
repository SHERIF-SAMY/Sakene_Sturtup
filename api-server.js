import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

app.all('/api/:endpoint', async (req, res) => {
  const endpoint = req.params.endpoint;
  if (endpoint.startsWith('_')) {
    return res.status(404).json({ error: `API route /api/${endpoint} not found` });
  }
  const filePath = path.join(__dirname, 'api', `${endpoint}.js`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: `API route /api/${endpoint} not found` });
  }
  try {
    const mtime = fs.statSync(filePath).mtimeMs;
    const m = await import(`file://${filePath}?t=${mtime}`);
    const handler = m.default;
    await handler(req, res);
  } catch (err) {
    console.error(`Error in /api/${endpoint}:`, err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`API Server running on http://localhost:${PORT}`));
