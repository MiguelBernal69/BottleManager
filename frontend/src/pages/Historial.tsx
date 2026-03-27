import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import api from '../api/axios'
import type { HistorialItem } from '../types'

const METODO_PAGO_LABELS: Record<string, string> = {
  qr: 'QR',
  al_contado: 'Al contado',
  credito: 'Crédito',
}

const DEPT_LABELS: Record<string, string> = {
  cochabamba: 'Cochabamba', santa_cruz: 'Santa Cruz', la_paz: 'La Paz',
  oruro: 'Oruro', potosi: 'Potosí', tarija: 'Tarija',
  beni: 'Beni', pando: 'Pando', sucre: 'Sucre',
}

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
    const empresa = (h.pedidoData?.cliente?.empresa ?? '').toLowerCase()
    const nombreCliente = (h.pedidoData?.cliente?.nombreCliente ?? '').toLowerCase()
    const matchSearch = empresa.includes(search.toLowerCase()) || nombreCliente.includes(search.toLowerCase())
    const fecha = new Date(h.entregadoAt)
    const matchDesde = fechaDesde ? fecha >= new Date(fechaDesde) : true
    const matchHasta = fechaHasta ? fecha <= new Date(fechaHasta + 'T23:59:59') : true
    return matchSearch && matchDesde && matchHasta
  })

  const totalFiltrado = filtered.reduce((acc, h) => acc + Number(h.totalPagar ?? h.totalSinFactura), 0)

  const d = detalle?.pedidoData

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Historial</h1>
        <span className="text-sm text-gray-500">{filtered.length} entrega(s)</span>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <p className="text-xs text-gray-500 mb-1">Buscar empresa o contacto</p>
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-52"
          />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Desde</p>
          <Input type="date" value={fechaDesde}
            onChange={e => setFechaDesde(e.target.value)} className="w-40" />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Hasta</p>
          <Input type="date" value={fechaHasta}
            onChange={e => setFechaHasta(e.target.value)} className="w-40" />
        </div>
        {(search || fechaDesde || fechaHasta) && (
          <Button variant="outline" size="sm"
            onClick={() => { setSearch(''); setFechaDesde(''); setFechaHasta('') }}>
            Limpiar
          </Button>
        )}
      </div>

      {/* Total filtrado */}
      {filtered.length > 0 && (
        <div className="flex gap-4">
          <div className="bg-green-50 rounded-lg px-4 py-2 text-sm">
            <span className="text-gray-500">Total entregas: </span>
            <span className="font-semibold text-green-700">Bs. {totalFiltrado.toFixed(2)}</span>
          </div>
          <div className="bg-blue-50 rounded-lg px-4 py-2 text-sm">
            <span className="text-gray-500">Cantidad de pedidos: </span>
            <span className="font-semibold text-blue-700">{filtered.length}</span>
          </div>
        </div>
      )}

      <Card className="rounded-lg border">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b bg-gray-50">
                <th className="px-4 py-3">Fecha entrega</th>
                <th className="px-4 py-3">Empresa</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Variante</th>
                <th className="px-4 py-3">Cantidad</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Método pago</th>
                <th className="px-4 py-3">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(h => (
                <tr key={h.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(h.entregadoAt).toLocaleDateString('es-BO')}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {h.pedidoData?.cliente?.empresa ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    {h.pedidoData?.variante?.producto?.nombre ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {h.pedidoData?.variante
                      ? `${h.pedidoData.variante.tamanoMl}ml · ${h.pedidoData.variante.material} · ${h.pedidoData.variante.tipo}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3">{h.pedidoData?.cantidad ?? '—'}</td>
                  <td className="px-4 py-3 font-semibold text-green-700">
                    Bs. {Number(h.totalPagar ?? h.totalSinFactura).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {METODO_PAGO_LABELS[h.pedidoData?.metodoPago ?? ''] ?? '—'}
                    </span>
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
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                    No hay entregas con los filtros aplicados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Modal detalle completo */}
      <Dialog open={!!detalle} onOpenChange={() => setDetalle(null)}>
        <DialogContent className="bg-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de entrega #{detalle?.id}</DialogTitle>
          </DialogHeader>
          {detalle && d && (
            <div className="space-y-4 mt-2 text-sm">

              {/* Cliente */}
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Cliente</p>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                  <p><span className="text-gray-500">Empresa:</span> <span className="font-medium">{d.cliente?.empresa ?? '—'}</span></p>
                  {d.cliente?.nombreCliente && <p><span className="text-gray-500">Contacto:</span> {d.cliente.nombreCliente}</p>}
                  {d.cliente?.telefono && <p><span className="text-gray-500">Teléfono:</span> {d.cliente.telefono}</p>}
                  {d.cliente?.departamento && <p><span className="text-gray-500">Departamento:</span> {DEPT_LABELS[d.cliente.departamento] ?? d.cliente.departamento}</p>}
                  {d.cliente?.direccion && <p><span className="text-gray-500">Dirección:</span> {d.cliente.direccion}</p>}
                </div>
              </div>

              {/* Producto */}
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Producto</p>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                  <p><span className="text-gray-500">Producto:</span> <span className="font-medium">{d.variante?.producto?.nombre ?? '—'}</span></p>
                  <p><span className="text-gray-500">Tamaño:</span> {d.variante?.tamanoMl}ml</p>
                  <p><span className="text-gray-500">Material:</span> {d.variante?.material}</p>
                  <p><span className="text-gray-500">Tipo:</span> {d.variante?.tipo}</p>
                  <p><span className="text-gray-500">Cant. por paquete:</span> {d.variante?.cantidadPaquete}</p>
                </div>
              </div>

              {/* Pedido */}
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Pedido</p>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                  <p><span className="text-gray-500">Cantidad:</span> <span className="font-medium">{d.cantidad} paquetes</span></p>
                  <p>
                    <span className="text-gray-500">Total unidades:</span>{' '}
                    <span className="font-medium">{d.cantidad * (d.variante?.cantidadPaquete ?? 1)}</span>
                  </p>
                  <p><span className="text-gray-500">Precio unitario:</span> Bs. {Number(d.precioUnitario).toFixed(2)}</p>
                  <p>
                    <span className="text-gray-500">Total pagado:</span>{' '}
                    <span className="font-semibold text-green-700">
                      Bs. {Number(detalle.totalPagar ?? detalle.totalSinFactura).toFixed(2)}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-500">Método de pago:</span>{' '}
                    <span className="font-medium">{METODO_PAGO_LABELS[d.metodoPago ?? ''] ?? '—'}</span>
                  </p>
                  {d.notas && <p><span className="text-gray-500">Notas:</span> {d.notas}</p>}
                </div>
              </div>

              {/* Códigos */}
              {(d.codigoProduccion || d.codigoImprenta) && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Códigos</p>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                    {d.codigoProduccion && (
                      <p><span className="text-gray-500">Producción:</span> <span className="font-mono text-xs">{d.codigoProduccion}</span></p>
                    )}
                    {d.codigoImprenta && (
                      <p><span className="text-gray-500">Imprenta:</span> <span className="font-mono text-xs">{d.codigoImprenta}</span></p>
                    )}
                  </div>
                </div>
              )}

              {/* Personalizaciones */}
              {d.personalizaciones?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Personalizaciones</p>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                    {d.personalizaciones.map((p: any, i: number) => (
                      <p key={i}>• <span className="text-gray-500">{p.tipo}:</span> {p.valor}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Entrega */}
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Entrega</p>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                  <p><span className="text-gray-500">Estado final:</span> <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">{detalle.estadoFinal}</span></p>
                  <p><span className="text-gray-500">Fecha pedido:</span> {new Date(d.createdAt).toLocaleDateString('es-BO')}</p>
                  <p><span className="text-gray-500">Fecha entrega:</span> <span className="font-medium">{new Date(detalle.entregadoAt).toLocaleDateString('es-BO')}</span></p>
                </div>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}