import React, { useEffect, useMemo, useState } from 'react'
import http from '../services/http'
import '../App.css'

export interface Submission {
  id: number
  full_name: string
  x_profile?: string
  region?: string
  phone?: string
  niche?: string
  skills?: string
  category?: string
  followers?: string
  reason?: string
  created_at: string
}

interface StatsResponse {
  success: boolean
  total: number
  latest: string | null
}

interface ListResponse {
  page: number
  limit: number
  total: number
  submissions: Submission[]
}

interface AdminDashboardProps {
  onBack?: () => void
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [selected, setSelected] = useState<Submission | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [stats, setStats] = useState<{ total: number; latest: string | null }>({ total: 0, latest: null })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  // Filters & sort
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'name-asc' | 'name-desc'>('date-desc')
  const [filterNiche, setFilterNiche] = useState<string>('')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [filterFollowers, setFilterFollowers] = useState<string>('') // 'low', 'medium', 'high'

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    fetchSubmissions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortBy, filterNiche, filterCategory, filterFollowers])

  async function fetchStats() {
    try {
      const { data } = await http.get<StatsResponse>('/magnetx/community/stats')
      if (data.success) setStats({ total: data.total, latest: data.latest })
    } catch (e) {
      console.error(e)
    }
  }

  // Fallback: derive global total and latest from list endpoint (no filters)
  async function fetchGlobalTotalsFromList() {
    try {
      const { data } = await http.get<ListResponse>('/magnetx/community/submissions', { params: { page: 1, limit: 1, sort: 'date-desc' } })
      setStats(prev => ({ ...prev, total: data.total, latest: data.submissions[0]?.created_at || prev.latest }))
    } catch (e) {
      console.error('Failed to fetch global totals from list', e)
    }
  }

  async function fetchSubmissions() {
    setLoading(true)
    try {
      const params: any = { page, limit, sort: sortBy }
      if (filterNiche) params.niche = filterNiche
      if (filterCategory) params.category = filterCategory
      if (filterFollowers) params.followers = filterFollowers
      const { data } = await http.get<ListResponse>('/magnetx/community/submissions', { params })
      setSubmissions(data.submissions)
      setTotalPages(Math.ceil(data.total / limit))
      // Sync stats total when filters are NOT applied and the count differs (keeps "Total Submissions" accurate)
      const filtersApplied = !!(filterNiche || filterCategory || filterFollowers)
      if (!filtersApplied && data.total !== stats.total) {
        setStats(prev => ({ ...prev, total: data.total, latest: data.submissions[0]?.created_at || prev.latest }))
      }
      // Also trigger a fresh stats fetch in background (covers new submissions added elsewhere)
      fetchStats()
      // And update via global-list fallback to guarantee correctness across environments
      fetchGlobalTotalsFromList()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // When a submission list item is clicked, fetch full detail (in case list omits fields)
  async function openDetail(base: Submission) {
    setSelected(base)
    setDetailLoading(true)
    try {
      const { data } = await http.get<{ success: boolean; submission: Submission }>(`/magnetx/community/submissions/${base.id}`)
      if (data.success && data.submission) {
        setSelected(data.submission)
      }
    } catch (e) {
      console.error('Failed to load submission detail', e)
    } finally {
      setDetailLoading(false)
    }
  }

  const latestApplicant = useMemo(() => {
    if (submissions.length) return submissions[0]
    return null
  }, [submissions])

  function resetFilters() {
    setSortBy('date-desc')
    setFilterNiche('')
    setFilterCategory('')
    setFilterFollowers('')
    setPage(1)
  }

  async function refreshAll() {
    await Promise.all([fetchStats(), fetchGlobalTotalsFromList()])
    // Optionally reload current page to reflect any new items
    await fetchSubmissions()
  }

  return (
    <main className="mx-container" style={{ maxWidth: 1080 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>Admin • MagnetX Submissions</h1>
          <p style={{ marginTop: 0, color: 'var(--text-muted)' }}>Review and manage community application submissions.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={refreshAll} title="Refresh stats and list">↻ Refresh</button>
          {onBack && <button className="btn btn-outline" onClick={onBack}>← Back</button>}
        </div>
      </header>

      <section style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>Total Submissions</span>
          <strong style={{ fontSize: 40 }}>{stats.total}</strong>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>Latest Applicant</span>
          {latestApplicant ? (
            <>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{latestApplicant.full_name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(latestApplicant.created_at).toLocaleString()}</div>
            </>
          ) : (
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>No submissions yet</div>
          )}
        </div>
      </section>

      {/* Filters & Sort */}
      <section className="card" style={{ marginTop: 32 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 14 }}>
            Sort:
            <select value={sortBy} onChange={e => { setSortBy(e.target.value as any); setPage(1) }} style={{ padding: '6px 10px', fontSize: 14 }}>
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
            </select>
          </label>
          <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 14 }}>
            Niche:
            <select value={filterNiche} onChange={e => { setFilterNiche(e.target.value); setPage(1) }} style={{ padding: '6px 10px', fontSize: 14 }}>
              <option value="">All</option>
              <option value="DeFi">DeFi</option>
              <option value="Gaming">Gaming</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="NFT">NFT</option>
            </select>
          </label>
          <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 14 }}>
            Category:
            <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1) }} style={{ padding: '6px 10px', fontSize: 14 }}>
              <option value="">All</option>
              <option value="Builder">Builder</option>
              <option value="Founder">Founder</option>
              <option value="Engineer">Engineer</option>
            </select>
          </label>
          <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 14 }}>
            Followers:
            <select value={filterFollowers} onChange={e => { setFilterFollowers(e.target.value); setPage(1) }} style={{ padding: '6px 10px', fontSize: 14 }}>
              <option value="">All</option>
              <option value="low">&lt; 1k</option>
              <option value="medium">1k - 10k</option>
              <option value="high">&gt; 10k</option>
            </select>
          </label>
          <button type="button" className="btn btn-outline" onClick={resetFilters} style={{ padding: '6px 12px', fontSize: 14 }}>Reset</button>
        </div>
      </section>

      <section>
        <h2 style={{ margin: '32px 0 12px' }}>Submissions {loading && '(loading...)'}</h2>
        {!loading && submissions.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No submissions match your filters.</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {submissions.map(sub => (
            <button
              key={sub.id}
              onClick={() => openDetail(sub)}
              style={{
                all: 'unset',
                cursor: 'pointer',
                borderRadius: 12,
                border: '1px solid rgba(0,0,0,0.08)',
                background: 'rgba(255,255,255,0.5)',
                padding: '14px 18px',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                alignItems: 'center',
                gap: 12
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600 }}>{sub.full_name} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>• {sub.niche || 'N/A'}</span></div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub.region || 'Unknown'} · {new Date(sub.created_at).toLocaleString()}</div>
              </div>
              <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>View</span>
            </button>
          ))}
        </div>
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <section style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24 }}>
          <button className="btn btn-outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
          <span style={{ alignSelf: 'center', fontSize: 14 }}>Page {page} of {totalPages}</span>
          <button className="btn btn-outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
        </section>
      )}

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '60px 20px', zIndex: 20
          }}
          onClick={() => setSelected(null)}
        >
          <div
            className="card"
            style={{ maxWidth: 620, width: '100%', background: 'rgba(255,255,255,0.95)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <h3 style={{ margin: 0 }}>{selected.full_name}</h3>
              <button className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => setSelected(null)}>Close</button>
            </div>
            {detailLoading && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading full details…</p>}
            <dl style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px 16px', marginTop: 20 }}>
              {selected.x_profile && <DT label="X Profile" value={<a href={selected.x_profile} target="_blank" rel="noreferrer noopener">{selected.x_profile}</a>} />}
              {selected.region && <DT label="Region" value={selected.region} />}
              {selected.phone && <DT label="Phone" value={selected.phone} />}
              {selected.niche && <DT label="Niche" value={selected.niche} />}
              {selected.skills && <DT label="Skills" value={selected.skills} />}
              {selected.category && <DT label="Category" value={selected.category} />}
              {selected.followers && <DT label="Followers" value={selected.followers} />}
              {selected.reason && <DT label="Reason" value={selected.reason} />}
              <DT label="Submitted" value={new Date(selected.created_at).toLocaleString()} />
            </dl>
          </div>
        </div>
      )}

      <footer>
        <p style={{ textAlign: 'center', marginTop: 48 }}>© MagnetX Admin</p>
      </footer>
    </main>
  )
}

function DT({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <dt style={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)' }}>{label}</dt>
      <dd style={{ margin: 0 }}>{value}</dd>
    </>
  )
}

export default AdminDashboard
