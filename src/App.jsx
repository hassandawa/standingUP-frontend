import { Route, Routes } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage.jsx';
import IdeaAnalysisPage from './pages/IdeaAnalysisPage.jsx';
import InputPage from './pages/InputPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import SharedViewPage from './pages/SharedViewPage.jsx';
import SignInPage from './pages/SignInPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import StartupDetailPage from './pages/StartupDetailPage.jsx';
import ComparisonPage from './pages/ComparisonPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import AICofounderPage from './pages/AICofounderPage.jsx';
import InvestorToolsPage from './pages/InvestorToolsPage.jsx';
import MarketingHubPage from './pages/MarketingHubPage.jsx';
import DevelopmentHubPage from './pages/DevelopmentHubPage.jsx';
import GrowthHubPage from './pages/GrowthHubPage.jsx';
import FinancialPlanPage from './pages/FinancialPlanPage.jsx';
import LaunchHubPage from './pages/LaunchHubPage.jsx';
import CollaborationHubPage from './pages/CollaborationHubPage.jsx';
import PricingPage from './pages/PricingPage.jsx';
import First100CustomersPage from './pages/First100CustomersPage.jsx';
import DecisionEnginePage from './pages/DecisionEnginePage.jsx';
import BusinessPlanningPage from './pages/BusinessPlanningPage.jsx';
import CustomerInsightsPage from './pages/CustomerInsightsPage.jsx';
import MarketIntelligencePage from './pages/MarketIntelligencePage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/input" element={<InputPage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="/analyze-idea" element={<IdeaAnalysisPage />} />
      <Route path="/share/:token" element={<SharedViewPage />} />
      <Route path="/compare" element={<ComparisonPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/ai-cofounder" element={<AICofounderPage />} />
      <Route path="/investor-tools" element={<InvestorToolsPage />} />
      <Route path="/marketing-hub" element={<MarketingHubPage />} />
      <Route path="/development-hub" element={<DevelopmentHubPage />} />
      <Route path="/growth-hub" element={<GrowthHubPage />} />
      <Route path="/financial-plan" element={<FinancialPlanPage />} />
      <Route path="/launch-hub" element={<LaunchHubPage />} />
      <Route path="/first-100-customers" element={<First100CustomersPage />} />
      <Route path="/decision-engine" element={<DecisionEnginePage />} />
      <Route path="/business-planning" element={<BusinessPlanningPage />} />
      <Route path="/customer-insights" element={<CustomerInsightsPage />} />
      <Route path="/market-intelligence" element={<MarketIntelligencePage />} />
      <Route path="/collaboration" element={<CollaborationHubPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/startups/:planId" element={<StartupDetailPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
