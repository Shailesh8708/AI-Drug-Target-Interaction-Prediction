import { useState, useRef, useEffect } from 'react'
import { useBipasha } from './BipashaContext'
import BipashaGreeting from './BipashaGreeting'
import BipashaFeatureGrid from './BipashaFeatureGrid'
import {
  X,
  Send,
  Sparkles,
  ShieldCheck,
  LayoutGrid,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  Maximize2,
  Minimize2,
} from 'lucide-react'

export default function BipashaPanel() {
  const {
    isOpen,
    setIsOpen,
    chatMessages,
    sendChatMessage,
    agentState,
    executeAction,
  } = useBipasha()

  const [activeTab, setActiveTab] = useState('deck') // 'deck' | 'chat' | 'safety'
  const [inputText, setInputText] = useState('')
  const [isExpandedFull, setIsExpandedFull] = useState(false)
  const chatScrollRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll chat messages
  useEffect(() => {
    if (activeTab === 'chat' && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [chatMessages, activeTab])

  // Focus input when chat tab is selected
  useEffect(() => {
    if (activeTab === 'chat' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [activeTab])

  if (!isOpen) return null

  const handleSend = (e) => {
    e?.preventDefault()
    if (!inputText.trim()) return
    sendChatMessage(inputText)
    setInputText('')
    if (activeTab !== 'chat') {
      setActiveTab('chat')
    }
  }

  const handleSuggestionClick = (query) => {
    sendChatMessage(query)
    if (activeTab !== 'chat') {
      setActiveTab('chat')
    }
  }

  return (
    <div
      className={`bipasha-panel-container ${isExpandedFull ? 'expanded-full' : ''}`}
      role="dialog"
      aria-label="Bipasha Mam AI Assistant Panel"
    >
      <div className="bipasha-panel-glass">
        {/* Panel Header */}
        <div className="panel-header">
          <div className="panel-identity">
            <div className="panel-agent-orb" aria-hidden="true">
              <span className="panel-orb-core" />
              <span className="panel-orb-ring" />
            </div>
            <div>
              <div className="identity-title-row">
                <h3 className="panel-agent-name">Bipasha Mam</h3>
                <span className="agent-status-tag">ACTIVE AI</span>
              </div>
              <p className="panel-agent-subtitle">AI Drug Discovery & Research Assistant</p>
            </div>
          </div>

          <div className="panel-header-actions">
            <button
              type="button"
              className="panel-icon-btn"
              onClick={() => setIsExpandedFull((prev) => !prev)}
              aria-label={isExpandedFull ? 'Collapse panel size' : 'Expand panel size'}
              title={isExpandedFull ? 'Standard view' : 'Enlarge view'}
            >
              {isExpandedFull ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
            <button
              type="button"
              className="panel-icon-btn close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close assistant panel"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="panel-tabs-bar" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'deck'}
            className={`panel-tab-btn ${activeTab === 'deck' ? 'active' : ''}`}
            onClick={() => setActiveTab('deck')}
          >
            <LayoutGrid size={14} />
            <span>Control Deck</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'chat'}
            className={`panel-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare size={14} />
            <span>Research Chat</span>
            {chatMessages.length > 1 && <span className="tab-pill">{chatMessages.length}</span>}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'safety'}
            className={`panel-tab-btn ${activeTab === 'safety' ? 'active' : ''}`}
            onClick={() => setActiveTab('safety')}
          >
            <ShieldCheck size={14} />
            <span>Guardrails</span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="panel-scroll-content">
          {/* TAB 1: Control Deck */}
          {activeTab === 'deck' && (
            <div className="tab-content deck-content">
              {/* Dynamic Context Greeting */}
              <BipashaGreeting />

              {/* 10 Module Launcher Grid */}
              <BipashaFeatureGrid />
            </div>
          )}

          {/* TAB 2: Research Chat */}
          {activeTab === 'chat' && (
            <div className="tab-content chat-content">
              <div className="chat-messages-container" ref={chatScrollRef}>
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`chat-bubble-row ${msg.sender}`}>
                    {msg.sender === 'bipasha' && (
                      <div className="chat-avatar-mini" aria-hidden="true">
                        BM
                      </div>
                    )}
                    <div className="chat-bubble">
                      <p className="bubble-text">{msg.text}</p>
                      {msg.subtext && <small className="bubble-subtext">{msg.subtext}</small>}

                      {msg.targetAction && (
                        <div className="bubble-action-launch">
                          <button
                            type="button"
                            className="launch-direct-btn"
                            onClick={() => executeAction(msg.targetAction)}
                          >
                            <span>{msg.actionLabel || 'Open Module'}</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      )}

                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="bubble-suggestions-wrap">
                          {msg.suggestions.map((sug, i) => (
                            <button
                              key={i}
                              type="button"
                              className="suggestion-chip"
                              onClick={() => handleSuggestionClick(sug)}
                            >
                              <span>{sug}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      <span className="bubble-timestamp">{msg.time}</span>
                    </div>
                  </div>
                ))}

                {agentState === 'thinking' && (
                  <div className="chat-bubble-row bipasha">
                    <div className="chat-avatar-mini" aria-hidden="true">
                      BM
                    </div>
                    <div className="chat-bubble thinking">
                      <div className="typing-dots">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Safety Guardrails */}
          {activeTab === 'safety' && (
            <div className="tab-content safety-content">
              <div className="safety-card">
                <div className="safety-title-lockup">
                  <ShieldAlert size={20} className="shield-icon" />
                  <h4>Computational Biology & Safety Protocol</h4>
                </div>
                <p>
                  Bipasha Mam is an exploratory computational intelligence agent designed strictly for biomedical research and personal inventory organization.
                </p>

                <div className="safety-rules-list">
                  <div className="rule-item">
                    <span className="rule-badge red">STRICT</span>
                    <div>
                      <strong>No Clinical Prescriptions or Diagnoses</strong>
                      <small>The agent will never prescribe medication, diagnose symptoms, or advise changing doctor-ordered therapy.</small>
                    </div>
                  </div>
                  <div className="rule-item">
                    <span className="rule-badge amber">ESTIMATE</span>
                    <div>
                      <strong>Computational Hypotheses Only</strong>
                      <small>DTI scores and affinity predictions represent statistical estimates for laboratory synthesis, not verified biological truths.</small>
                    </div>
                  </div>
                  <div className="rule-item">
                    <span className="rule-badge green">CONTROL</span>
                    <div>
                      <strong>Safe Intent Execution Architecture</strong>
                      <small>The agent cannot run arbitrary code; actions pass through a certified application registry.</small>
                    </div>
                  </div>
                </div>

                <div className="disclaimer-callout">
                  <ShieldCheck size={16} />
                  <span>Always verify pharmaceutical instructions with a licensed medical professional or pharmacist.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Natural Language Prompt & Input Area */}
        <form className="panel-footer-input" onSubmit={handleSend}>
          <div className="input-wrap">
            <Sparkles size={15} className="sparkle-decor" />
            <input
              ref={inputRef}
              type="text"
              className="chat-input-field"
              placeholder="Ask Bipasha Mam... (e.g. 'Open DTI Lab' or 'Check expiries')"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              aria-label="Message Bipasha Mam"
            />
            <button
              type="submit"
              className="send-message-btn"
              disabled={!inputText.trim()}
              aria-label="Send message"
            >
              <Send size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
