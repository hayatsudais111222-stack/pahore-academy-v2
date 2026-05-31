'use client'

import { useEffect, useRef, useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { useAuthStore } from '@/store'
import { getLibraryFiles, uploadLibraryFile, supabase } from '@/lib/supabase'
import { formatFileSize, formatDate, SUBJECTS, CLASSES, BOARDS } from '@/lib/utils'
import type { LibraryFile } from '@/types'
import toast from 'react-hot-toast'

export default function AdminLibraryPage() {
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
      setSelectedFile(file)
      if (!meta.title) setMeta(p => ({ ...p, title: file.name.replace('.pdf', '') }))
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !meta.title || !userId) return
    setUploading(true)
    const { error } = await uploadLibraryFile(selectedFile, { ...meta, uploaded_by: userId })
    if (error) { toast.error('Upload failed'); setUploading(false); return }
    toast.success('Uploaded!')
    setShowForm(false)
    setSelectedFile(null)
    setMeta({ title: '', description: '', subject: '', class: '', board: '', tags: '' })
    fetchFiles()
    setUploading(false)
  }

  const deleteFile = async (id: string) => {
    if (!confirm('Delete this file?')) return
    await supabase.from('library_files').update({ is_active: false }).eq('id', id)
    toast.success('File removed')
    fetchFiles()
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <Topbar title="Library — Admin" subtitle="Manage all library files" />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ borderColor: '#C9A84C' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-xl font-bold text-text-primary">Upload PDF</h3>
              <button onClick={() => setShowForm(false)} className="text-text-muted text-xl">✕</button>
            </div>
            <div className="space-y-4">
              <div onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer"
                style={{ borderColor: selectedFile ? '#C9A84C' : '#E2E8F0' }}>
                <input ref={fileRef} type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
                <div className="text-4xl mb-2">{selectedFile ? '📄' : '📤'}</div>
                <p className="text-text-muted text-sm">{selectedFile ? selectedFile.name : 'Click to select PDF'}</p>
              </div>
              <input type="text" value={meta.title} onChange={e => setMeta(p => ({ ...p, title: e.target.value }))}
                placeholder="Title *" className="input-field" />
              <textarea value={meta.description} onChange={e => setMeta(p => ({ ...p, description: e.target.value }))}
                placeholder="Description" rows={2} className="input-field resize-none" />
              <div className="grid grid-cols-3 gap-3">
                <select value={meta.subject} onChange={e => setMeta(p => ({ ...p, subject: e.target.value }))} className="input-field text-sm">
                  <option value="">Subject</option>{SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={meta.class} onChange={e => setMeta(p => ({ ...p, class: e.target.value }))} className="input-field text-sm">
                  <option value="">Class</option>{CLASSES.slice(0, 10).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={meta.board} onChange={e => setMeta(p => ({ ...p, board: e.target.value }))} className="input-field text-sm">
                  <option value="">Board</option>{BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 py-2.5 rounded-xl">Cancel</button>
                <button onClick={handleUpload} disabled={uploading || !selectedFile}
                  className="btn-primary flex-1 py-2.5 rounded-xl disabled:opacity-50">
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="pt-[60px] pl-[248px]">
        <div className="p-6">
          <div className="flex justify-between mb-6">
            <p className="text-text-muted text-sm">{files.length} files</p>
            <button onClick={() => setShowForm(true)} className="btn-primary px-5 py-2.5 rounded-xl">+ Upload PDF</button>
          </div>
          {loading ? (
            <div className="grid grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-40 rounded-card" />)}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map(file => (
                <div key={file.id} className="card">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl shrink-0">📄</span>
                    <div className="min-w-0">
                      <h3 className="text-text-primary font-medium text-sm line-clamp-2">{file.title}</h3>
                      {file.subject && <span className="text-xs text-gold">{file.subject}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {file.class && <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#E2E8F0', color: '#4A5568' }}>{file.class}</span>}
                    {file.file_size && <span className="text-xs text-text-muted">{formatFileSize(file.file_size)}</span>}
                  </div>
                  <div className="flex gap-2">
                    <a href={file.file_url} target="_blank" rel="noreferrer"
                      className="btn-primary text-xs px-3 py-1.5 rounded-lg flex-1 text-center">Open</a>
                    <button onClick={() => deleteFile(file.id)}
                      className="text-xs px-3 py-1.5 rounded-lg"
                      style={{ background: '#8B2E2E22', color: '#FCA5A5' }}>Delete</button>
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
