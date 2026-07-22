import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppNav } from '../components/PageShell.jsx';
import { Share2, FileDown, BookOpen, Users2, MessageSquare, Copy, CheckCheck, Link as LinkIcon, Download, ArrowRight, Plus, Trash2, Send, UserPlus, LogIn } from 'lucide-react';
import { shareAnalysis, exportAsPdf, exportAsNotion, getMyTeams, createTeam, getTeamByInviteCode, joinTeam, getTeamAnalyses, addTeamAnalysis, getComments, createComment, deleteComment, inviteTeamMember, getPendingInvites, revokeTeamInvite, acceptTeamInvite, removeTeamMember } from '../services/api.js';
import { getSession, readValue } from '../services/storage.js';
import { CopyButton, Badge } from '../components/SharedUI.jsx';

const TABS = [
  { key: 'share', label: 'Share Link', icon: Share2 },
  { key: 'pdf', label: 'Export PDF', icon: FileDown },
  { key: 'notion', label: 'Export Notion', icon: BookOpen },
  { key: 'team', label: 'Team Workspace', icon: Users2 },
  { key: 'comments', label: 'Comments', icon: MessageSquare },
];

// Keep in sync with backend TEAM_MEMBER_LIMIT in database_service.py
const TEAM_MEMBER_LIMIT = 5;

