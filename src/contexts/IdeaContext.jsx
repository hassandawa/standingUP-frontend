import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSavedIdeas, getSavedIdeaById, createSavedIdea, deleteSavedIdea } from '../services/api.js';
import { getSession, saveValue, readValue } from '../services/storage.js';

const IDEA_STORAGE_KEY = 'startingup.selectedIdeaId';

const IdeaContext = createContext(null);

export function IdeaProvider({ children }) {
  const [savedIdeas, setSavedIdeas] = useState([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState(() => {
    try {
      return localStorage.getItem(IDEA_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingList, setFetchingList] = useState(false);
  const [error, setError] = useState('');

  const [session, setSessionState] = useState(() => getSession());
  const isAuthenticated = !!session?.token;

  useEffect(() => {
    function refreshSession() {
      setSessionState(getSession());
    }
    window.addEventListener('startingup:session-changed', refreshSession);
    window.addEventListener('storage', refreshSession);
    // Also catch the case where sign-in happened just before this provider
    // mounted/rendered (e.g. a fresh page load right after redirect).
    refreshSession();
    return () => {
      window.removeEventListener('startingup:session-changed', refreshSession);
      window.removeEventListener('storage', refreshSession);
    };
  }, []);

  const fetchSavedIdeas = useCallback(async () => {
    if (!isAuthenticated) return;
    setFetchingList(true);
    try {
      const ideas = await getSavedIdeas();
      setSavedIdeas(ideas);
    } catch (err) {
      console.error('Failed to fetch saved ideas:', err);
    } finally {
      setFetchingList(false);
    }
  }, [isAuthenticated]);

  const loadIdea = useCallback(async (ideaId) => {
    if (!ideaId || !isAuthenticated) return;
    setLoading(true);
    setError('');
    try {
      const idea = await getSavedIdeaById(ideaId);
      setSelectedIdea(idea);
      setSelectedIdeaId(ideaId);
      // Sync to localStorage for cross-session persistence
      try {
        localStorage.setItem(IDEA_STORAGE_KEY, ideaId);
      } catch {}
      // Sync to sessionStorage so hub pages can read it via readValue('selectedIdea')
      if (idea?.idea_data) {
        saveValue('selectedIdea', idea.idea_data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load idea');
      setSelectedIdea(null);
      // If the referenced idea no longer exists (deleted, or a stale ID
      // left over from before a migration), stop pointing at it so this
      // doesn't keep failing on every future page load.
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('not found')) {
        setSelectedIdeaId(null);
        try {
          localStorage.removeItem(IDEA_STORAGE_KEY);
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const selectIdea = useCallback(async (ideaId) => {
    if (!ideaId) {
      setSelectedIdea(null);
      setSelectedIdeaId(null);
      try {
        localStorage.removeItem(IDEA_STORAGE_KEY);
      } catch {}
      return;
    }
    await loadIdea(ideaId);
  }, [loadIdea]);

  const saveNewIdea = useCallback(async (payload) => {
    if (!isAuthenticated) throw new Error('Authentication required');
    const result = await createSavedIdea(payload);
    await fetchSavedIdeas();
    if (result.idea_id) {
      await selectIdea(result.idea_id);
    }
    return result;
  }, [isAuthenticated, fetchSavedIdeas, selectIdea]);

  const removeIdea = useCallback(async (ideaId) => {
    if (!isAuthenticated) throw new Error('Authentication required');
    await deleteSavedIdea(ideaId);
    if (selectedIdeaId === ideaId) {
      setSelectedIdea(null);
      setSelectedIdeaId(null);
      try {
        localStorage.removeItem(IDEA_STORAGE_KEY);
      } catch {}
    }
    await fetchSavedIdeas();
  }, [isAuthenticated, selectedIdeaId, fetchSavedIdeas]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedIdeas();
    }
  }, [isAuthenticated, fetchSavedIdeas]);

  useEffect(() => {
    if (selectedIdeaId && isAuthenticated && !selectedIdea) {
      loadIdea(selectedIdeaId);
    }
  }, [selectedIdeaId, isAuthenticated, selectedIdea, loadIdea]);

  const value = {
    savedIdeas,
    selectedIdea,
    selectedIdeaId,
    loading,
    fetchingList,
    error,
    isAuthenticated,
    fetchSavedIdeas,
    selectIdea,
    saveNewIdea,
    removeIdea,
  };

  return <IdeaContext.Provider value={value}>{children}</IdeaContext.Provider>;
}

export function useIdea() {
  const context = useContext(IdeaContext);
  if (!context) {
    throw new Error('useIdea must be used within an IdeaProvider');
  }
  return context;
}
