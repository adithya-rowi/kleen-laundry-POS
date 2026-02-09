import { useState, useEffect } from 'react'
import { Store, Users, UserCheck, Receipt } from 'lucide-react'
import StatCard from '@/components/StatCard'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-text-muted">Memuat data...</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-navy mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Store}
          label="Total Outlet"
          value={stats?.totalBranches ?? '-'}
          color="cyan"
        />
        <StatCard
          icon={Users}
          label="Total Karyawan"
          value={stats?.totalEmployees ?? '-'}
          color="royal"
        />
        <StatCard
          icon={UserCheck}
          label="Total Pelanggan"
          value={stats?.totalCustomers ?? '-'}
          color="navy"
        />
        <StatCard
          icon={Receipt}
          label="Transaksi Hari Ini"
          value={stats?.todayOrders ?? '-'}
          color="warning"
        />
      </div>
    </div>
  )
}
