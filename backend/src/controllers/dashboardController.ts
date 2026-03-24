import { Request, Response } from 'express';
import prisma from '../db/prisma';

export const getSummary = async (_req: Request, res: Response) => {
  const [totalClientes, totalVentas, ingresoTotal, porEstado, ventasRecientes] = await Promise.all([
    prisma.cliente.count(),
    prisma.venta.count(),
    prisma.venta.aggregate({ _sum: { precioTotal: true } }),
    prisma.venta.groupBy({
      by: ['estado'],
      _count: { id: true },
      _sum: { precioTotal: true },
    }),
    prisma.venta.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { cliente: true, botella: true },
    }),
  ]);

  res.json({
    totalClientes,
    totalVentas,
    ingresoTotal: ingresoTotal._sum.precioTotal ?? 0,
    porEstado,
    ventasRecientes,
  });
};