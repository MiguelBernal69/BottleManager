import { Request, Response } from 'express';
import prisma from '../db/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const botellas = await prisma.botella.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(botellas);
};

export const getById = async (req: Request, res: Response) => {
  const botella = await prisma.botella.findUnique({ where: { id: Number(req.params.id) } });
  if (!botella) return res.status(404).json({ error: 'Botella no encontrada' });
  res.json(botella);
};

export const create = async (req: Request, res: Response) => {
  const { nombre, tamano, color, forma, material, precioBase, descripcion } = req.body;
  if (!nombre || !tamano || !color || !forma || !precioBase)
    return res.status(400).json({ error: 'Faltan campos requeridos: nombre, tamano, color, forma, precioBase' });
  const nueva = await prisma.botella.create({
    data: { nombre, tamano, color, forma, material, precioBase: Number(precioBase), descripcion },
  });
  res.status(201).json(nueva);
};

export const update = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { nombre, tamano, color, forma, material, precioBase, descripcion } = req.body;
  const existing = await prisma.botella.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Botella no encontrada' });
  const actualizada = await prisma.botella.update({
    where: { id },
    data: { nombre, tamano, color, forma, material, precioBase: Number(precioBase), descripcion },
  });
  res.json(actualizada);
};

export const remove = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const existing = await prisma.botella.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Botella no encontrada' });
  await prisma.botella.delete({ where: { id } });
  res.json({ message: 'Botella eliminada correctamente' });
};