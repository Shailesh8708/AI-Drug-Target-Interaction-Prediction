import { useState } from 'react'
import { Bot, Send, Sparkles, MessageSquare, RefreshCw } from 'lucide-react'
import { askDrugQuestion } from '../../services/drugIntelligenceService.js'

export default function AIDrugAnalystPanel({ drug }) {
  const [question, setQuestion] = useState('')
  const [asking, setAsking] = useState(false)
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'assistant',
      text: `Hello! I am your AI Drug Analyst for ${drug?.name || 'this compound'}. Ask me any question regarding its molecular structure, targets, bioactivity assays, ADMET profile, drug interactions, or pharmacogenomics.`,
    },
  ])

  const suggestedQuestions = [
    'What is the primary biological target and mechanism?',
    'Does this drug penetrate the blood-brain barrier (BBB)?',
    'Which CYP enzymes are involved in its hepatic metabolism?',
    'What are the most critical drug-drug interaction warnings?',
    'How does its chemical structure satisfy Lipinski rules?',
  ]

  const handleSend = async (qText) => {
    const textToSend = qText || question
    if (!textToSend.trim() || asking) return

    const newHistory = [...chatHistory, { sender: 'user', text: textToSend }]
    setChatHistory(newHistory)
    setQuestion('')
    setAsking(true)

    const answer = await askDrugQuestion(drug, textToSend)
    setChatHistory([...newHistory, { sender: 'assistant', text: answer }])
    setAsking(false)
  }

  return (
    <div className="ai-analyst-panel">
      <div className="ai-analyst-header">
        <h3>
          <Bot size={20} />
          AI Drug Analyst & Computational Synthesis
        </h3>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          Grounded In-Silico Scientific Reasoning
        </span>
      </div>

      {/* Structured AI Executive Synthesis */}
      <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(51, 65, 85, 0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          <Sparkles size={16} />
          <span>Automated Pharmacological Dossier Summary</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
          {drug?.aiSummary ||
            `${drug?.name} is a clinically established ${drug?.class || 'therapeutic agent'}. It exerts its pharmacodynamic effect primarily through the modulation of ${drug?.targets?.map((t) => t.name).join(' and ') || 'macromolecular targets'}. From a medicinal chemistry perspective, the compound exhibits an oral bioavailability envelope aligned with Lipinski and Veber parameters, with balanced lipophilicity (LogP ${drug?.logP?.toFixed(1) || 'N/A'}) and topological polar surface area (${drug?.tpsa || 'N/A'} Å²).`}
        </p>
      </div>

      {/* Interactive "Ask the Drug" Chat */}
      <div className="qa-chat-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#f8fafc', fontWeight: 600 }}>
          <MessageSquare size={16} color="#10b981" />
          <span>Interactive "Ask the Drug" Natural Language Consultation</span>
        </div>

        {/* Suggestion Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {suggestedQuestions.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleSend(sq)}
              className="flagship-pill"
              style={{ fontSize: '0.75rem' }}
            >
              {sq}
            </button>
          ))}
        </div>

        {/* Chat History Viewport */}
        <div className="qa-bubbles-list">
          {chatHistory.map((item, i) => (
            <div key={i} className={`chat-bubble ${item.sender}`}>
              {item.text}
            </div>
          ))}
          {asking && (
            <div className="chat-bubble assistant" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} className="spin" />
              <span>Analyzing pharmacology knowledge base...</span>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <form
          className="qa-input-row"
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
        >
          <input
            type="text"
            placeholder={`Ask a question about ${drug?.name || 'this drug'} (targets, ADMET, CYP, warnings)...`}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            type="submit"
            className="action-btn-pill primary"
            disabled={asking || !question.trim()}
          >
            <Send size={15} /> Ask
          </button>
        </form>
      </div>
    </div>
  )
}
