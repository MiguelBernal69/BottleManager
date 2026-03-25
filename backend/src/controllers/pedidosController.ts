import { Request, Response } from 'express'
import { EstadoPedido } from '@prisma/client'
import prisma from '../db/prisma'

const include = {
  cliente: true,
  variante: { include: { producto: true } },
  personalizaciones: true,
}

export const getAll = async (_req: Request, res: Response) => {
  try {
    const pedidos = await prisma.pedido.findMany({
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
    const { clienteId, varianteId, cantidad, precioUnitario, notas, totalPagar, codigoProduccion, codigoImprenta, personalizaciones } = req.body
    if (!clienteId || !varianteId || !cantidad || !precioUnitario)
      return res.status(400).json({ error: 'Faltan campos requeridos' })

    const pedido = await prisma.pedido.create({
      data: {
        clienteId: Number(clienteId),
        varianteId: Number(varianteId),
        cantidad: Number(cantidad),
        precioUnitario,
        notas,
        totalPagar: Number(totalPagar), // Aquí deberías calcular el total real
        codigoProduccion,
        codigoImprenta,
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
    const { estado } = req.body
    const estadosValidos = Object.values(EstadoPedido)
    if (!estadosValidos.includes(estado))
      return res.status(400).json({ error: `Estado inválido. Válidos: ${estadosValidos.join(', ')}` })
    const id = Number(req.params.id)
    const existing = await prisma.pedido.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'Pedido no encontrado' })
    const actualizado = await prisma.pedido.update({ where: { id }, data: { estado }, include })
    res.json(actualizado)
  } catch (e) {
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