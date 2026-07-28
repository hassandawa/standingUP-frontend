const KEYS = {
  session: 'startingup.session',
  profile: 'startingup.profile',
  analysis: 'startingup.analysis',
  ideas: 'startingup.ideas',
  selectedIdea: 'startingup.selectedIdea',
  plan: 'startingup.plan',
  ideaAnalysis: 'startingup.ideaAnalysis',
  ideaForm: 'startingup.ideaForm',
  buildProgress: 'startingup.buildProgress',
  progressToken: 'startingup.progressToken',
  customerPlan: 'startingup.customerPlan',
  decisionReport: 'startingup.decisionReport',
  businessPlan: 'startingup.businessPlan',
  customerInsights: 'startingup.customerInsights',
  marketIntelligence: 'startingup.marketIntelligence',
  investorTools: 'startingup.investorTools',
  marketingHub: 'startingup.marketingHub',
  developmentHub: 'startingup.developmentHub',
  growthHub: 'startingup.growthHub',
  financialPlan: 'startingup.financialPlan',
  launchHub: 'startingup.launchHub',
};

export function saveValue(key, value) {
  sessionStorage.setItem(KEYS[key], JSON.stringify(value));
}

export function readValue(key, fallback = null) {
  const raw = sessionStorage.getItem(KEYS[key]);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function clearGeneratedState() {
  ['profile', 'analysis', 'ideas', 'selectedIdea', 'plan', 'ideaAnalysis', 'ideaForm', 'buildProgress', 'progressToken', 'customerPlan', 'decisionReport', 'businessPlan', 'customerInsights', 'marketIntelligence', 'investorTools', 'marketingHub', 'developmentHub', 'growthHub', 'financialPlan', 'launchHub'].forEach((key) => {
    sessionStorage.removeItem(KEYS[key]);
  });
}

// Session storage clears when the tab/browser closes; localStorage persists
// across browser restarts. "Remember me" decides which one backs the
// session, and reads always check both so a page reload works either way.
export function setSession(auth, remember = false) {
  const raw = JSON.stringify(auth);
  if (remember) {
    localStorage.setItem(KEYS.session, raw);
    sessionStorage.removeItem(KEYS.session);
  } else {
    sessionStorage.setItem(KEYS.session, raw);
    localStorage.removeItem(KEYS.session);
  }
  window.dispatchEvent(new Event('startingup:session-changed'));
}

export function getSession() {
  const raw = localStorage.getItem(KEYS.session) || sessionStorage.getItem(KEYS.session);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(KEYS.session);
  sessionStorage.removeItem(KEYS.session);
  window.dispatchEvent(new Event('startingup:session-changed'));
}
