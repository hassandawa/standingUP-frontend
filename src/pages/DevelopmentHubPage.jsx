import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AppNav } from '../components/PageShell.jsx';
import { Sparkles, Save, Copy, CheckCheck, Database, Code, FolderTree, BookOpen, Cloud, Server } from 'lucide-react';
import { generateDevelopmentHub, saveDevelopmentHub } from '../services/api.js';
import { getSession, readValue, saveValue } from '../services/storage.js';
import IdeaSelector from '../components/IdeaSelector.jsx';
import { useIdea } from '../contexts/IdeaContext.jsx';
import { CopyButton, Badge } from '../components/SharedUI.jsx';

const TABS = [
  { key: 'database', label: 'DB Schema', icon: Database },
  { key: 'api', label: 'API Endpoints', icon: Code },
  { key: 'structure', label: 'Folder Structure', icon: FolderTree },
  { key: 'readme', label: 'README', icon: BookOpen },
  { key: 'deployment', label: 'Deployment', icon: Cloud },
];

function CodeBlock({ code, language = 'json' }) {
  return (
    <div className="relative group">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={typeof code === 'string' ? code : JSON.stringify(code, null, 2)} />
      </div>
      <pre className="bg-[#0A0A0A] text-[#A8FF60] p-4 text-xs font-mono overflow-x-auto rounded-none leading-relaxed">
        {typeof code === 'string' ? code : JSON.stringify(code, null, 2)}
      </pre>
    </div>
  );
}

