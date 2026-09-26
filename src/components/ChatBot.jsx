
import { Users, Paperclip, ArrowUp, Bot } from 'lucide-react'
import { useState, useRef } from 'react'


export default function ChatBot({ currentProject, logs = [], agentStatus, onSendMessage, onEmergencyStop }) {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')

const [attachedFiles, setAttachedFiles] = useState([])
  const fileInputRef = useRef(null)

  const handlePaperclipClick = () => fileInputRef.current?.click()

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files)
    if (selected.length > 0) setAttachedFiles((prev) => [...prev, ...selected])
    e.target.value = ''
  }

  const removeFile = (index) => {
    setAttachedFiles((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleSend = () => {
    if (inputValue.trim() || attachedFiles.length > 0) {
      const fileData = attachedFiles.map((file) => ({
        name: file.name,
        path: file.path || file.name, // Electron exposes native file path
      }))

      const userMsg = { id: Date.now(), type: 'user', text: inputValue.trim(), files: fileData }
      setMessages((prev) => [...prev, userMsg])

      onSendMessage({ goal: inputValue.trim(), files: fileData })

      setInputValue('')
      setAttachedFiles([])
    }
  }

  return (
    <main className="flex-1 bg-white text-slate-900 flex flex-col h-full overflow-hidden">
      <header className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-950">{currentProject?.name || 'New Session'}</h1>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{currentProject?.status || 'Offline'}</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-700">Status: {agentStatus}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onEmergencyStop}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow transition cursor-pointer"
          >
            EMERGENCY STOP
          </button>
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold flex items-center gap-2">
            <Users size={18} /> Share
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
              <Bot size={28} />
            </div>
            <p className="text-sm font-medium">Need help with something...</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-4 rounded-2xl max-w-[70%] ${msg.type === 'user' ? 'bg-slate-100 text-slate-900' : 'bg-slate-50 border border-slate-200 text-slate-800'}`}>
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))
        )}

        {logs.length > 0 && (
          <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-xl space-y-1">
            <p className="text-slate-500 uppercase font-sans font-bold text-[10px]">Live Agent Execution Log</p>
            {logs.map((log, idx) => (
              <p key={idx}>&gt; {typeof log === 'string' ? log : JSON.stringify(log)}</p>
            ))}
          </div>
        )}
      </div>

      <footer className="p-6 border-t border-slate-100 flex flex-col items-center gap-2">
        <div className="w-full max-w-4xl bg-white border border-slate-200 p-2 rounded-2xl flex flex-col gap-2 shadow-lg">
          
          {/* File Attachment Previews */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 px-2 pt-1 border-b border-slate-100 pb-2">
              {attachedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-lg text-xs font-medium">
                  <FileText size={14} className="text-red-600" />
                  <span className="max-w-[180px] truncate">{file.name}</span>
                  <button onClick={() => removeFile(index)} className="text-slate-400 hover:text-slate-600 ml-1 cursor-pointer">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Hidden File Input */}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" />

            {/* Paperclip Button */}
            <button 
              type="button" 
              onClick={handlePaperclipClick} 
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <Paperclip size={20} />
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Posez une question ou entrez une commande..."
              className="flex-1 border-none bg-transparent text-sm focus:outline-none px-2"
            />
            <button onClick={handleSend} className="p-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition cursor-pointer">
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </footer>
    </main>
  )
}