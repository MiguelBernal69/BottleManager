import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import api from '../api/axios'
import type { Cliente } from '../types'

const DEPARTAMENTOS = [
  { value: 'cochabamba', label: 'Cochabamba' },
  { value: 'santa_cruz', label: 'Santa Cruz' },
  { value: 'la_paz', label: 'La Paz' },
  { value: 'oruro', label: 'Oruro' },
  { value: 'potosi', label: 'Potosí' },
  { value: 'sucre', label: 'Sucre' },
  { value: 'tarija', label: 'Tarija' },
  { value: 'beni', label: 'Beni' },
  { value: 'pando', label: 'Pando' },
]

const empty = { empresa: '', nombreCliente: '', telefono: '', direccion: '', departamento: 'cochabamba' }

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [form, setForm] = useState(empty)
  const [search, setSearch] = useState('')

  const load = () => api.get('/clientes').then(r => setClientes(r.data))
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true) }
  const openEdit = (c: Cliente) => {
    setEditing(c)
    setForm({
      empresa: c.empresa,
      nombreCliente: c.nombreCliente ?? '',
      telefono: c.telefono ?? '',
      direccion: c.direccion ?? '',
      departamento: c.departamento ?? 'cochabamba',
    })
    setOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.empresa.trim()) { alert('La empresa es requerida'); return }
    try {
      if (editing) await api.put(`/clientes/${editing.id}`, form)
      else await api.post('/clientes', form)
      setOpen(false); load()
    } catch (e: any) {
      alert(e?.response?.data?.error ?? 'Error al guardar')
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este cliente?')) { await api.delete(`/clientes/${id}`); load() }
  }

  const filtered = clientes.filter(c =>
    c.empresa.toLowerCase().includes(search.toLowerCase()) ||
    (c.nombreCliente ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const deptLabel = (v?: string) => DEPARTAMENTOS.find(d => d.value === v)?.label ?? v ?? '—'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Clientes</h1>
        <Button 
        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md'
        onClick={openCreate}>+ Nuevo cliente</Button>
      </div>

      <Input  placeholder="Buscar empresa o contacto..." value={search}
        onChange={e => setSearch(e.target.value)} className="max-w-xs rounded-md" />

      <Card className='rounded-lg border'>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b bg-gray-50">
                <th className="px-4 py-3">Empresa</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Departamento</th>
                <th className="px-4 py-3">Dirección</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.empresa}</td>
                  <td className="px-4 py-3 text-gray-500">{c.nombreCliente ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{c.telefono ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{deptLabel(c.departamento)}</td>
                  <td className="px-4 py-3 text-gray-500">{c.direccion ?? '—'}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <Button 
                    className='bg-slate-100 hover:bg-slate-300 font-bold py-2 px-4 rounded-md'
                    size="sm" variant="outline" onClick={() => openEdit(c)}>Editar</Button>
                    <Button 
                    className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md'
                    size="sm" variant="destructive" onClick={() => handleDelete(c.id)}>Eliminar</Button>
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
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label>Empresa</Label>
              <Input value={form.empresa} placeholder="Nombre de la empresa"
                onChange={e => setForm({ ...form, empresa: e.target.value })} />
            </div>
            <div>
              <Label>Nombre de contacto (opcional)</Label>
              <Input value={form.nombreCliente} placeholder="Nombre del contacto"
                onChange={e => setForm({ ...form, nombreCliente: e.target.value })} />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input value={form.telefono} placeholder="Teléfono"
                onChange={e => setForm({ ...form, telefono: e.target.value })} />
            </div>
            <div>
              <Label>Departamento</Label>
              <Select value={form.departamento} onValueChange={v => setForm({ ...form, departamento: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEPARTAMENTOS.map(d => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Dirección (opcional)</Label>
              <Input value={form.direccion} placeholder="Dirección"
                onChange={e => setForm({ ...form, direccion: e.target.value })} />
            </div>
            <Button

              className="w-full mt-2 border-bg-black hover:bg-slate-300 font-bold py-2 px-4 rounded-md" onClick={handleSubmit}>
              {editing ? 'Guardar cambios' : 'Crear cliente'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}