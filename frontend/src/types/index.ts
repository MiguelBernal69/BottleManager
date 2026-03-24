export interface Cliente {
  id: number
  nombre: string
  email?: string
  telefono?: string
  direccion?: string
  createdAt: string
  updatedAt: string
}

export interface Botella {
  id: number
  nombre: string
  tamano: string
  color: string
  forma: string
  material?: string
  precioBase: number
  descripcion?: string
  createdAt: string
  updatedAt: string
}

export type EstadoVenta = 'registrado' | 'en_produccion' | 'en_envio'

export interface Venta {
  id: number
  clienteId: number
  botellaId: number
  cantidad: number
  precioTotal: number
  estado: EstadoVenta
  notas?: string
  createdAt: string
  updatedAt: string
  cliente: Cliente
  botella: Botella
}

export interface DashboardData {
  totalClientes: number
  totalVentas: number
  ingresoTotal: number
  porEstado: { estado: EstadoVenta; _count: { id: number }; _sum: { precioTotal: number } }[]
  ventasRecientes: Venta[]
}

export interface HistorialItem {
  id: number
  clienteId: number
  botellaId: number
  cantidad: number
  precioTotal: number
  notas?: string
  entregadoAt: string
  cliente: Cliente
  botella: Botella
}