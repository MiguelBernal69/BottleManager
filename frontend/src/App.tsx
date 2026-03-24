import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Clientes from './pages/Clientes'
import Botellas from './pages/Botellas'
import Ventas from './pages/Ventas'
import Seguimiento from './pages/Seguimiento'
import Historial from './pages/Historial'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/botellas" element={<Botellas />} />
            <Route path="/ventas" element={<Ventas />} />
            <Route path="/seguimiento" element={<Seguimiento />} />
            <Route path="/historial" element={<Historial />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App