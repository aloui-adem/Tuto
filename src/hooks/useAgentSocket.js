import { useState, useEffect, useRef } from 'react'

export function useAgentSocket(url = 'ws://localhost:8000/ws/agent') {
  const [isConnected, setIsConnected] = useState(false)
  const [logs, setLogs] = useState([])
  const [agentStatus, setAgentStatus] = useState('idle')
  const socketRef = useRef(null)

  useEffect(() => {
    const ws = new WebSocket(url)
    socketRef.current = ws

    ws.onopen = () => setIsConnected(true)
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.type === 'STATUS') setAgentStatus(data.payload)
        if (data.type === 'LOG') setLogs((prev) => [...prev, data.payload])
      } catch {
        setLogs((prev) => [...prev, { text: e.data, type: 'bot' }])
      }
    }
    ws.onclose = () => {
      setIsConnected(false)
      setAgentStatus('disconnected')
    }

    return () => ws.close()
  }, [url])

  const sendGoal = (goalText) => {
    if (socketRef.current && isConnected) {
      socketRef.current.send(JSON.stringify({ action: 'START', goal: goalText }))
      setAgentStatus('running')
    }
  }

  const stopAgent = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.send(JSON.stringify({ action: 'STOP' }))
      setAgentStatus('idle')
    }
  }

  return { isConnected, logs, agentStatus, sendGoal, stopAgent }
}