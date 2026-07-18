import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Lightbulb, Trash2, Plus, Loader2, AlertCircle } from 'lucide-react';
import { useIdea } from '../contexts/IdeaContext.jsx';

export default function IdeaSelector() {
  const { savedIdeas, selectedIdea, selectedIdeaId, loading, fetchingList, error, isAuthenticated, selectIdea, removeIdea } = useIdea();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (!isAuthenticated) {
    return (
      <div className="border-2 border-[#0A0A0A] bg-white p-4 mb-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-4 w-4 text-[#6A6A6A] flex-shrink-0" />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Sign in required</p>
            <p className="text-[11px] text-[#6A6A6A] mt-0.5">Sign in to access your saved ideas across all tools.</p>
          </div>
          <Link to="/signin" className="ml-auto h-8 px-4 border-2 border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EE] text-[10px] font-black uppercase tracking-widest flex items-center hover:bg-transparent hover:text-[#0A0A0A] transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (fetchingList) {
    return (
      <div className="border-2 border-[#0A0A0A] bg-white p-4 mb-6">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-[#6A6A6A]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#6A6A6A]">Loading saved ideas...</span>
        </div>
      </div>
    );
  }

  if (savedIdeas.length === 0) {
    return (
      <div className="border-2 border-dashed border-[#0A0A0A] bg-white p-6 mb-6">
        <div className="text-center">
          <Lightbulb className="h-8 w-8 text-[#C0BDB6] mx-auto mb-3" />
          <p className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A] mb-1">No saved ideas yet</p>
          <p className="text-[11px] text-[#6A6A6A] mb-4">Analyze or generate an idea first, then save it to access it here.</p>
          <Link to="/input" className="inline-flex items-center gap-1.5 h-9 px-5 border-2 border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EE] text-[10px] font-black uppercase tracking-widest hover:bg-transparent hover:text-[#0A0A0A] transition-colors">
            <Plus className="h-3 w-3" /> Create Idea
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full border-2 border-[#0A0A0A] bg-white p-4 flex items-center justify-between hover:bg-[#F5F3EE] transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Lightbulb className="h-4 w-4 text-[#0A0A0A] flex-shrink-0" />
          <div className="text-left min-w-0">
            {selectedIdea ? (
              <>
                <p className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A] truncate">{selectedIdea.title}</p>
                {selectedIdea.description && (
                  <p className="text-[10px] text-[#6A6A6A] truncate mt-0.5">{selectedIdea.description}</p>
                )}
              </>
            ) : (
              <p className="text-xs font-bold uppercase tracking-widest text-[#6A6A6A]">Select a saved idea</p>
            )}
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-[#6A6A6A] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 border-2 border-[#0A0A0A] bg-white shadow-[4px_4px_0px_#0A0A0A] z-50 max-h-64 overflow-y-auto">
          {savedIdeas.map((idea) => (
            <div
              key={idea.id}
              className={`flex items-center justify-between p-3 border-b border-[#0A0A0A] last:border-b-0 cursor-pointer transition-colors ${selectedIdeaId === idea.id ? 'bg-[#F5F3EE]' : 'hover:bg-[#F5F3EE]'}`}
            >
              <button
                onClick={() => { selectIdea(idea.id); setOpen(false); }}
                className="flex-1 text-left min-w-0"
              >
                <p className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A] truncate">{idea.title}</p>
                {idea.description && (
                  <p className="text-[10px] text-[#6A6A6A] truncate mt-0.5">{idea.description}</p>
                )}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); removeIdea(idea.id); }}
                className="ml-2 p-1 hover:bg-red-50 transition-colors flex-shrink-0"
                title="Delete idea"
              >
                <Trash2 className="h-3 w-3 text-[#6A6A6A] hover:text-red-600" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-2 border-2 border-red-600 bg-red-50 p-2">
          <p className="text-[10px] font-bold text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
