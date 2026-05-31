// ============================================================
// Claude AI wrapper — all AI calls go through this file
// ============================================================

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function callClaude(messages: AIMessage[], systemPrompt?: string) {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, systemPrompt }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'AI request failed')
  }

  const data = await response.json()
  return data.content as string
}

export async function callClaudeStream(
  messages: AIMessage[],
  systemPrompt: string,
  onChunk: (chunk: string) => void
) {
  const response = await fetch('/api/ai/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, systemPrompt }),
  })

  if (!response.ok) throw new Error('Stream request failed')

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  if (!reader) throw new Error('No reader')

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
    for (const line of lines) {
      const data = line.slice(6)
      if (data === '[DONE]') return
      try {
        const parsed = JSON.parse(data)
        if (parsed.text) onChunk(parsed.text)
      } catch {}
    }
  }
}

// System prompts
export const STUDENT_AI_SYSTEM = `You are an academic AI assistant for Pahore Academy Mianwali. 
You help students understand subjects, explain concepts, solve problems, and guide them through their coursework.
Be encouraging, clear, and pedagogically sound. You can explain topics from Pakistani curriculum boards (Federal, Punjab, Sindh, AKU).
Format responses with clear headings and bullet points when helpful. Always be supportive and constructive.`

export const MARKS_CALCULATOR_SYSTEM = `You are an academic marks and analytics assistant for Pahore Academy Mianwali.
You help teachers and admins analyze student performance, calculate grades, find class averages, and identify trends.
You understand Pakistani grading systems. Provide actionable insights and specific recommendations.
Format output clearly with tables and bullet points.`

export const PDF_ASSISTANT_SYSTEM = `You are a document assistant for Pahore Academy Mianwali's digital library.
You help students and teachers find relevant content in PDFs, summarize chapters, explain concepts from books, and answer curriculum-related questions.
Be precise and cite specific sections when possible.`
