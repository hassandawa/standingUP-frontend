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

export function setSession(auth) {
  saveValue('session', auth);
  window.dispatchEvent(new Event('startingup:session-changed'));
}

export function getSession() {
  return readValue('session');
}

export function clearSession() {
  sessionStorage.removeItem(KEYS.session);
  window.dispatchEvent(new Event('startingup:session-changed'));
}
