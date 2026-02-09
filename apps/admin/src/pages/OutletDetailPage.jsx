import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, MapPin, Store, Settings } from 'lucide-react'

export default function OutletDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [branch, setBranch] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/branches/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setBranch(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

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
        <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
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
    </div>
  )
}
