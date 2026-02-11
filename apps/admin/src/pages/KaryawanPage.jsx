import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'
import Modal from '@/components/Modal'

const roleColors = {
  kasir: 'bg-cyan-light text-cyan',
  kurir: 'bg-royal-light text-royal',
  produksi: 'bg-amber-50 text-warning',
  admin: 'bg-navy/10 text-navy',
}

const ROLES = ['admin', 'kasir', 'kurir', 'produksi']

const EMPTY_FORM = {
  name: '',
  username: '',
  phone: '',
  role: 'kasir',
  branch_id: '',
  pin: '',
  is_active: true,
}

function autoUsername(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
}

export default function KaryawanPage() {
  const [employees, setEmployees] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchEmployees = useCallback(() => {
    fetch('/api/employees')
      .then((res) => res.json())
      .then((data) => {
        setEmployees(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchEmployees()
    fetch('/api/branches')
      .then((res) => res.json())
      .then((data) => setBranches(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [fetchEmployees])

  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError('')
    setModalOpen(true)
  }

  function openEdit(emp) {
    setEditing(emp)
    setForm({
      name: emp.name || '',
      username: emp.username || '',
      phone: emp.phone || '',
      role: emp.role || 'kasir',
      branch_id: emp.branch_id || '',
      pin: emp.pin || '',
      is_active: emp.is_active !== false,
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

    if (form.pin && !/^\d{4}$/.test(form.pin)) {
      setError('PIN harus 4 digit angka')
      return
    }

    setSaving(true)

    const url = editing ? `/api/employees/${editing.id}` : '/api/employees'
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
      fetchEmployees()
    } catch {
      setError('Gagal menyimpan. Periksa koneksi.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(emp) {
    if (!window.confirm(`Hapus karyawan "${emp.name}"?`)) return

    try {
      const res = await fetch(`/api/employees/${emp.id}`, { method: 'DELETE' })
      if (res.ok) fetchEmployees()
    } catch {
      // ignore
    }
  }

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return <div className="text-text-muted">Memuat data karyawan...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-navy">Karyawan</h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-cyan text-navy font-semibold text-sm rounded-lg hover:bg-cyan/80 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah Karyawan
        </button>
      </div>

      {employees.length === 0 ? (
        <div className="bg-surface rounded-xl shadow-sm border border-border p-12 text-center">
          <Users className="w-12 h-12 text-text-muted/40 mx-auto mb-4" />
          <p className="text-text-muted">
            Belum ada karyawan. Klik tombol Tambah Karyawan untuk memulai.
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
                    Role
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">
                    Outlet
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider hidden sm:table-cell">
                    Telepon
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-navy">{emp.name}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          roleColors[emp.role] || 'bg-background text-text-muted'
                        }`}
                      >
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-muted hidden md:table-cell">
                      {emp.branches?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-text-muted hidden sm:table-cell">
                      {emp.phone || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          emp.is_active !== false
                            ? 'bg-cyan-light text-success'
                            : 'bg-red-50 text-danger'
                        }`}
                      >
                        {emp.is_active !== false ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(emp)}
                          className="p-2 rounded-lg hover:bg-background text-text-muted hover:text-navy transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp)}
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
        title={editing ? 'Edit Karyawan' : 'Tambah Karyawan'}
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
              onChange={(e) => {
                const name = e.target.value
                updateForm('name', name)
                if (!editing) updateForm('username', autoUsername(name))
              }}
              placeholder="Nama lengkap"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30 focus:border-cyan"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy mb-1">Username *</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => updateForm('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="nama_pengguna"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30 focus:border-cyan"
              required
            />
            {!editing && (
              <p className="text-xs text-text-muted mt-1">Otomatis dari nama, bisa diedit</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-navy mb-1">Telepon</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => updateForm('phone', e.target.value)}
              placeholder="628xxxxxxxxxx"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30 focus:border-cyan"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => updateForm('role', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30 focus:border-cyan"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1">PIN (4 digit)</label>
              <input
                type="text"
                value={form.pin}
                onChange={(e) => updateForm('pin', e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="1234"
                maxLength={4}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30 focus:border-cyan"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy mb-1">Outlet</label>
            <select
              value={form.branch_id}
              onChange={(e) => updateForm('branch_id', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30 focus:border-cyan"
            >
              <option value="">— Pilih Outlet —</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {editing && (
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-navy">Status</label>
              <button
                type="button"
                onClick={() => updateForm('is_active', !form.is_active)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  form.is_active ? 'bg-cyan' : 'bg-border'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    form.is_active ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm text-text-muted">
                {form.is_active ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
          )}

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
