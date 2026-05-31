'use client'

import { useEffect, useRef, useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { useAuthStore } from '@/store'
import { getLibraryFiles, uploadLibraryFile } from '@/lib/supabase'
import { formatFileSize, formatDate, SUBJECTS, CLASSES, BOARDS } from '@/lib/utils'
import type { LibraryFile } from '@/types'
import toast from 'react-hot-toast'

export default function TeacherLibraryPage() {
  const { userId } = useAuthStore()
  const [files, setFiles] = useState<LibraryFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [meta, setMeta] = useState({ title: '', description: '', subject: '', class: '', board: '', tags: '' })
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchFiles = async () => {
    const { data } = await getLibraryFiles()
    setFiles(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchFiles() }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.pdf')) { toast.error('Only PDF files allowed'); return }
      if (file.size > 50 * 1024 * 1024) { toast.error('File too large (max 50MB)'); return }
      setSelectedFile(file)
      if (!meta.title) setMeta(p => ({ ...p, title: file.name.replace('.pdf', '') }))
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !meta.title || !userId) { toast.error('Select a file and enter a title'); return }
    setUploading(true)
    const { error } = await uploadLibraryFile(selectedFile, {
      ...meta,
      uploaded_by: userId,
      tags: meta.tags ? meta.tags.split(',').map(t => t.trim()) : [],
    })
    if (error) { toast.error('Upload failed: ' + error.message); setUploading(false); return }
    toast.success('File uploaded!')
    setShowForm(false)
    setSelectedFile(null)
    setMeta({ title: '', description: '', subject: '', class: '', board: '', tags: '' })
    fetchFiles()
    setUploading(false)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <Topbar title="Library Management" subtitle="Upload and manage resources" />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ borderColor: '#C9A84C' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-xl font-bold text-text-primary">Upload PDF</h3>
              <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-primary text-xl">✕</button>
            </div>

            <div className="space-y-4">
              {/* File drop zone */}
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors"
                style={{ borderColor: selectedFile ? '#C9A84C' : '#E2E8F0', background: selectedFile ? 'rgba(184,150,106,0.05)' : 'transparent' }}>
                <input ref={fileRef} type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
                <div className="text-4xl mb-2">{selectedFile ? '📄' : '📤'}</div>
                {selectedFile ? (
                  <p className="text-gold font-medium text-sm">{selectedFile.name} ({formatFileSize(selectedFile.size)})</p>
                ) : (
                  <p className="text-text-muted text-sm">Click to select a PDF file (max 50MB)</p>
                )}
              </div>

              <div>
                <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-1.5">Title *</label>
                <input type="text" value={meta.title} onChange={e => setMeta(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Chemistry Chapter 5 Notes" className="input-field" />
              </div>
              <div>
                <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-1.5">Description</label>
                <textarea value={meta.description} onChange={e => setMeta(p => ({ ...p, description: e.target.value }))}
                  placeholder="What does this file contain?" rows={2} className="input-field resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-1.5">Subject</label>
                  <select value={meta.subject} onChange={e => setMeta(p => ({ ...p, subject: e.target.value }))} className="input-field text-sm">
                    <option value="">Any</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-1.5">Class</label>
                  <select value={meta.class} onChange={e => setMeta(p => ({ ...p, class: e.target.value }))} className="input-field text-sm">
                    <option value="">Any</option>
                    {CLASSES.slice(0, 10).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-1.5">Board</label>
                  <select value={meta.board} onChange={e => setMeta(p => ({ ...p, board: e.target.value }))} className="input-field text-sm">
                    <option value="">Any</option>
                    {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-1.5">Tags (comma-separated)</label>
                <input type="text" value={meta.tags} onChange={e => setMeta(p => ({ ...p, tags: e.target.value }))}
                  placeholder="notes, chapter5, past-papers" className="input-field" />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 py-2.5 rounded-xl">Cancel</button>
                <button onClick={handleUpload} disabled={uploading || !selectedFile}
                  className="btn-primary flex-1 py-2.5 rounded-xl disabled:opacity-50">
                  {uploading ? 'Uploading...' : 'Upload PDF'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="pt-[60px] pl-[248px]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-text-muted text-sm">{files.length} files in library</p>
            </div>
            <button onClick={() => setShowForm(true)} className="btn-primary px-5 py-2.5 rounded-xl">
              + Upload PDF
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-40 rounded-card" />)}
            </div>
          ) : files.length === 0 ? (
            <div className="py-24 text-center">
              <div className="text-5xl mb-4">📚</div>
              <p className="font-heading text-xl text-text-primary mb-2">Library is empty</p>
              <p className="text-text-muted mb-6">Upload the first resource for your students</p>
              <button onClick={() => setShowForm(true)} className="btn-primary px-8 py-3 rounded-xl">
                Upload First PDF
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map(file => (
                <div key={file.id} className="card group hover:border-border-light transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl shrink-0">📄</span>
                    <div className="min-w-0">
                      <h3 className="text-text-primary font-medium text-sm leading-snug line-clamp-2">{file.title}</h3>
                      {file.subject && <span className="text-xs text-gold">{file.subject}</span>}
                    </div>
                  </div>
                  {file.description && <p className="text-text-muted text-xs mb-3 line-clamp-2">{file.description}</p>}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {file.class && <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#E2E8F0', color: '#4A5568' }}>{file.class}</span>}
                    {file.board && <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#E2E8F0', color: '#4A5568' }}>{file.board}</span>}
                    {file.file_size && <span className="text-xs text-text-muted">{formatFileSize(file.file_size)}</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-text-muted text-xs">{formatDate(file.upload_date)}</p>
                    <a href={file.file_url} target="_blank" rel="noreferrer"
                      className="btn-primary text-xs px-3 py-1.5 rounded-lg">Open</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
