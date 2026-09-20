import React from 'react';
import { Lightbulb, CheckCircle2 } from 'lucide-react';
import { GapItem } from '../api/client';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface GapsPanelProps {
  gaps: GapItem[];
}

export const GapsPanel: React.FC<GapsPanelProps> = ({ gaps }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.01em', margin: 0 }}>
            Investigation Gaps & Missing Evidence (Loop Triggers)
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Auditable identification of missing proof points. 'Insufficient Evidence' is a deliberate, first-class outcome, never a failure.
          </p>
        </div>

        <Badge variant={gaps.length > 0 ? 'status-ambiguous' : 'verified'} dot>
          {gaps.length} Actionable Gap{gaps.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {gaps.length === 0 ? (
        <Card variant="standard" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 size={22} color="#059669" />
            <span style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 500 }}>
              No critical evidence gaps identified for this case. Evidence density meets all pipeline requirements.
            </span>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {gaps.map((g, idx) => (
            <Card
              key={idx}
              variant="standard"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                border: '1px solid rgba(217, 119, 6, 0.25)',
                background: 'rgba(255, 255, 255, 0.95)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Badge variant="status-ambiguous">
                  {g.category.replace(/_/g, ' ')}
                </Badge>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  GAP #{idx + 1}
                </span>
              </div>

              <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#e2e8f0', margin: 0, lineHeight: 1.4 }}>
                {g.description}
              </h4>

              <div
                style={{
                  background: 'rgba(2, 132, 199, 0.05)',
                  border: '1px solid rgba(2, 132, 199, 0.16)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  marginTop: 'auto',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#0284c7',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <Lightbulb size={13} />
                  <span>Suggested Action:</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#334155', margin: 0, lineHeight: 1.45 }}>
                  {g.suggested_action}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