const EXPORT_TYPES = [
  { value: 'analysis', label: 'Idea Analysis' },
  { value: 'business_plan', label: 'Business Plan' },
  { value: 'customer_insights', label: 'Customer Insights' },
  { value: 'market_intelligence', label: 'Market Intelligence' },
  { value: 'development_hub', label: 'Development' },
  { value: 'growth_hub', label: 'Growth' },
  { value: 'financial_plan', label: 'Financial Plan' },
  { value: 'marketing_hub', label: 'Marketing' },
  { value: 'investor_tools', label: 'Investor Tools' },
  { value: 'launch_hub', label: 'Launch' },
];

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CollaborationHubPage() {
  const [activeTab, setActiveTab] = useState('share');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const profile = readValue('profile');
  const selectedIdea = readValue('selectedIdea');
  const analysis = readValue('ideaAnalysis');

  // Share
  const [shareUrl, setShareUrl] = useState('');

  // Export
  const [exportType, setExportType] = useState('analysis');
  const [exportData, setExportData] = useState(null);

  // Team
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamAnalyses, setTeamAnalyses] = useState([]);
  const [inviteEmail, setInviteEmail] = useState({});
  const [pendingInvites, setPendingInvites] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();

  // Comments
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentTargetType, setCommentTargetType] = useState('analysis');
  const [commentTargetId, setCommentTargetId] = useState('main');

  const session = getSession();

  async function handleShare() {
    if (!analysis) { setError('No analysis to share. Generate an idea analysis first.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await shareAnalysis(analysis, {});
      setShareUrl(res.url);
      setNotice('Share link created!');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  function loadExportData() {
    const dataMap = {
      analysis: readValue('ideaAnalysis'),
      business_plan: readValue('businessPlan'),
      customer_insights: readValue('customerInsights'),
      market_intelligence: readValue('marketIntelligence'),
      development_hub: readValue('developmentHub'),
      growth_hub: readValue('growthHub'),
      financial_plan: readValue('financialPlan'),
      marketing_hub: readValue('marketingHub'),
      investor_tools: readValue('investorTools'),
      launch_hub: readValue('launchHub'),
    };
    return dataMap[exportType] || null;
  }

  async function handleExportPdf() {
    const data = loadExportData();
    if (!data) { setError('No data found for this report type. Generate it first.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await exportAsPdf(exportType, data);
      downloadFile(res.content, res.filename, 'text/html');
      setNotice('HTML export downloaded. Open in browser and use Print → Save as PDF.');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleExportNotion() {
    const data = loadExportData();
    if (!data) { setError('No data found for this report type.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await exportAsNotion(exportType, data);
      downloadFile(res.content, res.filename, 'text/markdown');
      setNotice('Markdown file downloaded. Import into Notion via File → Import.');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function loadTeams() {
    try {
      const t = await getMyTeams();
      setTeams(t);
    } catch { /* ignore */ }
  }

  async function handleCreateTeam() {
    if (!teamName.trim()) { setError('Team name is required.'); return; }
    setLoading(true);
    setError('');
    try {
      await createTeam(teamName.trim(), teamDesc.trim());
      setTeamName('');
      setTeamDesc('');
      setNotice('Team created!');
      await loadTeams();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleJoinTeam() {
    if (!inviteCode.trim()) { setError('Enter an invite code.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await joinTeam(inviteCode.trim());
      if (res.already_member) setNotice('You are already a member of this team.');
      else setNotice('Joined team!');
      await loadTeams();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleInviteMember(team) {
    const email = (inviteEmail[team._id] || '').trim();
    if (!email) { setError('Enter an email to invite.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await inviteTeamMember(team._id, email);
      setNotice(res.email_sent ? `Invite emailed to ${email}!` : `Invite created for ${email}, but the email could not be sent — share the accept link manually.`);
      setInviteEmail((prev) => ({ ...prev, [team._id]: '' }));
      await loadPendingInvites(team);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function loadPendingInvites(team) {
    try {
      const invites = await getPendingInvites(team._id);
      setPendingInvites((prev) => ({ ...prev, [team._id]: invites }));
    } catch { /* ignore, likely not the owner */ }
  }

  async function handleRevokeInvite(team, inviteId) {
    try {
      await revokeTeamInvite(team._id, inviteId);
      setNotice('Invite revoked.');
      await loadPendingInvites(team);
    } catch (e) { setError(e.message); }
  }

  async function handleRemoveMember(team, memberUserId) {
    if (!window.confirm('Remove this member from the team?')) return;
    setLoading(true);
    setError('');
    try {
      await removeTeamMember(team._id, memberUserId);
      setNotice('Member removed.');
      await loadTeams();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    const token = searchParams.get('accept_invite');
    if (!token) return;
    if (!session?.token) {
      setError('Sign in or create an account first, then reopen this invite link to join the team.');
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const res = await acceptTeamInvite(token);
        setNotice(`You've joined "${res.team_name}"!`);
        setActiveTab('team');
        await loadTeams();
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
        searchParams.delete('accept_invite');
        setSearchParams(searchParams, { replace: true });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, session?.token]);

  async function loadTeamAnalyses(team) {
    setSelectedTeam(team);
    try {
      const a = await getTeamAnalyses(team.id || team._id);
      setTeamAnalyses(a);
    } catch { setTeamAnalyses([]); }
  }

  async function loadComments() {
    try {
      const c = await getComments(commentTargetType, commentTargetId);
      setComments(c);
    } catch { setComments([]); }
  }

  async function handleAddComment() {
    if (!commentText.trim()) return;
    setLoading(true);
    try {
      await createComment(commentTargetType, commentTargetId, 'general', commentText.trim());
      setCommentText('');
      await loadComments();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleDeleteComment(id) {
    try {
      await deleteComment(id);
      await loadComments();
    } catch (e) { setError(e.message); }
  }

  useEffect(() => { if (session?.token) loadTeams(); }, []);
  useEffect(() => { loadComments(); }, [commentTargetType, commentTargetId]);

  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      <AppNav />
      <main className="pt-[104px] pb-24 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-[#0A0A0A]">Collaboration Hub</h1>
            <p className="text-sm text-[#6A6A6A] mt-1">Share, export, team workspace & comments</p>
          </div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 text-red-700 text-xs font-bold uppercase">{error}</div>}
        {notice && <div className="mb-6 p-4 bg-green-50 border-2 border-green-600 text-green-800 text-xs font-bold uppercase">{notice}</div>}

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

        {activeTab === 'share' && (
          <div className="space-y-6 max-w-2xl">
            <div className="border-2 border-[#0A0A0A] bg-white p-6">
              <h2 className="text-sm font-black uppercase tracking-widest mb-4">Share Your Analysis</h2>
              <p className="text-xs text-[#6A6A6A] mb-4">Generate a shareable link to your startup's idea analysis. Anyone with the link can view the results.</p>
              <button onClick={handleShare} disabled={loading || !analysis} className="h-11 px-6 bg-[#0A0A0A] text-[#F5F3EE] text-xs font-black uppercase tracking-widest flex items-center gap-2 border-2 border-[#0A0A0A] hover:bg-[#F5F3EE] hover:text-[#0A0A0A] transition-colors disabled:opacity-40">
                <LinkIcon className="h-4 w-4" /> {loading ? 'Creating...' : 'Generate Share Link'}
              </button>
              {shareUrl && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 p-3 bg-[#F5F3EE] border-2 border-[#0A0A0A]">
                    <input readOnly value={shareUrl} className="flex-1 bg-transparent text-xs font-mono outline-none" />
                    <CopyButton text={shareUrl} />
                  </div>
                  <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                    Open shared view <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
            {!analysis && (
              <div className="p-4 border-2 border-[#0A0A0A] bg-yellow-50">
                <p className="text-xs font-bold text-yellow-800">No analysis found. Go to <Link to="/analyze-idea" className="underline">Idea Analysis</Link> first.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pdf' && (
          <div className="space-y-6 max-w-2xl">
            <div className="border-2 border-[#0A0A0A] bg-white p-6">
              <h2 className="text-sm font-black uppercase tracking-widest mb-4">Export as PDF</h2>
              <p className="text-xs text-[#6A6A6A] mb-4">Generate a printable HTML report. Open in your browser and use Print → Save as PDF.</p>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] block mb-1">Report Type</label>
                  <select value={exportType} onChange={e => setExportType(e.target.value)} className="w-full h-11 px-3 border-2 border-[#0A0A0A] bg-white text-xs font-bold uppercase tracking-widest outline-none">
                    {EXPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <button onClick={handleExportPdf} disabled={loading} className="h-11 px-6 bg-[#0A0A0A] text-[#F5F3EE] text-xs font-black uppercase tracking-widest flex items-center gap-2 border-2 border-[#0A0A0A] hover:bg-[#F5F3EE] hover:text-[#0A0A0A] transition-colors disabled:opacity-40">
                  <Download className="h-4 w-4" /> {loading ? 'Exporting...' : 'Export'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notion' && (
          <div className="space-y-6 max-w-2xl">
            <div className="border-2 border-[#0A0A0A] bg-white p-6">
              <h2 className="text-sm font-black uppercase tracking-widest mb-4">Export to Notion</h2>
              <p className="text-xs text-[#6A6A6A] mb-4">Download a Markdown file that you can import directly into Notion.</p>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] block mb-1">Report Type</label>
                  <select value={exportType} onChange={e => setExportType(e.target.value)} className="w-full h-11 px-3 border-2 border-[#0A0A0A] bg-white text-xs font-bold uppercase tracking-widest outline-none">
                    {EXPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <button onClick={handleExportNotion} disabled={loading} className="h-11 px-6 bg-[#0A0A0A] text-[#F5F3EE] text-xs font-black uppercase tracking-widest flex items-center gap-2 border-2 border-[#0A0A0A] hover:bg-[#F5F3EE] hover:text-[#0A0A0A] transition-colors disabled:opacity-40">
                  <Download className="h-4 w-4" /> {loading ? 'Exporting...' : 'Export'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-6">
            {!session?.token ? (
              <div className="p-8 border-2 border-[#0A0A0A] text-center">
                <p className="text-sm font-bold uppercase tracking-widest text-[#6A6A6A]">Sign in to use team workspace</p>
                <Link to="/signin" className="mt-4 inline-block h-10 px-6 bg-[#0A0A0A] text-[#F5F3EE] text-xs font-black uppercase tracking-widest leading-10">Sign In</Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border-2 border-[#0A0A0A] bg-white p-6">
                    <h2 className="text-sm font-black uppercase tracking-widest mb-4"><Plus className="h-4 w-4 inline" /> Create Team</h2>
                    {session?.user?.plan === 'team' ? (
                      <div className="space-y-3">
                        <input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Team name" className="w-full h-11 px-3 border-2 border-[#0A0A0A] bg-white text-xs font-bold outline-none" />
                        <input value={teamDesc} onChange={e => setTeamDesc(e.target.value)} placeholder="Description (optional)" className="w-full h-11 px-3 border-2 border-[#0A0A0A] bg-white text-xs outline-none" />
                        <button onClick={handleCreateTeam} disabled={loading || !teamName.trim()} className="h-11 px-6 bg-[#0A0A0A] text-[#F5F3EE] text-xs font-black uppercase tracking-widest flex items-center gap-2 border-2 border-[#0A0A0A] hover:bg-[#F5F3EE] hover:text-[#0A0A0A] transition-colors disabled:opacity-40">
                          <UserPlus className="h-4 w-4" /> Create Team
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-xs font-bold text-[#6A6A6A] mb-4">Creating a team and inviting collaborators requires the Team plan.</p>
                        <Link to="/pricing" className="inline-block h-10 px-6 bg-[#0A0A0A] text-[#F5F3EE] text-xs font-black uppercase tracking-widest leading-10">
                          Upgrade to Team
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="border-2 border-[#0A0A0A] bg-white p-6">
                    <h2 className="text-sm font-black uppercase tracking-widest mb-4"><LogIn className="h-4 w-4 inline" /> Join Team</h2>
                    <div className="space-y-3">
                      <input value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="Enter invite code" className="w-full h-11 px-3 border-2 border-[#0A0A0A] bg-white text-xs font-mono font-bold outline-none" />
                      <button onClick={handleJoinTeam} disabled={loading || !inviteCode.trim()} className="h-11 px-6 bg-[#0A0A0A] text-[#F5F3EE] text-xs font-black uppercase tracking-widest flex items-center gap-2 border-2 border-[#0A0A0A] hover:bg-[#F5F3EE] hover:text-[#0A0A0A] transition-colors disabled:opacity-40">
                        <ArrowRight className="h-4 w-4" /> Join
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-2 border-[#0A0A0A] bg-white p-6">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-4">Your Teams</h2>
                  {teams.length === 0 ? (
                    <p className="text-xs text-[#6A6A6A]">No teams yet. Create or join one above.</p>
                  ) : (
                    <div className="grid gap-3">
                      {teams.map(team => {
                        const isOwner = team.owner_id === session?.user?.id;
                        const memberCount = team.members?.length || 0;
                        return (
                          <div key={team._id} className="border border-[#0A0A0A] p-4">
                            <div className="flex items-center justify-between cursor-pointer" onClick={() => { loadTeamAnalyses(team); if (isOwner) loadPendingInvites(team); }}>
                              <div>
                                <h3 className="text-sm font-bold">{team.name}</h3>
                                {team.description && <p className="text-[10px] text-[#6A6A6A]">{team.description}</p>}
                              </div>
                              <div className="text-right text-[10px] text-[#6A6A6A]">
                                <div>{memberCount}/{TEAM_MEMBER_LIMIT} members</div>
                                <Badge label={`Code: ${team.invite_code}`} color="bg-[#E8E6E1] text-[#0A0A0A]" />
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1 mt-2">
                              {(team.members || []).map((m, i) => (
                                <span key={i} className="inline-flex items-center gap-1">
                                  <Badge label={`${m.name || m.email} (${m.role})`} color={m.role === 'owner' ? 'bg-[#0A0A0A] text-white' : 'bg-[#E8E6E1] text-[#0A0A0A]'} />
                                  {isOwner && m.role !== 'owner' && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleRemoveMember(team, m.user_id); }}
                                      title="Remove member"
                                      className="text-[10px] font-black text-red-600 hover:text-red-800 -ml-1"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </span>
                              ))}
                            </div>

                            {isOwner && (
                              <div className="mt-3 pt-3 border-t border-[#0A0A0A]/20" onClick={(e) => e.stopPropagation()}>
                                {memberCount >= TEAM_MEMBER_LIMIT ? (
                                  <p className="text-[10px] font-bold text-[#6A6A6A]">Member limit reached ({TEAM_MEMBER_LIMIT}). Remove someone to invite another.</p>
                                ) : (
                                  <div className="flex gap-2">
                                    <input
                                      type="email"
                                      value={inviteEmail[team._id] || ''}
                                      onChange={(e) => setInviteEmail((prev) => ({ ...prev, [team._id]: e.target.value }))}
                                      placeholder="teammate@email.com"
                                      className="flex-1 h-9 px-3 border-2 border-[#0A0A0A] bg-white text-xs outline-none"
                                    />
                                    <button
                                      onClick={() => handleInviteMember(team)}
                                      disabled={loading}
                                      className="h-9 px-3 bg-[#0A0A0A] text-[#F5F3EE] text-[10px] font-black uppercase tracking-widest border-2 border-[#0A0A0A] hover:bg-[#F5F3EE] hover:text-[#0A0A0A] transition-colors disabled:opacity-40 flex items-center gap-1"
                                    >
                                      <Send className="h-3 w-3" /> Invite
                                    </button>
                                  </div>
                                )}

                                {(pendingInvites[team._id] || []).length > 0 && (
                                  <div className="mt-3">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Pending Invites:</span>
                                    <div className="mt-1 space-y-1">
                                      {pendingInvites[team._id].map((inv) => (
                                        <div key={inv._id} className="text-xs flex items-center justify-between">
                                          <span>{inv.email}</span>
                                          <button
                                            onClick={() => handleRevokeInvite(team, inv._id)}
                                            className="text-[10px] font-bold text-red-600 hover:text-red-800 uppercase tracking-wide"
                                          >
                                            Revoke
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {selectedTeam?._id === team._id && teamAnalyses.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-[#0A0A0A]/20">
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Shared Analyses:</span>
                                <div className="mt-1 space-y-1">
                                  {teamAnalyses.map(a => (
                                    <div key={a._id} className="text-xs flex items-center gap-2">
                                      <span className="font-bold">{a.title}</span>
                                      <Badge label={a.report_type} color="bg-[#E8E6E1] text-[#0A0A0A]" />
                                    </div>
                                  ))}
                                </div>
                            </div>
                          )}
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="space-y-6 max-w-3xl">
            {!session?.token ? (
              <div className="p-8 border-2 border-[#0A0A0A] text-center">
                <p className="text-sm font-bold uppercase tracking-widest text-[#6A6A6A]">Sign in to use comments</p>
                <Link to="/signin" className="mt-4 inline-block h-10 px-6 bg-[#0A0A0A] text-[#F5F3EE] text-xs font-black uppercase tracking-widest leading-10">Sign In</Link>
              </div>
            ) : (
              <>
                <div className="border-2 border-[#0A0A0A] bg-white p-6">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-4">Comments</h2>
                  <div className="flex items-end gap-3 mb-4">
                    <div className="flex-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] block mb-1">Target Type</label>
                      <select value={commentTargetType} onChange={e => setCommentTargetType(e.target.value)} className="w-full h-10 px-3 border-2 border-[#0A0A0A] bg-white text-xs font-bold uppercase tracking-widest outline-none">
                        {EXPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] block mb-1">Target ID (default: main)</label>
                      <input value={commentTargetId} onChange={e => setCommentTargetId(e.target.value)} placeholder="main" className="w-full h-10 px-3 border-2 border-[#0A0A0A] bg-white text-xs font-mono outline-none" />
                    </div>
                  </div>

                  <div className="flex gap-2 mb-6">
                    <input value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddComment()} placeholder="Write a comment..." className="flex-1 h-11 px-3 border-2 border-[#0A0A0A] bg-white text-xs outline-none" />
                    <button onClick={handleAddComment} disabled={loading || !commentText.trim()} className="h-11 px-5 bg-[#0A0A0A] text-[#F5F3EE] text-xs font-black uppercase tracking-widest flex items-center gap-2 border-2 border-[#0A0A0A] hover:bg-[#F5F3EE] hover:text-[#0A0A0A] transition-colors disabled:opacity-40">
                      <Send className="h-4 w-4" /> Send
                    </button>
                  </div>

                  <div className="space-y-3">
                    {comments.length === 0 && <p className="text-xs text-[#6A6A6A] text-center py-4">No comments yet. Start the conversation!</p>}
                    {comments.map(c => (
                      <div key={c._id || c.id} className="border border-[#0A0A0A] p-4 bg-[#F5F3EE]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">{c.user_name}</span>
                            <span className="text-[10px] text-[#6A6A6A]">{new Date(c.created_at).toLocaleString()}</span>
                            <Badge label={c.section} color="bg-[#E8E6E1] text-[#0A0A0A]" />
                          </div>
                          {c.user_id === session?.user?.id && (
                            <button onClick={() => handleDeleteComment(c._id || c.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-3.5 w-3.5" /></button>
                          )}
                        </div>
                        <p className="text-xs whitespace-pre-wrap">{c.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}