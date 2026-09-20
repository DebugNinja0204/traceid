import React from 'react';
import { Printer, FileText, CheckCircle2 } from 'lucide-react';
import { ReportData } from '../api/client';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface ReportViewProps {
  report: ReportData | null;
  caseTitle: string;
}

export const ReportView: React.FC<ReportViewProps> = ({ report, caseTitle }) => {
  if (!report) {
    return (
      <Card variant="standard" style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
        <FileText size={32} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
        <p style={{ margin: 0, fontWeight: 500 }}>Compiling intelligence dossier report...</p>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Dossier Header */}
      <Card
        variant="elevated"
        style={{
          padding: '28px',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.07)',
            paddingBottom: '16px',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.72rem',
                color: '#0284c7',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 700,
              }}
            >
              CONFIDENTIAL INTELLIGENCE DOSSIER (AUDITABLE VERDICT)
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e2e8f0', marginTop: '4px', margin: 0, letterSpacing: '-0.02em' }}>
              {caseTitle}
            </h2>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={<Printer size={15} />}
            onClick={() => window.print()}
          >
            Export / Print Dossier
          </Button>
        </div>

        {/* Status Highlights */}
        <div
          style={{
            background: 'rgba(2, 132, 199, 0.04)',
            border: '1px solid rgba(2, 132, 199, 0.12)',
            borderRadius: '12px',
            padding: '18px 22px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span
              style={{
                fontSize: '0.76rem',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Evaluated Case Status:
            </span>
            <Badge variant="corroborating" dot>
              {report.status}
            </Badge>
          </div>
          <ul style={{ paddingLeft: '20px', fontSize: '0.86rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
            {report.status_reasons.map((r, i) => (
              <li key={i} style={{ marginBottom: '4px' }}>
                {r}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Dossier Narrative Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {report.sections.map((sec, idx) => (
          <Card key={idx} variant="standard" style={{ padding: '22px 24px', background: 'rgba(255, 255, 255, 0.9)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <CheckCircle2 size={16} color="#0284c7" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
                {sec.title}
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.65', margin: 0 }}>
              {sec.text}
            </p>
            {sec.evidence_ids && sec.evidence_ids.length > 0 && (
              <div
                style={{
                  marginTop: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexWrap: 'wrap',
                  borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                  paddingTop: '10px',
                }}
              >
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  Referenced Evidence Claims:
                </span>
                {sec.evidence_ids.map((eid) => (
                  <span
                    key={eid}
                    style={{
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(2, 132, 199, 0.08)',
                      color: '#0284c7',
                      border: '1px solid rgba(2, 132, 199, 0.2)',
                      padding: '2px 7px',
                      borderRadius: '5px',
                      fontWeight: 600,
                    }}
                  >
                    {eid}
                  </span>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
