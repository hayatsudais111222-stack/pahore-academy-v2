'use client'

import { useEffect, useRef, useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { useAuthStore } from '@/store'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import type { LibraryFile } from '@/types'
import toast from 'react-hot-toast'

export default function AdminLibraryPage() {
  const { userId } = useAuthStore()
  const [files, setFiles] = useState<LibraryFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [meta, setMeta] = useState({ title: '', description: '', subject: '', class: '', board: '' })
  const fileRef = useRef<HTMLInputElement>(null)

  const SUBJECTS = ['Mathematics','Physics','Chemistry','Biology','English','Urdu','Islamiyat','Pakistan Studies','Computer Science','Economics','Statistics','History','Geography','General Science']
  const CLASSES  = ['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10','Class 11 (Pre-Medical)','Class 11 (Pre-Engineering)','Class 12 (Pre-Medical)','Class 12 (Pre-Engineering)']
  const BOARDS   = ['Federal','Punjab','Sindh','AKU','KPK','Balochistan']

  const fetchFiles = async () => {
    const { data } = await supabase
      .from('library_files')
      .select('*')
      .eq('is_active', true)
      .order('upload_date', { ascending: false })
    setFiles(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchFiles() }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) { toast.error('Only PDF files allowed'); return }
    if (file.size > 50 * 1024 * 1024) { toast.error('File too large (max 50MB)'); return }
    setSelectedFile(file)
    if (!meta.title) setMeta(p => ({ ...p, title: file.name.replace('.pdf', '').replace(/[_-]/g, ' ') }))
  }

  const handleUpload = async () => {
    if (!selectedFile) { toast.error('Please select a PDF file'); return }
    if (!meta.title.trim()) { toast.error('Please enter a title'); return }
    if (!userId) { toast.error('Not logged in'); return }

    setUploading(true)
    try {
      // 1. Upload file to Supabase Storage
      const fileName = `${Date.now()}-${selectedFile.name.replace(/\s+/g, '-')}`
      const { error: storageError } = await supabase.storage
        .from('library')
        .upload(fileName, selectedFile, { cacheControl: '3600', upsert: false })

      if (storageError) {
        console.error('Storage error:', storageError)
        toast.error('Storage upload failed: ' + storageError.message)
        setUploading(false)
        return
      }

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('library')
        .getPublicUrl(fileName)

      // 3. Save metadata to database
      const { error: dbError } = await supabase
        .from('library_files')
        .insert({
          title: meta.title.trim(),
          description: meta.description.trim() || null,
          subject: meta.subject || null,
          class: meta.class || null,
          board: meta.board || null,
          file_url: publicUrl,
          file_size: selectedFile.size,
          uploaded_by: userId,
          upload_date: new Date().toISOString(),
          is_active: true,
          tags: [],
        })

      if (dbError) {
        console.error('DB error:', dbError)
        toast.error('Database save failed: ' + dbError.message)
        setUploading(false)
        return
      }

      toast.success('PDF uploaded successfully! ✅')
      setShowForm(false)
      setSelectedFile(null)
      setMeta({ title: '', description: '', subject: '', class: '', board: '' })
      fetchFiles()
    } catch (err) {
      console.error('Upload error:', err)
      toast.error('Upload failed. Please try again.')
    }
    setUploading(false)
  }

  const deleteFile = async (id: string) => {
    if (!confirm('Delete this file?')) return
    await supabase.from('library_files').update({ is_active: false }).eq('id', id)
    toast.success('File removed')
    fetchFiles()
  }

  const formatSize = (bytes: number) => {
    if (!bytes) return '—'
    if (bytes < 1048576) return (bytes / 1024).toFixed(0) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F0F4FF' }}>
      <Sidebar />
      <Topbar title="Library — Admin" subtitle="Manage all library files" />

      {/* Upload Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,27,53,.55)', backdropFilter: 'blur(8px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', border: '1px solid #DDE3F0', borderRadius: 24, padding: 32, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(27,58,122,.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: 22, fontWeight: 700, color: '#0D1B35', margin: 0 }}>Upload PDF</h3>
              <button onClick={() => { setShowForm(false); setSelectedFile(null) }}
                style={{ background: '#F0F4FF', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7A99' }}>✕</button>
            </div>

            <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* File drop zone */}
              <div onClick={() => fileRef.current?.click()}
                style={{ border: `2px dashed ${selectedFile ? '#1B3A7A' : '#DDE3F0'}`, borderRadius: 14, padding: 32, textAlign: 'center', cursor: 'pointer', background: selectedFile ? '#EEF2FF' : '#F7F9FF', transition: 'all .2s' }}>
                <input ref={fileRef} type="file" accept=".pdf,application/pdf" onChange={handleFileSelect} style={{ display: 'none' }} />
                <div style={{ fontSize: 40, marginBottom: 10 }}>{selectedFile ? '📄' : '📤'}</div>
                {selectedFile ? (
                  <div>
                    <p style={{ color: '#1B3A7A', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{selectedFile.name}</p>
                    <p style={{ color: '#6B7A99', fontSize: 12 }}>{formatSize(selectedFile.size)}</p>
                  </div>
                ) : (
                  <div>
                    <p style={{ color: '#0D1B35', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Click to select a PDF</p>
                    <p style={{ color: '#6B7A99', fontSize: 12 }}>Maximum file size: 50MB</p>
                  </div>
                )}
              </div>

              <div>
                <label className="label">Title *</label>
                <input type="text" value={meta.title} onChange={e => setMeta(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Physics Chapter 5 Notes" className="input-field" />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea value={meta.description} onChange={e => setMeta(p => ({ ...p, description: e.target.value }))}
                  placeholder="What does this file contain?" rows={2} className="input-field" style={{ resize: 'none' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label className="label">Subject</label>
                  <select value={meta.subject} onChange={e => setMeta(p => ({ ...p, subject: e.target.value }))} className="input-field">
                    <option value="">Any</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Class</label>
                  <select value={meta.class} onChange={e => setMeta(p => ({ ...p, class: e.target.value }))} className="input-field">
                    <option value="">Any</option>
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Board</label>
                  <select value={meta.board} onChange={e => setMeta(p => ({ ...p, board: e.target.value }))} className="input-field">
                    <option value="">Any</option>
                    {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button onClick={() => { setShowForm(false); setSelectedFile(null) }} className="btn-secondary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }}>
                  Cancel
                </button>
                <button onClick={handleUpload} disabled={uploading || !selectedFile || !meta.title.trim()}
                  className="btn-primary" style={{ flex: 1, padding: '12px', justifyContent: 'center', opacity: (uploading || !selectedFile || !meta.title.trim()) ? 0.5 : 1 }}>
                  {uploading ? '⏳ Uploading...' : '📤 Upload PDF'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main style={{ marginLeft: 260, paddingTop: 66 }}>
        <div style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 22, fontWeight: 700, color: '#0D1B35', margin: 0 }}>Digital Library</h2>
              <p style={{ color: '#6B7A99', fontSize: 13, marginTop: 4 }}>{files.length} files available</p>
            </div>
            <button onClick={() => setShowForm(true)} className="btn-primary" style={{ padding: '11px 22px' }}>
              + Upload PDF
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />)}
            </div>
          ) : files.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px', background: '#fff', borderRadius: 20, border: '1px solid #DDE3F0' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📚</div>
              <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: 22, color: '#0D1B35', marginBottom: 8 }}>Library is empty</h3>
              <p style={{ color: '#6B7A99', marginBottom: 24 }}>Upload the first resource for your students</p>
              <button onClick={() => setShowForm(true)} className="btn-primary" style={{ padding: '12px 28px' }}>Upload First PDF</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
              {files.map(file => (
                <div key={file.id} className="card" style={{ transition: 'all .3s cubic-bezier(.22,.68,0,1.2)' }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#EEF2FF,#E0E8FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>📄</div>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0D1B35', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.title}</h3>
                      {file.subject && <span style={{ fontSize: 11, color: '#1B3A7A', fontWeight: 600 }}>{file.subject}</span>}
                    </div>
                  </div>
                  {file.description && <p style={{ color: '#6B7A99', fontSize: 12.5, marginBottom: 10, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{file.description}</p>}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    {file.class && <span style={{ fontSize: 11, background: '#EEF2FF', color: '#1B3A7A', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>{file.class}</span>}
                    {file.board && <span style={{ fontSize: 11, background: '#FFFBEB', color: '#92400E', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>{file.board}</span>}
                    {file.file_size && <span style={{ fontSize: 11, color: '#6B7A99' }}>{formatSize(file.file_size)}</span>}
                  </div>
                  <p style={{ fontSize: 11, color: '#6B7A99', marginBottom: 12 }}>{formatDate(file.upload_date)}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={file.file_url} target="_blank" rel="noreferrer" className="btn-primary" style={{ flex: 1, padding: '8px 12px', justifyContent: 'center', fontSize: 13, textDecoration: 'none' }}>Open PDF</a>
                    <button onClick={() => deleteFile(file.id)} style={{ padding: '8px 14px', borderRadius: 9, background: '#FFF5F5', color: '#C53030', border: '1px solid rgba(197,48,48,.2)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Delete</button>
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
