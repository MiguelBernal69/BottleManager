import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import clientesRouter from './routes/clientes'
import productosRouter from './routes/productos'
import variantesRouter from './routes/variantes'
import pedidosRouter from './routes/pedidos'
import historialRouter from './routes/historial'
import dashboardRouter from './routes/dashboard'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Serializar BigInt a string automáticamente
app.use((_req, res, next) => {
  const originalJson = res.json.bind(res)
  res.json = (data: any) => {
    return originalJson(JSON.parse(JSON.stringify(data, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    )))
  }
  next()
})

app.use('/api/clientes', clientesRouter)
app.use('/api/productos', productosRouter)
app.use('/api/variantes', variantesRouter)
app.use('/api/pedidos', pedidosRouter)
app.use('/api/historial', historialRouter)
app.use('/api/dashboard', dashboardRouter)

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', message: 'API corriendo 🚀' })
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`)
})