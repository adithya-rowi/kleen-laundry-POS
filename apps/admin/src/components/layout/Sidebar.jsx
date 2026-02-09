import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/cn'
import {
  LayoutDashboard,
  Store,
  Users,
  UserCheck,
  Receipt,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/outlet', label: 'Outlet', icon: Store },
  { to: '/karyawan', label: 'Karyawan', icon: Users },
  { to: '/pelanggan', label: 'Pelanggan', icon: UserCheck },
  { to: '/transaksi', label: 'Transaksi', icon: Receipt },
]

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold text-white tracking-wide">
          KLEEN LAUNDRY
        </h1>
        <p className="text-xs text-cyan mt-1">Admin Dashboard</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-cyan text-navy'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors w-full cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          Keluar
        </button>
      </div>
    </div>
  )

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-navy text-white rounded-lg cursor-pointer"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-screen w-64 bg-navy z-40 transition-transform duration-200',
          'md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
