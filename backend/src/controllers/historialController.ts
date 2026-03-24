import { Request, Response } from 'express'
import prisma from '../db/prisma'

const include = { cliente: true, botella: true }

export const getAll = async (_req: Request, res: Response) => {
    console.log(prisma);
  const historial = await prisma.historial.findMany({
    include,
    orderBy: { entregadoAt: 'desc' },
  })
  res.json(historial)
}

export const entregar = async (req: Request, res: Response) => {
  const id = Number(req.params.id)

  const venta = await prisma.venta.findUnique({ where: { id }, include })
  if (!venta) return res.status(404).json({ error: 'Venta no encontrada' })

  await prisma.$transaction([
    prisma.historial.create({
      data: {
        clienteId: venta.clienteId,
        botellaId: venta.botellaId,
        cantidad: venta.cantidad,
        precioTotal: venta.precioTotal,
        notas: venta.notas,
      },
    }),
    prisma.venta.delete({ where: { id } }),
  ])

  res.json({ message: 'Venta entregada y movida al historial' })
}