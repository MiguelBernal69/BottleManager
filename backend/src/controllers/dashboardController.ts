import { Request, Response } from 'express'
import prisma from '../db/prisma'

export const getSummary = async (_req: Request, res: Response) => {
  try {
    const [
      totalClientes,
      totalPedidos,
      pedidosPorEstado,
      pedidosRecientes,
      totalHistorial,
      historialCompleto,
    ] = await Promise.all([
      prisma.cliente.count(),
      prisma.pedido.count(),
      prisma.pedido.groupBy({ by: ['estado'], _count: { id: true } }),
      prisma.pedido.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          cliente: true,
          variante: { include: { producto: true } },
          personalizaciones: true,
        },
      }),
      prisma.historialPedido.count(),
      prisma.historialPedido.findMany({
        orderBy: { entregadoAt: 'desc' },
      }),
    ])

    const ingresoTotalSinFactura = historialCompleto.reduce(
      (acc, h) => acc + Number(h.totalSinFactura), 0
    )
    const ingresoTotalConFactura = historialCompleto.reduce(
      (acc, h) => acc + Number(h.totalConFactura), 0
    )

    const ingresosPorMes: Record<string, { sinFactura: number; conFactura: number }> = {}
    historialCompleto.forEach(h => {
      const fecha = new Date(h.entregadoAt)
      const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
      if (!ingresosPorMes[key]) ingresosPorMes[key] = { sinFactura: 0, conFactura: 0 }
      ingresosPorMes[key].sinFactura += Number(h.totalSinFactura)
      ingresosPorMes[key].conFactura += Number(h.totalConFactura)
    })

    const graficoIngresos = Object.entries(ingresosPorMes)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([mes, valores]) => ({
        mes,
        sinFactura: Number(valores.sinFactura.toFixed(2)),
        conFactura: Number(valores.conFactura.toFixed(2)),
      }))

    // Últimas 5 entregas con datos del cliente desde pedidoData
    const ultimasEntregas = historialCompleto.slice(0, 5).map(h => ({
      ...h,
      clienteNombre: (h.pedidoData as any)?.cliente?.nombre ?? '—',
    }))

    res.json({
      totalClientes,
      totalPedidos,
      pedidosPorEstado,
      pedidosRecientes,
      totalHistorial,
      ingresoTotalSinFactura: Number(ingresoTotalSinFactura.toFixed(2)),
      ingresoTotalConFactura: Number(ingresoTotalConFactura.toFixed(2)),
      graficoIngresos,
      ultimasEntregas,
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error al obtener dashboard' })
  }
}