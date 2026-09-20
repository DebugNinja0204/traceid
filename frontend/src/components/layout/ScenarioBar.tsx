import React from 'react';
import { Play } from 'lucide-react';
import { DemoScenario } from '../../api/client';

export interface ScenarioBarProps {
  scenarios: DemoScenario[];
  activeId: string;
  onSelect: (id: string) => void;
}

export const ScenarioBar: React.FC<ScenarioBarProps> = ({
  scenarios,
  activeId,
  onSelect,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'STRONG_MATCH': return '#39FF88';
      case 'POSSIBLE_MATCH': return '#38BDF8';
      case 'AMBIGUOUS': return '#FBBF24';
      case 'INSUFFICIENT_EVIDENCE': return '#6B8F76';
      case 'LIKELY_DIFFERENT': return '#F87171';
      default: return '#6B8F76';
    }
  };

  return (
    <div
      style={{
        background: 'rgba(6, 10, 8, 0.9)',
        borderBottom: '1px solid rgba(57, 255, 136, 0.06)',
        padding: '8px 28px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        overflowX: 'auto',
        backdropFilter: 'blur(12px)',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', flexShrink: 0 }}>
        <Play size={11} color="#39FF88" fill="#39FF88" />
        <span
          style={{
            fontSize: '0.66rem',
            fontWeight: 700,
            color: '#3D5E47',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.06em',
          }}
        >
          Demo Scenarios:
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {scenarios.map((scen) => {
          const isActive = activeId === scen.id;
          const statusColor = getStatusColor(scen.expected_status);

          return (
            <button
              key={scen.id}
              onClick={() => onSelect(scen.id)}
              style={{
                position: 'relative',
                background: isActive ? 'rgba(57, 255, 136, 0.07)' : 'rgba(13, 21, 16, 0.6)',
                border: isActive ? '1px solid rgba(57, 255, 136, 0.2)' : '1px solid rgba(57, 255, 136, 0.06)',
                color: isActive ? '#E8F5EC' : '#6B8F76',
                padding: '5px 11px',
                borderRadius: '7px',
                fontSize: '0.74rem',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(57, 255, 136, 0.04)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#A8C4B0';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(13, 21, 16, 0.6)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#6B8F76';
                }
              }}
            >
              <span>{scen.name.split(':')[0]}</span>
              <span
                style={{
                  fontSize: '0.6rem',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  background: `${statusColor}11`,
                  color: statusColor,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  border: `1px solid ${statusColor}33`,
                  letterSpacing: '0.02em',
                }}
              >
                {scen.expected_status}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};