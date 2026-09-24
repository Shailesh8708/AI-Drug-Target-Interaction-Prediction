import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { getActionById, parseAgentIntent, getContextualGreeting } from './BipashaActionRegistry'

const BipashaContext = createContext(null)

export function BipashaProvider({ children, activePage, navigate, setNotice }) {
  const [isOpen, setIsOpen] = useState(false)
  const [agentState, setAgentState] = useState('idle') // idle, hover, activating, greeting, thinking, navigating, success, error, minimized
  const [activeLoadingAction, setActiveLoadingAction] = useState(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome',
      sender: 'bipasha',
      text: "Hello! I'm Bipasha Mam, your AI Research & Discovery Assistant. Ready to explore the computational biology workspace?",
      time: 'Just now',
      suggestions: ['Launch DTI Lab', 'View 3D Molecule', 'Check Expiries', 'Explain Predictions'],
    },
  ])

  const animationFrameRef = useRef(null)
  const loadingStartTimeRef = useRef(null)
  const loadingDurationRef = useRef(3600) // 3.6s target duration within 3-5s requirement

  // Update greeting when page changes
  useEffect(() => {
    const greetingData = getContextualGreeting(activePage)
    // Add brief contextual greeting note if panel is open or keep ready
    if (greetingData) {
      setChatMessages((prev) => {
        // Only append if last message wasn't identical greeting to avoid spam
        if (prev.length > 0 && prev[prev.length - 1].contextPage === activePage) {
          return prev
        }
        return [
          ...prev,
          {
            id: `context-${activePage}-${Date.now()}`,
            sender: 'bipasha',
            contextPage: activePage,
            text: greetingData.greeting,
            subtext: greetingData.subtext,
            time: 'Live',
            suggestions: greetingData.quickActions.map((a) => a.label),
          },
        ]
      })
    }
  }, [activePage])

  const cancelLoading = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    setActiveLoadingAction(null)
    setLoadingProgress(0)
    setAgentState('idle')
  }, [])

  const completeNavigation = useCallback((action) => {
    if (action && action.route) {
      navigate(action.route)
      if (setNotice) {
        setNotice(`Navigated to ${action.label} via Bipasha Mam`)
      }
    }
    setActiveLoadingAction(null)
    setLoadingProgress(0)
    setAgentState('success')
    setIsOpen(false) // Automatically minimizes panel to orb

    setTimeout(() => {
      setAgentState('idle')
    }, 1400)
  }, [navigate, setNotice])

  const skipLoading = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    setLoadingProgress(100)
    if (activeLoadingAction) {
      setTimeout(() => {
        completeNavigation(activeLoadingAction)
      }, 150)
    }
  }, [activeLoadingAction, completeNavigation])

  const executeAction = useCallback((actionId, options = {}) => {
    const action = getActionById(actionId)
    if (!action) {
      // Fallback: check if actionId is overview
      if (actionId === 'overview') {
        navigate('overview')
        setIsOpen(false)
        return
      }
      console.warn(`Action ${actionId} not found in BipashaActionRegistry`)
      return
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    const duration = options.fast ? 800 : (options.duration || 3600)
    loadingDurationRef.current = duration
    setActiveLoadingAction(action)
    setLoadingProgress(0)
    setAgentState('navigating')
    loadingStartTimeRef.current = performance.now()

    const step = (currentTime) => {
      const elapsed = currentTime - loadingStartTimeRef.current
      const linearRatio = Math.min(elapsed / loadingDurationRef.current, 1)
      // Ease in-out cubic progression for realistic staged calculation feeling
      const easedProgress = linearRatio < 0.5
        ? 4 * linearRatio * linearRatio * linearRatio
        : 1 - Math.pow(-2 * linearRatio + 2, 3) / 2
      
      const currentPercent = Math.min(Math.round(easedProgress * 100), 100)
      setLoadingProgress(currentPercent)

      if (linearRatio < 1) {
        animationFrameRef.current = requestAnimationFrame(step)
      } else {
        // Finished loading
        setLoadingProgress(100)
        setTimeout(() => {
          completeNavigation(action)
        }, 320)
      }
    }

    animationFrameRef.current = requestAnimationFrame(step)
  }, [completeNavigation, navigate])

  const sendChatMessage = useCallback((text) => {
    if (!text || !text.trim()) return

    const trimmed = text.trim()
    const userMsgId = `user-${Date.now()}`
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    setChatMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: 'user', text: trimmed, time: timeStr },
    ])

    setAgentState('thinking')

    setTimeout(() => {
      const intent = parseAgentIntent(trimmed)
      const botMsgId = `bot-${Date.now()}`

      setChatMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          sender: 'bipasha',
          text: intent.text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: intent.suggestions || [],
          targetAction: intent.targetAction,
          actionLabel: intent.actionLabel,
        },
      ])

      setAgentState('idle')

      // If user clearly commanded navigation, trigger the action smoothly
      if (intent.type === 'navigate' && intent.targetAction) {
        setTimeout(() => {
          executeAction(intent.targetAction)
        }, 650)
      }
    }, 450)
  }, [executeAction])

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev
      if (next) {
        setAgentState('activating')
        setTimeout(() => setAgentState('greeting'), 400)
      } else {
        setAgentState('idle')
      }
      return next
    })
  }, [])

  return (
    <BipashaContext.Provider
      value={{
        isOpen,
        setIsOpen,
        toggleOpen,
        agentState,
        setAgentState,
        activeLoadingAction,
        loadingProgress,
        executeAction,
        cancelLoading,
        skipLoading,
        chatMessages,
        sendChatMessage,
        activePage,
        navigate,
      }}
    >
      {children}
    </BipashaContext.Provider>
  )
}

export function useBipasha() {
  const context = useContext(BipashaContext)
  if (!context) {
    throw new Error('useBipasha must be used within a BipashaProvider')
  }
  return context
}
