export default function StatCard({ icon: Icon, label, value, color = 'cyan' }) {
  const colorMap = {
    cyan: 'bg-cyan-light text-cyan',
    royal: 'bg-royal-light text-royal',
    navy: 'bg-navy/10 text-navy',
    warning: 'bg-amber-50 text-warning',
  }

  return (
    <div className="bg-surface rounded-xl p-6 shadow-sm border border-border">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-text-muted">{label}</p>
          <p className="text-2xl font-bold text-text">{value}</p>
        </div>
      </div>
    </div>
  )
}
