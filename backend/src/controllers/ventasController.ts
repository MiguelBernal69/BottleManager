import { Request, Response } from 'express';
import { EstadoPedido } from '@prisma/client';
import prisma from '../db/prisma';

const include = { cliente: true, botella: true };
const ESTADOS_VALIDOS = Object.values(EstadoPedido);

export const getAll = async (_req: Request, res: Response) => {
  const ventas = await prisma.venta.findMany({ include, orderBy: { createdAt: 'desc' } });
  res.json(ventas);
};

export const getById = async (req: Request, res: Response) => {
  const venta = await prisma.venta.findUnique({ where: { id: Number(req.params.id) }, include });
  if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
  res.json(venta);
};

export const create = async (req: Request, res: Response) => {
  const { clienteId, botellaId, cantidad, precioTotal, notas } = req.body;
  if (!clienteId || !botellaId || !cantidad || !precioTotal)
    return res.status(400).json({ error: 'Faltan campos requeridos: clienteId, botellaId, cantidad, precioTotal' });
  const nueva = await prisma.venta.create({
    data: {
      clienteId: Number(clienteId),
      botellaId: Number(botellaId),
      cantidad: Number(cantidad),
      precioTotal: Number(precioTotal),
      notas,
    },
    include,
  });
  res.status(201).json(nueva);
};

export const updateEstado = async (req: Request, res: Response) => {
  const { estado } = req.body;
  if (!ESTADOS_VALIDOS.includes(estado))
    return res.status(400).json({ error: `Estado inválido. Valores posibles: ${ESTADOS_VALIDOS.join(', ')}` });
  const id = Number(req.params.id);
  const existing = await prisma.venta.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Venta no encontrada' });
  const actualizada = await prisma.venta.update({ where: { id }, data: { estado }, include });
  res.json(actualizada);
};

export const remove = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const existing = await prisma.venta.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Venta no encontrada' });
  await prisma.venta.delete({ where: { id } });
  res.json({ message: 'Venta eliminada correctamente' });
};