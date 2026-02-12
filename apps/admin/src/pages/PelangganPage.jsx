import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Pencil, Trash2, UserCheck, Search } from 'lucide-react'
import Modal from '@/components/Modal'

const typeColors = {
  reguler: 'bg-background text-text-muted',
  member: 'bg-cyan-light text-cyan',
}

const TYPES = ['reguler', 'member']

const EMPTY_FORM = {
  name: '',
  phone: '',
  type: 'reguler',
  address: '',
}

export default function PelangganPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const debounceRef = useRef(null)

  const fetchCustomers = useCallback((searchTerm = '') => {
    const params = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''
    fetch(`/api/customers${params}`)
      .then((res) => res.json())
      .then((data) => {
        setCustomers(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  function handleSearchChange(value) {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchCustomers(value)
    }, 300)
  }

  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError('')
    setModalOpen(true)
  }

  function openEdit(customer) {
    setEditing(customer)
    setForm({
      name: customer.name || '',
      phone: customer.phone || '',
      type: customer.type || 'reguler',
      address: customer.address || '',
    })
    setError('')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
    setError('')
  }

  async function handleSave(e) {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) {
      setError('Nama wajib diisi')
      return
    }

    if (!form.phone.trim()) {
      setError('Nomor telepon wajib diisi')
      return
    }

    if (!/^628\d{8,13}$/.test(form.phone.trim())) {
      setError('Format telepon: 628xxxxxxxxxx')
      return
    }

    setSaving(true)

    const url = editing ? `/api/customers/${editing.id}` : '/api/customers'
    const method = editing ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan')
        setSaving(false)
        return
      }

      closeModal()
      fetchCustomers(search)
    } catch {
      setError('Gagal menyimpan. Periksa koneksi.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(customer) {
    if (!window.confirm(`Hapus pelanggan "${customer.name}"?`)) return

    try {
      const res = await fetch(`/api/customers/${customer.id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchCustomers(search)
      } else {
        const data = await res.json()
        alert(data.error || 'Gagal menghapus pelanggan')
      }
    } catch {
      // ignore
    }
  }

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (loading) {
    return <div className="text-text-muted">Memuat data pelanggan...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-navy">Pelanggan</h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-cyan text-navy font-semibold text-sm rounded-lg hover:bg-cyan/80 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah Pelanggan
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Cari nama atau nomor telepon..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30 focus:border-cyan"
        />
      </div>

      {customers.length === 0 ? (
        <div className="bg-surface rounded-xl shadow-sm border border-border p-12 text-center">
          <UserCheck className="w-12 h-12 text-text-muted/40 mx-auto mb-4" />
          <p className="text-text-muted">
            {search
              ? 'Tidak ada pelanggan yang cocok dengan pencarian.'
              : 'Belum ada pelanggan. Klik tombol Tambah Pelanggan untuk memulai.'}
          </p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Telepon
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider hidden sm:table-cell">
                    Total Transaksi
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">
                    Terakhir Transaksi
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Tipe
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-navy">{cust.name}</td>
                    <td className="px-6 py-4 text-text-muted">{cust.phone || '-'}</td>
                    <td className="px-6 py-4 text-text-muted hidden sm:table-cell">
                      {cust.total_orders || 0}
                    </td>
                    <td className="px-6 py-4 text-text-muted hidden md:table-cell">
                      {formatDate(cust.last_order)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          typeColors[cust.type] || typeColors.reguler
                        }`}
                      >
                        {cust.type === 'member' ? 'Member' : 'Reguler'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(cust)}
                          className="p-2 rounded-lg hover:bg-background text-text-muted hover:text-navy transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cust)}
                          className="p-2 rounded-lg hover:bg-red-50 text-text-muted hover:text-danger transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-danger text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-navy mb-1">Nama *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              placeholder="Nama lengkap"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30 focus:border-cyan"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy mb-1">Telepon *</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => updateForm('phone', e.target.value.replace(/\D/g, ''))}
              placeholder="628xxxxxxxxxx"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30 focus:border-cyan"
              required
            />
            <p className="text-xs text-text-muted mt-1">Format: 628xxxxxxxxxx</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy mb-1">Tipe</label>
            <select
              value={form.type}
              onChange={(e) => updateForm('type', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30 focus:border-cyan"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy mb-1">Alamat</label>
            <textarea
              value={form.address}
              onChange={(e) => updateForm('address', e.target.value)}
              placeholder="Alamat lengkap (opsional)"
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30 focus:border-cyan resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm text-text-muted hover:text-navy transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-cyan text-navy font-semibold text-sm rounded-lg hover:bg-cyan/80 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
