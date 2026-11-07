import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import { manejarErrores } from './middlewares/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API funcionando correctamente'
    });
});

app.use('/api/auth', authRoutes);

app.use(manejarErrores);

export default app;