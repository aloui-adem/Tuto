import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [status, setStatus] = useState('disconnected');
  const [goal, setGoal] = useState('');
  const [logs, setLogs] = useState([]);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    // Connect to Python WebSocket backend
    const ws = new WebSocket('ws://localhost:8000/ws/agent');

    ws.onopen = () => {
      setStatus('connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLogs((prev) => [...prev, data]);
    };

    ws.onclose = () => {
      setStatus('disconnected');
    };

    ws.onerror = () => {
      setStatus('disconnected');
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  const handleSendGoal = (e) => {
    e?.preventDefault();
    if (!goal.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const payload = {
      goal: goal,
      files: attachedFiles.map((f) => ({ name: f.name }))
    };

    wsRef.current.send(JSON.stringify(payload));
    setGoal('');
  };

  const handleFileAttach = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles((prev) => [...prev, ...files]);
  };

  return (
    <div className="flex h-screen w-screen bg-gray-50 text-slate-800 font-sans overflow-hidden">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-slate-100 border-r border-slate-200 flex flex-col justify-between p-4">
        <div className="space-y-4">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">
                T
              </div>
              <span className="font-bold text-xl text-slate-900">Tuto</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
          </div>

          {/* New Project Button */}
          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm">
            <span className="text-xl leading-none">+</span> New Project
          </button>

          {/* Search Box */}
          <div className="relative">
            <svg
              className="w-4 h-4 absolute left-3 top-3 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Rechercher"
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Empty State */}
          <div className="pt-8 text-center px-2">
            <p className="text-xs text-slate-400 leading-relaxed">
              No projects found. create a new project to get started.
            </p>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm">
              G
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 leading-none">Guest</p>
              <p className="text-xs text-slate-400 mt-1">Studio • Pro</p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600">⋮</button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col bg-white">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Context</h2>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
              Online
            </span>
            <div className="flex items-center gap-1.5 ml-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  status === 'connected' ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <span className="text-xs font-mono text-slate-500">Status: {status}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase px-4 py-2 rounded-lg transition-colors shadow-sm tracking-wide">
              EMERGENCY STOP
            </button>
            <button className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              Share
            </button>
          </div>
        </header>

        {/* Content Body / Agent Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                🤖
              </div>
              <p className="text-sm font-medium">Need help with something...</p>
            </div>
          ) : (
            logs.map((log, idx) => (
              <div
                key={idx}
                className="bg-slate-900 text-slate-100 p-3.5 rounded-xl text-sm border border-slate-800 shadow-sm flex items-center gap-3"
              >
                <span className="font-bold text-yellow-400 font-mono">[{log.action}]</span>
                <span className="text-slate-200">{log.text}</span>
              </div>
            ))
          )}
        </div>

        {/* Floating Input Footer */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <form onSubmit={handleSendGoal} className="relative flex items-center">
            {/* Attachment Button */}
            <label className="absolute left-3 cursor-pointer text-slate-400 hover:text-slate-600 p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
              <input type="file" multiple className="hidden" onChange={handleFileAttach} />
            </label>

            {/* Input Field */}
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Posez une question ou entrez une commande..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-24 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-300 transition-colors"
            />

            {/* Send Button */}
            <button
              type="submit"
              className="absolute right-2 bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-1.5 rounded-lg text-sm transition-colors"
            >
              Send
            </button>
          </form>

          {/* Attached Files Chips */}
          {attachedFiles.length > 0 && (
            <div className="flex gap-2 mt-2">
              {attachedFiles.map((file, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200 flex items-center gap-1"
                >
                  📎 {file.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}