import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

// Serve React App from dist folder (created by npm run build)
app.use(express.static(path.join(__dirname, 'dist')));

// Keep-Alive Endpoint for monitoring
app.get('/ping', (req, res) => res.status(200).send('alive'));

// Handle React Routing (SPA fallback)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});