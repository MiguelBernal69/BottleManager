import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '../api/axios'

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

const hoy = () => new Date().toISOString().split('T')[0]
const inicioMes = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

type Rango = 'hoy' | 'mes' | 'personalizado'

export default function Dashboard() {
  const [data, setData] = useState<any | null>(null)
  const [rango, setRango] = useState<Rango>('mes')
  const [desde, setDesde] = useState(inicioMes())
  const [hasta, setHasta] = useState(hoy())
  const [loading, setLoading] = useState(false)

  const fetchData = async (d: string, h: string) => {
    setLoading(true)
    try {
      const res = await api.get(`/dashboard?desde=${d}&hasta=${h}`)
      setData(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData(desde, hasta) }, [])

  const handleRango = (tipo: Rango) => {
    setRango(tipo)
    if (tipo === 'hoy') {
      const d = hoy()
      setDesde(d); setHasta(d)
      fetchData(d, d)
    } else if (tipo === 'mes') {
      const d = inicioMes(); const h = hoy()
      setDesde(d); setHasta(h)
      fetchData(d, h)
    }
  }

  const handleAplicar = () => fetchData(desde, hasta)

  if (!data) return <p className="text-gray-500 p-4">Cargando...</p>

  const chartData = data.graficoIngresos.map((g: any) => ({
    name: `${MESES[g.mes.split('-')[1]]} ${g.mes.split('-')[0]}`,
    'Ingresos': g.total,
  }))

  const estadoData = data.pedidosPorEstado.map((e: any) => ({
    name: ESTADO_LABELS[e.estado] ?? e.estado,
    pedidos: e._count.id,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        {loading && <span className="text-xs text-gray-400">Actualizando...</span>}
      </div>

      {/* Selector de rango */}
      <Card>
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex gap-2">
              <button
                onClick={() => handleRango('hoy')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                  rango === 'hoy' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Hoy
              </button>
              <button
                onClick={() => handleRango('mes')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                  rango === 'mes' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Este mes
              </button>
              <button
                onClick={() => setRango('personalizado')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                  rango === 'personalizado' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Personalizado
              </button>
            </div>

            {rango === 'personalizado' && (
              <div className="flex gap-2 items-end">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Desde</p>
                  <Input type="date" value={desde}
                    onChange={e => setDesde(e.target.value)} className="w-36 h-8 text-sm" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Hasta</p>
                  <Input type="date" value={hasta}
                    onChange={e => setHasta(e.target.value)} className="w-36 h-8 text-sm" />
                </div>
                <Button size="sm" onClick={handleAplicar} className="h-8">Aplicar</Button>
              </div>
            )}

            <span className="text-xs text-gray-400 ml-auto">
              {new Date(desde).toLocaleDateString('es-BO')} — {new Date(hasta).toLocaleDateString('es-BO')}
            </span>
          </div>
        </CardContent>
      </Card>

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
            <CardTitle className="text-xs text-gray-500">Entregas totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-800">{data.totalHistorial}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-gray-500">Ingresos (período)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              Bs. {data.ingresoFiltrado.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Total histórico: Bs. {data.ingresoTotal.toFixed(2)}</p>
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
                  <Tooltip formatter={(val: any) => `Bs. ${val}`} />
                  <Bar dataKey="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pedidos activos por estado</CardTitle>
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
          {data.ultimasEntregas.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Sin entregas aún</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Fecha</th>
                  <th className="pb-2">Empresa</th>
                  <th className="pb-2">Producto</th>
                  <th className="pb-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.ultimasEntregas.map((h: any) => (
                  <tr key={h.id} className="border-b last:border-0">
                    <td className="py-2 text-gray-500">
                      {new Date(h.entregadoAt).toLocaleDateString('es-BO')}
                    </td>
                    <td className="py-2 font-medium">{h.empresa}</td>
                    <td className="py-2 text-gray-500">
                      {h.productoNombre} {h.varianteTamano}ml
                    </td>
                    <td className="py-2 font-semibold text-green-700">
                      Bs. {Number(h.pedidoData?.totalPagar ?? 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Pedidos activos recientes */}
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
                  <th className="pb-2">Empresa</th>
                  <th className="pb-2">Producto</th>
                  <th className="pb-2">Cantidad</th>
                  <th className="pb-2">Total</th>
                  <th className="pb-2">Estado</th>
                  <th className="pb-2">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {data.pedidosRecientes.map((p: any) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2 font-medium">{p.cliente.empresa}</td>
                    <td className="py-2 text-gray-600">
                      {p.variante.producto.nombre} {p.variante.tamanoMl}ml
                    </td>
                    <td className="py-2">{p.cantidad}</td>
                    <td className="py-2 font-semibold text-green-700">
                      Bs. {(Number(p.precioUnitario) * p.cantidad).toFixed(2)}
                    </td>
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