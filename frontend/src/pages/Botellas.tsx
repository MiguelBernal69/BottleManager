import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import api from '../api/axios'
import type { Botella } from '../types'

const empty = { nombre: '', tamano: '', color: '', forma: '', material: '', precioBase: '', descripcion: '' }

export default function Botellas() {
  const [botellas, setBotellas] = useState<Botella[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Botella | null>(null)
  const [form, setForm] = useState(empty)
  const [search, setSearch] = useState('')

  const load = () => api.get('/botellas').then(r => setBotellas(r.data))
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true) }
  const openEdit = (b: Botella) => {
    setEditing(b)
    setForm({ nombre: b.nombre, tamano: b.tamano, color: b.color, forma: b.forma, material: b.material ?? '', precioBase: String(b.precioBase), descripcion: b.descripcion ?? '' })
    setOpen(true)
  }

  const handleSubmit = async () => {
    const data = { ...form, precioBase: Number(form.precioBase) }
    if (editing) await api.put(`/botellas/${editing.id}`, data)
    else await api.post('/botellas', data)
    setOpen(false); load()
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar esta botella?')) { await api.delete(`/botellas/${id}`); load() }
  }

  const filtered = botellas.filter(b => b.nombre.toLowerCase().includes(search.toLowerCase()))

  const campos = [
    { key: 'nombre', label: 'Nombre' }, { key: 'tamano', label: 'Tamaño' },
    { key: 'color', label: 'Color' }, { key: 'forma', label: 'Forma' },
    { key: 'material', label: 'Material' }, { key: 'precioBase', label: 'Precio base' },
    { key: 'descripcion', label: 'Descripción' },
  ] as const

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Botellas</h1>
        <Button onClick={openCreate}>+ Nueva botella</Button>
      </div>

      <Input placeholder="Buscar por nombre..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b bg-gray-50">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Tamaño</th>
                <th className="px-4 py-3">Color</th>
                <th className="px-4 py-3">Forma</th>
                <th className="px-4 py-3">Precio base</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{b.nombre}</td>
                  <td className="px-4 py-3">{b.tamano}</td>
                  <td className="px-4 py-3">{b.color}</td>
                  <td className="px-4 py-3">{b.forma}</td>
                  <td className="px-4 py-3 font-medium text-green-700">Bs. {b.precioBase.toFixed(2)}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(b)}>Editar</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(b.id)}>Eliminar</Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">No hay botellas</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar botella' : 'Nueva botella'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {campos.map(f => (
              <div key={f.key}>
                <Label>{f.label}</Label>
                <Input value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}
            <Button className="w-full mt-2" onClick={handleSubmit}>
              {editing ? 'Guardar cambios' : 'Crear botella'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}