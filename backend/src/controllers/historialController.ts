import { Request, Response } from 'express'
import prisma from '../db/prisma'

export const getAll = async (_req: Request, res: Response) => {
  try {
    const historial = await prisma.historialPedido.findMany({
      orderBy: { entregadoAt: 'desc' },
    })
    res.json(historial)
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