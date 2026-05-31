'use client'

import { useState, useRef, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { callClaude, STUDENT_AI_SYSTEM } from '@/lib/claude'
import type { ChatMessage } from '@/types'
import toast from 'react-hot-toast'

export default function StudentAIPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'السلام علیکم! I\'m your AI study assistant from Pahore Academy. I can help you understand any subject, solve problems, explain concepts, or guide you through your coursework. What would you like to learn today?',
      timestamp: new Date().toISOString(),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg: ChatMessage = { role: 'user', content: input.trim(), timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
      const response = await callClaude(history, STUDENT_AI_SYSTEM)
      setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date().toISOString() }])
    } catch {
      toast.error('AI is temporarily unavailable')
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date().toISOString(),
      }])
    }
    setLoading(false)
  }

  const suggestions = [
    'Explain the water cycle',
    'Help me with quadratic equations',
    'What is photosynthesis?',
    'Summarize Chapter 1 of Physics',
  ]

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <Topbar title="AI Study Assistant" subtitle="Powered by Claude AI" />
      <main className="pt-[60px] pl-[248px] h-screen flex flex-col">
        <div className="flex-1 flex flex-col p-6 overflow-hidden">

          {/* Chat area */}
          <div className="flex-1 overflow-y-auto space-y-4 pb-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'text-bg-primary font-medium'
                    : 'text-text-primary'
                }`}
                  style={{
                    background: msg.role === 'user' ? '#C9A84C' : '#FFFFFF',
                    border: msg.role === 'assistant' ? '1px solid #E2E8F0' : 'none',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  }}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                        style={{ background: '#C9A84C', color: '#F8F9FC' }}>AI</div>
                      <span className="text-xs text-text-muted">Study Assistant</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-xl px-4 py-3" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {suggestions.map(s => (
                <button key={s} onClick={() => setInput(s)}
                  className="text-xs px-3 py-2 rounded-lg text-text-secondary hover:text-gold transition-colors"
                  style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-3" style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask me anything about your subjects..."
              className="input-field flex-1"
              disabled={loading}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()} className="btn-primary px-6 rounded-xl disabled:opacity-50">
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
