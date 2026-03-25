import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import api from '../api/axios'
import type { Pedido, Cliente, Producto, VarianteProducto } from '../types'

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

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [open, setOpen] = useState(false)

  const [clienteId, setClienteId] = useState('')
  const [productoId, setProductoId] = useState('')
  const [varianteId, setVarianteId] = useState('')
  const [cantidad, setCantidad] = useState('1')
  const [precioUnitario, setPrecioUnitario] = useState('')
  const [tipoFactura, setTipoFactura] = useState<'sinFactura' | 'conFactura'>('sinFactura')
  const [notas, setNotas] = useState('')
  const [personalizaciones, setPersonalizaciones] = useState<{ tipo: string; valor: string }[]>([])

  const load = () => api.get('/pedidos').then(r => setPedidos(r.data))

  useEffect(() => {
    load()
    api.get('/clientes').then(r => setClientes(r.data))
    api.get('/productos').then(r => setProductos(r.data))
  }, [])

  const variantesDelProducto: VarianteProducto[] = productos.find(p => p.id === Number(productoId))?.variantes ?? []
  const varianteSeleccionada = variantesDelProducto.find(v => v.id === Number(varianteId))

  // Total en tiempo real
  const totalCalculado = precioUnitario && cantidad
    ? (Number(precioUnitario) * Number(cantidad)).toFixed(2)
    : null

  const aplicarPrecio = (
    variante: VarianteProducto | undefined,
    tipo: 'sinFactura' | 'conFactura'
  ) => {
    if (!variante) return
    setPrecioUnitario(tipo === 'sinFactura' ? variante.precioSinFactura : variante.precioConFactura)
  }

  const handleSelectProducto = (pid: string) => {
    setProductoId(pid)
    setVarianteId('')
    setPrecioUnitario('')
  }

  const handleSelectVariante = (vid: string) => {
    setVarianteId(vid)
    const variante = variantesDelProducto.find(v => v.id === Number(vid))
    aplicarPrecio(variante, tipoFactura)
  }

  const handleTipoFactura = (tipo: 'sinFactura' | 'conFactura') => {
    setTipoFactura(tipo)
    aplicarPrecio(varianteSeleccionada, tipo)
  }

  const addPersonalizacion = () =>
    setPersonalizaciones([...personalizaciones, { tipo: '', valor: '' }])

  const removePersonalizacion = (i: number) =>
    setPersonalizaciones(personalizaciones.filter((_, idx) => idx !== i))

  const updatePersonalizacion = (i: number, field: 'tipo' | 'valor', value: string) => {
    const updated = [...personalizaciones]
    updated[i][field] = value
    setPersonalizaciones(updated)
  }

  const resetForm = () => {
    setClienteId(''); setProductoId(''); setVarianteId('')
    setCantidad('1'); setPrecioUnitario(''); setNotas('')
    setPersonalizaciones([]); setTipoFactura('sinFactura')
  }

  const handleSubmit = async () => {
    if (!clienteId || !varianteId || !cantidad || !precioUnitario) {
      alert('Completa todos los campos requeridos')
      return
    }
    try {
      await api.post('/pedidos', {
        clienteId: Number(clienteId),
        varianteId: Number(varianteId),
        cantidad: Number(cantidad),
        precioUnitario,
        notas,
        personalizaciones: personalizaciones.filter(p => p.tipo && p.valor),
      })
      setOpen(false)
      resetForm()
      load()
    } catch (e: any) {
      alert(e?.response?.data?.error ?? 'Error al crear pedido')
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este pedido?')) {
      await api.delete(`/pedidos/${id}`)
      load()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Pedidos</h1>
        <Button onClick={() => { resetForm(); setOpen(true) }}>+ Nuevo pedido</Button>
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
                <th className="px-4 py-3">Precio unit.</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map(p => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.cliente.nombre}</td>
                  <td className="px-4 py-3">{p.variante.producto.nombre}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {p.variante.tamanoMl}ml · {p.variante.material} · {p.variante.tipo}
                  </td>
                  <td className="px-4 py-3">{p.cantidad}</td>
                  <td className="px-4 py-3 font-medium">
                    Bs. {Number(p.precioUnitario).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-green-700">
                    Bs. {(Number(p.precioUnitario) * p.cantidad).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORS[p.estado]}`}>
                      {ESTADO_LABELS[p.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(p.createdAt).toLocaleDateString('es-BO')}
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)}>
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
              {pedidos.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-gray-400">
                    No hay pedidos activos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nuevo pedido</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">

            {/* Cliente */}
            <div>
              <Label>Cliente</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                <SelectContent>
                  {clientes.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Producto */}
            <div>
              <Label>Producto</Label>
              <Select value={productoId} onValueChange={handleSelectProducto}>
                <SelectTrigger><SelectValue placeholder="Seleccionar producto" /></SelectTrigger>
                <SelectContent>
                  {productos.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Variante */}
            {productoId && (
              <div>
                <Label>Variante</Label>
                <Select value={varianteId} onValueChange={handleSelectVariante}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar variante" /></SelectTrigger>
                  <SelectContent>
                    {variantesDelProducto.map(v => (
                      <SelectItem key={v.id} value={String(v.id)}>
                        {v.tamanoMl}ml — {v.material} — {v.tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Tipo de factura */}
            {varianteId && (
              <div>
                <Label>Tipo de precio</Label>
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => handleTipoFactura('sinFactura')}
                    className={`flex-1 py-2 px-3 rounded-md border text-sm font-medium transition-colors ${
                      tipoFactura === 'sinFactura'
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Sin factura · Bs. {varianteSeleccionada?.precioSinFactura}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTipoFactura('conFactura')}
                    className={`flex-1 py-2 px-3 rounded-md border text-sm font-medium transition-colors ${
                      tipoFactura === 'conFactura'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Con factura · Bs. {varianteSeleccionada?.precioConFactura}
                  </button>
                </div>
              </div>
            )}

            {/* Cantidad y precio */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Cantidad (paquetes)</Label>
                <Input
                  type="number"
                  min={1}
                  value={cantidad}
                  onChange={e => setCantidad(e.target.value)}
                />
              </div>
              <div>
                <Label>Precio unitario (Bs.)</Label>
                <Input
                  type="number"
                  value={precioUnitario}
                  onChange={e => setPrecioUnitario(e.target.value)}
                  className={tipoFactura === 'sinFactura' ? 'border-green-300' : 'border-blue-300'}
                />
              </div>
            </div>

            {/* Total calculado */}
            {totalCalculado && (
              <div className={`rounded-lg p-3 text-sm font-medium ${
                tipoFactura === 'sinFactura'
                  ? 'bg-green-50 text-green-800'
                  : 'bg-blue-50 text-blue-800'
              }`}>
                Total a pagar: Bs. {totalCalculado}
                <span className="font-normal text-xs ml-2">
                  ({cantidad} paquetes × Bs. {precioUnitario})
                </span>
              </div>
            )}

            {/* Notas */}
            <div>
              <Label>Notas (opcional)</Label>
              <Input
                value={notas}
                onChange={e => setNotas(e.target.value)}
                placeholder="Observaciones del pedido"
              />
            </div>

            {/* Personalizaciones */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Personalizaciones (opcional)</Label>
                <Button size="sm" variant="outline" onClick={addPersonalizacion}>+ Agregar</Button>
              </div>
              {personalizaciones.map((p, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    placeholder="Tipo (ej: color)"
                    value={p.tipo}
                    onChange={e => updatePersonalizacion(i, 'tipo', e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Input
                    placeholder="Valor (ej: rojo)"
                    value={p.valor}
                    onChange={e => updatePersonalizacion(i, 'valor', e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 px-2"
                    onClick={() => removePersonalizacion(i)}
                  >✕</Button>
                </div>
              ))}
            </div>

            <Button className="w-full" onClick={handleSubmit}>Crear pedido</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}