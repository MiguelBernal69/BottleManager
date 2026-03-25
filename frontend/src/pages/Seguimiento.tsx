import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import api from '../api/axios'
import type { Pedido, EstadoPedido } from '../types'

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
const ESTADOS: EstadoPedido[] = ['pendiente', 'en_produccion', 'en_envio']

export default function Seguimiento() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [filtro, setFiltro] = useState('todos')
  const [pedidoAEntregar, setPedidoAEntregar] = useState<Pedido | null>(null)

  const load = () => api.get('/pedidos').then(r => setPedidos(r.data))
  useEffect(() => { load() }, [])

  const handleEstado = async (id: number, estado: EstadoPedido) => {
    await api.patch(`/pedidos/${id}/estado`, { estado })
    load()
  }

  const confirmarEntrega = async () => {
    if (!pedidoAEntregar) return
    try {
      await api.post(`/historial/${pedidoAEntregar.id}/entregar`)
      setPedidoAEntregar(null)
      load()
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

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b bg-gray-50">
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Variante</th>
                <th className="px-4 py-3">Cantidad</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.cliente.nombre}</td>
                  <td className="px-4 py-3">{p.variante.producto.nombre}</td>
                  <td className="px-4 py-3 text-gray-500">{p.variante.tamanoMl}ml · {p.variante.material}</td>
                  <td className="px-4 py-3">{p.cantidad}</td>
                  <td className="px-4 py-3 font-medium text-green-700">
                    Bs. {(Number(p.precioUnitario) * p.cantidad).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <Select value={p.estado} onValueChange={val => handleEstado(p.id, val as EstadoPedido)}>
                      <SelectTrigger className="h-7 w-36 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ESTADOS.map(e => <SelectItem key={e} value={e}>{ESTADO_LABELS[e]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setPedidoAEntregar(p)}>
                      Entregar
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400">No hay pedidos activos</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={!!pedidoAEntregar} onOpenChange={() => setPedidoAEntregar(null)}>
        <DialogContent className="bg-white">
          <DialogHeader><DialogTitle>Confirmar entrega</DialogTitle></DialogHeader>
          {pedidoAEntregar && (
            <div className="space-y-4 mt-2">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <p><span className="text-gray-500">Cliente:</span> <span className="font-medium">{pedidoAEntregar.cliente.nombre}</span></p>
                <p><span className="text-gray-500">Producto:</span> <span className="font-medium">{pedidoAEntregar.variante.producto.nombre}</span></p>
                <p><span className="text-gray-500">Variante:</span> <span className="font-medium">{pedidoAEntregar.variante.tamanoMl}ml · {pedidoAEntregar.variante.material} · {pedidoAEntregar.variante.tipo}</span></p>
                <p><span className="text-gray-500">Cantidad:</span> <span className="font-medium">{pedidoAEntregar.cantidad}</span></p>
                <p><span className="text-gray-500">Total sin factura:</span> <span className="font-medium text-green-700">Bs. {(Number(pedidoAEntregar.variante.precioSinFactura) * pedidoAEntregar.cantidad).toFixed(2)}</span></p>
                <p><span className="text-gray-500">Total con factura:</span> <span className="font-medium text-blue-700">Bs. {(Number(pedidoAEntregar.variante.precioConFactura) * pedidoAEntregar.cantidad).toFixed(2)}</span></p>
                {pedidoAEntregar.personalizaciones.length > 0 && (
                  <div>
                    <p className="text-gray-500 mb-1">Personalizaciones:</p>
                    {pedidoAEntregar.personalizaciones.map((per, i) => (
                      <p key={i} className="pl-2 text-gray-600">• {per.tipo}: {per.valor}</p>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">Esta acción moverá el pedido al historial y <span className="font-medium">no podrá modificarse</span>.</p>
              <div className="flex gap-3">
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={confirmarEntrega}>Confirmar entrega</Button>
                <Button variant="outline" className="flex-1" onClick={() => setPedidoAEntregar(null)}>Cancelar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}