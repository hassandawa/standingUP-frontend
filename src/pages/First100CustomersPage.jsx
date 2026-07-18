import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AppNav } from '../components/PageShell.jsx';
import { Sparkles, Save, Copy, CheckCheck, Users, MessageCircle, Calendar, Target } from 'lucide-react';
import { generateFirst100Customers, saveCustomerStrategy } from '../services/api.js';
import { getSession, readValue, saveValue } from '../services/storage.js';
import IdeaSelector from '../components/IdeaSelector.jsx';
import { useIdea } from '../contexts/IdeaContext.jsx';
import { CopyButton, Badge } from '../components/SharedUI.jsx';

export default function First100CustomersPage() {
  const { selectedIdea: savedIdea } = useIdea();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const profile = readValue('profile');
  const selectedIdea = savedIdea?.idea_data || readValue('selectedIdea');
  const plan = readValue('plan');
  const analysis = readValue('ideaAnalysis');

  async function handleGenerate() {
    if (!selectedIdea) return;
    setError('');
    setNotice('');
    setLoading(true);
    try {
      const planData = plan || {};
      const data = {
        startup_name: selectedIdea.startup_name,
        pitch: selectedIdea.pitch,
        problem: selectedIdea.problem,
        solution: selectedIdea.solution,
        target_users: Array.isArray(selectedIdea.target_users) ? selectedIdea.target_users : (selectedIdea.target_users ? [selectedIdea.target_users] : []),
        industry: profile?.preferred_industry || '',
        mvp_features: Array.isArray(planData.mvp_features || selectedIdea.mvp_features) ? (planData.mvp_features || selectedIdea.mvp_features) : ((planData.mvp_features || selectedIdea.mvp_features) ? [(planData.mvp_features || selectedIdea.mvp_features)] : []),
        competitors: Array.isArray(planData.competitors || selectedIdea.competitors) ? (planData.competitors || selectedIdea.competitors) : ((planData.competitors || selectedIdea.competitors) ? [(planData.competitors || selectedIdea.competitors)] : []),
      };
      const res = await generateFirst100Customers(data);
      setResult(res);
      saveValue('first100Customers', res);
      setNotice('First 100 Customers plan generated.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!result || !selectedIdea) return;
    setError('');
    setNotice('');
    if (!getSession()?.token) { setError('Sign in to save to your dashboard.'); return; }
    setSaving(true);
    try {
      const ideaContext = { startup_name: selectedIdea.startup_name, pitch: selectedIdea.pitch, industry: profile?.preferred_industry || '' };
      const res = await saveCustomerStrategy(result, ideaContext);
      setNotice(res.message || 'Saved.');
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      <AppNav />
      <main className="pt-[104px] pb-24 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-[#0A0A0A]">First 100 Customers</h1>
            <p className="text-sm text-[#6A6A6A] mt-1">Find and convert early adopters for {selectedIdea?.startup_name || 'your startup'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleGenerate} disabled={loading || !selectedIdea} className="h-11 px-6 bg-[#0A0A0A] text-[#F5F3EE] text-xs font-black uppercase tracking-widest flex items-center gap-2 border-2 border-[#0A0A0A] hover:bg-[#F5F3EE] hover:text-[#0A0A0A] transition-colors disabled:opacity-40">
              <Sparkles className="h-4 w-4" />
              {loading ? 'Generating...' : result ? 'Regenerate' : 'Generate'}
            </button>
            {result && (
              <button onClick={handleSave} disabled={saving} className="h-11 px-6 border-2 border-[#0A0A0A] text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors disabled:opacity-40">
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
        </div>

        <IdeaSelector />

        {error && <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 text-red-700 text-xs font-bold uppercase">{error}</div>}
        {notice && <div className="mb-6 p-4 bg-green-50 border-2 border-green-600 text-green-800 text-xs font-bold uppercase">{notice}</div>}

        {!selectedIdea && (
          <div className="p-12 border-2 border-[#0A0A0A] text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-[#6A6A6A]">Select a startup idea on the dashboard first</p>
            <Link to="/dashboard" className="mt-4 inline-block h-10 px-6 bg-[#0A0A0A] text-[#F5F3EE] text-xs font-black uppercase tracking-widest leading-10">Go to Dashboard</Link>
          </div>
        )}

        {loading && (
          <div className="p-12 border-2 border-[#0A0A0A] text-center animate-pulse">
            <Users className="h-8 w-8 mx-auto mb-4 text-[#6A6A6A]" />
            <p className="text-sm font-bold uppercase tracking-widest text-[#6A6A6A]">Generating customer acquisition plan...</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-8">
            {result.ideal_early_adopters && (
              <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-black uppercase tracking-widest">Ideal Early Adopters</h2>
                  <CopyButton text={result.ideal_early_adopters} />
                </div>
                <p className="text-xs text-[#6A6A6A] leading-relaxed">{result.ideal_early_adopters}</p>
              </div>
            )}

            {result.where_to_find_them?.length > 0 && (
              <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                <h2 className="text-sm font-black uppercase tracking-widest mb-3">Where to Find Them</h2>
                <div className="grid gap-2">
                  {result.where_to_find_them.map((place, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-[#F5F3EE] border border-[#0A0A0A]">
                      <Target className="h-4 w-4 text-[#0A0A0A]" />
                      <span className="text-xs">{place}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.outreach_channels?.length > 0 && (
              <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                <h2 className="text-sm font-black uppercase tracking-widest mb-3">Outreach Channels</h2>
                <div className="flex flex-wrap gap-2">
                  {result.outreach_channels.map((channel, i) => (
                    <Badge key={i} label={channel} color="bg-[#0A0A0A] text-white" />
                  ))}
                </div>
              </div>
            )}

            {result.cold_message_templates?.length > 0 && (
              <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                <h2 className="text-sm font-black uppercase tracking-widest mb-3">Cold Message Templates</h2>
                <div className="grid gap-4">
                  {result.cold_message_templates.map((template, i) => (
                    <div key={i} className="border border-[#0A0A0A] p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge label={template.platform || 'General'} />
                        <Badge label={template.tone || 'Professional'} color="bg-[#E8E6E1] text-[#0A0A0A]" />
                      </div>
                      <p className="text-xs text-[#6A6A6A] leading-relaxed">{template.message || template.template}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.social_media_launch_plan && (
              <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                <h2 className="text-sm font-black uppercase tracking-widest mb-3">Social Media Launch Plan</h2>
                <p className="text-xs text-[#6A6A6A] leading-relaxed">{result.social_media_launch_plan}</p>
              </div>
            )}

            {result.referral_strategy && (
              <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                <h2 className="text-sm font-black uppercase tracking-widest mb-3">Referral Strategy</h2>
                <p className="text-xs text-[#6A6A6A] leading-relaxed">{result.referral_strategy}</p>
              </div>
            )}

            {result.seven_day_action_plan?.length > 0 && (
              <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-black uppercase tracking-widest">7-Day Action Plan</h2>
                  <Calendar className="h-4 w-4 text-[#6A6A6A]" />
                </div>
                <div className="grid gap-2">
                  {result.seven_day_action_plan.map((day, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-[#F5F3EE] border border-[#0A0A0A]">
                      <Badge label={day.day || `Day ${i + 1}`} />
                      <div className="flex-1">
                        <p className="text-xs font-bold">{day.focus || day.theme || ''}</p>
                        <p className="text-[10px] text-[#6A6A6A] mt-1">{day.tasks?.join(', ') || day.description || ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.metrics_to_track?.length > 0 && (
              <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                <h2 className="text-sm font-black uppercase tracking-widest mb-3">Metrics to Track</h2>
                <div className="grid grid-cols-2 gap-2">
                  {result.metrics_to_track.map((metric, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-[#F5F3EE] border border-[#0A0A0A]">
                      <span className="text-xs font-mono font-bold text-[#0A0A0A]">{metric}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
