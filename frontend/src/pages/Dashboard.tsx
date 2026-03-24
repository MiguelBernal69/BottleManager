import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '../api/axios'
import type { DashboardData } from '../types'

const ESTADO_LABELS: Record<string, string> = {
  registrado: 'Registrado',
  en_produccion: 'En producción',
  en_envio: 'En envío',
  entregado: 'Entregado',
}

const ESTADO_COLORS: Record<string, string> = {
  registrado: 'bg-gray-100 text-gray-700',
  en_produccion: 'bg-yellow-100 text-yellow-700',
  en_envio: 'bg-blue-100 text-blue-700',
  entregado: 'bg-green-100 text-green-700',
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data))
  }, [])

  if (!data) return <p className="text-gray-500">Cargando...</p>

  const chartData = data.porEstado.map(e => ({
    name: ESTADO_LABELS[e.estado] ?? e.estado,
    ventas: e._count.id,
    ingresos: e._sum.precioTotal ?? 0,
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-sm text-gray-500">Clientes</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-gray-800">{data.totalClientes}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-sm text-gray-500">Ventas totales</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-gray-800">{data.totalVentas}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-sm text-gray-500">Ingresos totales</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-600">Bs. {data.ingresoTotal.toFixed(2)}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Ventas por estado</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="ventas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Últimas ventas</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Cliente</th>
                <th className="pb-2">Botella</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.ventasRecientes.map(v => (
                <tr key={v.id} className="border-b last:border-0">
                  <td className="py-2">{v.cliente.nombre}</td>
                  <td className="py-2">{v.botella.nombre}</td>
                  <td className="py-2 font-medium">Bs. {v.precioTotal.toFixed(2)}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORS[v.estado]}`}>
                      {ESTADO_LABELS[v.estado]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}