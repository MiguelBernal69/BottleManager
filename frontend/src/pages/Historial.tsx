import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import api from '../api/axios'
import type { HistorialItem } from '../types'

export default function Historial() {
  const [historial, setHistorial] = useState<HistorialItem[]>([])
  const [search, setSearch] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [detalle, setDetalle] = useState<HistorialItem | null>(null)

  useEffect(() => {
    api.get('/historial').then(r => setHistorial(r.data))
  }, [])

  const filtered = historial.filter(h => {
    const nombreCliente = (h.pedidoData?.cliente?.nombre ?? '').toLowerCase()
    const matchSearch = nombreCliente.includes(search.toLowerCase())
    const fecha = new Date(h.entregadoAt)
    const matchDesde = fechaDesde ? fecha >= new Date(fechaDesde) : true
    const matchHasta = fechaHasta ? fecha <= new Date(fechaHasta + 'T23:59:59') : true
    return matchSearch && matchDesde && matchHasta
  })

  const totalSinFactura = filtered.reduce((acc, h) => acc + Number(h.totalSinFactura), 0)
  const totalConFactura = filtered.reduce((acc, h) => acc + Number(h.totalConFactura), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Historial</h1>
        <span className="text-sm text-gray-500">{filtered.length} entrega(s)</span>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <p className="text-xs text-gray-500 mb-1">Buscar cliente</p>
          <Input
            placeholder="Nombre del cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-48"
          />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Desde</p>
          <Input
            type="date"
            value={fechaDesde}
            onChange={e => setFechaDesde(e.target.value)}
            className="w-40"
          />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Hasta</p>
          <Input
            type="date"
            value={fechaHasta}
            onChange={e => setFechaHasta(e.target.value)}
            className="w-40"
          />
        </div>
        {(search || fechaDesde || fechaHasta) && (
          <Button variant="outline" size="sm" onClick={() => { setSearch(''); setFechaDesde(''); setFechaHasta('') }}>
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Totales filtrados */}
      {filtered.length > 0 && (
        <div className="flex gap-4">
          <div className="bg-green-50 rounded-lg px-4 py-2 text-sm">
            <span className="text-gray-500">Total sin factura: </span>
            <span className="font-semibold text-green-700">Bs. {totalSinFactura.toFixed(2)}</span>
          </div>
          <div className="bg-blue-50 rounded-lg px-4 py-2 text-sm">
            <span className="text-gray-500">Total con factura: </span>
            <span className="font-semibold text-blue-700">Bs. {totalConFactura.toFixed(2)}</span>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b bg-gray-50">
                <th className="px-4 py-3">Fecha entrega</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Sin factura</th>
                <th className="px-4 py-3">Con factura</th>
                <th className="px-4 py-3">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(h => (
                <tr key={h.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(h.entregadoAt).toLocaleDateString('es-BO')}
                  </td>
                 <td className="px-4 py-3 font-medium">{h.pedidoData?.cliente?.nombre ?? '—'}</td>
                  <td className="px-4 py-3 text-green-700 font-medium">
                    Bs. {Number(h.totalSinFactura).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-blue-700 font-medium">
                    Bs. {Number(h.totalConFactura).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" onClick={() => setDetalle(h)}>
                      Ver detalle
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                    No hay entregas con los filtros aplicados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Modal detalle */}
      <Dialog open={!!detalle} onOpenChange={() => setDetalle(null)}>
        <DialogContent className="bg-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de entrega</DialogTitle>
          </DialogHeader>
          {detalle && (
            <div className="space-y-4 mt-2 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">Cliente</p>
                  <p className="font-medium">{detalle.pedidoData?.cliente?.nombre ?? '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">Fecha entrega</p>
                  <p className="font-medium">{new Date(detalle.entregadoAt).toLocaleDateString('es-BO')}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <p className="text-gray-500 text-xs mb-2">Pedido</p>
                {detalle.pedidoData?.variante && (
                  <>
                    <p><span className="text-gray-500">Producto:</span> <span className="font-medium">{detalle.pedidoData.variante?.producto?.nombre}</span></p>
                    <p><span className="text-gray-500">Variante:</span> <span className="font-medium">{detalle.pedidoData.variante?.tamanoMl}ml · {detalle.pedidoData.variante?.material} · {detalle.pedidoData.variante?.tipo}</span></p>
                    <p><span className="text-gray-500">Cantidad:</span> <span className="font-medium">{detalle.pedidoData.cantidad}</span></p>
                    <p><span className="text-gray-500">Precio unitario:</span> <span className="font-medium">Bs. {Number(detalle.pedidoData.precioUnitario).toFixed(2)}</span></p>
                  </>
                )}
                {detalle.pedidoData?.personalizaciones?.length > 0 && (
                  <div>
                    <p className="text-gray-500 mt-2 mb-1">Personalizaciones:</p>
                    {detalle.pedidoData.personalizaciones.map((p: any, i: number) => (
                      <p key={i} className="pl-2 text-gray-600">• {p.tipo}: {p.valor}</p>
                    ))}
                  </div>
                )}
                {detalle.pedidoData?.notas && (
                  <p><span className="text-gray-500">Notas:</span> <span className="font-medium">{detalle.pedidoData.notas}</span></p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">Total sin factura</p>
                  <p className="font-semibold text-green-700 text-lg">Bs. {Number(detalle.totalSinFactura).toFixed(2)}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">Total con factura</p>
                  <p className="font-semibold text-blue-700 text-lg">Bs. {Number(detalle.totalConFactura).toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}