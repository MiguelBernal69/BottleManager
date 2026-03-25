import { Request, Response } from 'express'
import prisma from '../db/prisma'

export const getAll = async (_req: Request, res: Response) => {
  const productos = await prisma.producto.findMany({
    include: { variantes: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json(productos)
}

export const getById = async (req: Request, res: Response) => {
  const producto = await prisma.producto.findUnique({
    where: { id: Number(req.params.id) },
    include: { variantes: true },
  })
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' })
  res.json(producto)
}

export const create = async (req: Request, res: Response) => {
  const { nombre, descripcion } = req.body
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' })
  const nuevo = await prisma.producto.create({ data: { nombre, descripcion } })
  res.status(201).json(nuevo)
}

export const update = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const { nombre, descripcion } = req.body
  const existing = await prisma.producto.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ error: 'Producto no encontrado' })
  const actualizado = await prisma.producto.update({ where: { id }, data: { nombre, descripcion } })
  res.json(actualizado)
}

export const remove = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const existing = await prisma.producto.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ error: 'Producto no encontrado' })
  await prisma.producto.delete({ where: { id } })
  res.json({ message: 'Producto eliminado' })
}