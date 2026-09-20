import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  UserCheck,
  Network,
  Layers,
  CalendarClock,
  HelpCircle,
  FileText,
  Scale,
} from 'lucide-react';
import {
  CandidateItem,
  ClusterItem,
  ContradictionItem,
  DemoScenario,
  GapItem,
  GraphEdge,
  GraphNode,
  InvestigationDetail,
  ReportData,
  ReviewAction,
  SourceItem,
  TimelineEventItem,
  api,
} from './api/client';

import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ScenarioBar } from './components/layout/ScenarioBar';
import { StatusBanner } from './components/StatusBanner';
import { CandidateMatrix } from './components/CandidateMatrix';
import { SourcesClusters } from './components/SourcesClusters';
import { TimelineContradictions } from './components/TimelineContradictions';
import { EvidenceGraph } from './components/EvidenceGraph';
import { GapsPanel } from './components/GapsPanel';
import { ReportView } from './components/ReportView';
import { CopilotDrawer } from './components/CopilotDrawer';
import { ReviewDrawer } from './components/ReviewDrawer';
import { NewInvestigationModal } from './components/NewInvestigationModal';
import { LandingPage } from './components/landing/LandingPage';
import { ComponentsShowcase } from './components/showcase/ComponentsShowcase';

import { Tabs, TabItem } from './components/ui/Tabs';
import { Badge } from './components/ui/Badge';
import { Button } from './components/ui/Button';
import { Skeleton } from './components/ui/Skeleton';
import { SlideUp } from './components/motion/MotionWrapper';

type TabType = 'matrix' | 'graph' | 'sources' | 'timeline' | 'gaps' | 'report';
type ViewType = 'landing' | 'workspace' | 'components';

