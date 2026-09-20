import React from 'react';
import { User, CheckCircle2, XCircle, HelpCircle, Scale, Sparkles, Briefcase, Building2 } from 'lucide-react';
import { CandidateItem, SignalItem } from '../api/client';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface CandidateMatrixProps {
  candidates: CandidateItem[];
  runnerUp: CandidateItem | null;
  onOpenReview: (targetType: 'CLAIM' | 'CANDIDATE', targetId: string) => void;
}

export const CandidateMatrix: React.FC<CandidateMatrixProps> = ({
  candidates,
  runnerUp,
  onOpenReview,
}) => {
  const renderTierBadge = (tier: string) => {
    switch (tier) {
      case 'DISCRIMINATING':
        return <Badge variant="discriminating">DISCRIMINATING</Badge>;
      case 'CORROBORATING':
        return <Badge variant="corroborating">CORROBORATING</Badge>;
      case 'WEAK':
      default:
        return <Badge variant="weak">WEAK</Badge>;
    }
  };

  const renderSignals = (signals: SignalItem[], type: 'supporting' | 'contradicting' | 'unresolved') => {
    if (!signals || signals.length === 0) {
      return (
        <div
          style={{
            padding: '14px',
            background: 'rgba(0, 0, 0, 0.02)',
            borderRadius: '10px',
            color: '#94a3b8',
            fontSize: '0.8rem',
            fontStyle: 'italic',
            border: '1px dashed rgba(0, 0, 0, 0.08)',
            textAlign: 'center',
          }}
        >
          No {type} signals identified.
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {signals.map((s, idx) => (
          <div
            key={idx}
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              borderRadius: '10px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {renderTierBadge(s.tier)}
                {s.cluster_id && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      color: '#64748b',
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(0, 0, 0, 0.04)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    Cluster #{s.cluster_id.substring(0, 8)}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: '0.68rem',
                  color: '#94a3b8',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {s.evidence_ids.length} proof point{s.evidence_ids.length > 1 ? 's' : ''}
              </span>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#1e293b', margin: 0, lineHeight: 1.45 }}>
              {s.signal}
            </p>

            {s.evidence_ids.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  flexWrap: 'wrap',
                  marginTop: '2px',
                }}
              >
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                  Ref:
                </span>
                {s.evidence_ids.map((eid, eidx) => (
                  <button
                    key={eidx}
                    onClick={() => onOpenReview('CLAIM', eid)}
                    style={{
                      background: 'rgba(2, 132, 199, 0.06)',
                      border: '1px solid rgba(2, 132, 199, 0.2)',
                      borderRadius: '5px',
                      padding: '1px 6px',
                      fontSize: '0.68rem',
                      color: '#0284c7',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                    }}
                    title="Inspect / Review this evidence claim"
                  >
                    {eid.substring(0, 10)}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderCandidateCard = (cand: CandidateItem, isPrimary: boolean) => {
    return (
      <Card
        key={cand.id}
        variant={isPrimary ? 'elevated' : 'standard'}
        style={{
          border: isPrimary ? '1px solid rgba(2, 132, 199, 0.25)' : '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: isPrimary ? '0 12px 35px -5px rgba(2, 132, 199, 0.08)' : '0 4px 18px rgba(15, 23, 42, 0.04)',
          padding: '24px',
          background: isPrimary ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.78)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            paddingBottom: '16px',
            marginBottom: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: isPrimary
                  ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(56, 189, 248, 0.1) 100%)'
                  : 'rgba(0, 0, 0, 0.04)',
                border: isPrimary
                  ? '1px solid rgba(2, 132, 199, 0.25)'
                  : '1px solid rgba(0, 0, 0, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isPrimary ? '#0284c7' : '#64748b',
              }}
            >
              <User size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e2e8f0', margin: 0 }}>
                  {cand.name}
                </h3>
                {isPrimary ? (
                  <Badge variant="corroborating" dot>PRIMARY LEADER</Badge>
                ) : (
                  <Badge variant="neutral">RUNNER-UP</Badge>
                )}
              </div>
              <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '2px 0 0 0', fontFamily: 'var(--font-mono)' }}>
                Pair State: <strong style={{ color: '#0284c7' }}>{cand.pair_state}</strong> • ID: {cand.id.substring(0, 12)}
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={<Scale size={14} color="#7c3aed" />}
            onClick={() => onOpenReview('CANDIDATE', cand.id)}
          >
            Review Verdict
          </Button>
        </div>

        {/* Identified Persona & Disambiguation Grounding */}
        {(cand.bio_summary || cand.primary_role || cand.primary_organization) && (
          <div
            style={{
              marginBottom: '20px',
              padding: '16px 18px',
              background: isPrimary ? 'rgba(2, 132, 199, 0.04)' : 'rgba(0, 0, 0, 0.02)',
              border: isPrimary ? '1px solid rgba(2, 132, 199, 0.18)' : '1px solid rgba(0, 0, 0, 0.06)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={15} color={isPrimary ? '#0284c7' : '#64748b'} />
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: isPrimary ? '#0284c7' : '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {isPrimary ? 'AI Predicted Identity Profile' : 'Secondary Candidate Footprint'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {cand.primary_role && (
                  <span
                    style={{
                      fontSize: '0.74rem',
                      background: '#ffffff',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      padding: '3px 9px',
                      borderRadius: '6px',
                      color: '#334155',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Briefcase size={12} color="#64748b" />
                    {cand.primary_role}
                  </span>
                )}
                {cand.primary_organization && (
                  <span
                    style={{
                      fontSize: '0.74rem',
                      background: 'rgba(2, 132, 199, 0.08)',
                      border: '1px solid rgba(2, 132, 199, 0.22)',
                      padding: '3px 9px',
                      borderRadius: '6px',
                      color: '#0284c7',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Building2 size={12} color="#0284c7" />
                    {cand.primary_organization}
                  </span>
                )}
              </div>
            </div>

            {cand.bio_summary && (
              <p
                style={{
                  fontSize: '0.9rem',
                  color: '#1e293b',
                  margin: 0,
                  lineHeight: 1.55,
                  fontWeight: 500,
                }}
              >
                {cand.bio_summary}
              </p>
            )}

            {cand.relevance_reasons && cand.relevance_reasons.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(0, 0, 0, 0.05)', paddingTop: '10px' }}>
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: '#64748b',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.04em',
                  }}
                >
                  Disambiguation & Evidence Calibration Clues:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {cand.relevance_reasons.map((reason, rIdx) => (
                    <span
                      key={rIdx}
                      style={{
                        fontSize: '0.72rem',
                        background: '#ffffff',
                        border: '1px solid rgba(2, 132, 199, 0.22)',
                        color: '#0369a1',
                        padding: '2px 9px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontWeight: 500,
                      }}
                    >
                      ✓ {reason}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3-Column Interpretable Evidence Matrix (D7) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Supporting */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '10px',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#059669',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <CheckCircle2 size={14} />
              <span>Supporting Signals ({cand.matrix?.supporting?.length || 0})</span>
            </div>
            {renderSignals(cand.matrix?.supporting, 'supporting')}
          </div>

          {/* Contradicting */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '10px',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#e11d48',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <XCircle size={14} />
              <span>Contradicting Signals ({cand.matrix?.contradicting?.length || 0})</span>
            </div>
            {renderSignals(cand.matrix?.contradicting, 'contradicting')}
          </div>

          {/* Unresolved */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '10px',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#d97706',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <HelpCircle size={14} />
              <span>Unresolved ({cand.matrix?.unresolved?.length || 0})</span>
            </div>
            {renderSignals(cand.matrix?.unresolved, 'unresolved')}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.01em', margin: 0 }}>
            Candidate Resolution & Evidence Matrix
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Interpretable signal tiers (Discriminating, Corroborating, Weak) across independent clusters. Runner-up candidate is always shown to reveal identity ambiguity (I13).
          </p>
        </div>
      </div>

      {/* Candidates List */}
      {candidates.length === 0 ? (
        <Card variant="standard" style={{ padding: '40px', textAlign: 'center' }}>
          <User size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ color: '#334155', fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
            No Candidate Identities Generated
          </h4>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '6px', maxWidth: '480px', margin: '6px auto 0' }}>
            The input context yielded zero correlated identity candidates in the authorized corpus. Refusing to fabricate identities (Scenario C).
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {candidates.map((cand, idx) => renderCandidateCard(cand, idx === 0))}
          {runnerUp && !candidates.some((c) => c.id === runnerUp.id) && (
            renderCandidateCard(runnerUp, false)
          )}
        </div>
      )}
    </div>
  );
};
