import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [logs, setLogs] = useState([]);
  const [goal, setGoal] = useState('');
  const [status, setStatus] = useState('disconnected');
  const [attachedFiles, setAttachedFiles] = useState([]);

  const [cursor, setCursor] = useState({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
    visible: false,
    text: ''
  });

  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/agent');
    wsRef.current = ws;

    ws.onopen = () => setStatus('connected');
    ws.onclose = () => setStatus('disconnected');
    ws.onerror = () => setStatus('error');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLogs((prev) => [...prev, data]);

      if (data.x !== undefined && data.y !== undefined) {
        setCursor((prev) => {
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;

          if (!prev.visible) {
            setTimeout(() => {
              setCursor({
                x: data.x,
                y: data.y,
                visible: true,
                text: data.text || ''
              });
            }, 50);

            return {
              x: centerX,
              y: centerY,
              visible: true,
              text: 'Targeting...'
            };
          }

          return {
            x: data.x,
            y: data.y,
            visible: true,
            text: data.text || ''
          };
        });
      } else if (data.action === "DONE") {
        setTimeout(() => {
          setCursor({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            visible: false,
            text: ''
          });
        }, 2000);
      }
    };

    return () => ws.close();
  }, []);

  const handleSendGoal = (e) => {
    e.preventDefault();
    if (!goal.trim()) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ goal }));
    }

    setLogs((prev) => [...prev, { action: 'USER', text: goal }]);
    setGoal('');
  };

  const handleFileAttach = (e) => {
    if (e.target.files) {
      setAttachedFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="flex h-screen w-screen bg-white font-sans overflow-hidden relative select-none">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-slate-100 border-r border-slate-200 flex flex-col justify-between p-4 flex-shrink-0 h-full">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">
                T
              </div>
              <span className="font-bold text-xl text-slate-900">Tuto</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
          </div>

          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm">
            <span className="text-xl leading-none">+</span> New Project
          </button>

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

          <div className="pt-8 text-center px-2">
            <p className="text-xs text-slate-400 leading-relaxed">
              No projects found. Create a new project to get started.
            </p>
          </div>
        </div>

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

      {/* --- MAIN CONTENT (EXPANDS TO FILL THE FULL WINDOW) --- */}
      <main className="flex-1 flex flex-col bg-white h-full min-w-0">
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
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

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3 text-2xl">
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

        <div className="p-4 border-t border-slate-100 bg-white flex-shrink-0">
          <form onSubmit={handleSendGoal} className="relative flex items-center">
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

            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Posez une question ou entrez une commande..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-24 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-300 transition-colors"
            />

            <button
              type="submit"
              className="absolute right-2 bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-1.5 rounded-lg text-sm transition-colors"
            >
              Send
            </button>
          </form>

          {attachedFiles && attachedFiles.length > 0 && (
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

      {/* --- CURSOR OVERLAY --- */}
      {cursor && cursor.visible && (
        <div
          className="fixed pointer-events-none z-50 transition-all duration-700 ease-out flex items-center gap-2"
          style={{
            left: `${cursor.x}px`,
            top: `${cursor.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="relative flex items-center justify-center w-10 h-10">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-6 w-6 bg-red-600 border-2 border-white shadow-lg"></span>
          </div>

          <div className="bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-lg border border-slate-700 shadow-xl backdrop-blur font-medium whitespace-nowrap">
            {cursor.text}
          </div>
        </div>
      )}
    </div>
  );
}