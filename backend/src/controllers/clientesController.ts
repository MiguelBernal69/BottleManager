import { Request, Response } from 'express';
import prisma from '../db/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const clientes = await prisma.cliente.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(clientes);
};

export const getById = async (req: Request, res: Response) => {
  const cliente = await prisma.cliente.findUnique({ where: { id: Number(req.params.id) } });
  if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json(cliente);
};

export const create = async (req: Request, res: Response) => {
  const { nombre, email, telefono, direccion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });
  const nuevo = await prisma.cliente.create({ data: { nombre, email, telefono, direccion } });
  res.status(201).json(nuevo);
};

export const update = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { nombre, email, telefono, direccion } = req.body;
  const existing = await prisma.cliente.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Cliente no encontrado' });
  const actualizado = await prisma.cliente.update({
    where: { id },
    data: { nombre, email, telefono, direccion },
  });
  res.json(actualizado);
};

export const remove = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const existing = await prisma.cliente.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Cliente no encontrado' });
  await prisma.cliente.delete({ where: { id } });
  res.json({ message: 'Cliente eliminado correctamente' });
};