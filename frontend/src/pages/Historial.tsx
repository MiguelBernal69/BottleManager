import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import api from '../api/axios'
import type { HistorialItem } from '../types'

export default function Historial() {
  const [historial, setHistorial] = useState<HistorialItem[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/historial').then(r => setHistorial(r.data))
  }, [])

  const filtered = historial.filter(h =>
    h.cliente.nombre.toLowerCase().includes(search.toLowerCase()) ||
    h.botella.nombre.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Historial</h1>
        <span className="text-sm text-gray-500">{filtered.length} entrega(s)</span>
      </div>

      <Input
        placeholder="Buscar por cliente o botella..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="max-w-xs"
      />

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b bg-gray-50">
                <th className="px-4 py-3">Fecha entrega</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Botella</th>
                <th className="px-4 py-3">Cantidad</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(h => (
                <tr key={h.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(h.entregadoAt).toLocaleDateString('es-BO')}
                  </td>
                  <td className="px-4 py-3 font-medium">{h.cliente.nombre}</td>
                  <td className="px-4 py-3">{h.botella.nombre}</td>
                  <td className="px-4 py-3">{h.cantidad}</td>
                  <td className="px-4 py-3 font-medium text-green-700">Bs. {h.precioTotal.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Entregado
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                    No hay entregas en el historial
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}