import React from 'react';
import { CheckCircle2, Calendar, ShieldAlert } from 'lucide-react';
import { ContradictionItem, TimelineEventItem } from '../api/client';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface TimelineContradictionsProps {
  timelineEvents: TimelineEventItem[];
  contradictions: ContradictionItem[];
}

export const TimelineContradictions: React.FC<TimelineContradictionsProps> = ({
  timelineEvents,
  contradictions,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Contradictions Section */}
      <Card variant="standard" style={{ padding: '26px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.01em', margin: 0 }}>
              Contradiction & Conflict Engine
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '4px 0 0 0' }}>
              Hard contradictions (impossible chronology, conflicting physical locations) mandate LIKELY_DIFFERENT unless explained away.
            </p>
          </div>

          {contradictions.length > 0 ? (
            <Badge variant="flagged" dot icon={<ShieldAlert size={12} />}>
              {contradictions.length} Active Contradiction{contradictions.length > 1 ? 's' : ''}
            </Badge>
          ) : (
            <Badge variant="verified" dot icon={<CheckCircle2 size={12} />}>
              Zero Contradictions Detected
            </Badge>
          )}
        </div>

        {contradictions.length === 0 ? (
          <div
            style={{
              padding: '16px 20px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#059669',
              fontSize: '0.88rem',
            }}
          >
            <CheckCircle2 size={20} color="#059669" />
            <span style={{ color: '#1e293b' }}>
              All claims, dates, and locations across independent sources are mutually compatible. No factual conflicts found.
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {contradictions.map((c) => (
              <div
                key={c.id}
                style={{
                  background: 'rgba(225, 29, 72, 0.05)',
                  border: '1px solid rgba(225, 29, 72, 0.25)',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Badge variant={c.severity === 'HARD' ? 'flagged' : 'status-ambiguous'}>
                      {c.severity} CONTRADICTION
                    </Badge>
                    <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#e11d48', fontFamily: 'var(--font-mono)' }}>
                      Kind: {c.kind}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontFamily: 'var(--font-mono)',
                      color: c.explained_away ? '#059669' : '#e11d48',
                      background: '#ffffff',
                      border: '1px solid rgba(0, 0, 0, 0.06)',
                      padding: '3px 9px',
                      borderRadius: '6px',
                    }}
                  >
                    Explained Away: {c.explained_away ? 'YES' : 'NO (BLOCKS MATCH)'}
                  </span>
                </div>

                <p style={{ fontSize: '0.88rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                  {c.explanation || 'Direct conflict discovered in independent official records.'}
                </p>

                {c.evidence_ids && c.evidence_ids.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                      Conflicting Claims:
                    </span>
                    {c.evidence_ids.map((eid, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.72rem',
                          background: '#ffffff',
                          color: '#e11d48',
                          border: '1px solid rgba(225, 29, 72, 0.25)',
                          padding: '2px 7px',
                          borderRadius: '5px',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {eid}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Chronological Timeline Section */}
      <Card variant="standard" style={{ padding: '26px' }}>
        <div style={{ marginBottom: '22px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.01em', margin: 0 }}>
            Chronological Provenance Timeline (Primary Candidate)
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Deterministic chronological ordering of validated identity milestones isolated specifically for the primary candidate. Unrelated namesakes are excluded to prevent narrative contamination.
          </p>
        </div>

        {timelineEvents.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
            Zero chronological events extracted from available evidence.
          </div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: '28px' }}>
            {/* Vertical Line */}
            <div
              style={{
                position: 'absolute',
                top: '14px',
                bottom: '14px',
                left: '10px',
                width: '2px',
                background: 'linear-gradient(180deg, #0284c7 0%, rgba(2, 132, 199, 0.15) 100%)',
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {timelineEvents.map((evt) => (
                <div key={evt.id} style={{ position: 'relative' }}>
                  {/* Timeline Dot */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-24px',
                      top: '16px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: evt.is_impossible ? '#e11d48' : '#0284c7',
                      boxShadow: evt.is_impossible
                        ? '0 0 8px rgba(225, 29, 72, 0.4)'
                        : '0 0 8px rgba(2, 132, 199, 0.4)',
                      border: '2px solid #ffffff',
                    }}
                  />

                  {/* Event Card */}
                  <div
                    style={{
                      background: evt.is_impossible ? 'rgba(225, 29, 72, 0.05)' : '#ffffff',
                      border: evt.is_impossible
                        ? '1px solid rgba(225, 29, 72, 0.25)'
                        : '1px solid rgba(0, 0, 0, 0.06)',
                      borderRadius: '14px',
                      padding: '16px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            color: evt.is_impossible ? '#e11d48' : '#0284c7',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          <Calendar size={13} />
                          {evt.date}
                          {evt.end_date ? ` — ${evt.end_date}` : ''}
                        </span>

                        {evt.is_impossible && (
                          <Badge variant="flagged">IMPOSSIBLE TIMELINE OVERLAP</Badge>
                        )}
                      </div>

                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                        Claim: {evt.claim_id?.substring(0, 10)}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.88rem', color: '#1e293b', margin: 0, lineHeight: 1.5 }}>
                      {evt.description}
                    </p>

                    {evt.conflicts_with && evt.conflicts_with.length > 0 && (
                      <div
                        style={{
                          marginTop: '4px',
                          padding: '6px 12px',
                          background: '#ffffff',
                          borderRadius: '6px',
                          border: '1px solid rgba(225, 29, 72, 0.25)',
                          fontSize: '0.74rem',
                          color: '#e11d48',
                        }}
                      >
                        Conflicts with event IDs: {evt.conflicts_with.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
