import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import api from '../api/axios'
import type { Venta, Cliente, Botella, EstadoVenta } from '../types'

const ESTADO_LABELS: Record<string, string> = {
  registrado: 'Registrado', en_produccion: 'En producción',
  en_envio: 'En envío', entregado: 'Entregado',
}
const ESTADO_COLORS: Record<string, string> = {
  registrado: 'bg-gray-100 text-gray-700', en_produccion: 'bg-yellow-100 text-yellow-700',
  en_envio: 'bg-blue-100 text-blue-700', entregado: 'bg-green-100 text-green-700',
}
const ESTADOS: EstadoVenta[] = ['registrado', 'en_produccion', 'en_envio']

export default function Ventas() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [botellas, setBotellas] = useState<Botella[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ clienteId: '', botellaId: '', cantidad: '1', precioTotal: '', notas: '' })

  const load = () => api.get('/ventas').then(r => setVentas(r.data))
  useEffect(() => {
    load()
    api.get('/clientes').then(r => setClientes(r.data))
    api.get('/botellas').then(r => setBotellas(r.data))
  }, [])

  const handleSubmit = async () => {
    await api.post('/ventas', { ...form, clienteId: Number(form.clienteId), botellaId: Number(form.botellaId), cantidad: Number(form.cantidad), precioTotal: Number(form.precioTotal) })
    setOpen(false); load()
  }

  const handleEstado = async (id: number, estado: EstadoVenta) => {
    await api.patch(`/ventas/${id}/estado`, { estado }); load()
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar esta venta?')) { await api.delete(`/ventas/${id}`); load() }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Ventas</h1>
        <Button onClick={() => setOpen(true)}>+ Nueva venta</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b bg-gray-50">
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Botella</th>
                <th className="px-4 py-3">Cantidad</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map(v => (
                <tr key={v.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{v.cliente.nombre}</td>
                  <td className="px-4 py-3">{v.botella.nombre}</td>
                  <td className="px-4 py-3">{v.cantidad}</td>
                  <td className="px-4 py-3 font-medium text-green-700">Bs. {v.precioTotal.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <Select value={v.estado} onValueChange={val => handleEstado(v.id, val as EstadoVenta)}>
                      <SelectTrigger className="h-7 w-36 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS.map(e => (
                          <SelectItem key={e} value={e}>{ESTADO_LABELS[e]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(v.id)}>Eliminar</Button>
                  </td>
                </tr>
              ))}
              {ventas.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">No hay ventas</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nueva venta</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label>Cliente</Label>
              <Select value={form.clienteId} onValueChange={v => setForm({ ...form, clienteId: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                <SelectContent>{clientes.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Botella</Label>
              <Select value={form.botellaId} onValueChange={v => setForm({ ...form, botellaId: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar botella" /></SelectTrigger>
                <SelectContent>{botellas.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.nombre} — Bs. {b.precioBase}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cantidad</Label>
              <Input type="number" min={1} value={form.cantidad} onChange={e => setForm({ ...form, cantidad: e.target.value })} />
            </div>
            <div>
              <Label>Precio total (Bs.)</Label>
              <Input type="number" value={form.precioTotal} onChange={e => setForm({ ...form, precioTotal: e.target.value })} />
            </div>
            <div>
              <Label>Notas (opcional)</Label>
              <Input value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} />
            </div>
            <Button className="w-full mt-2" onClick={handleSubmit}>Crear venta</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}