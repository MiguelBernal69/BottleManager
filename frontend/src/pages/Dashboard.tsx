import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '../api/axios'
import type { DashboardData } from '../types'

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

const MESES: Record<string, string> = {
  '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
  '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data))
  }, [])

  if (!data) return <p className="text-gray-500">Cargando...</p>

  const chartData = data.graficoIngresos.map(g => ({
    name: `${MESES[g.mes.split('-')[1]]} ${g.mes.split('-')[0]}`,
    'Sin factura': g.sinFactura,
    'Con factura': g.conFactura,
  }))

  const estadoData = data.pedidosPorEstado.map(e => ({
    name: ESTADO_LABELS[e.estado] ?? e.estado,
    pedidos: e._count.id,
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-gray-500">Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-800">{data.totalClientes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-gray-500">Pedidos activos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-800">{data.totalPedidos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-gray-500">Ingresos s/f</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              Bs. {data.ingresoTotalSinFactura.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-gray-500">Ingresos c/f</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              Bs. {data.ingresoTotalConFactura.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ingresos por mes</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Sin datos aún</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(val) => `Bs. ${val}`} />
                  <Legend />
                  <Bar dataKey="Sin factura" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Con factura" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pedidos por estado</CardTitle>
          </CardHeader>
          <CardContent>
            {estadoData.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Sin pedidos activos</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={estadoData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="pedidos" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Últimas entregas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Últimas entregas</CardTitle>
        </CardHeader>
        <CardContent>
          {data.ultimasEntregas.map(h => (
            <tr key={h.id} className="border-b last:border-0">
              <td className="py-2 text-gray-500">
                {new Date(h.entregadoAt).toLocaleDateString('es-BO')}
              </td>
              <td className="py-2 font-medium">{h.clienteNombre}</td>
              <td className="py-2 text-green-700 font-medium">
                Bs. {Number(h.totalSinFactura).toFixed(2)}
              </td>
              <td className="py-2 text-blue-700 font-medium">
                Bs. {Number(h.totalConFactura).toFixed(2)}
              </td>
            </tr>
          ))}
        </CardContent>
      </Card>

      {/* Últimos pedidos activos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pedidos activos recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {data.pedidosRecientes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Sin pedidos activos</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Cliente</th>
                  <th className="pb-2">Producto</th>
                  <th className="pb-2">Cantidad</th>
                  <th className="pb-2">Estado</th>
                  <th className="pb-2">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {data.pedidosRecientes.map(p => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2 font-medium">{p.cliente.nombre}</td>
                    <td className="py-2 text-gray-600">
                      {p.variante.producto.nombre} {p.variante.tamanoMl}ml
                    </td>
                    <td className="py-2">{p.cantidad}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORS[p.estado]}`}>
                        {ESTADO_LABELS[p.estado]}
                      </span>
                    </td>
                    <td className="py-2 text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString('es-BO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}