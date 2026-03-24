import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import clientesRouter from './routes/clientes';
import botellasRouter from './routes/botellas';
import ventasRouter from './routes/ventas';
import dashboardRouter from './routes/dashboard';
import historialRouter from './routes/historial'
import "dotenv/config";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/clientes', clientesRouter);
app.use('/api/botellas', botellasRouter);
app.use('/api/ventas', ventasRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/historial', historialRouter)

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', message: 'BottleManager API corriendo 🚀' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});