export function App() {
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [demoScenarios, setDemoScenarios] = useState<DemoScenario[]>([]);
  const [activeId, setActiveId] = useState<string>('inv-scenario-a');
  const [activeTab, setActiveTab] = useState<TabType>('matrix');
  const [loading, setLoading] = useState(false);

  // Investigation full data state
  const [investigation, setInvestigation] = useState<InvestigationDetail | null>(null);
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [runnerUp, setRunnerUp] = useState<CandidateItem | null>(null);
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [clusters, setClusters] = useState<ClusterItem[]>([]);
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEventItem[]>([]);
  const [contradictions, setContradictions] = useState<ContradictionItem[]>([]);
  const [gaps, setGaps] = useState<GapItem[]>([]);
  const [report, setReport] = useState<ReportData | null>(null);
  const [reviews, setReviews] = useState<ReviewAction[]>([]);

  // Drawers and Modals
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{ type: 'CLAIM' | 'CANDIDATE'; id: string }>({
    type: 'CLAIM',
    id: '',
  });

  // Load scenarios on mount
  useEffect(() => {
    loadScenariosAndList();
  }, []);

  // Reload details when active investigation changes
  useEffect(() => {
    if (activeId) {
      loadInvestigationDetails(activeId);
    }
  }, [activeId]);

  const loadScenariosAndList = async () => {
    try {
      const res = await api.getDemoScenarios();
      setDemoScenarios(res || []);
      if (res && res.length > 0 && !activeId) {
        setActiveId(res[0].id);
      }
    } catch (e) {
      console.error('Failed loading scenarios', e);
    }
  };

  const loadInvestigationDetails = async (id: string) => {
    setLoading(true);
    try {
      const [inv, candData, srcData, graphData, timeData, contraData, gapData, repData, revData] =
        await Promise.all([
          api.getInvestigation(id),
          api.getCandidates(id),
          api.getSources(id),
          api.getGraph(id),
          api.getTimeline(id),
          api.getContradictions(id),
          api.getGaps(id),
          api.getReport(id),
          api.getReviews(id),
        ]);

      setInvestigation(inv);
      setCandidates(candData.candidates || []);
      setRunnerUp(candData.runner_up || null);
      setSources(srcData.sources || []);
      setClusters(srcData.clusters || []);
      setGraphNodes(graphData.nodes || []);
      setGraphEdges(graphData.edges || []);
      setTimelineEvents(timeData.events || []);
      setContradictions(contraData.contradictions || []);
      setGaps(gapData.gaps || []);
      setReport(repData);
      setReviews(revData.reviews || []);
    } catch (e) {
      console.error('Failed loading investigation details', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (type: 'CLAIM' | 'CANDIDATE', id: string) => {
    setReviewTarget({ type, id });
    setIsReviewOpen(true);
  };

  const handleReviewSubmitted = (newStatus: string) => {
    if (investigation) {
      setInvestigation({ ...investigation, status: newStatus });
    }
    loadInvestigationDetails(activeId);
  };

  const handleCaseCreated = (newId: string) => {
    loadScenariosAndList();
    setActiveId(newId);
    setCurrentView('workspace');
  };

  const tabs: TabItem[] = [
    {
      id: 'matrix',
      label: 'Candidates',
      count: candidates.length,
      icon: <UserCheck size={14} />,
    },
    {
      id: 'graph',
      label: 'Entity Graph',
      count: graphNodes.length,
      icon: <Network size={14} />,
    },
    {
      id: 'sources',
      label: 'Sources',
      count: clusters.length,
      icon: <Layers size={14} />,
    },
    {
      id: 'timeline',
      label: 'Timeline',
      count: contradictions.length,
      icon: <CalendarClock size={14} />,
    },
    {
      id: 'gaps',
      label: 'Gaps',
      count: gaps.length,
      icon: <HelpCircle size={14} />,
    },
    {
      id: 'report',
      label: 'Dossier',
      icon: <FileText size={14} />,
    },
  ];

  const recentCases = demoScenarios.slice(0, 5).map((s) => ({ id: s.id, title: s.name }));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row', background: 'var(--bg-base)' }}>

      {/* Persistent Left Sidebar */}
      <Sidebar
        currentView={currentView}
        activeTab={activeTab}
        recentCases={recentCases}
        onNavigate={(view) => setCurrentView(view)}
        onTabChange={(tab) => {
          setActiveTab(tab as TabType);
          setCurrentView('workspace');
        }}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Main Content Column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Top Bar */}
        <Header
          currentView={currentView}
          breadcrumb={currentView === 'workspace' && investigation ? investigation.title : undefined}
          onNavigate={(view) => setCurrentView(view)}
          onOpenCopilot={() => setIsCopilotOpen(true)}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />

        {/* Main View Content */}
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>

          {/* Landing View */}
          {currentView === 'landing' && (
            <LandingPage
              scenarios={demoScenarios}
              onLaunchWorkspace={(scenarioId) => {
                if (scenarioId) {
                  setActiveId(scenarioId);
                }
                setCurrentView('workspace');
              }}
              onExploreComponents={() => setCurrentView('components')}
            />
          )}

          {/* Components Showcase */}
          {currentView === 'components' && (
            <ComponentsShowcase
              onOpenCopilot={() => setIsCopilotOpen(true)}
              onOpenReview={() => handleOpenReview('CLAIM', '')}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
            />
          )}

          {/* Workspace */}
          {currentView === 'workspace' && (
            <>
              {/* Scenario Bar */}
              <ScenarioBar
                scenarios={demoScenarios}
                activeId={activeId}
                onSelect={(id) => setActiveId(id)}
              />

              {/* Workspace Content */}
              <div style={{ padding: '24px 28px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>

                {/* Case Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    marginBottom: '28px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Badge variant="verified" dot>
                        ACTIVE CASE
                      </Badge>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontFamily: 'var(--font-mono)',
                          color: '#3D5E47',
                          fontWeight: 600,
                        }}
                      >
                        {activeId}
                      </span>
                    </div>

                    <h1
                      style={{
                        fontSize: '1.55rem',
                        fontWeight: 800,
                        color: '#E8F5EC',
                        letterSpacing: '-0.02em',
                        margin: 0,
                        lineHeight: 1.25,
                      }}
                    >
                      {investigation?.title || 'Loading Investigation...'}
                    </h1>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        background: 'rgba(13, 21, 16, 0.8)',
                        border: '1px solid rgba(57, 255, 136, 0.08)',
                        padding: '7px 16px',
                        borderRadius: '9px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.74rem',
                        color: '#6B8F76',
                      }}
                    >
                      <span>Iterations: <strong style={{ color: '#A8C4B0' }}>{investigation?.iteration_count || 1}</strong></span>
                      <span style={{ width: '1px', height: '12px', background: 'rgba(57, 255, 136, 0.08)' }} />
                      <span>Candidates: <strong style={{ color: '#39FF88' }}>{candidates.length}</strong></span>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Scale size={14} color="#FBBF24" />}
                      onClick={() => handleOpenReview('CLAIM', '')}
                    >
                      Human Review
                    </Button>
                  </div>
                </div>

                {/* Status Banner */}
                {investigation && (
                  <StatusBanner
                    status={investigation.status}
                    reasons={investigation.status_reasons || []}
                    whatWouldChange={investigation.what_would_change || []}
                    imageAnalysis={investigation.image_analysis}
                    hasImage={investigation.has_image}
                    invId={activeId}
                    clusterCount={clusters.length}
                    candidateCount={candidates.length}
                    evidenceCount={candidates[0]?.matrix?.supporting?.length || 0}
                  />
                )}

                {/* Tabs Navigation */}
                <div style={{ marginBottom: '24px', marginTop: '24px', overflowX: 'auto' }}>
                  <Tabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onChange={(id) => setActiveTab(id as TabType)}
                  />
                </div>

                {/* Tab Content */}
                <div style={{ position: 'relative', minHeight: '400px' }}>
                  {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '4px 0' }}>
                      <Skeleton height="72px" rounded="12px" />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Skeleton height="220px" rounded="12px" />
                        <Skeleton height="220px" rounded="12px" />
                      </div>
                    </div>
                  ) : (
                    <AnimatePresence mode="wait">
                      {activeTab === 'matrix' && (
                        <SlideUp key="matrix">
                          <CandidateMatrix
                            candidates={candidates}
                            runnerUp={runnerUp}
                            onOpenReview={handleOpenReview}
                          />
                        </SlideUp>
                      )}

                      {activeTab === 'graph' && (
                        <SlideUp key="graph">
                          <EvidenceGraph nodes={graphNodes} edges={graphEdges} />
                        </SlideUp>
                      )}

                      {activeTab === 'sources' && (
                        <SlideUp key="sources">
                          <SourcesClusters sources={sources} clusters={clusters} />
                        </SlideUp>
                      )}

                      {activeTab === 'timeline' && (
                        <SlideUp key="timeline">
                          <TimelineContradictions
                            timelineEvents={timelineEvents}
                            contradictions={contradictions}
                          />
                        </SlideUp>
                      )}

                      {activeTab === 'gaps' && (
                        <SlideUp key="gaps">
                          <GapsPanel gaps={gaps} />
                        </SlideUp>
                      )}

                      {activeTab === 'report' && (
                        <SlideUp key="report">
                          <ReportView
                            report={report}
                            caseTitle={investigation?.title || 'Active Investigation'}
                          />
                        </SlideUp>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Slide-in Drawers and Modals */}
      <CopilotDrawer
        investigationId={activeId}
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />

      <ReviewDrawer
        investigationId={activeId}
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        targetType={reviewTarget.type}
        targetId={reviewTarget.id}
        reviews={reviews}
        onReviewSubmitted={handleReviewSubmitted}
      />

      <NewInvestigationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleCaseCreated}
      />
    </div>
  );
}

export default App;