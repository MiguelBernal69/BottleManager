import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import api from '../api/axios'
import type { Producto, VarianteProducto } from '../types'

const emptyProducto = { nombre: '', descripcion: '' }
const emptyVariante = {
  tamanoMl: '', material: '', tipo: '', cantidadPaquete: '',
  precioSinFactura: '', precioConFactura: ''
}

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [search, setSearch] = useState('')

  // Modal producto
  const [openProducto, setOpenProducto] = useState(false)
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null)
  const [formProducto, setFormProducto] = useState(emptyProducto)

  // Modal variantes (panel de variantes de un producto)
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const [openVariantes, setOpenVariantes] = useState(false)

  // Modal crear/editar variante
  const [openVariante, setOpenVariante] = useState(false)
  const [editingVariante, setEditingVariante] = useState<VarianteProducto | null>(null)
  const [formVariante, setFormVariante] = useState(emptyVariante)

  const load = async () => {
    const res = await api.get('/productos')
    setProductos(res.data)
    // Si hay un producto seleccionado, actualizarlo con los datos frescos
    if (productoSeleccionado) {
      const actualizado = res.data.find((p: Producto) => p.id === productoSeleccionado.id)
      if (actualizado) setProductoSeleccionado(actualizado)
    }
  }

  useEffect(() => { load() }, [])

  // --- Producto handlers ---
  const openCreateProducto = () => {
    setEditingProducto(null)
    setFormProducto(emptyProducto)
    setOpenProducto(true)
  }

  const openEditProducto = (p: Producto) => {
    setEditingProducto(p)
    setFormProducto({ nombre: p.nombre, descripcion: p.descripcion ?? '' })
    setOpenProducto(true)
  }

  const handleSubmitProducto = async () => {
    if (!formProducto.nombre.trim()) return
    if (editingProducto) await api.put(`/productos/${editingProducto.id}`, formProducto)
    else await api.post('/productos', formProducto)
    setOpenProducto(false)
    load()
  }

  const handleDeleteProducto = async (id: number) => {
    if (confirm('¿Eliminar este producto y todas sus variantes?')) {
      await api.delete(`/productos/${id}`)
      load()
    }
  }

  // --- Ver variantes de un producto ---
  const verVariantes = (p: Producto) => {
    setProductoSeleccionado(p)
    setOpenVariantes(true)
  }

  // --- Variante handlers ---
  const openCreateVariante = () => {
    setEditingVariante(null)
    setFormVariante(emptyVariante)
    setOpenVariante(true)
  }

  const openEditVariante = (v: VarianteProducto) => {
    setEditingVariante(v)
    setFormVariante({
      tamanoMl: String(v.tamanoMl),
      material: v.material,
      tipo: v.tipo,
      cantidadPaquete: String(v.cantidadPaquete),
      precioSinFactura: String(v.precioSinFactura),
      precioConFactura: String(v.precioConFactura),
    })
    setOpenVariante(true)
  }

  const handleSubmitVariante = async () => {
    if (!productoSeleccionado) return
    const data = {
      productoId: productoSeleccionado.id,
      tamanoMl: Number(formVariante.tamanoMl),
      material: formVariante.material,
      tipo: formVariante.tipo,
      cantidadPaquete: Number(formVariante.cantidadPaquete),
      precioSinFactura: formVariante.precioSinFactura,
      precioConFactura: formVariante.precioConFactura,
    }
    if (editingVariante) await api.put(`/variantes/${editingVariante.id}`, data)
    else await api.post('/variantes', data)
    setOpenVariante(false)
    load()
  }

  const handleDeleteVariante = async (id: number) => {
    if (confirm('¿Eliminar esta variante?')) {
      await api.delete(`/variantes/${id}`)
      load()
    }
  }

  const filtered = productos.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  )

  const camposVariante = [
    { key: 'tamanoMl', label: 'Tamaño (ml)', type: 'number', placeholder: 'Ej: 500' },
    { key: 'material', label: 'Material', type: 'text', placeholder: 'Ej: Plástico, Vidrio' },
    { key: 'tipo', label: 'Tipo', type: 'text', placeholder: 'Ej: Botella, Galón' },
    { key: 'cantidadPaquete', label: 'Cantidad por paquete', type: 'number', placeholder: 'Ej: 12' },
    { key: 'precioSinFactura', label: 'Precio sin factura (Bs.)', type: 'number', placeholder: '0.00' },
    { key: 'precioConFactura', label: 'Precio con factura (Bs.)', type: 'number', placeholder: '0.00' },
  ] as const

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Productos</h1>
        <Button
        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md'
        onClick={openCreateProducto}>+ Nuevo producto</Button>
      </div>

      <Input
        placeholder="Buscar producto..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="max-w-xs"
      />

      <Card className='rounded-lg border'>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b bg-gray-50">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Variantes</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.nombre}</td>
                  <td className="px-4 py-3 text-gray-500">{p.descripcion ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {p.variantes.length} variante(s)
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <Button 
                    className='bg-slate-100 hover:bg-slate-300 font-bold py-2 px-4 rounded-md'
                    size="sm" variant="outline" onClick={() => verVariantes(p)}>
                      Ver variantes
                    </Button>
                    <Button 
                    className='bg-slate-100 hover:bg-slate-300 font-bold py-2 px-4 rounded-md'
                    size="sm" variant="outline" onClick={() => openEditProducto(p)}>
                      Editar
                    </Button>
                    <Button 
                      className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md'
                      size="sm" variant="destructive" onClick={() => handleDeleteProducto(p.id)}>
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                    No hay productos. Crea uno con el botón de arriba.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Modal crear/editar producto */}
      <Dialog open={openProducto} onOpenChange={setOpenProducto}>
        <DialogContent className="bg-white " >
          <DialogHeader>
            <DialogTitle>{editingProducto ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label>Nombre</Label>
              <Input
                placeholder="Ej: Agua mineral, Jugo de naranja"
                value={formProducto.nombre}
                onChange={e => setFormProducto({ ...formProducto, nombre: e.target.value })}
              />
            </div>
            <div>
              <Label>Descripción (opcional)</Label>
              <Input
                placeholder="Descripción del producto"
                value={formProducto.descripcion}
                onChange={e => setFormProducto({ ...formProducto, descripcion: e.target.value })}
              />
            </div>
            <Button className="w-full mt-2 border-bg-black hover:bg-slate-300 font-bold py-2 px-4 rounded-md" onClick={handleSubmitProducto}>
              {editingProducto ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal panel de variantes */}
      <Dialog open={openVariantes} onOpenChange={setOpenVariantes}>
        <DialogContent className="bg-white max-w-3xl max-h-[90vh] overflow-y-auto" size="lg">
          <DialogHeader>
            <DialogTitle>Variantes — {productoSeleccionado?.nombre}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="flex justify-end">
              <Button 
                className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md'
                onClick={openCreateVariante}>+ Nueva variante</Button>
            </div>

            {productoSeleccionado?.variantes.length === 0 ? (
              <p className="text-center text-gray-400 py-6">
                Este producto no tiene variantes aún. Agrega una con el botón de arriba.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b bg-gray-50">
                    <th className="px-3 py-2">Tamaño</th>
                    <th className="px-3 py-2">Material</th>
                    <th className="px-3 py-2">Tipo</th>
                    <th className="px-3 py-2">Paquete</th>
                    <th className="px-3 py-2">Sin fact.</th>
                    <th className="px-3 py-2">Con fact.</th>
                    <th className="px-3 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productoSeleccionado?.variantes.map(v => (
                    <tr key={v.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-3 py-2">{v.tamanoMl} ml</td>
                      <td className="px-3 py-2">{v.material}</td>
                      <td className="px-3 py-2">{v.tipo}</td>
                      <td className="px-3 py-2">{v.cantidadPaquete} u.</td>
                      <td className="px-3 py-2 text-green-700 font-medium">Bs. {v.precioSinFactura}</td>
                      <td className="px-3 py-2 text-blue-700 font-medium">Bs. {v.precioConFactura}</td>
                      <td className="px-3 py-2 flex gap-2">
                        <Button 
                          className='bg-slate-100 hover:bg-slate-300 font-bold py-2 px-4 rounded-md'
                          size="sm" variant="outline" onClick={() => openEditVariante(v)}>Editar</Button>
                        <Button 
                          className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md'
                          size="sm" variant="destructive" onClick={() => handleDeleteVariante(v.id)}>Eliminar</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal crear/editar variante */}
      <Dialog open={openVariante} onOpenChange={setOpenVariante}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>
              {editingVariante ? 'Editar variante' : `Nueva variante — ${productoSeleccionado?.nombre}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {camposVariante.map(f => (
              <div key={f.key}>
                <Label>{f.label}</Label>
                <Input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={formVariante[f.key]}
                  onChange={e => setFormVariante({ ...formVariante, [f.key]: e.target.value })}
                />
              </div>
            ))}
            <Button className="w-full mt-2 border-bg-black hover:bg-slate-300 font-bold py-2 px-4 rounded-md" onClick={handleSubmitVariante}>
              {editingVariante ? 'Guardar cambios' : 'Crear variante'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}