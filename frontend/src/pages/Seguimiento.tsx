import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import api from '../api/axios'
import type { Pedido, EstadoPedido, Movil } from '../types'

const ESTADO_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  en_produccion: 'En producción',
  en_envio: 'En envío',
}
const ESTADO_COLORS: Record<string, string> = {
  pendiente: 'bg-gray-100 text-gray-700',
  en_produccion: 'bg-yellow-100 text-yellow-700',
  en_envio: 'bg-blue-100 text-blue-700',
}
const METODO_PAGO_LABELS: Record<string, string> = {
  qr: 'QR', al_contado: 'Al contado', credito: 'Crédito',
}
const ESTADOS: EstadoPedido[] = ['pendiente', 'en_produccion', 'en_envio']

export default function Seguimiento() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [moviles, setMoviles] = useState<Movil[]>([])
  const [filtro, setFiltro] = useState('todos')
  const [pedidoAEntregar, setPedidoAEntregar] = useState<Pedido | null>(null)
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null)
  const [pedidoParaMovil, setPedidoParaMovil] = useState<{ pedido: Pedido; estadoDestino: EstadoPedido } | null>(null)
  const [movilSeleccionado, setMovilSeleccionado] = useState('')

  const load = () => api.get('/pedidos').then(r => setPedidos(r.data))
  useEffect(() => {
    load()
    api.get('/moviles/activos').then(r => setMoviles(r.data))
  }, [])

  const handleEstado = async (pedido: Pedido, estado: EstadoPedido) => {
    if (estado === 'en_envio') {
      setMovilSeleccionado(pedido.entrega?.movilId ? String(pedido.entrega.movilId) : '')
      setPedidoParaMovil({ pedido, estadoDestino: estado })
      return
    }
    await api.patch(`/pedidos/${pedido.id}/estado`, { estado })
    load()
  }

  const confirmarMovil = async () => {
    if (!pedidoParaMovil || !movilSeleccionado) { alert('Selecciona un móvil'); return }
    await api.patch(`/pedidos/${pedidoParaMovil.pedido.id}/estado`, {
      estado: pedidoParaMovil.estadoDestino,
      movilId: Number(movilSeleccionado),
      

    })
    setPedidoParaMovil(null); setMovilSeleccionado(''); load()
    console.log('Enviando pedido con móvilId:', movilSeleccionado)
  }

  const confirmarEntrega = async () => {
    if (!pedidoAEntregar) return
    try {
      await api.post(`/historial/${pedidoAEntregar.id}/entregar`)
      setPedidoAEntregar(null); load()
      console.log('Pedido entregado y movido al historial pero quiero saber que dodne esta el movil')
      console.log('El movil es:', pedidoAEntregar.entrega?.movil)
      console.log('El pedido es:', pedidoAEntregar.id)
    } catch (e: any) {
      alert(e?.response?.data?.error ?? 'Error al entregar pedido')
    }
  }

  const filtered = filtro === 'todos' ? pedidos : pedidos.filter(p => p.estado === filtro)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Seguimiento</h1>
        <span className="text-sm text-gray-500">{filtered.length} pedido(s) activo(s)</span>
      </div>

      <div className="flex gap-3 items-center">
        <span className="text-sm text-gray-600">Filtrar:</span>
        <Select value={filtro} onValueChange={setFiltro}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {ESTADOS.map(e => <SelectItem key={e} value={e}>{ESTADO_LABELS[e]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className='rounded-lg border'>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b bg-gray-50">
                <th className="px-4 py-3">Empresa</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Cantidad</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Método de pago</th>
                <th className="px-4 py-3">Detalle</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.cliente.empresa}</td>
                  <td className="px-4 py-3">{p.variante.producto.nombre} {p.variante.tamanoMl}ml</td>
                  <td className="px-4 py-3">{p.cantidad}</td>
                  <td className="px-4 py-3 font-medium text-green-700">
                    Bs. {(Number(p.precioUnitario) * p.cantidad).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={p.metodoPago ?? 'al_contado'}
                      onValueChange={async val => {
                        await api.patch(`/pedidos/${p.id}/pago`, { metodoPago: val })
                        load()
                      }}
                    >
                      <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="al_contado">Al contado</SelectItem>
                        <SelectItem value="qr">QR</SelectItem>
                        <SelectItem value="credito">Crédito</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <Button 
                      className='bg-slate-100 hover:bg-slate-300 font-bold py-2 px-4 rounded-md'
                      size="sm" variant="outline" onClick={() => setPedidoDetalle(p)}>
                      Ver detalle
                    </Button>
                  </td>
                  <td className="px-4 py-3">
                    <Select value={p.estado} onValueChange={val => handleEstado(p, val as EstadoPedido)}>
                      <SelectTrigger className="h-7 w-36 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ESTADOS.map(e => <SelectItem key={e} value={e}>{ESTADO_LABELS[e]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      disabled={p.estado !== 'en_envio'}
                      className={`font-bold py-2 px-4 rounded-md text-white ${
                        p.estado === 'en_envio'
                          ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                          : 'bg-gray-300 cursor-not-allowed opacity-50'
                      }`}
                      onClick={() => {
                        if (p.estado !== 'en_envio') return
                        setPedidoAEntregar(p)
                      }}
                    >
                      Entregar
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                    No hay pedidos activos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Modal detalle completo */}
      <Dialog open={!!pedidoDetalle} onOpenChange={() => setPedidoDetalle(null)}>
        <DialogContent className="bg-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del pedido #{pedidoDetalle?.id}</DialogTitle>
          </DialogHeader>
          {pedidoDetalle && (
            <div className="space-y-4 mt-2 text-sm">

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Cliente</p>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                  <p><span className="text-gray-500">Empresa:</span> <span className="font-medium">{pedidoDetalle.cliente.empresa}</span></p>
                  {pedidoDetalle.cliente.nombreCliente && <p><span className="text-gray-500">Contacto:</span> {pedidoDetalle.cliente.nombreCliente}</p>}
                  {pedidoDetalle.cliente.telefono && <p><span className="text-gray-500">Teléfono:</span> {pedidoDetalle.cliente.telefono}</p>}
                  {pedidoDetalle.cliente.departamento && <p><span className="text-gray-500">Departamento:</span> {pedidoDetalle.cliente.departamento}</p>}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Producto</p>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                  <p><span className="text-gray-500">Producto:</span> <span className="font-medium">{pedidoDetalle.variante.producto.nombre}</span></p>
                  <p><span className="text-gray-500">Tamaño:</span> {pedidoDetalle.variante.tamanoMl}ml</p>
                  <p><span className="text-gray-500">Material:</span> {pedidoDetalle.variante.material}</p>
                  <p><span className="text-gray-500">Tipo:</span> {pedidoDetalle.variante.tipo}</p>
                  <p><span className="text-gray-500">Cant. por paquete:</span> {pedidoDetalle.variante.cantidadPaquete}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Pedido</p>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                  <p><span className="text-gray-500">Cantidad:</span> <span className="font-medium">{pedidoDetalle.cantidad} paquetes</span></p>
                  <p><span className="text-gray-500">Total unidades:</span> <span className="font-medium">{pedidoDetalle.cantidad * pedidoDetalle.variante.cantidadPaquete}</span></p>
                  <p><span className="text-gray-500">Precio unitario:</span> Bs. {Number(pedidoDetalle.precioUnitario).toFixed(2)}</p>
                  <p><span className="text-gray-500">Total:</span> <span className="font-semibold text-green-700">Bs. {(Number(pedidoDetalle.precioUnitario) * pedidoDetalle.cantidad).toFixed(2)}</span></p>
                  <p><span className="text-gray-500">Método de pago:</span> {METODO_PAGO_LABELS[pedidoDetalle.metodoPago ?? ''] ?? '—'}</p>
                  <p><span className="text-gray-500">Estado:</span>
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORS[pedidoDetalle.estado]}`}>
                      {ESTADO_LABELS[pedidoDetalle.estado]}
                    </span>
                  </p>
                  {pedidoDetalle.notas && <p><span className="text-gray-500">Notas:</span> {pedidoDetalle.notas}</p>}
                </div>
              </div>

              {(pedidoDetalle.codigoProduccion || pedidoDetalle.codigoImprenta) && (
  <div>
    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
      Códigos
    </p>

    <div className="bg-gray-50 rounded-lg p-3 space-y-3">

      {/* PRODUCCIÓN */}
      {pedidoDetalle.codigoProduccion && (
        <div className="flex flex-col gap-1">
          <span className="text-gray-500 text-xs">Producción</span>

          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs break-all">
              {pedidoDetalle.codigoProduccion}
            </span>

            <button
              onClick={() => navigator.clipboard.writeText(pedidoDetalle.codigoProduccion!)}
              className="text-xs px-2 py-1 rounded bg-gray-500 text-white hover:bg-gray-600 active:scale-95 active:bg-gray-700 transition-all duration-100"
            >
              Copiar
            </button>
          </div>
        </div>
      )}

      {/* IMPRENTA */}
      {pedidoDetalle.codigoImprenta && (
        <div className="flex flex-col gap-1">
          <span className="text-gray-500 text-xs">Imprenta</span>

          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs break-all">
              {pedidoDetalle.codigoImprenta}
            </span>

            <button
              onClick={() => navigator.clipboard.writeText(pedidoDetalle.codigoImprenta!)}
              className="text-xs px-2 py-1 rounded bg-gray-500 text-white hover:bg-gray-600 active:scale-95 active:bg-gray-700 transition-all duration-100"
            >
              Copiar
            </button>
          </div>
        </div>
      )}

    </div>
  </div>
)}

              {pedidoDetalle.personalizaciones.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Personalizaciones</p>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                    {pedidoDetalle.personalizaciones.map((per, i) => (
                      <p key={i}>• <span className="text-gray-500">{per.tipo}:</span> {per.valor}</p>
                    ))}
                  </div>
                </div>
              )}

              {pedidoDetalle.entrega && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Envío</p>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                    <p><span className="text-gray-500">Móvil:</span> <span className="font-medium">{pedidoDetalle.entrega.movil.nombre}</span></p>
                    {pedidoDetalle.entrega.movil.placa && (
                      <p><span className="text-gray-500">Placa:</span> {pedidoDetalle.entrega.movil.placa}</p>
                    )}
                    <p><span className="text-gray-500">Fecha salida:</span> {new Date(pedidoDetalle.entrega.fechaSalida).toLocaleDateString('es-BO')}</p>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-400 text-right">
                Pedido creado el {new Date(pedidoDetalle.createdAt).toLocaleDateString('es-BO')}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal asignar móvil */}
      <Dialog open={!!pedidoParaMovil} onOpenChange={() => setPedidoParaMovil(null)}>
        <DialogContent className="bg-white">
          <DialogHeader><DialogTitle>Asignar móvil para envío</DialogTitle></DialogHeader>
          {pedidoParaMovil && (
            <div className="space-y-4 mt-2">
              <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                <p><span className="text-gray-500">Empresa:</span> <span className="font-medium">{pedidoParaMovil.pedido.cliente.empresa}</span></p>
                <p><span className="text-gray-500">Producto:</span> <span className="font-medium">{pedidoParaMovil.pedido.variante.producto.nombre} {pedidoParaMovil.pedido.variante.tamanoMl}ml</span></p>
              </div>
              <div>
                <Label>Seleccionar móvil</Label>
                <Select value={movilSeleccionado} onValueChange={setMovilSeleccionado}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar móvil" /></SelectTrigger>
                  <SelectContent>
                    {moviles.map(m => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.nombre}{m.placa ? ` — ${m.placa}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1" onClick={confirmarMovil}>Confirmar envío</Button>
                <Button variant="outline" className="flex-1" onClick={() => setPedidoParaMovil(null)}>Cancelar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal confirmar entrega */}
      <Dialog open={!!pedidoAEntregar} onOpenChange={() => setPedidoAEntregar(null)}>
        <DialogContent className="bg-white">
          <DialogHeader><DialogTitle>Confirmar entrega</DialogTitle></DialogHeader>
          {pedidoAEntregar && (
            <div className="space-y-4 mt-2">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                {/* Grid limpio */}
                <div className="grid grid-cols-2 gap-y-2">
                  <span className="text-gray-500">Empresa:</span>
                  <span className="font-medium">{pedidoAEntregar.cliente.empresa}</span>
                  
                  <span className="text-gray-500">Producto:</span> 
                  <span className="font-medium">{pedidoAEntregar.variante.producto.nombre} {pedidoAEntregar.variante.tamanoMl}ml</span>
                  
                  <span className="text-gray-500">Total unidades:</span> 
                  <span className="font-medium">{pedidoAEntregar.cantidad}</span>

                  <span className="text-gray-500">Total a pagar:</span> 
                  <span className="font-semibold text-green-700">Bs. {(Number(pedidoAEntregar.precioUnitario) * pedidoAEntregar.cantidad).toFixed(2)}</span>
                  
                  <span className="text-gray-500">Método de pago:</span> 
                  <span className="font-medium">{METODO_PAGO_LABELS[pedidoAEntregar.metodoPago ?? ''] ?? '—'}</span>
                  
                  <span className="text-gray-500">Móvil: </span>
                      <span className="font-medium">
                        {
                          pedidoAEntregar.entrega?.movil?.nombre
                          ?? moviles.find(m => m.id === Number(movilSeleccionado))?.nombre
                          ?? 'No asignado'
                        } - {
                          pedidoAEntregar.entrega?.movil?.placa
                          ?? moviles.find(m => m.id === Number(movilSeleccionado))?.placa
                          ?? 'No asignado'
                        }
                      </span>
 
                    <div className="col-span-2 space-y-2">
                      <div className="flex flex-col">
                        <span className="text-gray-500 ">Cód. producción:</span>
                        <span className="font-mono text-xs break-all">
                          {pedidoAEntregar.codigoProduccion}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-gray-500">Cód. imprenta:</span>
                        <span className="font-mono text-xs break-all">
                          {pedidoAEntregar.codigoImprenta}
                        </span>
                      </div>
                    </div>
  
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Esta acción moverá el pedido al historial y <span className="font-medium">no podrá modificarse</span>.
              </p>
              <div className="flex gap-3">
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={confirmarEntrega}>
                  Confirmar entrega
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setPedidoAEntregar(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}