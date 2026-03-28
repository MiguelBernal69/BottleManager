import { Request, Response } from 'express'
import prisma from '../db/prisma'

export const getSummary = async (req: Request, res: Response) => {
  try {
    const { desde, hasta } = req.query

    // Rango de fechas para historial
    const fechaDesde = desde ? new Date(desde as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const fechaHasta = hasta ? new Date((hasta as string) + 'T23:59:59') : new Date()
    const [
      totalClientes,
      totalPedidos,
      pedidosPorEstado,
      pedidosRecientes,
      totalHistorial,
      historialFiltrado,
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
          entrega: { include: { movil: true } },
        },
      }),
      prisma.historialPedido.count(),
      prisma.historialPedido.findMany({
        where: {
          entregadoAt: { gte: fechaDesde, lte: fechaHasta },
        },
        orderBy: { entregadoAt: 'desc' },
      }),
      prisma.historialPedido.findMany({
        orderBy: { entregadoAt: 'desc' },
      }),
    ])

  
    // Ingresos del rango filtrado
    const ingresoFiltrado = historialFiltrado.reduce((acc, h) => {
      const data = h.pedidoData as { totalPagar?: string }
      const total = parseFloat(data.totalPagar || "0")
      return acc + total
    }, 0
    )


    const ingresoTotal = historialCompleto.reduce((acc, h) => {
      const data = h.pedidoData as { totalPagar?: string }
      const total = parseFloat(data.totalPagar || "0")
      return acc + total
    }, 0)

    // Ingresos por mes (últimos 6 meses del historial completo)
    const ingresosPorMes: Record<string, number> = {}
    historialCompleto.forEach(h => {
      const fecha = new Date(h.entregadoAt)
      const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
      if (!ingresosPorMes[key]) ingresosPorMes[key] = 0
      ingresosPorMes[key] += Number(h.pedidoData ?? 0)
    })

    const graficoIngresos = Object.entries(ingresosPorMes)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([mes, total]) => ({
        mes,
        total: Number(total.toFixed(2)),
      }))

    // Últimas 5 entregas
    const ultimasEntregas = historialCompleto.slice(0, 5).map(h => ({
      ...h,
      empresa: (h.pedidoData as any)?.cliente?.empresa ?? '—',
      productoNombre: (h.pedidoData as any)?.variante?.producto?.nombre ?? '—',
      varianteTamano: (h.pedidoData as any)?.variante?.tamanoMl ?? '—',
    }))

    res.json({
      totalClientes,
      totalPedidos,
      totalHistorial,
      ingresoFiltrado: Number(ingresoFiltrado.toFixed(2)),
      ingresoTotal: Number(ingresoTotal.toFixed(2)),
      pedidosPorEstado,
      pedidosRecientes,
      graficoIngresos,
      ultimasEntregas,
      rangoFiltro: {
        desde: fechaDesde.toISOString(),
        hasta: fechaHasta.toISOString(),
      },
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error al obtener dashboard' })
  }
}