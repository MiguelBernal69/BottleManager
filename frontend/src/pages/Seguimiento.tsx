import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import api from '../api/axios'
import type { Venta, EstadoVenta } from '../types'

const ESTADO_LABELS: Record<string, string> = {
  registrado: 'Registrado', en_produccion: 'En producción', en_envio: 'En envío',
}
const ESTADO_COLORS: Record<string, string> = {
  registrado: 'bg-gray-100 text-gray-700',
  en_produccion: 'bg-yellow-100 text-yellow-700',
  en_envio: 'bg-blue-100 text-blue-700',
}
const ESTADOS_ACTIVOS: EstadoVenta[] = ['registrado', 'en_produccion', 'en_envio']

export default function Seguimiento() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [filtro, setFiltro] = useState<string>('todos')
  const [ventaAEntregar, setVentaAEntregar] = useState<Venta | null>(null)

  const load = () => api.get('/ventas').then(r => setVentas(r.data))
  useEffect(() => { load() }, [])

  const handleEstado = async (id: number, estado: EstadoVenta) => {
    await api.patch(`/ventas/${id}/estado`, { estado })
    load()
  }

  const confirmarEntrega = async () => {
    if (!ventaAEntregar) return
    await api.post(`/historial/${ventaAEntregar.id}/entregar`)
    setVentaAEntregar(null)
    load()
  }

  const filtered = filtro === 'todos' ? ventas : ventas.filter(v => v.estado === filtro)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Seguimiento</h1>
        <span className="text-sm text-gray-500">{filtered.length} venta(s) activa(s)</span>
      </div>

      <div className="flex gap-3 items-center">
        <span className="text-sm text-gray-600">Filtrar por estado:</span>
        <Select value={filtro} onValueChange={setFiltro}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {ESTADOS_ACTIVOS.map(e => (
              <SelectItem key={e} value={e}>{ESTADO_LABELS[e]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b bg-gray-50">
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Botella</th>
                <th className="px-4 py-3">Cantidad</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{v.cliente.nombre}</td>
                  <td className="px-4 py-3">{v.botella.nombre}</td>
                  <td className="px-4 py-3">{v.cantidad}</td>
                  <td className="px-4 py-3 font-medium text-green-700">Bs. {v.precioTotal.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <Select value={v.estado} onValueChange={val => handleEstado(v.id, val as EstadoVenta)}>
                      <SelectTrigger className="h-7 w-36 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS_ACTIVOS.map(e => (
                          <SelectItem key={e} value={e}>{ESTADO_LABELS[e]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => setVentaAEntregar(v)}
                    >
                      Entregar
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">No hay ventas activas</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={!!ventaAEntregar} onOpenChange={() => setVentaAEntregar(null)}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Confirmar entrega</DialogTitle>
          </DialogHeader>
          {ventaAEntregar && (
            <div className="space-y-4 mt-2">
              <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
                <p><span className="text-gray-500">Cliente:</span> <span className="font-medium">{ventaAEntregar.cliente.nombre}</span></p>
                <p><span className="text-gray-500">Botella:</span> <span className="font-medium">{ventaAEntregar.botella.nombre}</span></p>
                <p><span className="text-gray-500">Cantidad:</span> <span className="font-medium">{ventaAEntregar.cantidad}</span></p>
                <p><span className="text-gray-500">Total:</span> <span className="font-medium text-green-700">Bs. {ventaAEntregar.precioTotal.toFixed(2)}</span></p>
              </div>
              <p className="text-sm text-gray-600">
                Esta venta se moverá al historial y <span className="font-medium">ya no podrá modificarse</span>.
              </p>
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={confirmarEntrega}
                >
                  Confirmar entrega
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setVentaAEntregar(null)}
                >
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