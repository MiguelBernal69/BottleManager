export type DepartamentoE = 'cochabamba' | 'la_paz' | 'santa_cruz' | 'oruro' | 'potosi' | 'tarija' | 'beni' | 'pando' | 'sucre'

export type MetodoPago = 'qr' | 'al_contado' | 'credito'

export interface Cliente {
  id: number
  empresa: string
  nombreCliente?: string
  telefono?: string
  direccion?: string
  departamento?: DepartamentoE
  createdAt: string
  updatedAt: string
}

export interface Movil {
  id: number
  nombre: string
  placa?: string
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface Entrega {
  id: number
  pedidoId: number
  movilId: number
  fechaSalida: string
  fechaEntrega?: string
  movil: Movil
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
  totalPagar: number
  codigoProduccion?: string
  codigoImprenta?: string
  metodoPago?: MetodoPago
  createdAt: string
  updatedAt: string
  cliente: Cliente
  variante: VarianteProducto & { producto: Producto }
  personalizaciones: Personalizacion[]
  entrega?: Entrega
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
  totalPagar?: string
  totalSinFactura?: string
  totalConFactura?: string
  estadoFinal: string
  entregadoAt: string
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