import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

const apiPath = path.join(__dirname, 'api');
const files = fs.readdirSync(apiPath).filter(f => f.endsWith('.js'));

// Mock some basic next.js/vercel req/res properties if needed
app.use((req, res, next) => {
  // Ensure query is parsed (express does this by default)
  next();
});

for (const file of files) {
  const route = '/api/' + file.replace('.js', '');
  import(`file://${path.join(apiPath, file)}`).then(m => {
    const handler = m.default;
    app.all(route, async (req, res) => {
      try {
        await handler(req, res);
      } catch (err) {
        console.error(`Error in ${route}:`, err);
        if (!res.headersSent) {
          res.status(500).json({ error: err.message });
        }
      }
    });
    console.log(`Mounted ${route}`);
  });
}

const PORT = 3001;
app.listen(PORT, () => console.log(`API Server running on http://localhost:${PORT}`));
