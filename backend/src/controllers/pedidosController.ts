import { Request, Response } from 'express'
import { EstadoPedido } from '@prisma/client'
import prisma from '../db/prisma'

const include = {
  cliente: true,
  variante: { include: { producto: true } },
  personalizaciones: true,
  entrega: {
    include: {
      movil: true,
    },
  },
} 

export const getAll = async (_req: Request, res: Response) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      where: { estado: { in: [EstadoPedido.pendiente, EstadoPedido.en_produccion, EstadoPedido.en_envio] } },
      include,
      orderBy: { createdAt: 'desc' },
    })
    res.json(pedidos)
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener pedidos' })
  }
}

export const getById = async (req: Request, res: Response) => {
  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: Number(req.params.id) },
      include,
    })
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' })
    res.json(pedido)
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener pedido' })
  }
}

export const create = async (req: Request, res: Response) => {
  try {
    const {
      clienteId, varianteId, cantidad, precioUnitario,
      notas, totalPagar,personalizaciones, codigoProduccion, codigoImprenta, metodoPago,
    } = req.body

    if (!clienteId || !varianteId || !cantidad || !precioUnitario)
      return res.status(400).json({ error: 'Faltan campos requeridos' })

    const pedido = await prisma.pedido.create({
      data: {
        clienteId: Number(clienteId),
        varianteId: Number(varianteId),
        cantidad: Number(cantidad),
        precioUnitario,
        notas,
        codigoProduccion,
        codigoImprenta,
        metodoPago: metodoPago ?? 'al_contado',
        totalPagar: Number(totalPagar),
        personalizaciones: personalizaciones?.length
          ? { create: personalizaciones.map((p: any) => ({ tipo: p.tipo, valor: p.valor })) }
          : undefined,
      },
      include,
    })
    res.status(201).json(pedido)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error al crear pedido' })
  }
}

export const updateEstado = async (req: Request, res: Response) => {
  try {
    const { estado, movilId } = req.body
    const estadosValidos = ['pendiente', 'en_produccion', 'en_envio']
    if (!estadosValidos.includes(estado))
      return res.status(400).json({ error: `Estado inválido` })

    const id = Number(req.params.id)
    const existing = await prisma.pedido.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'Pedido no encontrado' })

    // Si pasa a en_envio, asignar móvil
    if (estado === 'en_envio') {
      if (!movilId) return res.status(400).json({ error: 'Se requiere movilId para en_envio' })
      await prisma.pedido.update({ where: { id }, data: { estado } })
      const entregaExistente = await prisma.entrega.findUnique({ where: { pedidoId: id } })
      if (!entregaExistente) {
        await prisma.entrega.create({ data: { pedidoId: id, movilId: Number(movilId) } })
      } else {
        await prisma.entrega.update({ where: { pedidoId: id }, data: { movilId: Number(movilId) } })
      }
    } else {
      await prisma.pedido.update({ where: { id }, data: { estado } })
    }

    const actualizado = await prisma.pedido.findUnique({ where: { id }, include })
    res.json(actualizado)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error al actualizar estado' })
  }
}

export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const existing = await prisma.pedido.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'Pedido no encontrado' })
    await prisma.pedido.delete({ where: { id } })
    res.json({ message: 'Pedido eliminado' })
  } catch (e) {
    res.status(500).json({ error: 'Error al eliminar pedido' })
  }
}

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const {
      clienteId, varianteId, cantidad, precioUnitario,
      notas, codigoProduccion, codigoImprenta, metodoPago, totalPagar
    } = req.body

    const existing = await prisma.pedido.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'Pedido no encontrado' })

    const actualizado = await prisma.pedido.update({
      where: { id },
      data: {
        clienteId: clienteId ? Number(clienteId) : undefined,
        varianteId: varianteId ? Number(varianteId) : undefined,
        cantidad: cantidad ? Number(cantidad) : undefined,
        precioUnitario: precioUnitario ?? undefined,
        notas: notas ?? undefined,
        codigoProduccion: codigoProduccion ?? undefined,
        codigoImprenta: codigoImprenta ?? undefined,
        metodoPago: metodoPago ?? undefined,
        totalPagar: totalPagar ? Number(totalPagar) : undefined,
      },
      include,
    })
    res.json(actualizado)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error al actualizar pedido' })
  }
}

export const updatePago = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const { metodoPago } = req.body
    const validos = ['qr', 'al_contado', 'credito']
    if (!validos.includes(metodoPago))
      return res.status(400).json({ error: 'Método de pago inválido' })
    const existing = await prisma.pedido.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'Pedido no encontrado' })
    const actualizado = await prisma.pedido.update({
      where: { id },
      data: { metodoPago },
      include,
    })
    res.json(actualizado)
  } catch (e) {
    res.status(500).json({ error: 'Error al actualizar método de pago' })
  }
}