export default function DevelopmentHubPage() {
  const { selectedIdea: savedIdea } = useIdea();
  const [activeTab, setActiveTab] = useState('database');
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
        target_users: Array.isArray(selectedIdea.target_users) ? selectedIdea.target_users.join(', ') : (selectedIdea.target_users || ''),
        industry: profile?.preferred_industry || '',
        location: '',
        business_model: planData.revenue_model?.pricing_model || analysis?.monetization_model || '',
        mvp_features: Array.isArray(planData.mvp_features || selectedIdea.mvp_features) ? (planData.mvp_features || selectedIdea.mvp_features).join(', ') : (planData.mvp_features || selectedIdea.mvp_features || ''),
        competitors: Array.isArray(planData.competitors || selectedIdea.competitors) ? (planData.competitors || selectedIdea.competitors).join(', ') : (planData.competitors || selectedIdea.competitors || ''),
        tech_stack: Array.isArray(planData.tech_stack || selectedIdea.tech_stack) ? (planData.tech_stack || selectedIdea.tech_stack).join(', ') : (planData.tech_stack || selectedIdea.tech_stack || ''),
      };
      const res = await generateDevelopmentHub(data);
      setResult(res);
      saveValue('developmentHub', res);
      setNotice('Development hub generated.');
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
      const res = await saveDevelopmentHub(result, ideaContext);
      setNotice(res.message || 'Saved.');
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  }

  const db = result?.database_schema || {};
  const api = result?.api_endpoints || {};
  const structure = result?.project_structure || {};
  const readme = result?.readme || {};
  const deploy = result?.deployment_guide || {};

  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      <AppNav />
      <main className="pt-[104px] pb-24 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-[#0A0A0A]">Development Hub</h1>
            <p className="text-sm text-[#6A6A6A] mt-1">Database schemas, API endpoints, project structure, README & deployment guides for {selectedIdea?.startup_name || 'your startup'}</p>
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
            <Server className="h-8 w-8 mx-auto mb-4 text-[#6A6A6A]" />
            <p className="text-sm font-bold uppercase tracking-widest text-[#6A6A6A]">Generating Development Hub...</p>
          </div>
        )}

        {result && !loading && (
          <>
            <div className="flex border-b-2 border-[#0A0A0A] mb-8 overflow-x-auto">
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-widest border-r-2 border-[#0A0A0A] transition-colors ${activeTab === tab.key ? 'bg-[#0A0A0A] text-[#F5F3EE]' : 'text-[#0A0A0A] hover:bg-[#E8E6E1]'}`}>
                    <Icon className="h-3.5 w-3.5" /> {tab.label}
                  </button>
                );
              })}
            </div>

            {activeTab === 'database' && (
              <div className="space-y-8">
                <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-black uppercase tracking-widest">Entities ({db.entities?.length || 0})</h2>
                    <CopyButton text={JSON.stringify(db, null, 2)} />
                  </div>
                  {db.er_diagram_summary && (
                    <p className="text-xs text-[#6A6A6A] mb-4 italic">{db.er_diagram_summary}</p>
                  )}
                  <div className="grid gap-6">
                    {(db.entities || []).map((entity, i) => (
                      <div key={i} className="border border-[#0A0A0A]">
                        <div className="bg-[#0A0A0A] text-[#F5F3EE] px-3 py-2 text-xs font-black uppercase tracking-widest flex items-center justify-between">
                          <span>{entity.name}</span>
                          <span className="text-[9px] font-normal text-[#A8A8A8]">{entity.description}</span>
                        </div>
                        <table className="w-full text-xs border-collapse">
                          <thead><tr className="bg-[#E8E6E1]"><th className="text-left px-3 py-1.5 font-black uppercase tracking-widest border-b border-[#0A0A0A]">Field</th><th className="text-left px-3 py-1.5 font-black uppercase tracking-widest border-b border-[#0A0A0A]">Type</th><th className="text-left px-3 py-1.5 font-black uppercase tracking-widest border-b border-[#0A0A0A]">Constraints</th><th className="text-left px-3 py-1.5 font-black uppercase tracking-widest border-b border-[#0A0A0A]">Description</th></tr></thead>
                          <tbody>
                            {(entity.attributes || []).map((attr, j) => (
                              <tr key={j} className="border-b border-[#0A0A0A]/10">
                                <td className="px-3 py-1.5 font-mono font-bold">{attr.name}</td>
                                <td className="px-3 py-1.5 font-mono text-[#6A6A6A]">{attr.type}</td>
                                <td className="px-3 py-1.5"><Badge label={attr.constraints} color="bg-[#E8E6E1] text-[#0A0A0A]" /></td>
                                <td className="px-3 py-1.5 text-[#6A6A6A]">{attr.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {entity.relationships?.length > 0 && (
                          <div className="px-3 py-2 bg-[#F5F3EE] border-t border-[#0A0A0A]">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Relationships: </span>
                            {entity.relationships.map((r, j) => <Badge key={j} label={r} color="bg-[#0A0A0A] text-white mr-1" />)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {(db.indexes || []).length > 0 && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-3">Indexes</h3>
                    <div className="grid gap-2">
                      {db.indexes.map((idx, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-[#F5F3EE] border border-[#0A0A0A]">
                          <Badge label={idx.type} color="bg-[#0A0A0A] text-white" />
                          <span className="text-xs font-mono font-bold">{idx.name}({idx.fields?.join(', ')})</span>
                          <span className="text-[10px] text-[#6A6A6A]">{idx.purpose}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {db.design_notes?.length > 0 && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-3">Design Notes</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {db.design_notes.map((note, i) => <li key={i} className="text-xs text-[#6A6A6A]">{note}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'api' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-black uppercase tracking-widest">Endpoints ({api.endpoints?.length || 0})</h2>
                  <CopyButton text={JSON.stringify(api, null, 2)} />
                </div>
                {(api.endpoints || []).map((ep, i) => (
                  <div key={i} className="border-2 border-[#0A0A0A] bg-white">
                    <div className="flex items-center gap-3 px-4 py-3 bg-[#0A0A0A] text-[#F5F3EE]">
                      <Badge label={ep.method} color={ep.method === 'GET' ? 'bg-green-600 text-white' : ep.method === 'POST' ? 'bg-blue-600 text-white' : ep.method === 'PUT' ? 'bg-orange-600 text-white' : ep.method === 'PATCH' ? 'bg-purple-600 text-white' : 'bg-red-600 text-white'} />
                      <span className="text-xs font-mono font-bold">{ep.path}</span>
                      {ep.auth_required && <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400">Auth</span>}
                    </div>
                    <div className="p-4 space-y-2">
                      <p className="text-xs text-[#6A6A6A]">{ep.description}</p>
                      {ep.request_body && ep.request_body !== 'N/A' && (
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Request Body:</span>
                          <p className="text-xs font-mono mt-0.5">{ep.request_body}</p>
                        </div>
                      )}
                      {ep.response && (
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Response:</span>
                          <p className="text-xs font-mono mt-0.5">{ep.response}</p>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(ep.status_codes || []).map((sc, j) => <Badge key={j} label={sc} color="bg-[#E8E6E1] text-[#0A0A0A]" />)}
                      </div>
                    </div>
                  </div>
                ))}
                {api.api_design_notes?.length > 0 && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-2">Design Notes</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {api.api_design_notes.map((note, i) => <li key={i} className="text-xs text-[#6A6A6A]">{note}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'structure' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-black uppercase tracking-widest">Project Structure</h2>
                  <CopyButton text={JSON.stringify(structure, null, 2)} />
                </div>
                <div className="border-2 border-[#0A0A0A] bg-white p-4">
                  <div className="font-mono text-xs space-y-1">
                    <div className="font-black text-sm">{structure.root_folder}/</div>
                    {(structure.folders || []).map((folder, i) => (
                      <div key={i} className="ml-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0A0A0A]">{folder.path}</span>
                          <span className="text-[9px] text-[#6A6A6A] italic">// {folder.purpose}</span>
                        </div>
                        {(folder.children || []).map((child, j) => (
                          <div key={j} className="ml-6 flex items-center gap-2">
                            <span className="text-[#0A0A0A]">{child.path}</span>
                            <span className="text-[9px] text-[#6A6A6A] italic">// {child.purpose}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                  <h3 className="text-sm font-black uppercase tracking-widest mb-3">Key Files</h3>
                  <div className="grid gap-2">
                    {(structure.key_files || []).map((file, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-[#F5F3EE] border border-[#0A0A0A]">
                        <span className="text-xs font-mono font-bold">{file.path}</span>
                        <span className="text-[10px] text-[#6A6A6A]">— {file.purpose}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {structure.architectural_notes?.length > 0 && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-2">Architectural Notes</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {structure.architectural_notes.map((note, i) => <li key={i} className="text-xs text-[#6A6A6A]">{note}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'readme' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-black uppercase tracking-widest">README.md</h2>
                  <CopyButton text={JSON.stringify(readme, null, 2)} />
                </div>

                <div className="border-2 border-[#0A0A0A] bg-white p-6 space-y-6">
                  <div>
                    <h1 className="text-xl font-black uppercase tracking-tight">{readme.project_name}</h1>
                    <p className="text-xs text-[#6A6A6A] mt-1">{readme.description}</p>
                  </div>

                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2 border-b border-[#0A0A0A] pb-1">Features</h3>
                    <ul className="list-disc list-inside space-y-0.5">
                      {(readme.features || []).map((f, i) => <li key={i} className="text-xs">{f}</li>)}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2 border-b border-[#0A0A0A] pb-1">Tech Stack</h3>
                    <div className="flex flex-wrap gap-1">
                      {(readme.tech_stack || []).map((t, i) => <Badge key={i} label={t} color="bg-[#0A0A0A] text-white" />)}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2 border-b border-[#0A0A0A] pb-1">Getting Started</h3>
                    {readme.getting_started?.prerequisites?.length > 0 && (
                      <div className="mb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Prerequisites:</span>
                        <ul className="list-disc list-inside">
                          {readme.getting_started.prerequisites.map((p, i) => <li key={i} className="text-xs">{p}</li>)}
                        </ul>
                      </div>
                    )}
                    {readme.getting_started?.installation?.length > 0 && (
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Installation:</span>
                        <ol className="list-decimal list-inside">
                          {readme.getting_started.installation.map((s, i) => <li key={i} className="text-xs">{s}</li>)}
                        </ol>
                      </div>
                    )}
                    {readme.getting_started?.development?.length > 0 && (
                      <div className="mt-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Development:</span>
                        <ul className="list-disc list-inside">
                          {readme.getting_started.development.map((d, i) => <li key={i} className="text-xs">{d}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2 border-b border-[#0A0A0A] pb-1">API Documentation</h3>
                    <p className="text-xs text-[#6A6A6A]">{readme.api_documentation}</p>
                  </div>

                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2 border-b border-[#0A0A0A] pb-1">Contributing</h3>
                    <ol className="list-decimal list-inside">
                      {(readme.contributing || []).map((c, i) => <li key={i} className="text-xs">{c}</li>)}
                    </ol>
                  </div>

                  <div>
                    <span className="text-xs font-bold">License: </span><span className="text-xs text-[#6A6A6A]">{readme.license}</span>
                  </div>
                </div>

                {readme.readme_notes?.length > 0 && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Notes</h3>
                    <ul className="list-disc list-inside">
                      {readme.readme_notes.map((n, i) => <li key={i} className="text-xs text-[#6A6A6A]">{n}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'deployment' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-black uppercase tracking-widest">Deployment Guide</h2>
                  <CopyButton text={JSON.stringify(deploy, null, 2)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(deploy.environments || []).map((env, i) => (
                    <div key={i} className="border-2 border-[#0A0A0A] bg-white p-4">
                      <Badge label={env.name} color={env.name === 'Production' ? 'bg-green-600 text-white' : env.name === 'Staging' ? 'bg-orange-600 text-white' : 'bg-[#0A0A0A] text-white'} />
                      <p className="text-xs mt-2 text-[#6A6A6A]">{env.purpose}</p>
                      <p className="text-xs font-mono mt-1">{env.hosting}</p>
                      <p className="text-xs font-mono text-blue-600 mt-1">{env.url}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-3">Docker</h3>
                    <p className="text-xs text-[#6A6A6A] mb-1">{deploy.docker?.dockerfile}</p>
                    <p className="text-xs text-[#6A6A6A]">{deploy.docker?.docker_compose}</p>
                  </div>
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-3">CI/CD ({deploy.ci_cd?.provider})</h3>
                    <ol className="list-decimal list-inside">
                      {(deploy.ci_cd?.pipeline_steps || []).map((step, i) => <li key={i} className="text-xs">{step}</li>)}
                    </ol>
                  </div>
                </div>

                <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                  <h3 className="text-xs font-black uppercase tracking-widest mb-3">Hosting Options</h3>
                  <div className="grid gap-2">
                    {(deploy.hosting_options || []).map((opt, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 bg-[#F5F3EE] border border-[#0A0A0A]">
                        <span className="text-xs font-bold">{opt.platform}</span>
                        <Badge label={opt.frontend ? 'FE' : ''} color="bg-blue-600 text-white" />
                        <Badge label={opt.backend ? 'BE' : ''} color="bg-green-600 text-white" />
                        <span className="text-xs text-[#6A6A6A]">{opt.estimated_cost}</span>
                        <span className="text-[10px] text-[#6A6A6A]">{opt.notes}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-3">Environment Variables</h3>
                    <table className="w-full text-xs border-collapse">
                      <thead><tr className="bg-[#E8E6E1]"><th className="text-left px-2 py-1 border-b border-[#0A0A0A]">Key</th><th className="text-left px-2 py-1 border-b border-[#0A0A0A]">Description</th><th className="text-center px-2 py-1 border-b border-[#0A0A0A]">Required</th></tr></thead>
                      <tbody>
                        {(deploy.environment_variables || []).map((ev, i) => (
                          <tr key={i} className="border-b border-[#0A0A0A]/10">
                            <td className="px-2 py-1 font-mono font-bold">{ev.key}</td>
                            <td className="px-2 py-1 text-[#6A6A6A]">{ev.description}</td>
                            <td className="px-2 py-1 text-center">{ev.required ? <span className="text-red-600 font-bold">Yes</span> : 'No'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-3">Deployment Steps</h3>
                    <ol className="list-decimal list-inside space-y-1">
                      {(deploy.deployment_steps || []).map((step, i) => <li key={i} className="text-xs">{step}</li>)}
                    </ol>
                    {(deploy.post_deployment || []).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#0A0A0A]/20">
                        <span className="text-[9px] font-black uppercase tracking-widest">Post-Deployment:</span>
                        <ul className="list-disc list-inside mt-1">
                          {deploy.post_deployment.map((pd, i) => <li key={i} className="text-xs">{pd}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {deploy.deployment_notes?.length > 0 && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Notes</h3>
                    <ul className="list-disc list-inside">
                      {deploy.deployment_notes.map((n, i) => <li key={i} className="text-xs text-[#6A6A6A]">{n}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}