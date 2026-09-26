import { Plus, Search, FolderClosed, EllipsisVertical, LibraryBig } from 'lucide-react'

export default function Sidebar({ projects = [], currentProjectId, isConnected, onNewProject }) {
  const groupedProjects = projects.reduce((groups, project) => {
    const section = project.section || 'RECENT'
    if (!groups[section]) groups[section] = []
    groups[section].push(project)
    return groups
  }, {})

  return (
    <aside className="w-72 bg-slate-50 text-slate-900 border-r border-slate-200 p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-600 text-white font-bold text-center leading-8 text-xl">T</div>
          <span className="text-2xl font-bold text-slate-900">Tuto</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
          <div className="w-8 h-8 border border-slate-200 rounded-lg flex items-center justify-center text-slate-500">
            <LibraryBig size={20} />
          </div>
        </div>
      </div>

      <button 
        onClick={onNewProject}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
      >
        <Plus size={20} />
        New Project
      </button>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Rechercher" 
          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none"
        />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto pr-1">
        {Object.keys(groupedProjects).length === 0 ? (
          <div className="text-xs text-slate-400 text-center py-8">
            No projects found. create a new project to get started.
          </div>
        ) : (
          Object.entries(groupedProjects).map(([section, projectsList]) => (
            <div key={section} className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase pl-3">{section}</h3>
              {projectsList.map((project) => (
                <div
                  key={project.id}
                  className={`flex items-start gap-3.5 p-3 rounded-xl cursor-pointer ${project.id === currentProjectId ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${project.id === currentProjectId ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                    <FolderClosed size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-slate-950">{project.name}</p>
                    <p className="text-xs text-slate-500 truncate">{project.info || 'Nouveau'}</p>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </nav>

      <div className="border-t border-slate-200 pt-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-200 text-center leading-10 text-xl font-medium text-slate-500">G</div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-950">Guest</p>
          <p className="text-xs text-slate-500">Studio • Pro</p>
        </div>
        <EllipsisVertical size={20} className="text-slate-500" />
      </div>
    </aside>
  )
}