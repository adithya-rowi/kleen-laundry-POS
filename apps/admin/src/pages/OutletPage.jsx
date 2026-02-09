import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export default function OutletPage() {
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/branches')
      .then((res) => res.json())
      .then((data) => {
        setBranches(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-text-muted">Memuat data outlet...</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-navy mb-6">Outlet</h2>
      <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Nama</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Kota</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider hidden sm:table-cell">Telepon</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Tipe</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {branches.map((branch) => (
                <tr
                  key={branch.id}
                  onClick={() => navigate(`/outlet/${branch.id}`)}
                  className="hover:bg-background/50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-navy">{branch.name}</td>
                  <td className="px-6 py-4 text-text-muted">{branch.city || '-'}</td>
                  <td className="px-6 py-4 text-text-muted hidden sm:table-cell">{branch.phone || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                      branch.type === 'production'
                        ? 'bg-cyan-light text-cyan'
                        : 'bg-royal-light text-royal'
                    }`}>
                      {branch.type === 'production' ? 'Production' : 'Drop Off'}
                    </span>
                  </td>
                  <td className="px-4">
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
