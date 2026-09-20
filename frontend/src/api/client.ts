/**
 * TRACEID API Client and Types
 */

const API_BASE = 'http://localhost:8000/api/v1';

export interface DemoScenario {
  id: string;
  name: string;
  expected_status: string;
  description: string;
}

export interface InvestigationSummary {
  id: string;
  title: string;
  status: string;
  iteration_count: number;
  candidate_count: number;
  created_at: string;
  updated_at: string;
}

export interface InvestigationDetail extends InvestigationSummary {
  status_reasons: string[];
  what_would_change: string[];
  context: Record<string, any>;
  image_analysis?: {
    visible_text?: string[];
    detected_logos?: string[];
    detected_affiliations?: string[];
    visual_context?: string;
    suggested_queries?: string[];
    detected_role?: string | null;
  } | null;
  has_image?: boolean;
}

export interface SignalItem {
  signal: string;
  tier: 'DISCRIMINATING' | 'CORROBORATING' | 'WEAK';
  evidence_ids: string[];
  cluster_id?: string;
}

export interface CandidateItem {
  id: string;
  name: string;
  pair_state: string;
  is_primary: boolean;
  primary_role?: string;
  primary_organization?: string;
  bio_summary?: string;
  relevance_reasons?: string[];
  matrix: {
    supporting: SignalItem[];
    contradicting: SignalItem[];
    unresolved: SignalItem[];
  };
}

export interface EvidenceItem {
  id: string;
  claim_id: string;
  source_id: string;
  snippet: string;
  support_level: string;
  signal_tier: 'DISCRIMINATING' | 'CORROBORATING' | 'WEAK';
  verification_status: string;
  observed_at: string;
}

export interface SourceItem {
  id: string;
  url: string;
  domain: string;
  source_type: string;
  reliability: 'HIGH' | 'MEDIUM' | 'LOW';
  reliability_reason: string;
  cluster_id: string;
  is_origin: boolean;
  injection_flags: string[];
  published_at: string;
  retrieved_at: string;
}

export interface ClusterItem {
  id: string;
  origin_source_id: string;
  member_count: number;
  flagged: boolean;
}

export interface GraphNode {
  id: string;
  type: string;
  label: string;
  attributes: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  evidence_ids: string[];
}

export interface TimelineEventItem {
  id: string;
  date: string;
  end_date: string | null;
  description: string;
  claim_id: string;
  is_impossible: boolean;
  conflicts_with: string[];
}

export interface ContradictionItem {
  id: string;
  kind: string;
  severity: 'HARD' | 'SOFT';
  claim_ids: string[];
  evidence_ids: string[];
  explanation: string | null;
  explained_away: boolean;
}

export interface GapItem {
  description: string;
  category: string;
  suggested_action: string;
}

export interface ReviewAction {
  id: string;
  action_type: 'CONFIRM' | 'REJECT';
  target_type: 'CLAIM' | 'CANDIDATE';
  target_id: string;
  reason: string;
  created_at: string;
}

export interface ReportData {
  status: string;
  status_reasons: string[];
  what_would_change: string[];
  sections: Array<{
    title: string;
    text: string;
    evidence_ids: string[];
  }>;
  matrix: {
    supporting: SignalItem[];
    contradicting: SignalItem[];
    unresolved: SignalItem[];
  };
  llm_narrative_available: boolean;
}

export interface CopilotResponse {
  answer: string;
  evidence_ids: string[];
  refused: boolean;
  refusal_reason: string | null;
}

export const api = {
  async getDemoScenarios(): Promise<DemoScenario[]> {
    const res = await fetch(`${API_BASE}/demo/scenarios`);
    return res.json();
  },

  async listInvestigations(): Promise<InvestigationSummary[]> {
    const res = await fetch(`${API_BASE}/investigations`);
    return res.json();
  },

  async getInvestigation(id: string): Promise<InvestigationDetail> {
    const res = await fetch(`${API_BASE}/investigations/${id}`);
    if (!res.ok) throw new Error('Investigation not found');
    return res.json();
  },

  async createInvestigation(formData: FormData): Promise<{ investigation_id: string; status: string }> {
    const res = await fetch(`${API_BASE}/investigations`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail?.error?.message || err.detail || 'Failed to create investigation');
    }
    return res.json();
  },

  async runPipeline(id: string): Promise<{ task_id: string; status: string }> {
    const res = await fetch(`${API_BASE}/investigations/${id}/run`, { method: 'POST' });
    return res.json();
  },

  async getCandidates(id: string): Promise<{ candidates: CandidateItem[]; runner_up: CandidateItem | null }> {
    const res = await fetch(`${API_BASE}/investigations/${id}/candidates`);
    return res.json();
  },

  async getEvidence(id: string): Promise<{ evidence: EvidenceItem[] }> {
    const res = await fetch(`${API_BASE}/investigations/${id}/evidence`);
    return res.json();
  },

  async getGraph(id: string): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
    const res = await fetch(`${API_BASE}/investigations/${id}/graph`);
    return res.json();
  },

  async getTimeline(id: string): Promise<{ events: TimelineEventItem[] }> {
    const res = await fetch(`${API_BASE}/investigations/${id}/timeline`);
    return res.json();
  },

  async getContradictions(id: string): Promise<{ contradictions: ContradictionItem[] }> {
    const res = await fetch(`${API_BASE}/investigations/${id}/contradictions`);
    return res.json();
  },

  async getSources(id: string): Promise<{ sources: SourceItem[]; clusters: ClusterItem[] }> {
    const res = await fetch(`${API_BASE}/investigations/${id}/sources`);
    return res.json();
  },

  async getGaps(id: string): Promise<{ gaps: GapItem[] }> {
    const res = await fetch(`${API_BASE}/investigations/${id}/gaps`);
    return res.json();
  },

  async getReport(id: string): Promise<ReportData> {
    const res = await fetch(`${API_BASE}/investigations/${id}/report`);
    return res.json();
  },

  async getReviews(id: string): Promise<{ reviews: ReviewAction[] }> {
    const res = await fetch(`${API_BASE}/investigations/${id}/review`);
    return res.json();
  },

  async submitReview(
    id: string,
    action_type: 'CONFIRM' | 'REJECT',
    target_type: 'CLAIM' | 'CANDIDATE',
    target_id: string,
    reason: string
  ): Promise<{ review_id: string; new_status: string }> {
    const res = await fetch(`${API_BASE}/investigations/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action_type, target_type, target_id, reason }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Review submission failed');
    }
    return res.json();
  },

  async askCopilot(id: string, question: string): Promise<CopilotResponse> {
    const res = await fetch(`${API_BASE}/investigations/${id}/copilot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    return res.json();
  },

  subscribeToInvestigationStream(id: string, onEvent: (data: any) => void): () => void {
    const eventSource = new EventSource(`${API_BASE}/investigations/${id}/stream`);
    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        onEvent(parsed);
      } catch (err) {
        console.warn('Failed to parse SSE event data:', err);
      }
    };
    eventSource.onerror = (err) => {
      console.debug('SSE stream status/reconnecting:', err);
    };
    return () => {
      eventSource.close();
    };
  },
};
