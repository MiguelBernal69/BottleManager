export interface Cliente {
  id: number
  nombre: string
  email?: string
  telefono?: string
  direccion?: string
  createdAt: string
  updatedAt: string
}

export interface Producto {
  id: number
  nombre: string
  descripcion?: string
  createdAt: string
  updatedAt: string
  variantes: VarianteProducto[]
}

export interface VarianteProducto {
  id: number
  productoId: number
  tamanoMl: number
  material: string
  tipo: string
  cantidadPaquete: number
  precioSinFactura: string
  precioConFactura: string
  producto?: Producto
}

export type EstadoPedido = 'pendiente' | 'en_produccion' | 'en_envio'

export interface Personalizacion {
  id?: number
  tipo: string
  valor: string
}

export interface Pedido {
  id: number
  clienteId: number
  varianteId: number
  cantidad: number
  precioUnitario: string
  estado: EstadoPedido
  notas?: string
  createdAt: string
  updatedAt: string
  cliente: Cliente
  variante: VarianteProducto & { producto: Producto }
  personalizaciones: Personalizacion[]
}


export interface DashboardData {
  totalClientes: number
  totalPedidos: number
  pedidosPorEstado: { estado: string; _count: { id: number } }[]
  pedidosRecientes: Pedido[]
  totalHistorial: number
}

export interface HistorialItem {
  id: number
  pedidoId: number
  clienteId?: number
  pedidoData: any
  totalSinFactura: string
  totalConFactura: string
  estadoFinal: string
  entregadoAt: string
  clienteNombre?: string
}

export interface DashboardData {
  totalClientes: number
  totalPedidos: number
  totalHistorial: number
  ingresoTotalSinFactura: number
  ingresoTotalConFactura: number
  pedidosPorEstado: { estado: string; _count: { id: number } }[]
  pedidosRecientes: Pedido[]
  graficoIngresos: { mes: string; sinFactura: number; conFactura: number }[]
  ultimasEntregas: HistorialItem[]
}