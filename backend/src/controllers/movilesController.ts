import { Request, Response } from 'express'
import prisma from '../db/prisma'


export const getAll = async (_req: Request, res: Response) => {
  try {
    const moviles = await prisma.movil.findMany({
      orderBy: { createdAt: 'desc' },
    })
    res.json(moviles)
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener móviles' })
  }
}

export const getActivos = async (_req: Request, res: Response) => {
  try {
    const moviles = await prisma.movil.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    })
    res.json(moviles)
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener móviles' })
  }
}

export const getHistorial = async (req: Request, res: Response) => {
  try {
    const entregas = await prisma.entrega.findMany({
      where: { movilId: Number(req.params.id) },
      include: {
        pedido: {
          include: {
            cliente: true,
            variante: { include: { producto: true } },
          },
        },
      },
      orderBy: { fechaSalida: 'desc' },
    })
    res.json(entregas)
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener historial' })
  }
}

export const create = async (req: Request, res: Response) => {
  try {
    const { nombre, placa } = req.body
    if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' })
    const nuevo = await prisma.movil.create({ data: { nombre, placa } })
    res.status(201).json(nuevo)
  } catch (e) {
    res.status(500).json({ error: 'Error al crear móvil' })
  }
}

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const { nombre, placa, activo } = req.body
    const existing = await prisma.movil.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'Móvil no encontrado' })
    const actualizado = await prisma.movil.update({
      where: { id },
      data: { nombre, placa, activo },
    })
    res.json(actualizado)
  } catch (e) {
    res.status(500).json({ error: 'Error al actualizar móvil' })
  }
}

export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const existing = await prisma.movil.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'Móvil no encontrado' })
    await prisma.movil.delete({ where: { id } })
    res.json({ message: 'Móvil eliminado' })
  } catch (e) {
    res.status(500).json({ error: 'Error al eliminar móvil' })
  }
}
