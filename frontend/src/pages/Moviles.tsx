import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import api from '../api/axios'
import type { Movil } from '../types'


const empty = { nombre: '', placa: '' }

export default function Moviles() {
  const [moviles, setMoviles] = useState<Movil[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Movil | null>(null)
  const [form, setForm] = useState(empty)
  const [historialMovil, setHistorialMovil] = useState<any[]>([])
  const [movilHistorial, setMovilHistorial] = useState<Movil | null>(null)

  const load = () => api.get('/moviles').then(r => setMoviles(r.data))
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true) }
  const openEdit = (m: Movil) => {
    setEditing(m); setForm({ nombre: m.nombre, placa: m.placa ?? '' }); setOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.nombre.trim()) { alert('El nombre es requerido'); return }
    try {
      if (editing) await api.put(`/moviles/${editing.id}`, form)
      else await api.post('/moviles', form)
      setOpen(false); load()
    } catch (e: any) {
      alert(e?.response?.data?.error ?? 'Error al guardar')
    }
  }

  const handleToggleActivo = async (m: Movil) => {
    await api.put(`/moviles/${m.id}`, { ...m, activo: !m.activo })
    load()
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este móvil?')) { await api.delete(`/moviles/${id}`); load() }
  }

  const verHistorial = async (m: Movil) => {
    const res = await api.get(`/moviles/${m.id}/historial`)
    setHistorialMovil(res.data)
    setMovilHistorial(m)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Móviles</h1>
        <Button 
        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md' 
        onClick={openCreate}>+ Nuevo móvil</Button>
        
      </div>

      <Card className='rounded-lg border'>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b bg-gray-50">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Placa</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {moviles.map(m => (
                <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{m.nombre}</td>
                  <td className="px-4 py-3 text-gray-500">{m.placa ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {m.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <Button 
                    className='bg-slate-100 hover:bg-slate-300 font-bold py-2 px-4 rounded-md'
                    size="sm" variant="outline" onClick={() => verHistorial(m)}>Historial</Button>
                    <Button 
                    className='bg-slate-100 hover:bg-slate-300 font-bold py-2 px-4 rounded-md'
                    size="sm" variant="outline" onClick={() => openEdit(m)}>Editar</Button>
                    <Button 
                    className='bg-slate-100 hover:bg-slate-300 font-bold py-2 px-4 rounded-md'
                    size="sm" variant="outline" onClick={() => handleToggleActivo(m)}>
                      {m.activo ? 'Desactivar' : 'Activar'}
                    </Button>
                    <Button 
                    className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md'
                    size="sm" variant="destructive" onClick={() => handleDelete(m.id)}>Eliminar</Button>
                  </td>
                </tr>
              ))}
              {moviles.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">No hay móviles</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Modal crear/editar */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar móvil' : 'Nuevo móvil'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label>Nombre</Label>
              <Input placeholder="Ej: Móvil 1, Camioneta A"
                value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div>
              <Label>Placa (opcional)</Label>
              <Input placeholder="Ej: 1234ABC"
                value={form.placa} onChange={e => setForm({ ...form, placa: e.target.value })} />
            </div>
            <Button className="w-full border-bg-black hover:bg-slate-300 font-bold py-2 px-4 rounded-md" onClick={handleSubmit}>
              {editing ? 'Guardar cambios' : 'Crear móvil'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal historial del móvil */}
      <Dialog open={!!movilHistorial} onOpenChange={() => { setMovilHistorial(null); setHistorialMovil([]) }}>
        <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Historial — {movilHistorial?.nombre}</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            {historialMovil.length === 0 ? (
              <p className="text-center text-gray-400 py-6">Sin entregas registradas</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b bg-gray-50">
                    <th className="px-3 py-2">Empresa</th>
                    <th className="px-3 py-2">Producto</th>
                    <th className="px-3 py-2">Cantidad</th>
                    <th className="px-3 py-2">Salida</th>
                  </tr>
                </thead>
                <tbody>
                  {historialMovil.map((e: any) => (
                    <tr key={e.id} className="border-b last:border-0">
                      <td className="px-3 py-2 font-medium">{e.pedido.cliente.empresa}</td>
                      <td className="px-3 py-2">{e.pedido.variante.producto.nombre} {e.pedido.variante.tamanoMl}ml</td>
                      <td className="px-3 py-2">{e.pedido.cantidad}</td>
                      <td className="px-3 py-2 text-gray-500">{new Date(e.fechaSalida).toLocaleDateString('es-BO')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

