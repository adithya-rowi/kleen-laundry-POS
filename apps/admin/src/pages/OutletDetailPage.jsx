import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, MapPin, Store, Settings, Search, ClipboardList } from 'lucide-react'

const categoryColors = {
  kiloan: 'bg-cyan-light text-cyan',
  unit: 'bg-royal-light text-royal',
  luas: 'bg-amber-50 text-warning',
}

function formatRupiah(price) {
  if (!price) return 'Rp 0'
  return `Rp ${price.toLocaleString('id-ID')}`
}

function formatDuration(days) {
  if (!days || days <= 0) return '-'
  return `${days} Hari`
}

export default function OutletDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [branch, setBranch] = useState(null)
  const [loading, setLoading] = useState(true)

  const [services, setServices] = useState([])
  const [servicesLoading, setServicesLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    fetch(`/api/branches/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setBranch(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  useEffect(() => {
    fetch(`/api/services?branch_id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        setServices(Array.isArray(data) ? data : [])
        setServicesLoading(false)
      })
      .catch(() => setServicesLoading(false))
  }, [id])

  const filtered = services.filter((svc) => {
    const matchSearch = !search || svc.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = !categoryFilter || svc.category === categoryFilter
    return matchSearch && matchCategory
  })

  if (loading) return <div className="text-text-muted">Memuat...</div>
  if (!branch) return <div className="text-danger">Outlet tidak ditemukan</div>

  return (
    <div>
      <button
        onClick={() => navigate('/outlet')}
        className="flex items-center gap-2 text-text-muted hover:text-navy mb-4 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="bg-surface rounded-xl shadow-sm border border-border p-6 mb-6">
        <h2 className="text-2xl font-bold text-navy mb-4">{branch.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-cyan shrink-0" />
            <span>{branch.city || '-'} {branch.address ? `- ${branch.address}` : ''}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-cyan shrink-0" />
            <span>{branch.phone || '-'}</span>
          </div>
          <div className="flex items-center gap-3">
            <Store className="w-4 h-4 text-cyan shrink-0" />
            <span>{branch.type === 'production' ? 'Production' : 'Drop Off Only'}</span>
          </div>
        </div>
      </div>

      {branch.production_stages && branch.production_stages.length > 0 && (
        <div className="bg-surface rounded-xl shadow-sm border border-border p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-navy" />
            <h3 className="text-lg font-bold text-navy">Tahapan Produksi</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {branch.production_stages.map((stage, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-cyan-light text-cyan rounded-full text-sm font-medium"
              >
                {i + 1}. {stage.stage_name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Daftar Layanan */}
      <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-navy" />
            <h3 className="text-lg font-bold text-navy">Daftar Layanan</h3>
          </div>
          <span className="text-sm text-text-muted">
            Total: {services.length} layanan
          </span>
        </div>

        {servicesLoading ? (
          <div className="text-text-muted py-8 text-center">Memuat layanan...</div>
        ) : services.length === 0 ? (
          <div className="text-text-muted py-8 text-center">
            Belum ada layanan untuk outlet ini.
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Cari layanan..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30 focus:border-cyan"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30 focus:border-cyan"
              >
                <option value="">Semua Kategori</option>
                <option value="kiloan">Kiloan</option>
                <option value="unit">Unit</option>
                <option value="luas">Luas</option>
              </select>
            </div>

            {/* Table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-background">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                        Nama Layanan
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                        Harga
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider hidden sm:table-cell">
                        Satuan
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">
                        Durasi
                      </th>
                      <th className="text-center px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">
                        Min Order
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider hidden lg:table-cell">
                        Kategori
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((svc) => (
                      <tr key={svc.id} className="hover:bg-background/50 transition-colors">
                        <td className="px-6 py-3 font-medium text-navy text-sm">
                          {svc.name}
                        </td>
                        <td className="px-6 py-3 text-sm text-right whitespace-nowrap">
                          {formatRupiah(svc.price)}
                        </td>
                        <td className="px-6 py-3 text-sm text-text-muted hidden sm:table-cell">
                          {svc.unit}
                        </td>
                        <td className="px-6 py-3 text-sm text-text-muted hidden md:table-cell">
                          {formatDuration(svc.turnaround_days)}
                        </td>
                        <td className="px-6 py-3 text-sm text-center text-text-muted hidden md:table-cell">
                          {svc.min_quantity}
                        </td>
                        <td className="px-6 py-3 hidden lg:table-cell">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                              categoryColors[svc.category] || 'bg-background text-text-muted'
                            }`}
                          >
                            {svc.category}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer count */}
            <div className="mt-3 text-right text-sm text-text-muted">
              Menampilkan {filtered.length} dari {services.length} layanan
            </div>
          </>
        )}
      </div>
    </div>
  )
}
