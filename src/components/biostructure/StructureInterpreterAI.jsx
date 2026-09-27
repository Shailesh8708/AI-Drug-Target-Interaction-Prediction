import { useState } from 'react'
import {
  BrainCircuit,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Send,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'
import { askStructureQuestion } from '../../services/bioStructureService.js'

const QUICK_QUESTIONS = [
  'Why is this ligand located here?',
  'Which residues contact the ligand?',
  'What interactions does the ligand make?',
  'What is the experimental resolution and method?',
  'Which chains are present in this structure?',
  'Explain this structure in simple terms.',
]

export default function StructureInterpreterAI({
  structure,
  pocketData,
  interpretation = '',
  onTriggerCamera = () => {},
}) {
  const [activeQuestion, setActiveQuestion] = useState('')
  const [chatLog, setChatLog] = useState([
    {
      sender: 'ai',
      text: `Hello! I am your AI Structure Interpreter for ${structure?.metadata?.structureId || 'this complex'}. Ask me anything about the observed residues, binding pocket, interactions, or experimental determination.`,
    },
  ])
  const [isAsking, setIsAsking] = useState(false)

  const handleAsk = async (questionText) => {
    const q = (questionText || activeQuestion).trim()
    if (!q) return

    setChatLog((prev) => [...prev, { sender: 'user', text: q }])
    setActiveQuestion('')
    setIsAsking(true)

    try {
      const res = await askStructureQuestion(
        structure?.metadata?.structureId || '2XCT',
        q,
        structure?.ligands?.[0]?.id || 'CPF'
      )
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.answer,
          highlight: res.highlight,
        },
      ])
      if (res.highlight) {
        onTriggerCamera(res.highlight)
      }
    } catch {
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Unable to query structure interpretation. Analysis remains grounded in calculated pocket residues.',
        },
      ])
    } finally {
      setIsAsking(false)
    }
  }

  return (
    <div className="structure-interpreter-panel glass-panel">
      {/* Panel Header */}
      <div className="panel-heading compact">
        <div>
          <div className="badge-flame-row">
            <BrainCircuit size={18} className="text-purple" />
            <p className="eyebrow">AI-Assisted Structural Biology</p>
          </div>
          <h3>🧠 Structure Interpreter & "Ask the Structure"</h3>
          <p className="panel-subtext">
            Scientifically grounded structural interpretation without hallucinated chemistry.
          </p>
        </div>
      </div>

      <div className="ai-interpreter-grid">
        {/* Left Column: Automated Grounded Interpretation */}
        <div className="ai-interpretation-card sub-card">
          <div className="card-head-row">
            <Sparkles size={16} className="text-emerald" />
            <h4>Automated Structural Biology Report</h4>
          </div>

          <div className="interpretation-markdown-view">
            {interpretation ? (
              <div
                className="markdown-content"
                dangerouslySetInnerHTML={{
                  __html: interpretation
                    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
                    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
                    .replace(/^- (.*$)/gim, '<li>$1</li>')
                    .replace(/\n\n/gim, '<p></p>'),
                }}
              />
            ) : (
              <p className="placeholder-copy">
                Interpretation generating based on 3D coordinate analysis...
              </p>
            )}
          </div>

          <div className="scientific-disclaimer-box">
            <ShieldCheck size={14} />
            <span>
              Interpretation is derived strictly from deposited PDB atomic coordinates and computed
              contacts. It is an educational research overview, not a clinical determination.
            </span>
          </div>
        </div>

        {/* Right Column: "Ask the Structure" Chat & Quick Queries */}
        <div className="ask-structure-card sub-card">
          <div className="card-head-row">
            <MessageSquare size={16} className="text-blue" />
            <h4>Ask the Structure</h4>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="quick-questions-scroll">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                className="quick-q-chip"
                onClick={() => handleAsk(q)}
              >
                <span>{q}</span>
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="chat-messages-container">
            {chatLog.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.sender}`}>
                <p>{msg.text}</p>
                {msg.highlight && msg.highlight !== 'none' && (
                  <button
                    className="focus-3d-btn"
                    onClick={() => onTriggerCamera(msg.highlight)}
                  >
                    Focus {msg.highlight} in 3D <ArrowRight size={12} />
                  </button>
                )}
              </div>
            ))}
            {isAsking && (
              <div className="chat-bubble ai loading">
                <RefreshCw size={14} className="animate-spin" />
                <span>Interpreting structural context...</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form
            className="chat-input-form"
            onSubmit={(e) => {
              e.preventDefault()
              handleAsk()
            }}
          >
            <input
              type="text"
              placeholder="Ask about this structure's residues, ligands, or binding..."
              value={activeQuestion}
              onChange={(e) => setActiveQuestion(e.target.value)}
              aria-label="Ask structure question"
            />
            <button
              type="submit"
              className="primary-button small"
              disabled={isAsking || !activeQuestion.trim()}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
