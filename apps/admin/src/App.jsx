import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import OutletPage from '@/pages/OutletPage'
import OutletDetailPage from '@/pages/OutletDetailPage'
import KaryawanPage from '@/pages/KaryawanPage'
import PelangganPage from '@/pages/PelangganPage'
import TransaksiPage from '@/pages/TransaksiPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/outlet" element={<OutletPage />} />
        <Route path="/outlet/:id" element={<OutletDetailPage />} />
        <Route path="/karyawan" element={<KaryawanPage />} />
        <Route path="/pelanggan" element={<PelangganPage />} />
        <Route path="/transaksi" element={<TransaksiPage />} />
      </Route>
    </Routes>
  )
}
