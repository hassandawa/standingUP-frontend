import axios from 'axios';

const API_URL_STORAGE_KEY = 'startingup.apiUrl';

function cleanApiUrl(value) {
  return (value || '').trim().replace(/\/$/, '');
}

function readRuntimeApiUrl() {
  if (typeof window === 'undefined') {
    return '';
  }
  const params = new URLSearchParams(window.location.search);
  const urlFromQuery = cleanApiUrl(params.get('apiUrl'));
  if (urlFromQuery) {
    window.localStorage.setItem(API_URL_STORAGE_KEY, urlFromQuery);
    params.delete('apiUrl');
    const nextSearch = params.toString();
    const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
    window.history.replaceState({}, '', nextUrl);
    return urlFromQuery;
  }
  return cleanApiUrl(window.localStorage.getItem(API_URL_STORAGE_KEY));
}

const API_BASE_URL = cleanApiUrl(import.meta.env.VITE_API_URL) || readRuntimeApiUrl();
const isProduction = import.meta.env.PROD;

function assertApiConfigured() {
  if (isProduction && !API_BASE_URL) {
    throw new Error('Frontend is missing VITE_API_URL. Set it in Vercel Project Settings > Environment Variables for Production, then redeploy. You can also open the site once with ?apiUrl=https://your-render-backend.onrender.com.');
  }
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 90000,
});

api.interceptors.request.use((config) => {
  const raw = sessionStorage.getItem('startingup.session');
  if (raw) {
    try {
      const session = JSON.parse(raw);
      if (session?.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
      }
    } catch {
      // Ignore malformed local session data.
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config || config._retry) return Promise.reject(error);
    const status = error.response?.status;
    if (status === 429 || (status >= 500 && status < 600)) {
      config._retry = true;
      const retryCount = config._retryCount || 0;
      const maxRetries = 2;
      if (retryCount < maxRetries) {
        config._retryCount = retryCount + 1;
        const delay = Math.min(1000 * 2 ** retryCount, 10000);
        await new Promise((r) => setTimeout(r, delay));
        return api(config);
      }
    }
    return Promise.reject(error);
  }
);

function apiError(error) {
  if (error.message?.includes('VITE_API_URL')) {
    return error.message;
  }
  if (error.response?.status === 405 && !API_BASE_URL) {
    return 'API URL is not configured. Set VITE_API_URL in Vercel to your Render backend URL, or open the site with ?apiUrl=https://your-render-backend.onrender.com.';
  }
  const detail = error.response?.data?.detail || error.response?.data?.message;
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || d.message || JSON.stringify(d)).join('; ');
  }
  return detail || error.message || 'Request failed. Please try again.';
}

export async function analyzeProfile(profile) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/profile/analyze', profile);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function signUpAccount(payload) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/auth/signup', payload);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function signInAccount(payload) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/auth/signin', payload);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function getCurrentUser() {
  try {
    assertApiConfigured();
    const { data } = await api.get('/api/auth/me');
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function logoutAccount() {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/auth/logout');
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function requestPasswordReset(email) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/auth/forgot-password', { email });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function verifyResetToken(token) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/auth/verify-reset-token', { token });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function resetPassword(token, newPassword) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/auth/reset-password', { token, new_password: newPassword });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function generateIdeas(profile) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/startups/generate', profile);
    return data.ideas || [];
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function generatePlan(profile, idea) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/startups/plan', { profile, idea });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function savePlan(profile, plan) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/startups/save', { profile, plan });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function getSavedPlans() {
  try {
    assertApiConfigured();
    const { data } = await api.get('/api/startups/saved');
    return data.plans || [];
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function deletePlan(planId) {
  try {
    assertApiConfigured();
    const { data } = await api.delete(`/api/startups/${planId}`);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function analyzeIdea(payload) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/startups/analyze-idea', payload);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

function getAuthHeaders() {
  const raw = sessionStorage.getItem('startingup.session');
  if (raw) {
    try {
      const session = JSON.parse(raw);
      if (session?.token) {
        return { Authorization: `Bearer ${session.token}` };
      }
    } catch {
      // Ignore malformed session data.
    }
  }
  return {};
}

export async function analyzeIdeaStream(payload, onToken, onDone, onError) {
  try {
    assertApiConfigured();
  } catch (error) {
    onError(error.message);
    return;
  }
  const url = API_BASE_URL ? `${API_BASE_URL}/api/startups/analyze-idea/stream` : '/api/startups/analyze-idea/stream';
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      onError(`Server error ${response.status}`);
      return;
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            if (parsed.token) {
              onToken(parsed.token);
            } else if (parsed.done) {
              onDone(parsed.result);
              return;
            } else if (parsed.error) {
              onError(parsed.error);
              return;
            }
          } catch {
            // skip malformed JSON
          }
        }
      }
    }
  } catch (error) {
    onError(error.message);
  }
}

