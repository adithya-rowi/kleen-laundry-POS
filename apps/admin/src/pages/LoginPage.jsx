import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError('Email atau password salah')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-navy">KLEEN LAUNDRY</h1>
          <p className="text-text-muted text-sm mt-1">Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-danger text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-royal/50 focus:border-royal"
              placeholder="admin@kleenlaundry.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-royal/50 focus:border-royal"
              placeholder="Masukkan password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-royal text-white font-semibold rounded-lg hover:bg-royal/90 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Memuat...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}
