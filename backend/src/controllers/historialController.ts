import { Request, Response } from 'express'
import prisma from '../db/prisma'

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1
    const limit = 15
    const skip = (page - 1) * limit

    const search = (req.query.search as string) ?? ''
    const desde = req.query.desde as string
    const hasta = req.query.hasta as string

    const whereDate = {
      entregadoAt: {
        ...(desde ? { gte: new Date(desde) } : {}),
        ...(hasta ? { lte: new Date(hasta + 'T23:59:59') } : {}),
      },
    }

    const [historial, total] = await Promise.all([
      prisma.historialPedido.findMany({
        where: whereDate,
        orderBy: { entregadoAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.historialPedido.count({ where: whereDate }),
    ])

    // Filtrar por búsqueda en memoria (viene del pedidoData JSON)
    const filtrado = search
      ? historial.filter(h => {
          const data = h.pedidoData as any
          const empresa = (data?.cliente?.empresa ?? '').toLowerCase()
          const contacto = (data?.cliente?.nombreCliente ?? '').toLowerCase()
          return empresa.includes(search.toLowerCase()) ||
                 contacto.includes(search.toLowerCase())
        })
      : historial

    res.json({
      data: filtrado,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    })
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener historial' })
  }
}

export const entregar = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: {
        cliente: true,
        variante: { include: { producto: true } },
        personalizaciones: true,
        entrega: { include: { movil: true } },
      },
    })
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' })

    const totalSinFactura = Number(pedido.variante.precioSinFactura) * pedido.cantidad
    const totalConFactura = Number(pedido.variante.precioConFactura) * pedido.cantidad

    await prisma.$transaction([
      prisma.historialPedido.create({
        data: {
          pedidoId: pedido.id,
          clienteId: pedido.clienteId,
          pedidoData: JSON.parse(JSON.stringify(pedido)),
          totalSinFactura,
          totalConFactura,
          estadoFinal: 'entregado',
        },
      }),
      prisma.pedido.delete({ where: { id } }),
    ])

    res.json({ message: 'Pedido entregado y guardado en historial' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error al entregar pedido' })
  }
}