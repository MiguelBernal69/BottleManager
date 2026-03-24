import { Request, Response } from 'express';
import prisma from '../db/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const botellas = await prisma.producto.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(botellas);
};

export const getById = async (req: Request, res: Response) => {
  const botella = await prisma.producto.findUnique({ where: { id: Number(req.params.id) } });
  if (!botella) return res.status(404).json({ error: 'producto botella no encontrada' });
  res.json(botella);
};

export const create = async (req: Request, res: Response) => {
  const { nombre, tamano, color, forma, material, precioBase, descripcion } = req.body;
  if (!nombre || !descripcion)
    return res.status(400).json({ error: 'Faltan campos requeridos: nombre, descripcion' });
  const nueva = await prisma.producto.create({
    data: { nombre, descripcion },
  });
  res.status(201).json(nueva);
};

export const update = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { nombre, tamano, color, forma, material, precioBase, descripcion } = req.body;
  const existing = await prisma.producto.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'produto botella no encontrada' });
  const actualizada = await prisma.producto.update({
    where: { id },
    data: { nombre, descripcion },
  });
  res.json(actualizada);
};

export const remove = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const existing = await prisma.producto.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'producto botella no encontrada para eliminar' });
  await prisma.producto.delete({ where: { id } });
  res.json({ message: 'producto botella eliminada correctamente' });
};