export async function chatAboutIdea(analysis, question) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/startups/analyze-idea/chat', { analysis, question });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function chatAboutIdeaStream(analysis, question, onToken, onDone, onError) {
  try {
    assertApiConfigured();
  } catch (error) {
    onError(error.message);
    return;
  }
  const url = API_BASE_URL ? `${API_BASE_URL}/api/startups/analyze-idea/chat/stream` : '/api/startups/analyze-idea/chat/stream';
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ analysis, question }),
    });
    if (!response.ok) {
      onError(`Server error ${response.status}`);
      return;
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            if (parsed.token) {
              onToken(parsed.token);
            } else if (parsed.done) {
              onDone(parsed.answer);
              return;
            } else if (parsed.error) {
              onError(parsed.error);
              return;
            }
          } catch {
            // skip malformed JSON
          }
        }
      }
    }
  } catch (error) {
    onError(error.message);
  }
}

export async function shareAnalysis(analysis, ideaForm = {}) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/startups/analyze-idea/share', { analysis, idea_form: ideaForm });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function getSharedAnalysis(token) {
  try {
    assertApiConfigured();
    const { data } = await api.get(`/api/share/${token}`);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function estimateMarketSize(payload) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/startups/market-size', payload);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function runDebate(payload) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/startups/debate', payload);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function compareIdeas(payload) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/startups/compare', payload);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function sendEmailReport(analysis, recipientEmail, ideaForm = {}) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/startups/email-report', { analysis, recipient_email: recipientEmail, idea_form: ideaForm });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function saveAnalysisProgress(analysis, ideaForm = {}) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/startups/analyze-idea/save', { analysis, idea_form: ideaForm });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function getSavedAnalyses() {
  try {
    assertApiConfigured();
    const { data } = await api.get('/api/startups/analyze-idea/saved');
    return data.analyses || [];
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function deleteSavedAnalysis(analysisId) {
  try {
    assertApiConfigured();
    const { data } = await api.delete(`/api/startups/analyze-idea/saved/${analysisId}`);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function saveBuildProgress(token, day, completedTasks, notes = '') {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/startups/progress/save', { token, day, completed_tasks: completedTasks, notes });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function loadBuildProgress(token) {
  try {
    assertApiConfigured();
    const { data } = await api.get(`/api/startups/progress/${token}`);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function getAnalytics() {
  try {
    assertApiConfigured();
    const { data } = await api.get('/api/analytics');
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function generateFirst100Customers(data) {
  try {
    assertApiConfigured();
    const { data: result } = await api.post('/api/startups/first-100-customers', data);
    return result;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function saveCustomerStrategy(strategy, ideaContext = {}, ideaId = null) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/startups/first-100-customers/save', { strategy, idea_context: ideaContext, idea_id: ideaId });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function getSavedCustomerStrategies() {
  try {
    assertApiConfigured();
    const { data } = await api.get('/api/startups/first-100-customers/saved');
    return data.strategies || [];
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function deleteCustomerStrategy(strategyId) {
  try {
    assertApiConfigured();
    const { data } = await api.delete(`/api/startups/first-100-customers/${strategyId}`);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function generateDecisionEngine(data) {
  try {
    assertApiConfigured();
    const { data: result } = await api.post('/api/startups/decision-engine', data);
    return result;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function saveDecisionReport(report, ideaContext = {}, ideaId = null) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/startups/decision-engine/save', { report, idea_context: ideaContext, idea_id: ideaId });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function getSavedDecisionReports() {
  try {
    assertApiConfigured();
    const { data } = await api.get('/api/startups/decision-engine/saved');
    return data.reports || [];
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function deleteDecisionReport(reportId) {
  try {
    assertApiConfigured();
    const { data } = await api.delete(`/api/startups/decision-engine/${reportId}`);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function generateBusinessPlan(data) {
  try {
    assertApiConfigured();
    const { data: result } = await api.post('/api/startups/business-plan', data);
    return result;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function saveBusinessPlan(plan, ideaContext = {}, ideaId = null) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/startups/business-plan/save', { plan, idea_context: ideaContext, idea_id: ideaId });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function getSavedBusinessPlans() {
  try {
    assertApiConfigured();
    const { data } = await api.get('/api/startups/business-plan/saved');
    return data.plans || [];
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function deleteBusinessPlan(planId) {
  try {
    assertApiConfigured();
    const { data } = await api.delete(`/api/startups/business-plan/${planId}`);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function generateCustomerInsights(data) {
  try {
    assertApiConfigured();
    const { data: result } = await api.post('/api/startups/customer-insights', data);
    return result;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function saveCustomerInsights(insights, ideaContext = {}, ideaId = null) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/startups/customer-insights/save', { insights, idea_context: ideaContext, idea_id: ideaId });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function getSavedCustomerInsights() {
  try {
    assertApiConfigured();
    const { data } = await api.get('/api/startups/customer-insights/saved');
    return data.insights || [];
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function deleteCustomerInsights(insightsId) {
  try {
    assertApiConfigured();
    const { data } = await api.delete(`/api/startups/customer-insights/${insightsId}`);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function generateMarketIntelligence(data) {
  try {
    assertApiConfigured();
    const { data: result } = await api.post('/api/startups/market-intelligence', data);
    return result;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function saveMarketIntelligence(report, ideaContext = {}, ideaId = null) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/startups/market-intelligence/save', { report, idea_context: ideaContext, idea_id: ideaId });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function getSavedMarketIntelligence() {
  try {
    assertApiConfigured();
    const { data } = await api.get('/api/startups/market-intelligence/saved');
    return data.reports || [];
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function deleteMarketIntelligence(reportId) {
  try {
    assertApiConfigured();
    const { data } = await api.delete(`/api/startups/market-intelligence/${reportId}`);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function generateAICofounderChat(advisorType, question, startupContext = {}) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/ai-cofounder/chat', { advisor_type: advisorType, question, startup_context: startupContext });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function saveAICofounderChat(advisorType, messages) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/ai-cofounder/chat/save', { advisor_type: advisorType, messages });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function getAICofounderChatHistory(advisorType) {
  try {
    assertApiConfigured();
    const { data } = await api.get(`/api/ai-cofounder/chat/${advisorType}`);
    return data.chats || [];
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function deleteAICofounderChat(chatId) {
  try {
    assertApiConfigured();
    const { data } = await api.delete(`/api/ai-cofounder/chat/${chatId}`);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function generateInvestorTools(data) {
  try {
    assertApiConfigured();
    const { data: result } = await api.post('/api/investor-tools/generate', data);
    return result;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function saveInvestorTools(report, ideaContext = {}, ideaId = null) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/investor-tools/save', { report, idea_context: ideaContext, idea_id: ideaId });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function getSavedInvestorTools() {
  try {
    assertApiConfigured();
    const { data } = await api.get('/api/investor-tools/saved');
    return data.reports || [];
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function deleteInvestorTools(reportId) {
  try {
    assertApiConfigured();
    const { data } = await api.delete(`/api/investor-tools/${reportId}`);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function generateMarketingHub(data) {
  try {
    assertApiConfigured();
    const { data: result } = await api.post('/api/marketing-hub/generate', data);
    return result;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function saveMarketingHub(report, ideaContext = {}, ideaId = null) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/marketing-hub/save', { report, idea_context: ideaContext, idea_id: ideaId });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function getSavedMarketingHub() {
  try {
    assertApiConfigured();
    const { data } = await api.get('/api/marketing-hub/saved');
    return data.reports || [];
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function deleteMarketingHub(reportId) {
  try {
    assertApiConfigured();
    const { data } = await api.delete(`/api/marketing-hub/${reportId}`);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function generateDevelopmentHub(data) {
  try {
    assertApiConfigured();
    const { data: result } = await api.post('/api/development-hub/generate', data);
    return result;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function saveDevelopmentHub(report, ideaContext = {}, ideaId = null) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/development-hub/save', { report, idea_context: ideaContext, idea_id: ideaId });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function getSavedDevelopmentHubs() {
  try {
    assertApiConfigured();
    const { data } = await api.get('/api/development-hub/saved');
    return data.reports || [];
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function deleteDevelopmentHub(reportId) {
  try {
    assertApiConfigured();
    const { data } = await api.delete(`/api/development-hub/${reportId}`);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function generateGrowthHub(data) {
  try {
    assertApiConfigured();
    const { data: result } = await api.post('/api/growth-hub/generate', data);
    return result;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function saveGrowthHub(report, ideaContext = {}, ideaId = null) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/growth-hub/save', { report, idea_context: ideaContext, idea_id: ideaId });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function getSavedGrowthHubs() {
  try {
    assertApiConfigured();
    const { data } = await api.get('/api/growth-hub/saved');
    return data.reports || [];
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function deleteGrowthHub(reportId) {
  try {
    assertApiConfigured();
    const { data } = await api.delete(`/api/growth-hub/${reportId}`);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function generateFinancialPlan(data) {
  try {
    assertApiConfigured();
    const { data: result } = await api.post('/api/financial-plan/generate', data);
    return result;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function saveFinancialPlan(report, ideaContext = {}, ideaId = null) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/financial-plan/save', { report, idea_context: ideaContext, idea_id: ideaId });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function getSavedFinancialPlans() {
  try {
    assertApiConfigured();
    const { data } = await api.get('/api/financial-plan/saved');
    return data.reports || [];
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function deleteFinancialPlan(reportId) {
  try {
    assertApiConfigured();
    const { data } = await api.delete(`/api/financial-plan/${reportId}`);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function trackEvent(event, properties = {}) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/analytics/track', { event, properties });
    return data;
  } catch {
    return { ok: false };
  }
}

export async function evaluateStartup(profile, idea) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/startups/evaluate', { profile, idea });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function generateCofounder(profile, idea) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/startups/cofounder', { profile, idea });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function generateRoadmap(profile, idea, plan) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/startups/roadmap', { profile, idea, plan });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function generateReadme(profile, idea, plan) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/startups/readme', { profile, idea, plan });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function generateLaunchHub(data) {
  try {
    assertApiConfigured();
    const { data: result } = await api.post('/api/launch-hub/generate', data);
    return result;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function saveLaunchHub(report, checkedItems = [], ideaContext = {}, ideaId = null) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/launch-hub/save', { report, checked_items: checkedItems, idea_context: ideaContext, idea_id: ideaId });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function getSavedLaunchHubs() {
  try {
    assertApiConfigured();
    const { data } = await api.get('/api/launch-hub/saved');
    return data.reports || [];
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function updateLaunchHubChecks(reportId, checkedItems) {
  try {
    assertApiConfigured();
    const { data } = await api.patch(`/api/launch-hub/${reportId}/checks`, { checked_items: checkedItems });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function deleteLaunchHub(reportId) {
  try {
    assertApiConfigured();
    const { data } = await api.delete(`/api/launch-hub/${reportId}`);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function createTeam(name, description) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/teams/create', { name, description });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function getMyTeams() {
  try {
    assertApiConfigured();
    const { data } = await api.get('/api/teams/my');
    return data.teams || [];
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function getTeamByInviteCode(code) {
  try {
    assertApiConfigured();
    const { data } = await api.get(`/api/teams/join/${code}`);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function joinTeam(inviteCode) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/teams/join', { invite_code: inviteCode });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function addTeamAnalysis(teamId, reportType, reportId, title) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/teams/analysis', { team_id: teamId, report_type: reportType, report_id: reportId, title });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function getTeamAnalyses(teamId) {
  try {
    assertApiConfigured();
    const { data } = await api.get(`/api/teams/${teamId}/analyses`);
    return data.analyses || [];
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function createComment(targetType, targetId, section, text) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/comments', { target_type: targetType, target_id: targetId, section, text });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function getComments(targetType, targetId) {
  try {
    assertApiConfigured();
    const { data } = await api.get(`/api/comments/${targetType}/${targetId}`);
    return data.comments || [];
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function deleteComment(commentId) {
  try {
    assertApiConfigured();
    const { data } = await api.delete(`/api/comments/${commentId}`);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function exportAsPdf(reportType, reportData) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/export/pdf', { report_type: reportType, report_data: reportData });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function exportAsNotion(reportType, reportData) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/export/notion', { report_type: reportType, report_data: reportData });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

// ─── Saved Ideas (Centralized Idea Registry) ──────────────────────────────────

export async function getSavedIdeas() {
  try {
    assertApiConfigured();
    const { data } = await api.get('/api/saved-ideas');
    return data.ideas || [];
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function createSavedIdea(payload) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/saved-ideas', payload);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function getSavedIdeaById(ideaId) {
  try {
    assertApiConfigured();
    const { data } = await api.get(`/api/saved-ideas/${ideaId}`);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function updateSavedIdea(ideaId, updates) {
  try {
    assertApiConfigured();
    const { data } = await api.put(`/api/saved-ideas/${ideaId}`, updates);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function updateSavedIdeaHubReport(ideaId, hubKey, reportData) {
  try {
    assertApiConfigured();
    const { data } = await api.patch(`/api/saved-ideas/${ideaId}/hub-reports`, { hub_key: hubKey, report_data: reportData });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function deleteSavedIdea(ideaId) {
  try {
    assertApiConfigured();
    const { data } = await api.delete(`/api/saved-ideas/${ideaId}`);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function createCheckoutSession(plan) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/billing/create-checkout-session', { plan });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function verifyCheckout(transactionId) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/billing/verify-checkout', { transaction_id: transactionId });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function cancelSubscription() {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/billing/cancel-subscription', {});
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function submitContactMessage(payload) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/contact', payload);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function adminListUsers() {
  try {
    assertApiConfigured();
    const { data } = await api.get('/api/admin/users');
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function adminGetUserActivity(userId) {
  try {
    assertApiConfigured();
    const { data } = await api.get(`/api/admin/users/${userId}/activity`);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function adminSetUserPlan(userId, plan, days) {
  try {
    assertApiConfigured();
    const { data } = await api.post(`/api/admin/users/${userId}/set-plan`, { plan, days });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function inviteTeamMember(teamId, email) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/teams/invite', { team_id: teamId, email });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function getPendingInvites(teamId) {
  try {
    assertApiConfigured();
    const { data } = await api.get(`/api/teams/${teamId}/invites`);
    return data.invites || [];
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function revokeTeamInvite(teamId, inviteId) {
  try {
    assertApiConfigured();
    const { data } = await api.post(`/api/teams/${teamId}/invites/${inviteId}/revoke`);
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function acceptTeamInvite(token) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/teams/accept-invite', { token });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}

export async function removeTeamMember(teamId, memberUserId) {
  try {
    assertApiConfigured();
    const { data } = await api.post('/api/teams/remove-member', { team_id: teamId, member_user_id: memberUserId });
    return data;
  } catch (error) {
    throw new Error(apiError(error));
  }
}
