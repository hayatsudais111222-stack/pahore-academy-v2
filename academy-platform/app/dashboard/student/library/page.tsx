'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { getLibraryFiles } from '@/lib/supabase'
import { formatFileSize, formatDate } from '@/lib/utils'
import type { LibraryFile } from '@/types'

export default function StudentLibraryPage() {
  const [files, setFiles] = useState<LibraryFile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterSubject, setFilterSubject] = useState('all')

  useEffect(() => {
    getLibraryFiles().then(({ data }) => {
      setFiles(data || [])
      setLoading(false)
    })
  }, [])

  const subjects: string[] = ['all', ...Array.from(new Set(files.map(f => f.subject).filter((s): s is string => !!s)))]
  const filtered = files.filter(f => {
    const matchSearch = !search || f.title.toLowerCase().includes(search.toLowerCase()) || f.description?.toLowerCase().includes(search.toLowerCase())
    const matchSubject = filterSubject === 'all' || f.subject === filterSubject
    return matchSearch && matchSubject
  })

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <Topbar title="Digital Library" subtitle="Books, notes, and resources" />
      <main className="pt-[60px] pl-[248px]">
        <div className="p-6">
          {/* Search & filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search books, notes, solutions..."
              className="input-field flex-1" />
            <div className="flex gap-2 flex-wrap">
              {subjects.slice(0, 6).map(s => (
                <button key={s} onClick={() => setFilterSubject(s)}
                  className="text-xs px-3 py-2 rounded-lg transition-all capitalize"
                  style={{
                    background: filterSubject === s ? '#C9A84C' : '#E2E8F0',
                    color: filterSubject === s ? '#F8F9FC' : '#4A5568',
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Files grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-40 rounded-card" />)}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(file => (
                <div key={file.id} className="card group hover:border-border-light transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-3xl shrink-0">📄</div>
                    <div className="min-w-0">
                      <h3 className="text-text-primary font-medium text-sm leading-snug truncate">{file.title}</h3>
                      {file.subject && <span className="text-xs text-gold">{file.subject}</span>}
                    </div>
                  </div>

                  {file.description && (
                    <p className="text-text-muted text-xs mb-3 line-clamp-2">{file.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                      {file.class && (
                        <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#E2E8F0', color: '#4A5568' }}>
                          {file.class}
                        </span>
                      )}
                      {file.file_size && (
                        <span className="text-xs text-text-muted">{formatFileSize(file.file_size)}</span>
                      )}
                    </div>
                    <a href={file.file_url} target="_blank" rel="noreferrer"
                      className="btn-primary text-xs px-3 py-1.5 rounded-lg">
                      Open PDF
                    </a>
                  </div>

                  <p className="text-text-muted text-xs mt-2">{formatDate(file.upload_date)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <div className="text-5xl mb-4">📚</div>
              <p className="font-heading text-xl text-text-primary mb-2">Library is empty</p>
              <p className="text-text-muted">No files available yet. Check back later.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
