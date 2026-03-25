import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import api from '../api/axios'
import type { Cliente } from '../types'

const empty = { empresa: '', nombreCliente: '', telefono: '', direccion: '', departamento: '' }

const DEPARTAMENTO_LABELS: Record<string, string> = {
  cochabamba: 'Cochabamba',
  santa_cruz: 'Santa Cruz',
  la_paz: 'La Paz',
  oruro: 'Oruro',
  potosi: 'Potosí',
  beni: 'Beni',
  tarija: 'Tarija',
  sucre: 'Sucre',
  pando: 'Pando'
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [form, setForm] = useState<typeof empty>(empty)
  const [search, setSearch] = useState('')

  const load = () => api.get('/clientes').then(r => setClientes(r.data))
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true) }
  const openEdit = (c: Cliente) => { setEditing(c); setForm({ empresa: c.empresa, nombreCliente: c.nombreCliente ?? '', telefono: c.telefono ?? '', direccion: c.direccion ?? '', departamento: c.departamento ?? '' }); setOpen(true) }

  const handleSubmit = async () => {
    if (editing) await api.put(`/clientes/${editing.id}`, form)
    else await api.post('/clientes', form)
    setOpen(false); load()
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este cliente?')) { await api.delete(`/clientes/${id}`); load() }
  }

  const filtered = clientes.filter(c => c.empresa.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Clientes</h1>
        <Button onClick={openCreate}>+ Nuevo cliente</Button>
      </div>

      <Input placeholder="Buscar por nombre..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs rounded-md" />

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b bg-gray-50">
                <th className="px-4 py-3">Empresa</th>
                <th className="px-4 py-3">Nombre del cliente</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Dirección</th>
                <th className="px-4 py-3">Departamento</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.empresa}</td>
                  <td className="px-4 py-3 text-gray-500">{c.nombreCliente ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{c.telefono ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{c.direccion ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{DEPARTAMENTO_LABELS[c.departamento as keyof typeof DEPARTAMENTO_LABELS]}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <Button size="sm"
                      className='bg-blue-500 hover:bg-blue-600 text-white rounded-md'
                      variant="outline" onClick={() => openEdit(c)}>Editar</Button>
                    <Button size="sm"
                      className='bg-red-500 hover:bg-red-600 text-white rounded-md'
                       variant="destructive" onClick={() => handleDelete(c.id)}>Eliminar</Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">No hay clientes</td></tr>
              )}
            </tbody>
          </table>  
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className='text-base'>{editing ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {(['empresa', 'nombreCliente', 'telefono', 'direccion'] as const).map(field => (
              <div key={field}>
                <Label className="capitalize text-gray-900 text-sm">{field}</Label>
                <Input className='rounded-md border-gray-400 hover:border-gray-500 focus:ring-2 focus:ring-blue-500' 
                  value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} />
              </div>
            ))}
            {/* Campo Departamento como select */}
              <div>
                <Label className="capitalize text-gray-900 text-sm">Departamento</Label>
                <select
                  value={form.departamento}
                  onChange={e => setForm({ ...form, departamento: e.target.value })}
                  className='w-full rounded-md border-gray-400 hover:border-gray-500 focus:ring-2 focus:ring-blue-500 p-2'
                >
                  <option value="">Selecciona un departamento</option>
                  {Object.entries(DEPARTAMENTO_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

            <Button className="w-full mt-2" onClick={handleSubmit}>
              {editing ? 'Guardar cambios' : 'Crear cliente'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}