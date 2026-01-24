import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import adminRoutes from "./config/admin.js";

// env config
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// modules
app.use("/api/admin", adminRoutes);
app.use('/citizen', express.static(path.join(__dirname, 'citizen')));
app.use('/pdrrmo', express.static(path.join(__dirname, 'pdrrmo')));
app.use('/config', express.static(path.join(__dirname, 'config')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'citizen', 'index.html'));
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Pulse360 server is running' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!', 
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Pulse360 server is running on http://localhost:${PORT}`);
    console.log(`Citizen module: http://localhost:${PORT}/citizen`);
    console.log(`PDRRMO module: http://localhost:${PORT}/pdrrmo`);
});
