import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import api from '../api/axios'
import type { Cliente } from '../types'

const empty = { nombre: '', email: '', telefono: '', direccion: '' }

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [form, setForm] = useState(empty)
  const [search, setSearch] = useState('')

  const load = () => api.get('/clientes').then(r => setClientes(r.data))
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true) }
  const openEdit = (c: Cliente) => { setEditing(c); setForm({ nombre: c.nombre, email: c.email ?? '', telefono: c.telefono ?? '', direccion: c.direccion ?? '' }); setOpen(true) }

  const handleSubmit = async () => {
    if (editing) await api.put(`/clientes/${editing.id}`, form)
    else await api.post('/clientes', form)
    setOpen(false); load()
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este cliente?')) { await api.delete(`/clientes/${id}`); load() }
  }

  const filtered = clientes.filter(c => c.nombre.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Clientes</h1>
        <Button onClick={openCreate}>+ Nuevo cliente</Button>
      </div>

      <Input placeholder="Buscar por nombre..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b bg-gray-50">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Dirección</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.nombre}</td>
                  <td className="px-4 py-3 text-gray-500">{c.email ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{c.telefono ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{c.direccion ?? '—'}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(c)}>Editar</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(c.id)}>Eliminar</Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No hay clientes</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {(['nombre', 'email', 'telefono', 'direccion'] as const).map(field => (
              <div key={field}>
                <Label className="capitalize">{field}</Label>
                <Input value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} />
              </div>
            ))}
            <Button className="w-full mt-2" onClick={handleSubmit}>
              {editing ? 'Guardar cambios' : 'Crear cliente'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}