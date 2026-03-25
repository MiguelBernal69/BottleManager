import { Request, Response } from 'express'
import prisma from '../db/prisma'

export const getByProducto = async (req: Request, res: Response) => {
  const variantes = await prisma.varianteProducto.findMany({
    where: { productoId: Number(req.params.productoId) },
  })
  res.json(variantes)
}

export const create = async (req: Request, res: Response) => {
  const { productoId, tamanoMl, material, tipo, cantidadPaquete, precioSinFactura, precioConFactura } = req.body
  if (!productoId || !tamanoMl || !material || !tipo || !cantidadPaquete || !precioSinFactura || !precioConFactura)
    return res.status(400).json({ error: 'Faltan campos requeridos' })
  const nueva = await prisma.varianteProducto.create({
    data: {
      productoId: Number(productoId),
      tamanoMl: Number(tamanoMl),
      material,
      tipo,
      cantidadPaquete: Number(cantidadPaquete),
      precioSinFactura,
      precioConFactura,
    },
  })
  res.status(201).json(nueva)
}

export const update = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const { tamanoMl, material, tipo, cantidadPaquete, precioSinFactura, precioConFactura } = req.body
  const existing = await prisma.varianteProducto.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ error: 'Variante no encontrada' })
  const actualizada = await prisma.varianteProducto.update({
    where: { id },
    data: { tamanoMl: Number(tamanoMl), material, tipo, cantidadPaquete: Number(cantidadPaquete), precioSinFactura, precioConFactura },
  })
  res.json(actualizada)
}

export const remove = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const existing = await prisma.varianteProducto.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ error: 'Variante no encontrada' })
  await prisma.varianteProducto.delete({ where: { id } })
  res.json({ message: 'Variante eliminada' })
}